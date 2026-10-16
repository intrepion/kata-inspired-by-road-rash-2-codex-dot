# Gameplay research and fidelity ledger

Inspected before final design, 2026-10-16. Primary material is the Genesis version, not the 1994 3DO game or the first Road Rash.

## Sources

1. Electronic Arts, *Road Rash II instruction manual*, 1992. [Scanned US manual](https://segaretro.org/images/b/b0/Road_Rash_2_MD_US_Manual.pdf), [catalog and provenance](https://segaretro.org/File:Road_Rash_2_MD_US_Manual.pdf). Visually inspected PDF spreads containing printed pp. 2–3, 10–13, 16–19. Page numbers below are printed numbers, not PDF indices. Direct Games Database and web PDF access failed; the Sega Retro download succeeded. No manual art is distributed here.
2. *Electronic Gaming Monthly* 42, January 1993, “Behind the Screens: The Making of Road Rash 2,” pp. 126–127. [Original issue scan](https://retrocdn.net/images/9/93/EGM_US_042.pdf). Visually inspected p. 127: discussion with producer Randy Breen, different opponent priorities, chains and hardware compromises. The direct download worked despite web fetch returning 403. No magazine art is distributed.
3. [Road Rash II overview](https://en.wikipedia.org/wiki/Road_Rash_II), consulted as a secondary discovery aid to locate the original manual and contemporary coverage. Primary sources above drive the decisions, not details from other series entries.

## Verified original mechanics → this game's treatment

| Evidence | Original mechanic | Cinderline treatment |
| --- | --- | --- |
| Manual p. 2 | Continuous directional steering, separate acceleration/brake/attack, pause | Keyboard equivalents, continuous input |
| Manual pp. 2, 12–13 | Attack nearest racer; punch, kick and backhand; weapons | Nearest-target punch and displacement kick; omit backhand/weapons |
| Manual p. 3 | Third or better on each course to advance | Third or better opens next of three stages |
| Manual pp. 10–11 | Behind-bike road view, speed, placement, rider/rival stamina, bike condition | Perspective canvas and corresponding gauges; omit mirrors/RPM |
| Manual p. 12 | Automatic run back; steer to alter path, brake to wait | Slide then automatic return with those inputs |
| Manual pp. 2, 12 | Limited nitro on equipped bikes | Three charges on the slice's single bike; dedicated Shift key |
| Manual pp. 17–18 | Curves, changing grades, traffic/roadside hazards | Curved elevated road, moving cars, shoulder falls |
| EGM p. 127 | Different rider priorities and aggression | Independent weaving; some seek nearby player |

## Explicit design approximations

All numerical values are original tuning, not measured original physics. Eight riders replace fifteen. Roads are continuous procedural curves and elevation profiles; perspective uses projected strips and hill occlusion. There is no physical airborne state. Shoulder falls stand in for collisions with roadside scenery; decorative rocks/cacti have no colliders. Cars use two traffic directions and recycle into the distance. They do not physically collide with AI racers. Rival knockdowns pause their motion for four seconds; they do not perform the player's full return animation. Punches deal 34 stamina damage; kicks push sideways/backward without stamina damage. Riders recover stamina gradually. Falling costs 22 bike condition, and remount protection lasts 2.5 seconds. Return collision risk is simplified away: braking can wait, but cars cannot injure the on-foot rider.

Campaign scope is three sequential original desert roads with increasing demands, free retries, qualification badges and best times, rather than five tracks across five levels and a motorcycle economy. Browser saves replace passwords. Nitro is present from the start with a direct key rather than double-tap acceleration. No claim is made that this bike roster, timing, handling or progression reproduces the original game's balance.

## Omitted

Police/arrest, fines and money, motorcycle purchasing, club/chain acquisition, multiplayer/split screen, original settings and characters, livestock, oil/gravel patches, rear mirrors, powered jumps and animated narrative cutscenes. These omissions keep the race/combat/recovery loop coherent and bounded. The original executable was not run, so camera and feel comparisons are source-grounded interpretation rather than direct A/B validation.
