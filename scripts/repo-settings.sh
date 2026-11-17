#!/usr/bin/env bash
# scripts/repo-settings.sh
#
# Idempotently configure the GitHub repository settings for this repo, as
# every Aerosol repo does (synq's scripts/repo-settings.sh is the model).
# Rerunning it changes nothing and prints "no changes".
#
# Run it as the org owner (Kelvin), or an admin of the repo.
#
#   scripts/repo-settings.sh                 # apply
#   DRY_RUN=1 scripts/repo-settings.sh       # show what would change, only GETs
#
# Environment overrides:
#   OWNER, REPO           target repo (default aerosol-build/synq-examples)
#   (No REQUIRED_CHECKS: no PR checks, ever, Kelvin 2026-11-14. No ruleset
#   here requires a status check, and setting REQUIRED_CHECKS stops the run.)
#   ALLOW_EMPTY=1         continue even though the default branch has no
#                         commits yet (normally the script stops, because the
#                         branch ruleset would block the first push to main)
#
# The repository is public, so secret scanning and push protection are free
# and always on, and there are no environments, release tags or deploys.
#
# Needs: gh (logged in, repo admin), jq.

set -euo pipefail

OWNER="${OWNER:-aerosol-build}"
REPO="${REPO:-synq-examples}"
# No PR checks, ever (Kelvin, 2026-11-14): no ruleset here requires a status
# check, so a rerun never puts one back. upsert_ruleset refuses one as well.
if [[ -n "${REQUIRED_CHECKS:-}" ]]; then
  echo "error: REQUIRED_CHECKS is gone: no ruleset requires a status check (no PR checks, ever: Kelvin, 2026-11-14)" >&2
  exit 1
fi
DRY_RUN="${DRY_RUN:-0}"
ALLOW_EMPTY="${ALLOW_EMPTY:-0}"

# What search and GitHub's topic pages show for the repository.
DESCRIPTION="Working examples of Synq: Sign In With Solana, Solana wallet login, Mobile Wallet Adapter on Seeker, and passkeys, for Next.js and Expo"
HOMEPAGE="https://synq.build"
TOPICS='["solana","sign-in-with-solana","wallet-login","authentication","nextjs","expo","seeker","passkeys"]'

R="repos/${OWNER}/${REPO}"
BRANCH_RULESET_NAME="main-branch"
CHANGES=0

for bin in gh jq; do
  command -v "$bin" >/dev/null 2>&1 || { echo "error: $bin is required" >&2; exit 1; }
done

api() {
  gh api -H "Accept: application/vnd.github+json" -H "X-GitHub-Api-Version: 2022-11-28" "$@"
}

# GET that prints the body, prints nothing on 404, and exits on any other error.
get_json() {
  local out
  if out=$(api "$1" 2>&1); then
    printf '%s' "$out"
    return 0
  fi
  if grep -q 'HTTP 404' <<<"$out"; then
    return 0
  fi
  echo "error: GET /$1 failed: $out" >&2
  exit 1
}

# GET a 204/404 endpoint: returns 0 on 2xx, 1 on 404, exits on anything else.
get_status() {
  local out
  if out=$(api --silent "$1" 2>&1); then
    return 0
  fi
  if grep -q 'HTTP 404' <<<"$out"; then
    return 1
  fi
  echo "error: GET /$1 failed: $out" >&2
  exit 1
}

# write METHOD PATH [JSON_BODY]  -- the only function that mutates anything.
write() {
  local method=$1 path=$2 body=${3:-}
  CHANGES=$((CHANGES + 1))
  if [[ "$DRY_RUN" == "1" ]]; then
    if [[ -n "$body" ]]; then
      echo "    [dry-run] $method /$path $(jq -c . <<<"$body")"
    else
      echo "    [dry-run] $method /$path"
    fi
    return 0
  fi
  if [[ -n "$body" ]]; then
    api --method "$method" "$path" --input - >/dev/null <<EOF
$body
EOF
  else
    api --method "$method" "$path" --silent
  fi
}

# ---------------------------------------------------------------------------
# 0. Preflight
# ---------------------------------------------------------------------------
if [[ "$DRY_RUN" == "1" ]]; then echo "==> ${OWNER}/${REPO} (dry run)"; else echo "==> ${OWNER}/${REPO}"; fi

repo_json=$(get_json "$R")
if [[ -z "$repo_json" ]]; then
  echo "error: ${OWNER}/${REPO} not found (or no access)" >&2
  exit 1
fi
if [[ "$(jq -r '.permissions.admin // false' <<<"$repo_json")" != "true" ]]; then
  echo "error: $(gh api user --jq .login) is not an admin of ${OWNER}/${REPO}" >&2
  exit 1
fi
default_branch=$(jq -r '.default_branch' <<<"$repo_json")
if [[ -z "$(get_json "$R/branches/${default_branch}")" ]]; then
  if [[ "$ALLOW_EMPTY" != "1" ]]; then
    echo "error: branch '${default_branch}' has no commits yet. Push the initial commit first;" >&2
    echo "       the branch ruleset has no bypass actors and would block it. (ALLOW_EMPTY=1 to override)" >&2
    exit 1
  fi
  echo "    warning: '${default_branch}' does not exist yet (ALLOW_EMPTY=1)"
