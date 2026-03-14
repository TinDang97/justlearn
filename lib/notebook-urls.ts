// Replace PLACEHOLDER URLs with actual NotebookLM public share URLs after creating notebooks.
// Steps:
//   1. Go to https://notebooklm.google.com and create a notebook per course
//   2. Upload all lesson .md files for that course as sources
//   3. Enable public sharing and copy the share URL
//   4. Replace each PLACEHOLDER value below with the real URL

export function isNotebookUrlValid(url: string | undefined): boolean {
  return !!url && !url.includes('PLACEHOLDER')
}

export const NOTEBOOK_URLS: Record<string, string> = {
  '01-python-fundamentals': 'https://notebooklm.google.com/notebook/332c3702-ee74-4545-a021-2cb5bb3080c7',
  '02-data-types-variables': 'https://notebooklm.google.com/notebook/PLACEHOLDER_02-data-types-variables',
  '03-control-flow-logic': 'https://notebooklm.google.com/notebook/PLACEHOLDER_03-control-flow-logic',
  '04-functions-modules': 'https://notebooklm.google.com/notebook/PLACEHOLDER_04-functions-modules',
  '05-data-structures': 'https://notebooklm.google.com/notebook/PLACEHOLDER_05-data-structures',
  '06-oop': 'https://notebooklm.google.com/notebook/PLACEHOLDER_06-oop',
  '07-file-handling-exceptions': 'https://notebooklm.google.com/notebook/PLACEHOLDER_07-file-handling-exceptions',
  '08-working-with-libraries': 'https://notebooklm.google.com/notebook/PLACEHOLDER_08-working-with-libraries',
  '09-web-development-basics': 'https://notebooklm.google.com/notebook/PLACEHOLDER_09-web-development-basics',
  '10-data-analysis-visualization': 'https://notebooklm.google.com/notebook/PLACEHOLDER_10-data-analysis-visualization',
  '11-automation-scripting': 'https://notebooklm.google.com/notebook/PLACEHOLDER_11-automation-scripting',
  '12-capstone-best-practices': 'https://notebooklm.google.com/notebook/PLACEHOLDER_12-capstone-best-practices',
}
