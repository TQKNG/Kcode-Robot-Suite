# GitHub deployment history

## Current state

GitHub recorded 29 deployment records for this repository when this audit was completed.
The `vercel[bot]` GitHub App created every recorded deployment.
The repository's `CI` and `Release Please` workflows do not create deployment records.
Keep the `Preview` and `Production` environments because they identify the current Vercel preview and production deployments.
The latest `Production` deployment, `7948441511`, completed successfully.
The latest `Preview` deployment, `7988893214`, failed on November 23, 2026.
The preceding `Preview` deployment, `7948459895`, completed successfully on November 20, 2026.

The 14 historical records in `Production – pj-kcode-demo-sandbox-web` and `Production – pj-kcode-demo-sandbox-web-i9b9` are obsolete.
Those two environment names came from the former Vercel microfrontends integration.
The latest deployment in each legacy environment, `6334937210` and `6334923775`, completed successfully.
Do not assume that the legacy deployment records are inactive.

PR #9 removed `@vercel/microfrontends` and its Vercel-only `withMicrofrontends` wrapper.
Deployments created after that change use the standard `Preview` and `Production` environment names.
The existing application configuration therefore prevents the legacy environment names from recurring.

## Read-only verification

Use the GitHub REST API to list the environments before taking any cleanup action.

```bash
gh api 'repos/TQKNG/Kcode-Robot-Suite/environments'
```

Use the deployment list to verify the creator, environment name, commit, and creation time for each record.

```bash
gh api --paginate 'repos/TQKNG/Kcode-Robot-Suite/deployments?per_page=100'
```

Confirm the latest Vercel deployment status in `Preview` and `Production` before removing either legacy environment.
The environment API reported no protection rules or branch policies for any of the four environments during this audit.
Environment secrets were not inspected and must be checked by a maintainer before deletion.
Confirm that no workflow or secret still references either legacy environment.

## Maintainer cleanup

Delete only `Production – pj-kcode-demo-sandbox-web` and `Production – pj-kcode-demo-sandbox-web-i9b9` after the read-only checks pass.
Do not delete `Preview` or `Production`.

GitHub's environment deletion endpoint requires an administrator-level write permission and a URL-encoded environment name.
Deleting an environment also deletes its environment secrets and protection rules, and it can fail jobs that are waiting on those protection rules.
Review the environment settings and export any information that must be retained before deletion.

GitHub can delete individual deployment records only after they are inactive when the repository contains multiple deployments.
Inspect the latest status for each legacy deployment before attempting deletion.
Delete inactive legacy deployment records individually only when they remain visible after the two obsolete environments are removed.
Do not create a replacement deployment or mark a deployment inactive solely to bypass GitHub's deletion constraint without reviewing the effect on the deployment history and Vercel integration.

See GitHub's [deployment environment API](https://docs.github.com/en/rest/deployments/environments) and [environment management guidance](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments) before running the cleanup.

## Sidebar display

No configurable GitHub repository setting for the deployment sidebar display limit was verified during this audit.
The repository sidebar could not be visually inspected because the browser host was unavailable.
Recheck the repository sidebar after the two legacy environments are removed and record any remaining display behavior in the issue or pull request.
