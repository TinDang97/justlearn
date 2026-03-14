# Section 9: Performance & Optimization

**Course:** Data Engineering | **Lessons:** 8 | **Level:** Intermediate to Advanced

---

Writing code that works is table stakes. Writing code that works fast on large data is the job. In this section, you will learn to profile, vectorize, and optimize real pandas pipelines — turning code that takes minutes into code that takes seconds.

## What You Will Learn

- Why pandas loops are slow (and what to do instead)
- Vectorization with NumPy and pandas built-in accessors
- Reducing memory footprint by 50-95% through dtype optimization
- Processing files larger than RAM with chunked reading
- Profiling pipelines with `time.perf_counter()` and `cProfile` to find the real bottleneck
- Using `np.where` and `np.select` as fast conditional assignment
- The 4-step optimization workflow: profile → identify → optimize → verify

## Lessons

| # | Title | Key Skill | Before/After | Has Practice |
|---|-------|-----------|-------------|--------------|
| 1 | Why Performance Matters | Cost model, anti-patterns, Knuth's rule | No | No |
| 2 | Vectorization with NumPy | Array ops, ufuncs, broadcasting | Yes | Yes |
| 3 | Pandas Vectorization Patterns | .str, .dt, column arithmetic, np.where | Yes | Yes |
| 4 | Memory Optimization with Dtypes | Downcasting, category dtype | No | Yes |
| 5 | Chunked Processing | chunksize loop, accumulator pattern | No | Yes |
| 6 | Profiling and Benchmarking | timer decorator, benchmark harness, cProfile | No | Yes |
| 7 | NumPy Integration Patterns | np.where, np.select, np.vectorize | Yes | Yes |
| 8 | Optimization in Practice | End-to-end 4-step workflow | Yes | Yes |

## Prerequisites

- Section 2: Pandas Fundamentals
- Section 3: Data Loading and File Formats
- Section 6: ETL Pipelines

## Key Constraints

All code in this section runs in **Pyodide** (in-browser Python):
- Libraries available: `pandas`, `numpy`, standard library only
- No `dask`, `polars`, `numba`, or `cython`
- Timing uses `time.perf_counter()` (not `%timeit`)
- Large file simulation uses in-memory `io.StringIO` and generator helpers

## Section Index

- [Lesson 1: Why Performance Matters](./lesson-01-why-performance-matters.md)
- [Lesson 2: Vectorization with NumPy](./lesson-02-vectorization-with-numpy.md)
- [Lesson 3: Pandas Vectorization Patterns](./lesson-03-pandas-vectorization-patterns.md)
- [Lesson 4: Memory Optimization with Dtypes](./lesson-04-memory-optimization-dtypes.md)
- [Lesson 5: Chunked Processing](./lesson-05-chunked-processing.md)
- [Lesson 6: Profiling and Benchmarking](./lesson-06-profiling-and-benchmarking.md)
- [Lesson 7: NumPy Integration Patterns](./lesson-07-numpy-integration-patterns.md)
- [Lesson 8: Optimization in Practice](./lesson-08-optimization-in-practice.md)

## Next Section

[Section 10: Real-World Projects →](../10-real-world-projects/README.md)
