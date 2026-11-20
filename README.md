# Kcode Demo Sandbox

An extensible Next.js demo platform built around a domain-agnostic microkernel and independently packaged plugins.

## Development

```bash
pnpm install
pnpm dev
pnpm build
```

Demo sign-in uses `admin` / `admin` only in development.

## Contributing and releases

See [CONTRIBUTING.md](CONTRIBUTING.md) to set up, verify and open a pull request.
See [RELEASING.md](RELEASING.md) for how versions and releases are managed.

## Architecture

The web app is the composition root. It registers plugin packages with the kernel; the kernel never imports plugins. See [the architecture overview](docs/architecture/overview.md) and [the plugin guide](docs/development/adding-a-plugin.md).
