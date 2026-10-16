# ADR 0001: Projected road and independent simulation

Accepted, 2026-10-16.

The defining experience depends on a behind-bike view, continuous handling and scalable traffic. We chose a procedural projected-strip road rendered in Canvas 2D, with actual continuous road coordinates in a separate fixed-step simulation, rather than a full 3D engine. This keeps the source small, portable and testable, and makes a cohesive illustrated style feasible without external art.

The tradeoff is a deliberately limited world: no physical jumps, free camera, intersections or volumetric collision. Hills use projection and occlusion, and contact is computed in road coordinates. Those limits are documented rather than presented as full simulation fidelity.
