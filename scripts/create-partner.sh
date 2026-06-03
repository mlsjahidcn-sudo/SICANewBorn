#!/usr/bin/env bash
# create-partner.sh — Create a new SICA partner user (one-shot).
#
# Usage:
#   bash scripts/create-partner.sh <email> "<company name>" "<contact person>" [status]
#
# Defaults:
#   status = Active
#   password = auto-generated, printed once
#   commission_rate = 10.00 (override by editing the row after)
#
# Requires: COZE_SUPABASE_URL + COZE_SUPABASE_SERVICE_ROLE_KEY in .env
#
# Side effects:
#   1. Creates a row in auth.users (with email_confirm: true)
#   2. Inserts a matching row in partners
# Both must succeed — if step 2 fails, the auth user is left orphaned.
set -euo pipefail

EMAIL="${1:-}"
COMPANY="${2:-}"
CONTACT="${3:-}"
STATUS="${4:-Active}"

if [ -z "$EMAIL" ] || [ -z "$COMPANY" ] || [ -z "$CONTACT" ]; then
  echo "Usage: $0 <email> \"<company name>\" \"<contact person>\" [status]" >&2
  exit 1
fi
if [ "$STATUS" != "Active" ] && [ "$STATUS" != "Suspended" ] && [ "$STATUS" != "Pending" ]; then
  echo "Status must be Active, Suspended, or Pending (got: $STATUS)" >&2
  exit 1
fi

# Load .env if present
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
  echo "Set them in .env or export before running." >&2
  exit 1
fi

# Generate a strong random password
gen_password() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 18 | tr -d '=+/' | head -c 20
  else
    LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20
  fi
}
PASSWORD="$(gen_password)"

# ---------------------------------------------------------------------------
# Step 1: create the auth.users row
# ---------------------------------------------------------------------------
echo "=== Creating auth user: $EMAIL ==="
USER_JSON=$(curl -sS -X POST "$URL/auth/v1/admin/users" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true,\"user_metadata\":{\"role\":\"partner\"}}")

USER_ID=$(echo "$USER_JSON" | python3 -c "import sys,json
try:
    d = json.load(sys.stdin)
    print(d.get('id',''))
except Exception:
    print('')")

if [ -z "$USER_ID" ]; then
  echo "ERROR creating auth user:" >&2
  echo "$USER_JSON" >&2
  exit 1
fi
echo "  UUID: $USER_ID"

# ---------------------------------------------------------------------------
# Step 2: insert the partners row
# ---------------------------------------------------------------------------
echo "=== Creating partner record ==="
PARTNER_RESP=$(curl -sS -X POST "$URL/rest/v1/partners" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "[{\"user_id\":\"$USER_ID\",\"email\":\"$EMAIL\",\"company_name\":\"$COMPANY\",\"contact_person\":\"$CONTACT\",\"status\":\"$STATUS\",\"commission_rate\":10.00}]")

if echo "$PARTNER_RESP" | grep -q '"code"'; then
  echo "ERROR inserting partner:" >&2
  echo "$PARTNER_RESP" >&2
  echo >&2
  echo "The auth user $USER_ID was created but partners failed." >&2
  exit 1
fi
PARTNER_ID=$(echo "$PARTNER_RESP" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'])")
echo "  partner_id: $PARTNER_ID"

cat <<EOF

=== DONE — save these credentials ===

  Email:        $EMAIL
  Password:     $PASSWORD
  Company:      $COMPANY
  Contact:      $CONTACT
  Status:       $STATUS
  Auth UUID:    $USER_ID
  Partner ID:   $PARTNER_ID

The user can now log in at /partner/login and should change the password
on first use. To bootstrap test data (a few partner_students, applications,
fees, leads) for this partner, run:

  bash scripts/seed-partner-data.sh $PARTNER_ID

EOF
