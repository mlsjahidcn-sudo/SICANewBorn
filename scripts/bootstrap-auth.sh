#!/usr/bin/env bash
# Bootstrap auth.users in the new official Supabase project.
# Run AFTER applying database/migration-supabase-cloud.sql in the SQL editor.
#
# Creates the 2 users from the old Volcengine project with the SAME emails.
# Passwords CANNOT be migrated (Supabase never exposes hashes via API) — we
# generate new known passwords. The user changes them on first login.
#
# This script:
#   1. Creates the 2 users via admin API (email_confirm: true)
#   2. Captures the new UUIDs
#   3. Inserts admin_profiles row for admin@sica.cn
#   4. Updates student_profiles row (auto-created by trigger) with email

set -e
NEW_URL="https://wbzdwwvtbaftjxecgdxk.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndiemR3d3Z0YmFmdGp4ZWNnZHhrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM2MjY3MCwiZXhwIjoyMDk1OTM4NjcwfQ.H1FDjK5yVHDZKt95LU5D_u7cS2h_p18uUB0BOvADsMg"

# These are FRESH passwords for first login — the user will reset.
ADMIN_PASS="Sica-Admin-2026!"
STUDENT_PASS="Sica-Student-2026!"

create_user() {
  local email=$1
  local password=$2
  local meta=$3
  local result
  result=$(curl -s -X POST "$NEW_URL/auth/v1/admin/users" \
    -H "apikey: $SERVICE_KEY" \
    -H "Authorization: Bearer $SERVICE_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$email\",\"password\":\"$password\",\"email_confirm\":true,\"user_metadata\":$meta}")
  local id
  id=$(echo "$result" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('id',''))")
  if [ -z "$id" ]; then
    echo "ERROR creating $email:" >&2
    echo "$result" >&2
    exit 1
  fi
  echo "$id"
}

echo "=== Creating admin@sica.cn ==="
ADMIN_ID=$(create_user "admin@sica.cn" "$ADMIN_PASS" '{"full_name":"SICA Admin","role":"admin"}')
echo "  UUID: $ADMIN_ID"
echo "  Pass: $ADMIN_PASS  (change on first login)"

echo
echo "=== Creating mlsjahid.cn@gmail.com ==="
STUDENT_ID=$(create_user "mlsjahid.cn@gmail.com" "$STUDENT_PASS" '{"full_name":"Jahid Abdullah","role":"student"}')
echo "  UUID: $STUDENT_ID"
echo "  Pass: $STUDENT_PASS  (change on first login)"

echo
echo "=== Inserting admin_profile ==="
curl -s -X POST "$NEW_URL/rest/v1/admin_profiles" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=minimal" \
  -d "[{\"user_id\":\"$ADMIN_ID\",\"email\":\"admin@sica.cn\",\"full_name\":\"SICA Admin\",\"role\":\"admin\",\"is_active\":true}]"
echo "  admin_profile created"

echo
echo "=== Updating student_profile (created by handle_new_student_user trigger) ==="
curl -s -X PATCH "$NEW_URL/rest/v1/student_profiles?id=eq.$STUDENT_ID" \
  -H "apikey: $SERVICE_KEY" \
  -H "Authorization: Bearer $SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"mlsjahid.cn@gmail.com\",\"status\":\"Active\"}"
echo "  student_profile updated"

echo
echo "=== Done ==="
echo "Save these credentials somewhere safe:"
echo "  admin@sica.cn         : $ADMIN_PASS"
echo "  mlsjahid.cn@gmail.com : $STUDENT_PASS"
echo
echo "Both users MUST change password on first login."
