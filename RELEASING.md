# Releasing

Releases are managed by [release-please](https://github.com/googleapis/release-please-action).
The configuration is in `release-please-config.json`, and the current version is tracked in `.release-please-manifest.json`.
The root `package.json` version is the same value and is updated by the release pull request.

## How a release happens

1. Merge pull requests into `master` using Conventional Commits messages (see [CONTRIBUTING.md](CONTRIBUTING.md)).
2. The `Release Please` workflow opens or updates a release pull request. It collects the changes since the last release and proposes the next version.
3. Review the release pull request, including its changelog and version number.
4. Merge the release pull request. release-please then creates the tag and the GitHub release.

## Versions

The repository starts at version `0.1.0`, which is recorded in both `package.json` and `.release-please-manifest.json`.
There were no earlier tags.
While the version is below `1.0.0`, a `feat` commit raises the minor version and a `fix` commit raises the patch version.

## Changing the version by hand

Do not edit the version in `package.json` or the manifest outside a release pull request, except to correct a mistake.
To force a specific version, use a `Release-As: x.y.z` footer in a commit message.