fi

# ---------------------------------------------------------------------------
# 1. Repository merge settings  (PATCH /repos/{owner}/{repo})
# ---------------------------------------------------------------------------
echo "--> repository settings"
want_repo=$(cat <<'JSON'
{
  "allow_squash_merge": true,
  "allow_merge_commit": true,
  "allow_rebase_merge": false,
  "squash_merge_commit_title": "PR_TITLE",
  "squash_merge_commit_message": "PR_BODY",
  "merge_commit_title": "PR_TITLE",
  "merge_commit_message": "PR_BODY",
  "delete_branch_on_merge": true,
  "allow_auto_merge": true,
  "allow_update_branch": true,
  "has_wiki": false,
  "has_projects": false
}
JSON
)
drift_keys=$(jq -rn --argjson want "$want_repo" --argjson have "$repo_json" \
  '[ $want | to_entries[] | select($have[.key] != .value) | "\(.key): \($have[.key]) -> \(.value)" ] | join(", ")')
if [[ -z "$drift_keys" ]]; then
  echo "    unchanged"
else
  echo "    updating: ${drift_keys}"
  write PATCH "$R" "$want_repo"
fi

# ---------------------------------------------------------------------------
# 1b. About: description, homepage and topics
#     (PATCH /repos/{owner}/{repo}, PUT /repos/{owner}/{repo}/topics)
# ---------------------------------------------------------------------------
echo "--> about: description and homepage"
want_about=$(jq -n --arg d "$DESCRIPTION" --arg h "$HOMEPAGE" '{ description: $d, homepage: $h }')
if jq -e --argjson want "$want_about" '.description == $want.description and .homepage == $want.homepage' <<<"$repo_json" >/dev/null; then
  echo "    unchanged"
else
  echo "    updating"
  write PATCH "$R" "$want_about"
fi

echo "--> about: topics"
have_topics=$(jq -c '(.topics // []) | sort' <<<"$repo_json")
want_topics=$(jq -c 'sort' <<<"$TOPICS")
if [[ "$have_topics" == "$want_topics" ]]; then
  echo "    unchanged: $(jq -r 'join(", ")' <<<"$want_topics")"
else
  echo "    updating: $(jq -r 'join(", ")' <<<"$have_topics") -> $(jq -r 'join(", ")' <<<"$want_topics")"
  write PUT "$R/topics" "{\"names\":${TOPICS}}"
fi

# ---------------------------------------------------------------------------
# 2. Actions: GITHUB_TOKEN read-only, cannot approve PRs
#    (PUT /repos/{owner}/{repo}/actions/permissions/workflow)
# ---------------------------------------------------------------------------
echo "--> actions workflow permissions"
want_wf='{"default_workflow_permissions":"read","can_approve_pull_request_reviews":false}'
have_wf=$(get_json "$R/actions/permissions/workflow")
if jq -e --argjson want "$want_wf" '. == $want' <<<"${have_wf:-null}" >/dev/null; then
  echo "    unchanged"
else
  echo "    updating: $(jq -c . <<<"${have_wf:-null}") -> ${want_wf}"
  write PUT "$R/actions/permissions/workflow" "$want_wf"
fi

# ---------------------------------------------------------------------------
# 3. Rulesets  (GET/POST /repos/{o}/{r}/rulesets, GET/PUT .../rulesets/{id})
# ---------------------------------------------------------------------------

