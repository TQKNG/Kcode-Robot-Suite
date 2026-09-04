---
name: intent-classifier
description: Categorize the intent of a user's request before deciding what action, tool, workflow, or response style is appropriate.
---

# Intent Classifier

- Use this skill when the user asks to classify, label, route, triage, or understand the intent behind a user request.
- It is also useful when building routers, evaluators, support workflows, prompt tests, or automation rules that depend on request intent.

## Goal

- Identify what the user is trying to accomplish, not just the topic they mention.
- Prefer a useful operational category over a vague content label.
- When the request has multiple intents, identify the primary intent and any secondary intents that would change routing or handling.

## Categories

- Use the smallest set of categories that makes the classification useful for the current task.
- Start with these defaults unless the user provides a taxonomy:

- `answer_question`: The user wants information, explanation, comparison, advice, or clarification.
- `perform_action`: The user wants Codex to do something in the environment, such as edit files, run commands, create artifacts, manage tasks, or call tools.
- `create_or_transform_content`: The user wants drafted, rewritten, summarized, translated, structured, or reformatted content.
- `debug_or_fix`: The user reports a failure, bug, error, broken workflow, unexpected output, or asks why something is not working.
- `review_or_evaluate`: The user wants critique, validation, scoring, risk analysis, code review, QA, or fact checking.
- `plan_or_design`: The user wants an approach, architecture, itinerary, roadmap, specification, or decision framework before execution.
- `search_or_research`: The user wants current, external, cited, or source-backed information.
- `personal_or_preferences`: The user is sharing preferences, context, constraints, goals, or asks Codex to remember or adapt to them.
- `meta_or_capability`: The user asks about Codex, ChatGPT, tools, models, plugins, skills, automations, limits, settings, or what is possible.
- `safety_or_policy_sensitive`: The request needs special care because it involves medical, legal, financial, self-harm, privacy, credentials, security, regulated activity, or potentially harmful actions.
- `ambiguous_or_incomplete`: The request cannot be routed confidently without more context.

## Classification Method

Look for verbs, desired outputs, referenced resources, urgency, constraints, and whether the user expects immediate execution or only guidance.
Classify by intended outcome even when the request mentions tools or formats.
For example, "make this README clearer" is `create_or_transform_content`, while "why does this README render wrong" is `debug_or_fix`.

Separate surface form from intent.
A question like "can you add tests?" often implies `perform_action`, not only `answer_question`, when the user is working in a codebase.

Respect user-provided taxonomies.
If the user supplies labels, map to their labels and mention any label that seems missing only when it matters.

Do not browse, edit files, run commands, or take external actions merely to classify intent unless the user also asks for those actions.
If classification depends on code, logs, an email, an image, or another artifact that is already available in context, use that context.
If the necessary artifact is absent, classify as `ambiguous_or_incomplete` and ask for the missing input.

## Output

When the user asks only for classification, answer with:

- `Intent:` the best category or user-provided label.
- `Confidence:` high, medium, or low.
- `Why:` one concise reason grounded in the request text.
- `Secondary intents:` include only if they affect handling.
- `Next handling:` the recommended response mode, tool route, or clarification question.

For bulk classification, use a compact table with one row per request.
Keep explanations brief enough that they help routing rather than becoming a full analysis of the request.
