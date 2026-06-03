#!/usr/bin/env bash
# create-admin.sh — Create a new SICA admin user (one-shot).
#
# Usage:
#   bash scripts/create-admin.sh <email> "<full name>" [admin|super_admin]
#
# Defaults:
#   role = admin (use 'super_admin' only if you need to manage other admins)
#   password = auto-generated, printed once
#
# Requires: COZE_SUPABASE_URL + COZE_SUPABASE_SERVICE_ROLE_KEY in .env
# (or pass SUPABASE_URL + SUPABASE_SERVICE_KEY as env vars).
#
# Side effects:
#   1. Creates a row in auth.users (with email_confirm: true)
#   2. Inserts a matching row in admin_profiles
# Both must succeed — if step 2 fails, the auth user is left orphaned and
# you should re-run with the same email (it will fail at step 1, then ask
# you to clean up via the Supabase dashboard).
set -euo pipefail

# ---------------------------------------------------------------------------
# Args + env
# ---------------------------------------------------------------------------
EMAIL="${1:-}"
NAME="${2:-}"
ROLE="${3:-admin}"

if [ -z "$EMAIL" ] || [ -z "$NAME" ]; then
  echo "Usage: $0 <email> \"<full name>\" [admin|super_admin]" >&2
  exit 1
fi
if [[ "$ROLE" != "admin" && "$ROLE" != "super_admin" ]]; then
  echo "Role must be 'admin' or 'super_admin' (got: $ROLE)" >&2
  exit 1
fi

# Load .env if present (so we don't make the user export vars every time).
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

# ---------------------------------------------------------------------------
# Generate a strong random password
# ---------------------------------------------------------------------------
gen_password() {
  # 20 chars, URL-safe base64, easy to copy/paste. Avoids confusing chars.
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 18 | tr -d '=+/' | head -c 20
  else
    # Fallback for systems without openssl
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
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"email_confirm\":true,\"user_metadata\":{\"full_name\":\"$NAME\",\"role\":\"$ROLE\"}}")

# Supabase returns the user object on success, or {error: ...} on failure.
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
# Step 2: insert the admin_profiles row
# ---------------------------------------------------------------------------
echo "=== Creating admin_profile ==="
PROFILE_RESP=$(curl -sS -X POST "$URL/rest/v1/admin_profiles" \
  -H "apikey: $KEY" \
  -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d "[{\"user_id\":\"$USER_ID\",\"email\":\"$EMAIL\",\"full_name\":\"$NAME\",\"role\":\"$ROLE\",\"is_active\":true}]")

if echo "$PROFILE_RESP" | grep -q '"code"'; then
  echo "ERROR inserting admin_profile:" >&2
  echo "$PROFILE_RESP" >&2
  echo >&2
  echo "The auth user $USER_ID was created but admin_profiles failed." >&2
  echo "Re-run the matching SQL by hand, or delete the auth user in the dashboard." >&2
  exit 1
fi
echo "  admin_profile created"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
cat <<EOF

=== DONE — save these credentials ===

  Email:    $EMAIL
  Password: $PASSWORD
  Role:     $ROLE
  UUID:     $USER_ID

The user can now log in at /admin/login and should change the password
on first use. If you ever lose the password, reset it via the Supabase
dashboard (Authentication → Users → Send recovery email).

EOF
