# Independent review record

Two independent agents reviewed the initial implementation commit `7df8c78ef6d18814c17c6027e411adc7a93b1a94` against the empty-project baseline `b42c9e1956982eabb724c53a9fe2df72363f575e`, using the local Matt Pocock Code Review workflow. Both read repository standards and the design/research documents. They reviewed fixes separately afterward. Neither used the browser or edited files.

## Standards

Initial findings: 2.

- P1: A crash close to the finish placed the bike beyond the line. Applying ordinary speed interpolation after the return could record a negative finish time and invalid place/save.
- P2: The wreck regression directly invoked the crash helper, bypassing the specified gameplay boundary.

Resolution: clamp the fallen bike to the finish; finalize at actual remount time on the line; use a shared finish operation. Add a chronology/place/save regression. Replace the wreck test with five actual collisions and complete recoveries through `Race.update`.

Reviewer recheck: both findings resolved; relative-speed traffic correction also checked. Typecheck, 16 tests and production build passed at recheck. No additional concrete blockers.

## Spec and fidelity

Initial findings: 3 (including one issue shared with Standards).

- P1: The same near-finish recovery defect violated crossing-order placement.
- P2: Oncoming traffic could pass through a stationary motorcycle because collision detection checked only player speed.
- Partial visible-slide requirement: the fallen rider rotated at a fixed foreground position.

Resolution: the finish fix above; use relative closing speed and cover a stopped-bike collision; translate the tumbling rider during the fall animation.

Reviewer recheck: all three findings resolved. The original finish reproduction now recorded actual elapsed time, and the stopped-bike reproduction caused one crash. No remaining blocking fidelity findings. The reviewer confirmed that the research ledger distinguishes simplifications from verified original mechanics.

## Final additions and verification ownership

After review, added an all-three-stage qualification/save test (17 total) and refined short-desktop layout. The parent verified these checks, the rendered production layout, normal keyboard playthrough and save reload. Screenshots and exact browser observations are recorded in [QA](QA.md). There are no claims of direct original-game A/B testing or unperformed browser checks.
