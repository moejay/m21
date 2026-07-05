---
name: version-checker
description: Non-blocking npm registry check for available updates to @moejay/m21
group: infrastructure
tags: [version, npm, update-notification]
depends_on: []
features: features/version-checker/
---

# Version Checker

Checks the package registry for a newer published version and prints an upgrade notification.

### How it works

1. Determines the currently installed version from the package's own metadata
2. Asks the npm registry for the latest published version of `@moejay/m21`, giving up after 3 seconds
3. If the latest version differs from the current one, prints: `Update available: X.Y.Z → A.B.C`
4. Silently swallows all errors (network failures, timeouts, malformed responses)

### Invariants

- **Non-blocking**: never delays startup and never causes it to fail — the check runs alongside normal startup and any error is discarded
- **No side effects beyond the notification**: doesn't auto-update, doesn't write state, doesn't cache results
- **Hard timeout**: gives up after 3 seconds so a slow or unreachable registry can't hang the tool
