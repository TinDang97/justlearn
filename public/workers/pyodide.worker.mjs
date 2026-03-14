import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.mjs'

// Cached promise — shared across all messages in this worker instance.
// Pyodide is ~30MB WASM; we load it exactly once per worker lifetime.
let pyodideReady = null

// Pandas install promise — set after first micropip.install('pandas').
// Prevents re-installing pandas on subsequent pandas code runs.
let pandasReady = null

/**
 * Returns true if the code string requires pandas.
 * Covers: `import pandas`, `import pandas as pd`, `from pandas import ...`
 */
function needsPandas(code) {
  return /import\s+pandas|from\s+pandas\s+import/.test(code)
}

/**
 * Mount bundled CSV datasets into the Pyodide FS on first run.
 * Files are fetched from the worker origin and written to /data/<name>.
 * Accessible in Python as pd.read_csv('data/students.csv') (CWD is /).
 */
async function ensureDatasetsMounted(pyodide) {
  if (pyodide._datasetsMounted) return
  pyodide._datasetsMounted = true
  try {
    pyodide.FS.mkdir('/data')
  } catch (_) {
    // /data already exists — safe to ignore
  }
  const datasets = ['students.csv']
  for (const file of datasets) {
    try {
      const res = await fetch(`/data/${file}`)
      const text = await res.text()
      pyodide.FS.writeFile(`/data/${file}`, text)
    } catch (_) {
      // In test/non-browser environments fetch may not be available — skip silently
    }
  }
}

self.onmessage = async (event) => {
  const { id, code } = event.data

  // Lazily initialize Pyodide on first message
  if (!pyodideReady) {
    pyodideReady = loadPyodide()
  }

  const output = []

  try {
    const pyodide = await pyodideReady

    // Mount bundled datasets into Pyodide FS before execution
    await ensureDatasetsMounted(pyodide)

    // Capture stdout and stderr line by line
    pyodide.setStdout({
      batched: (line) => {
        output.push({ type: 'stdout', line })
      },
    })

    pyodide.setStderr({
      batched: (line) => {
        output.push({ type: 'stderr', line })
      },
    })

    // Install pandas via micropip on first use — singleton so it only runs once
    if (needsPandas(code)) {
      if (pandasReady === null) {
        // Signal installing status to the UI before the slow install begins
        self.postMessage({ id, status: 'installing' })
        pandasReady = pyodide
          .loadPackage('micropip')
          .then(() =>
            pyodide.runPythonAsync("import micropip\nawait micropip.install('pandas')")
          )
      }
      // Await either the in-progress or already-completed install promise
      await pandasReady
    }

    // Use pyodide.globals to pass user source — avoids all string escaping issues
    pyodide.globals.set('_user_src', code)

    // Harness: parse user code, detect last expression, execute in two phases
    const harness = `
import sys as _sys
import ast as _ast

_result = None
_tree = _ast.parse(_user_src, mode='exec')
if _tree.body and isinstance(_tree.body[-1], _ast.Expr):
    _expr = _ast.Expression(body=_tree.body[-1].value)
    _stmts = _ast.Module(body=_tree.body[:-1], type_ignores=[])
    exec(compile(_stmts, '<string>', 'exec'), globals())
    _result = eval(compile(_expr, '<string>', 'eval'), globals())
else:
    exec(compile(_tree, '<string>', 'exec'), globals())
`

    await pyodide.runPythonAsync(harness)

    const result = pyodide.globals.get('_result')

    // Serialize the last-expression result based on its type
    if (result !== null && result !== undefined) {
      if (pandasReady !== null) {
        // Pandas is loaded — check for DataFrame/Series types
        const isDataFrame = await pyodide.runPythonAsync(
          'import pandas as pd; isinstance(_result, pd.DataFrame)'
        )
        if (isDataFrame) {
          const html = await pyodide.runPythonAsync(
            "_result.to_html(classes='df-table', border=0, max_rows=50)"
          )
          output.push({ type: 'html', line: html })
        } else {
          const isSeries = await pyodide.runPythonAsync(
            'isinstance(_result, (pd.Series, pd.Index))'
          )
          if (isSeries) {
            const text = await pyodide.runPythonAsync('str(_result)')
            output.push({ type: 'stdout', line: text })
          } else {
            const text = await pyodide.runPythonAsync('repr(_result)')
            output.push({ type: 'stdout', line: text })
          }
        }
      } else {
        // Non-pandas code — render result as repr
        const text = await pyodide.runPythonAsync('repr(_result)')
        output.push({ type: 'stdout', line: text })
      }
    }

    self.postMessage({ id, output, error: null })
  } catch (err) {
    self.postMessage({ id, output, error: err.message })
  }
}
