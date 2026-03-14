import { loadPyodide } from 'https://cdn.jsdelivr.net/pyodide/v0.29.3/full/pyodide.mjs'

// Cached promise — shared across all messages in this worker instance.
// Pyodide is ~30MB WASM; we load it exactly once per worker lifetime.
let pyodideReady = null

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

    await pyodide.runPythonAsync(code)

    self.postMessage({ id, output, error: null })
  } catch (err) {
    self.postMessage({ id, output, error: err.message })
  }
}
