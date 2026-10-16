# Verification evidence

Executed on the connected Mac in Chrome, 2026-10-16. Desktop keyboard is the primary supported and tested input. The parent task owned browser use; independent reviewers did not touch the browser.

## Automated checks

- `npm run typecheck`: passed, strict TypeScript.
- `npm test`: **17/17 passed**. Actual simulation boundary, including continuous speed/steering, curve forces, attack reach, rival down/retaliation, traffic collisions including a stopped bike, recovery/brake/remount, five real traffic crashes to wreck, pause, nitro, finish order, near-finish crash chronology, validated saves, complete input-driven races and all three stages qualifying/unlocking.
- `npm run build`: passed; production output contains no runtime dependencies, remote fonts or downloaded art.
- Dependency install audit reported zero known vulnerabilities at installation time. This is not a security audit.
- Independent standards and spec/fidelity reviews completed. All concrete findings were resolved and rechecked; see [review record](REVIEW.md).

## Normal-input Mac browser playthrough

Used the production preview at `http://127.0.0.1:5219/`, ordinary UI clicks and held keys (including simultaneous throttle/steer/attack). No JavaScript state injection, cheats, teleporting, clock acceleration, hidden debug mode or save editing.

1. Started from the road-selection menu through countdown. Held W to build speed, observed road/traffic scaling behind the motorcycle.
2. Steered through curves in both directions; road contact and horizon changed with the route's grades. An initial rendering inspection found oversized rivals and a foreground road gap; corrected both and rechecked in the browser.
3. Held J alongside rivals. Rival stamina visibly decreased (Flint reached 34); the final result recorded **4 landed hits**. Rival retaliation visibly reduced player stamina. K input and kick animation were exercised; a distinct successful kick displacement was not isolated visually. Kick displacement has an automated behavioral check.
4. Experienced a shoulder fall and multiple traffic encounters causing damage. Observed bike condition step from 100 to 78, 56, 34 and 12. Tested holding S during the return, steering adjustment, automatic remount and resumed racing. The field continued advancing.
5. Completed Ember Basin by riding the full 3.20 km: result **7 / 8 at 01:19.7, 4 hits, 4 crashes**. No state shortcuts. This nonqualifying result correctly kept the second stage locked.
6. Clicked Race again: a new countdown began with distance, condition and nitro reset. Accelerated again, then paused.
7. Reloaded the production page: the visible first-stage card retained **BEST 01:19.7**. Subsequent reloads retained it again. Storage was accessed only through the normal game UI.
8. In a fresh attempt used Shift + W: charge indicator changed from three to two and BOOSTING appeared. Held S to brake from over 110 MPH to 000. Pause/resume worked.
9. Toggled Sound on/off and checked for application errors. Captured console errors: none. The browser emitted unrelated installed-extension warnings; those are not game errors. Audio quality was not audibly assessed.
10. Adjusted the desktop layout so the full instrument panel and menu fit the current short viewport; visually rechecked the production build. The live tab is left at its start menu.

## Saved screenshots

- [Final riding view with nitro](images/racing.jpg)
- [Menu showing the persisted best time](images/menu-save.jpg)

These screenshots contain only the new game's local page, not other browser tabs or private material.

## Preview durability and preservation

The production preview runs with a detached session, stdin disconnected and logs outside the repository. The launching tool has exited. Rechecked more than 16 minutes later: its parent PID is **1**, it still listens only on **127.0.0.1:5219**, and HTTP GET succeeds. This avoids tying its lifetime to a task-managed PTY. It persists until process termination, logout/reboot or other host cleanup; automatic startup after reboot is not configured.

Port 5219 was successfully bound and released before use. Existing port 5218 remained served by the same prior process. No prior project directory, save key or preview process was edited, removed or stopped. The new project stayed within its empty assigned workspace; the local-only Sinking Star correction was never opened or changed. Machine security/locking settings were not modified. No public website was deployed.

## Limits and checks not performed

- The original Road Rash II executable was not run. Primary manual and contemporary developer coverage ground the design; no direct A/B handling or pixel-fidelity claim.
- Browser run covered the complete first stage, restart and best-time persistence. Top-three unlocks and full three-stage progression passed simulation tests; the second/third stages were not separately completed through the Mac browser.
- Successful kick displacement was not isolated visually; tested at simulation level.
- No mobile-device/touch playthrough, Safari/Firefox, gamepad, screen-reader usability audit or subjective audio check.
- Crash-return traffic injury, physical jumps, police, weapons, economy and multiplayer are omitted/simplified as recorded in [research](RESEARCH.md).
- CI status and the exact final commit are reported in the task handoff after publication; inspect the repository's CI check for that exact commit.
