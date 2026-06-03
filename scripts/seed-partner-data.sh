#!/usr/bin/env bash
# seed-partner-data.sh — Insert demo data for a partner so the portal has
# something to show during development.
#
# Usage:
#   bash scripts/seed-partner-data.sh <partner_id>
#
# Inserts:
#   - 4 partner_students (in various statuses)
#   - 3 partner_applications (different universities/programs/statuses)
#   - 3 partner_fees (Pending / Paid / Overdue)
#   - 2 partner_leads (incoming, not yet converted)
#
# Idempotent: if rows already exist for this partner, the script skips
# (checks count first).
set -euo pipefail

PARTNER_ID="${1:-}"
if [ -z "$PARTNER_ID" ]; then
  echo "Usage: $0 <partner_id>" >&2
  exit 1
fi

# Load .env
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . .env
  set +a
fi

URL="${COZE_SUPABASE_URL:-${SUPABASE_URL:-}}"
KEY="${COZE_SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SERVICE_KEY:-}}"
if [ -z "$URL" ] || [ -z "$KEY" ]; then
  echo "Missing COZE_SUPABASE_URL or COZE_SUPABASE_SERVICE_ROLE_KEY" >&2
  exit 1
fi

# Idempotency check
EXISTING=$(curl -s "$URL/rest/v1/partner_students?partner_id=eq.$PARTNER_ID&select=id" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
if [ "$EXISTING" -gt 0 ]; then
  echo "Partner $PARTNER_ID already has $EXISTING partner_students rows — skipping." >&2
  echo "Re-run with --force to wipe + re-seed (TODO: not implemented)." >&2
  exit 0
fi

echo "=== Seeding partner_students ==="
seed_one() {
  local table=$1
  local data=$2
  /usr/bin/curl -s -X POST "$URL/rest/v1/$table" \
    -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
    -H "Content-Type: application/json" -H "Prefer: return=representation" \
    -d "$data" > /dev/null
}

seed_one partner_students "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"John Smith\",\"student_email\":\"john.smith@example.com\",\"student_phone\":\"+1-555-0101\",\"nationality\":\"USA\",\"target_university\":\"Tsinghua University\",\"target_program\":\"Computer Science\",\"status\":\"New\"}"
seed_one partner_students "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"Sarah Johnson\",\"student_email\":\"sarah.j@example.com\",\"student_phone\":\"+44-555-0102\",\"nationality\":\"UK\",\"target_university\":\"Peking University\",\"target_program\":\"International Business\",\"status\":\"In Progress\"}"
seed_one partner_students "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"Mike Chen\",\"student_email\":\"mike.chen@example.com\",\"student_phone\":\"+1-555-0103\",\"nationality\":\"Canada\",\"target_university\":\"Fudan University\",\"target_program\":\"Data Science\",\"status\":\"Applied\"}"
seed_one partner_students "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"Emily Davis\",\"student_email\":\"emily.d@example.com\",\"student_phone\":\"+61-555-0104\",\"nationality\":\"Australia\",\"target_university\":\"Zhejiang University\",\"target_program\":\"Mechanical Engineering\",\"status\":\"Accepted\"}"

echo "=== Seeding partner_applications ==="
seed_one partner_applications "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"John Smith\",\"university\":\"Tsinghua University\",\"program\":\"Computer Science (Master)\",\"status\":\"Submitted\",\"submitted_at\":\"2026-05-15T10:00:00Z\",\"decision\":\"Pending\"}"
seed_one partner_applications "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"Sarah Johnson\",\"university\":\"Peking University\",\"program\":\"International Business (Bachelor)\",\"status\":\"Accepted\",\"submitted_at\":\"2026-04-20T10:00:00Z\",\"decision\":\"Accepted\"}"
seed_one partner_applications "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"Mike Chen\",\"university\":\"Fudan University\",\"program\":\"Data Science (Master)\",\"status\":\"Rejected\",\"submitted_at\":\"2026-03-10T10:00:00Z\",\"decision\":\"Rejected\",\"notes\":\"Did not meet language requirement\"}"

echo "=== Seeding partner_fees ==="
seed_one partner_fees "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"John Smith\",\"amount\":5000.00,\"currency\":\"CNY\",\"status\":\"Pending\",\"description\":\"Application fee — Tsinghua\",\"due_date\":\"2026-07-01\"}"
seed_one partner_fees "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"Sarah Johnson\",\"amount\":8000.00,\"currency\":\"CNY\",\"status\":\"Paid\",\"description\":\"Service charge — accepted application\",\"paid_at\":\"2026-05-01T10:00:00Z\",\"due_date\":\"2026-05-01\"}"
seed_one partner_fees "{\"partner_id\":\"$PARTNER_ID\",\"student_name\":\"Mike Chen\",\"amount\":3500.00,\"currency\":\"CNY\",\"status\":\"Overdue\",\"description\":\"Document translation fee\",\"due_date\":\"2026-05-15\"}"

echo "=== Seeding partner_leads ==="
seed_one partner_leads "{\"partner_id\":\"$PARTNER_ID\",\"lead_name\":\"Anna Müller\",\"lead_email\":\"anna.m@example.com\",\"lead_phone\":\"+49-555-0201\",\"interested_program\":\"MBA\",\"status\":\"New\",\"notes\":\"Referred by alumni network\"}"
seed_one partner_leads "{\"partner_id\":\"$PARTNER_ID\",\"lead_name\":\"Raj Patel\",\"lead_email\":\"raj.p@example.com\",\"lead_phone\":\"+91-555-0202\",\"interested_program\":\"Computer Science (Master)\",\"status\":\"Contacted\"}"

echo "=== Done ==="
echo "Partner $PARTNER_ID now has:"
echo "  4 partner_students"
echo "  3 partner_applications"
echo "  3 partner_fees"
echo "  2 partner_leads"
