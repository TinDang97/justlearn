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

self.onmessage = async (event) => {
  const { id, code } = event.data

  // Lazily initialize Pyodide on first message
  if (!pyodideReady) {
    pyodideReady = loadPyodide()
  }

  const output = []

  try {
    const pyodide = await pyodideReady

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

    await pyodide.runPythonAsync(code)

    self.postMessage({ id, output, error: null })
  } catch (err) {
    self.postMessage({ id, output, error: err.message })
  }
}
