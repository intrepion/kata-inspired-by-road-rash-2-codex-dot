# Repository instructions

- Work only in this repository. Preserve unrelated projects, preview processes and browser saves.
- Keep gameplay in `src/race.ts` independent of DOM, rendering and browser storage.
- Use strict TypeScript; expose names that describe road-racing concepts. Avoid new frameworks or runtime dependencies without a concrete need.
- Tests must assert actual gameplay behavior through `Race.update` or save functions. Cover regressions with meaningful assertions; do not replace normal-input browser checks with state manipulation.
- Verify source-grounded fidelity against `docs/RESEARCH.md` and scope against `docs/SPEC.md`. Distinguish omissions from implemented mechanics.
- Run `npm run typecheck`, `npm test`, `npm run build` after substantive changes.
- Local previews bind loopback with strict ports. Never stop other preview processes or change machine security settings.
- Keep credentials, local logs, private user material and dependency/build output out of Git. Review staged content before publishing.
