# moneroo-mcp

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
