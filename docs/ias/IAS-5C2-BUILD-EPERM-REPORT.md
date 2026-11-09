# IAS-5-C-2 Build EPERM Report

## Observations
- Earlier default Webpack output in `.next` failed with EPERM while creating `.next/static/chunks/app/api/push`.
- A subsequent restricted run using a distinct temporary `distDir` also failed at a directory creation under that new location. Therefore `.next` alone is not the proven cause.
- `Get-Process node` showed no Node processes visible to the current session. `Get-CimInstance Win32_Process` was denied by the execution environment, so a complete Windows process inventory was unavailable.
- Existing `.next/dev` cache was not deleted or modified for diagnosis.
- An approved elevated Webpack build using `.next-ias5c2-build` completed. A similarly isolated temporary dev server then ran and supported Playwright tests; it was stopped normally.

## Conclusion
The strongest reproducible cause is restricted execution's filesystem write boundary for Next-generated directories. A Windows-wide lock, antivirus interference, or ACL defect was not established. No running process was forcibly stopped, no permissions/security settings were changed, and no user files were deleted.

## Safe procedure
For Codex verification, use a temporary isolated `distDir` and an approved elevated execution when the restricted runner returns EPERM. Restore `next.config.mjs` and `tsconfig.json`, then remove only the exact temporary output created for that run. Do not delete the default `.next` folder while a local server may use it. A permanent project configuration change is not necessary for this recovery.
