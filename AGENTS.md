# synq-examples: rules for agents and people

Public, MIT. Working examples of Synq's public SDKs, each a folder of its own: `nextjs-solana-login` (Next.js App Router, Sign In With Solana and passkeys) and `expo-solana-login` (Expo on Android and Seeker, Mobile Wallet Adapter). The code Synq ships lives in the private `aerosol-build/synq` repo; this one only uses what npm has.

- **Published packages only.** Each example installs `@synqauth/*` from npm at one exact version, the same in every example, never a workspace link, a tarball or unpublished code. When a new version is out, bump every `@synqauth/*` in both examples together, in one PR, with the code changes it needs.
- **The docs are the spec.** The code follows docs.synq.build's guides (getting started, Solana wallets, own-UI sign-in, connected wallets). Where an example and the docs disagree, fix whichever is wrong in the same day, in its own repo.
- **Standalone folders.** Each example has its own `package.json` and `package-lock.json` (npm, which every reader has), so copying one folder out works. No root workspace.
- **No secrets, nothing environment-specific in code.** Every brand and app value (issuer, client ID, secret, app URL, app origin) comes from the example's `.env` file, and only `.env.example` is committed. The only Synq hosts named are links to synq.build and docs.synq.build in READMEs and placeholders in `.env.example`.
- **CI** (`.github/workflows/ci.yml`) typechecks and builds both examples on every push to `main` and on dispatch, on GitHub's hosted runners: this repository is public, so it never runs on self-hosted runners. There are no PR checks.
- **Repository settings** are `scripts/repo-settings.sh` (description, topics, rulesets, security), run by an admin; rerunning it changes nothing.
- **Pull requests** into `main`, which takes no direct pushes. Conventional Commits, scopes `nextjs-solana-login`, `expo-solana-login`, `repo`, `ci`, `deps` and `docs`.
