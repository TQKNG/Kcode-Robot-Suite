# Releasing

Releases are managed by [release-please](https://github.com/googleapis/release-please-action).
The configuration is in `release-please-config.json`, and the current version is tracked in `.release-please-manifest.json`.
The root `package.json` version is the same value and is updated by the release pull request.

## Prerequisites

Release-please can only open a release pull request when the repository allows GitHub Actions to create pull requests.
Enable "Allow GitHub Actions to create and approve pull requests" under Settings > Actions > General > Workflow permissions.
This setting is enabled for this repository, and it must stay enabled for release-please to open a release pull request.

## How a release happens

1. Merge pull requests into `master` using Conventional Commits messages (see [CONTRIBUTING.md](CONTRIBUTING.md)).
2. The `Release Please` workflow runs on each push to `master`. It opens or updates a release pull request when the commits since the last release include a `feat`, `fix` or `perf` commit, or a breaking change.
3. Commits of other types, such as `ci`, `chore`, `docs` and `test`, do not create a release pull request on their own.
4. Commits that do not follow Conventional Commits are skipped.
5. Review the release pull request, including its changelog and version number.
6. Merge the release pull request. release-please then creates the `vX.Y.Z` tag and the GitHub release.

## Versions

The repository starts at version `0.1.0`, which is recorded in both `package.json` and `.release-please-manifest.json`.
No `v0.1.0` tag or GitHub release exists yet, so no release has been published.
While the version is below `1.0.0`, a `feat` commit raises the minor version, a `fix` commit raises the patch version, and a breaking change raises the major version to `1.0.0`.

## Changing the version by hand

Do not edit the version in `package.json` or the manifest outside a release pull request, except to correct a mistake.
To force a specific version, use a `Release-As: x.y.z` footer in a commit message.

## Changelog

release-please creates `CHANGELOG.md` in the first release pull request and adds each later release above the existing entries.
Do not edit `CHANGELOG.md` by hand.

## Deployment

No deployment is configured.
The only workflows are `CI` and `Release Please`, so nothing runs after a release is published.
Releases created with the default `GITHUB_TOKEN` do not trigger other workflows.
If a deployment is added later, call it directly from the release workflow, or use a GitHub App or fine-grained token so that a published release starts it.
