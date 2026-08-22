#!/usr/bin/env bash
# end-to-end api smoke. needs dev server running. usage: BASE=http://localhost:3000 ./scripts/smoke.sh
set -euo pipefail
BASE="${BASE:-http://localhost:3000}"
J="$(mktemp)"; H="$(mktemp)"
FAIL=0

check() { # check <want> <got> <label>
  if [ "$1" = "$2" ]; then echo "ok   $3 ($2)"; else echo "FAIL $3: want $1 got $2"; FAIL=1; fi
}
code() { curl -s -o /dev/null -w "%{http_code}" "$@"; }
post() { curl -s -H 'content-type: application/json' "$@"; }

echo "== auth"
check 401 "$(code -X POST "$BASE/api/auth/login" -d '{"email":"aarav.rao@dayflow.co","password":"nope"}')" "bad login 401"
check 200 "$(code -c "$J" -X POST "$BASE/api/auth/login" -d '{"email":"aarav.rao@dayflow.co","password":"dayflow2026"}')" "employee login"
check 200 "$(code -b "$J" "$BASE/api/auth/me")" "me"
check 403 "$(code -b "$J" "$BASE/api/people")" "employee blocked from people"
check 200 "$(code -c "$H" -X POST "$BASE/api/auth/login" -d '{"email":"tanvi.nair@dayflow.co","password":"dayflow2026"}')" "hr login"
check 403 "$(code -b "$J" -X PATCH "$BASE/api/payroll/x" -d '{"monthlyWage":1}')" "employee blocked from payroll patch"

echo "== attendance"
check 200 "$(code -b "$J" "$BASE/api/attendance/me?month=$(date +%m)&year=$(date +%Y)")" "my month log"
check 200 "$(code -b "$H" "$BASE/api/people")" "hr day register"

echo "== leave + balance"
check 400 "$(code -b "$J" -X POST "$BASE/api/leave" -d '{"type":"Paid","from":"2027-01-01","to":"2027-02-28","remarks":"smoke over cap"}')" "over-cap leave blocked"
check 200 "$(code -b "$J" -X POST "$BASE/api/leave" -d '{"type":"Unpaid","from":"2027-03-01","to":"2027-03-02","remarks":"smoke unpaid"}')" "unpaid apply"
check 200 "$(code -b "$H" "$BASE/api/leave?all=1")" "hr queue"

echo "== payroll"
check 200 "$(code -b "$J" "$BASE/api/payroll/me")" "my payroll"
check 200 "$(code -b "$H" "$BASE/api/payroll")" "hr payroll list"

echo "== guard + logout"
code -b "$J" -c "$J" -X POST "$BASE/api/auth/logout" > /dev/null
REDIR=$(curl -s -o /dev/null -w "%{http_code}" -b "$J" "$BASE/dashboard")
check 307 "$REDIR" "guard redirects after logout"

[ "$FAIL" = 0 ] && echo "ALL GREEN" || { echo "SMOKE FAILED"; exit 1; }
