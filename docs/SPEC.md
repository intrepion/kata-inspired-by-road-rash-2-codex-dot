# Cinderline Run: accepted defaults and playable scope

The delegated brief explicitly directs recommended defaults without optional questions. The Grill with Docs workflow is therefore applied as a recorded design challenge and domain glossary, without an interview gate. No ancestor or initial repository AGENTS.md was found. Local Matt Pocock Implement, TDD and Code Review guidance informed the workflow.

## Design decision tree

- Identity: original assets and story; recognizability comes from motorcycle road racing and combat.
  - Camera: behind the bike with road receding to a horizon; visible curves, grades and scaling traffic. Reject a top-down/lane-clicking design.
  - Input: continuous throttle, brake and steering. Separate punch, kick, nitro and pause keys.
  - Core contest: eight riders on an open public road. Actual distance and finish crossing order determine placement.
  - Risk: traffic, shoulders and retaliation can throw a rider. Bike damage accumulates. Other riders continue during recovery.
  - Recovery: visible slide, on-foot automatic return, steer adjustment, brake to wait, automatic remount.
  - Progress: top-three qualification opens the next of three short original desert stages; browser-local progress and best times. Free retries keep the slice bounded.
- Art: cohesive illustrated desert travel postcard, orange jacket, teal instruments, distant mesas and warm sunset. Procedural vector shapes avoid copied assets and external downloads.
- Scope: roughly one-minute races before crashes, three events, no shop/economy, police or multiplayer.

## Reviewable acceptance criteria

1. Start menu and countdown lead to actual playable motion.
2. Holding controls continuously changes speed and lateral position; curves push outward more at high speed, shoulder riding slows.
3. Curves/hills are visible from the following camera. Traffic and opponents scale into view.
4. Only nearby riders can be hit. Punch stamina depletion and kicks can knock them down; rivals can hit back.
5. Traffic causes a crash and damage. The rider returns and remounts while the field moves on. Five crashes end the attempt.
6. Finish shows crossing-order placement, hits and crashes; immediate retry and track selection work.
7. Qualification unlocks harder stages; valid progress survives reload; damaged storage fails safely.
8. Automated mechanics tests, types/build and independent standards/fidelity review pass. Mac browser normal-input playthrough covers start, steering, combat, traffic fall, return, finish/restart and save reload. Any missing checks are identified honestly.
9. Public requested repository contains source, README, full MIT license, official GitHub OS ignores, docs and CI. No public website deployment. A detached loopback preview remains alive after its launching tool exits.

## Engineering seam

The main test boundary is the actual simulation's public `Race.update(dt, input)` method plus save parse/record functions. Input-state fixtures can arrange short collision/combat scenarios; a full simulated run uses input only. Browser checks use ordinary buttons/keys, without test-state mutations, warps, clock acceleration or cheat flags.
