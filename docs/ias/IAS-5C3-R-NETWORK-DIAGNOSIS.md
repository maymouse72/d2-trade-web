# IAS-5-C-3-R Network Diagnosis

Date: 2026-11-09. No Playwright, server, or operating-system settings were changed.

## Result

Classification: **NETWORK_POLICY_DENIED in the Codex constrained runner; user environment works**.

The configured address is `http://127.0.0.1:4173/game-info/ias-calculator`. Playwright's `webServer` successfully launched `next start`; Next logged `Ready`. The server readiness probe then repeatedly failed with `connect EACCES 127.0.0.1:4173`. The test server was shut down by the test runner when that diagnostic run was interrupted.

Separate PowerShell requests to both `127.0.0.1:4173` and `localhost:4173` failed with Windows' hidden-socket access-denied error. No listener was present before the diagnostic; while Playwright started its own server, readiness requests still failed. This rules out a simple wrong port, `localhost`/IPv4 alias difference, and a server that never starts. The app server itself reached Next `Ready`; the Playwright health probe could not use the local socket.

Earlier browser attempts using an externally started local server also returned `ERR_NETWORK_ACCESS_DENIED` in restricted execution and `ERR_CONNECTION_TIMED_OUT` in approved execution. This run reproduced the more diagnostic `EACCES` from Playwright's Node health-check process. This is an execution environment local-network policy boundary; evidence does not point to an IAS application error. No Windows firewall, antivirus, proxy, or permission settings were changed, and no unrelated process was stopped.

The user's screenshot later showed `npm run test:ias:browser` succeeding in their ordinary Windows PowerShell (`2 passed`). This confirms the restriction is specific to Codex's constrained runner, rather than the user's PC, app server, or Playwright configuration. No project configuration change is required. Changing the port, adding retries, or switching hostname would not resolve a denied loopback socket in the constrained runner and could obscure the root cause.

## User-PC diagnostic

In the user's normal PowerShell (not this constrained runner), from the repository:

```powershell
Get-Location
git status --short
Get-Process node -ErrorAction SilentlyContinue
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
  Where-Object { $_.LocalPort -in @(3000,3001,3100,4173) }
Test-NetConnection 127.0.0.1 -Port 4173
Invoke-WebRequest -Uri 'http://127.0.0.1:4173/game-info/ias-calculator' -UseBasicParsing -TimeoutSec 15
```

Do not terminate any existing Node process. If port 4173 is unused, run the browser test from the normal user PowerShell in the repository; Playwright will own and clean up its configured test server:

```powershell
npm run test:ias:browser
```

If a local development/production server is already running, leave it intact and use a separate unused port only after editing the test's local configuration deliberately. Do not change firewall or system policy. Record the command output if a normal PowerShell run still reports EACCES.
