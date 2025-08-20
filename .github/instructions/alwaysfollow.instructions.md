---
applyTo: '**'
---
version: 1
apply_to: "**"
description: >
  Global rules for the AI IDE. Prioritize speed, accuracy, security, and
  state-of-the-art UX/UI. Always use the internet and current docs.

behavior:
  use_internet: always            # Fetch data, versions, and docs live.
  follow_latest_docs: true        # Prefer official sources and changelogs.
  avoid_emojis: true              # Do not use emojis in any output.
  be_concise: true                # Short, direct answers. No filler.
  never_stall: true               # If blocked, state why and propose fixes.
  response_latency:
    target_seconds: 10            # Aim to respond fast.
    hard_limit_seconds: 60        # Do not exceed. Degrade gracefully.
  transparency:
    cite_sources: prefer          # Link or name authoritative docs when relevant.
    list_assumptions: when_needed

correctness_and_verification:
  verify_before_return: true      # Do not emit code without checks.
  checks:
    - static_analysis             # linters, type-checkers
    - build_or_compile            # ensure it builds
    - unit_or_smoke_tests         # minimal happy-path run
    - security_scan               # basic dependency and secret checks
  failure_policy:
    on_check_fail: summarize_errors_and_fix
  self_review_checklist:
    - Does it run? Any build or runtime errors?
    - Are types, nulls, and edge cases handled?
    - Are inputs validated and outputs documented?
    - Is performance acceptable and measured?
    - Are security and privacy risks mitigated?

coding_standards:
  general:
    comments_explain_rationale: true
    explicit_over_magic: true
    small_modular_units: true
    error_handling:
      fail_fast_on_programmer_errors: true
      user_safe_messages: true
      retries_with_backoff_for_io: true
  javascript_typescript:
    language: typescript_strict
    frameworks: [react, nextjs, node]
    patterns: [functional_components, hooks, suspense, rsc_when_applicable]
    lint: eslint_recommended
    format: prettier
    a11y: aria_compliant
  python:
    type_hints: required
    formatters: [black]
    linters: [ruff]
    min_python: "3.10"
    structure: [api, services, domain, adapters, infra, tests]
  mobile:
    frameworks: [react_native, flutter_optional]
    theming: design_tokens_single_source_of_truth
    performance: lazy_load, memoization, offline_first

ui_ux:
  goals:
    - state_of_the_art_visual_design
    - accessible_by_default_wcag_2_2
    - responsive_and_adaptive
    - dark_and_light_modes
    - motion_as_feedback_not_fluff
  system:
    design_tokens: required
    components: headless_or_accessible_first
    a11y_checks: [contrast, roles, focus_traps, keyboard_nav]
  performance_budgets:
    web:
      lighthouse_min_scores: {performance: 90, accessibility: 95, best_practices: 95}
      core_web_vitals_targets: {lcp_s: 2.5, inp_ms: 200, cls: 0.1}

internet_usage_and_deps:
  resolve_packages_by: official_registry_and_docs
  pin_versions: caret_for_apps_exact_for_libs
  changelog_breaking_changes: check_always
  supply_chain:
    lockfiles_required: true
    provenance_checks: prefer_signed
  network_calls:
    timeouts_seconds: 10
    retries: {max: 2, strategy: exponential_backoff}
    graceful_fallbacks: required

security_and_privacy:
  secrets:
    never_commit: true
    use_env_and_vault: true
    secret_scanners: enabled
  data_minimization: required
  authz:
    least_privilege: true
    input_validation: strict
    output_encoding: required
  dependency_policies:
    blocklist_known_vulnerable_versions: true

review_and_change_management:
  code_review:
    require_alternatives: 2        # Provide 2–3 options with trade-offs.
    focus_on: [correctness, readability, perf, security, maintainability]
  diffs_output: minimal_context_with_rationale
  commit_messages:
    style: conventional_commits
    include_scope: true
    include_motivation_and_links: true
  pr_template_sections:
    - problem_statement
    - solution_overview
    - alternatives_considered
    - risks_and_mitigations
    - test_evidence
    - perf_and_security_notes

testing:
  unit_tests_required: true
  snapshot_tests_for_ui: encouraged
  e2e_smoke_on_key_flows: required
  coverage_minimum: 75
  generate_repro_scripts_on_bugs: true

documentation:
  keep_docs_current_with_code: true
  include_quickstart_and_troubleshooting: true
  architecture_decisions: adr_required

output_format:
  default:
    - provide_code_first_then_notes
    - no_emojis_no_fluff
    - include_run_instructions_when_needed
    - include_limits_and_todos_when_applicable
