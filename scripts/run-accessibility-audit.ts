#!/usr/bin/env tsx
/**
 * WCAG 2.1 AA accessibility audit for JustLearn v2.0 pages.
 *
 * Usage:
 *   pnpm tsx scripts/run-accessibility-audit.ts [base-url]
 *
 * Defaults to http://localhost:3000.
 * Exits non-zero if any critical violations are found.
 *
 * Prerequisites: Next.js dev or start server must be running.
 * In CI: start with `pnpm start &` and wait for port 3000.
 */

import { execSync } from 'child_process'

const BASE_URL = process.argv[2] ?? 'http://localhost:3000'

// v2.0 pages to audit — covers all new page types introduced in v2.0
const PAGES_TO_AUDIT = [
  '/',                                          // Homepage (course catalog)
  '/courses/python',                            // Python course overview
  '/courses/data-engineering',                  // DE course overview (new in v2.0)
  '/courses/python/lesson-01',                  // Python lesson (representative)
  '/courses/data-engineering/lesson-01',        // DE lesson (new in v2.0)
]

// WCAG 2.1 AA tags for axe-core
const AXE_TAGS = 'wcag2a,wcag2aa,wcag21aa'

type AuditResult = {
  url: string
  passed: boolean
  output: string
  criticalCount: number
}

function auditPage(url: string): AuditResult {
  const fullUrl = `${BASE_URL}${url}`
  console.log(`\nAuditing: ${fullUrl}`)
  try {
    const output = execSync(
      `npx axe "${fullUrl}" --tags ${AXE_TAGS} --reporter json`,
      { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
    )
    // Parse axe JSON output
    const results = JSON.parse(output)
    const violations = results?.[0]?.violations ?? []
    const critical = violations.filter(
      (v: { impact: string }) => v.impact === 'critical' || v.impact === 'serious'
    )
    if (critical.length > 0) {
      console.error(`  FAIL: ${critical.length} critical/serious violations`)
      critical.forEach((v: { id: string; description: string; nodes: unknown[] }) => {
        console.error(`    - ${v.id}: ${v.description} (${(v.nodes as unknown[]).length} elements)`)
      })
    } else {
      console.log(`  PASS: 0 critical violations (${violations.length} total, minor/moderate only)`)
    }
    return { url, passed: critical.length === 0, output, criticalCount: critical.length }
  } catch (err) {
    // axe-cli exits non-zero when violations found; capture output anyway
    const output = (err as { stdout?: string }).stdout ?? String(err)
    let criticalCount = 0
    try {
      const results = JSON.parse(output)
      const violations = results?.[0]?.violations ?? []
      criticalCount = violations.filter(
        (v: { impact: string }) => v.impact === 'critical' || v.impact === 'serious'
      ).length
      violations
        .filter((v: { impact: string }) => v.impact === 'critical' || v.impact === 'serious')
        .forEach((v: { id: string; description: string; nodes: unknown[] }) => {
          console.error(`    - ${v.id}: ${v.description} (${(v.nodes as unknown[]).length} elements)`)
        })
    } catch {
      console.error(`  ERROR: Could not parse axe output for ${url}`)
      console.error(output.slice(0, 500))
    }
    return { url, passed: criticalCount === 0, output, criticalCount }
  }
}

export function main() {
  console.log('JustLearn v2.0 — WCAG 2.1 AA Accessibility Audit')
  console.log(`Base URL: ${BASE_URL}`)
  console.log(`Pages: ${PAGES_TO_AUDIT.length}`)

  const results: AuditResult[] = PAGES_TO_AUDIT.map(auditPage)

  const failed = results.filter((r) => !r.passed)
  const totalCritical = results.reduce((sum, r) => sum + r.criticalCount, 0)

  console.log('\n─────────────────────────────────────────────')
  console.log(`Audit complete: ${results.length - failed.length}/${results.length} pages passed`)
  console.log(`Total critical/serious violations: ${totalCritical}`)

  if (failed.length > 0) {
    console.error('\nFailed pages:')
    failed.forEach((r) => console.error(`  - ${r.url} (${r.criticalCount} critical)`))
    console.error('\nFix all critical and serious violations before shipping v2.0.')
    process.exit(1)
  } else {
    console.log('\nAll pages pass WCAG 2.1 AA audit. Zero critical violations.')
    process.exit(0)
  }
}

main()
