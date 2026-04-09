# moneroo-mcp

## 0.4.1

### Patch Changes

- chore(mcp): remove MCP resources (not needed), add smithery.yaml for registry submission

## 0.4.0

### Minor Changes

- feat(mcp): v3 — exports, reports, and MCP resources (28 tools total)

  Exports & Reports (4):
  - `export_transactions` — CSV or Excel (.xlsx) export with status/date filters
  - `generate_invoice` — professional HTML invoice for a payment (printable to PDF)
  - `generate_report_pdf` — monthly HTML activity report with daily chart, method breakdown, failure analysis
  - `export_for_accounting` — accounting CSV (generic, Sage-compatible, or FEC format for France)

  MCP Resources (3):
  - `moneroo://dashboard` — direct link to the Moneroo dashboard
  - `moneroo://transaction/{id}` — deep link to a specific transaction
  - `moneroo://docs` — Moneroo API documentation with section links

  Documentation: full README rewrite covering all 28 tools and 3 resources with parameter tables and example prompts.

## 0.3.0

### Minor Changes

- feat(mcp): v2 — add 16 analytics, insights, and automation tools

  Analytics (6):
  - `get_revenue_report` — revenue summary by status + daily breakdown
  - `get_payment_methods_breakdown` — volume and share per method
  - `get_failure_analysis` — top failure reasons with sample IDs
  - `get_conversion_rate` — funnel from initiated to success
  - `compare_periods` — side-by-side period comparison with % change
  - `get_peak_hours` — hourly and weekday breakdown of successful payments

  Insights (5):
  - `analyze_trends` — weekly trends with week-over-week change
  - `predict_revenue` — end-of-month projection based on daily average
  - `detect_anomalies` — amount outliers, volume spikes, duplicate detection
  - `suggest_optimizations` — structured KPIs for Claude to interpret
  - `churn_risk` — customers gone silent over a configurable period

  Automations (5):
  - `create_recurring_payment` — first payment + cron config
  - `schedule_payout` — immediate or future payout with `at` command
  - `create_payment_reminder` — payment link + formatted message (email/WhatsApp/SMS)
  - `setup_webhook_alert` — save passive alert rules locally
  - `list_webhook_alerts` — list active alert rules

## 0.2.0

### Minor Changes

- Add 4 new MCP tools: verify_payment, list_payouts, create_payout, verify_payout