# Canonical form used to compare a desired ruleset with the one GitHub returns.
# GitHub reorders rules and adds defaulted parameters (required_reviewers,
# dismissal_restriction, ...), so we sort, then keep only the keys we set.
# shellcheck disable=SC2016 # a jq program, not a shell expansion
JQ_RULESET_DEFS='
def norm_actor:
  { actor_type, bypass_mode: (.bypass_mode // "always") }
  + (if .actor_type == "OrganizationAdmin" or .actor_type == "DeployKey"
     then {} else { actor_id } end);
def canon:
  { name, target, enforcement,
    bypass_actors: ((.bypass_actors // []) | map(norm_actor) | sort_by(.actor_type, (.actor_id // 0))),
    conditions: { ref_name: {
      include: ((.conditions.ref_name.include // []) | sort),
      exclude: ((.conditions.ref_name.exclude // []) | sort) } },
    rules: ((.rules // [])
      | map(
          if .type == "required_status_checks" then
            .parameters.required_status_checks |= ((. // []) | sort_by(.context))
          elif .type == "pull_request" and (.parameters.allowed_merge_methods != null) then
            .parameters.allowed_merge_methods |= sort
          else . end)
      | sort_by(.type)) };
def proj($w):
  if ($w | type) == "object" and type == "object" then
    . as $h | reduce ($w | keys_unsorted[]) as $k ({}; .[$k] = ($h[$k] | proj($w[$k])))
  elif ($w | type) == "array" and type == "array" and length == ($w | length) then
    . as $h | [ range(0; length) as $i | $h[$i] | proj($w[$i]) ]
  else . end;
'

upsert_ruleset() {
  local want=$1 name target ids id count have
  name=$(jq -r '.name' <<<"$want")
  target=$(jq -r '.target' <<<"$want")
  echo "--> ${target} ruleset \"${name}\""
  if jq -e 'any(.rules[]?; .type == "required_status_checks")' <<<"$want" >/dev/null; then
    echo "error: ruleset \"${name}\" requires status checks: no PR checks, ever (Kelvin, 2026-11-14)" >&2
    exit 1
  fi

  ids=$(api --paginate "$R/rulesets?includes_parents=false&targets=${target}&per_page=100" |
    jq -s -r --arg n "$name" 'add // [] | .[] | select(.name == $n and .source_type == "Repository") | .id')
  count=$(grep -c . <<<"$ids" || true)
  if [[ "$count" -gt 1 ]]; then
    echo "error: ${count} rulesets named \"${name}\" (ids: $(tr '\n' ' ' <<<"$ids")); delete the extras by hand" >&2
    exit 1
  fi

  if [[ -z "$ids" ]]; then
    echo "    creating"
    write POST "$R/rulesets" "$want"
    return 0
  fi

  id=$ids
  have=$(api "$R/rulesets/${id}")
  if jq -e -n --argjson want "$want" --argjson have "$have" "${JQ_RULESET_DEFS}"'
      ($want | canon) as $w | ($have | canon | proj($w)) == $w' >/dev/null; then
    echo "    unchanged (id ${id})"
  else
    echo "    updating (id ${id})"
    write PUT "$R/rulesets/${id}" "$want"
  fi
}

#    The default branch: PR required (0 approvals, squash or merge commit), no status checks,
#    no force pushes, no deletion. No bypass actors, not even admins.
branch_ruleset=$(jq -c --arg name "$BRANCH_RULESET_NAME" '.name = $name' <<'JSON'
{
  "name": "",
  "target": "branch",
  "enforcement": "active",
  "bypass_actors": [],
  "conditions": { "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] } },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    { "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": false,
        "allowed_merge_methods": ["merge", "squash"]
      } }
  ]
}
JSON
)
upsert_ruleset "$branch_ruleset"

# ---------------------------------------------------------------------------
# 4. Dependabot alerts + security updates
#    GET vulnerability-alerts: 204 = on, 404 = off.
#    GET automated-security-fixes: {"enabled":bool,"paused":bool}.
# ---------------------------------------------------------------------------
echo "--> dependabot alerts"
if get_status "$R/vulnerability-alerts"; then
  echo "    unchanged: enabled"
else
  echo "    enabling"
  write PUT "$R/vulnerability-alerts"
fi

echo "--> dependabot security updates"
asf=$(get_json "$R/automated-security-fixes")
if [[ -n "$asf" ]] && jq -e '.enabled == true' <<<"$asf" >/dev/null; then
  echo "    unchanged: enabled"
else
  echo "    enabling"
  write PUT "$R/automated-security-fixes"
fi

# ---------------------------------------------------------------------------
# 5. Secret scanning + push protection (free on a public repository)
# ---------------------------------------------------------------------------
echo "--> secret scanning + push protection"
if jq -e '.security_and_analysis.secret_scanning.status == "enabled"
          and .security_and_analysis.secret_scanning_push_protection.status == "enabled"' \
  <<<"$repo_json" >/dev/null; then
  echo "    unchanged: enabled"
else
  echo "    enabling"
  write PATCH "$R" '{"security_and_analysis":{"secret_scanning":{"status":"enabled"},"secret_scanning_push_protection":{"status":"enabled"}}}'
fi

# ---------------------------------------------------------------------------
# Verify: whoever ran this must not be able to bypass the branch ruleset.
# ---------------------------------------------------------------------------
verify_bypass() {
  local name=$1 expected=$2 id got
  id=$(api --paginate "$R/rulesets?includes_parents=false&per_page=100" |
    jq -s -r --arg n "$name" 'add // [] | .[] | select(.name == $n and .source_type == "Repository") | .id')
  got=$(api "$R/rulesets/${id}" --jq '.current_user_can_bypass')
  if [[ "$got" == "$expected" ]]; then
    echo "    ok: \"${name}\" current_user_can_bypass=${got}"
  else
    echo "error: \"${name}\" current_user_can_bypass=${got}, expected ${expected}" >&2
    exit 1
  fi
}
if [[ "$DRY_RUN" != "1" ]]; then
  echo "--> verify bypass for $(gh api user --jq .login)"
  verify_bypass "$BRANCH_RULESET_NAME" never
fi

echo
if [[ "$CHANGES" -eq 0 ]]; then
  echo "no changes"
elif [[ "$DRY_RUN" == "1" ]]; then
  echo "${CHANGES} change(s) would be made (dry run)"
else
  echo "${CHANGES} change(s) applied"
fi
