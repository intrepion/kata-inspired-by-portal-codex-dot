# Parallax Relay
An original desktop first-person spatial puzzle game. Restore an abandoned orbital relay across five compact chambers by placing two linked gateways. All artwork, geometry, writing and synthesized sounds are original; no Valve assets or copied maps.

## Play locally
Requires Node 24 and a desktop browser with WebGL.

```sh
npm ci
npm run dev
```
Open http://127.0.0.1:5184 . The strict port preserves the previous games on 5173–5183. The server is loopback-only, session-only: no login/boot autostart. Restart with the command above after quitting it or restarting the Mac. No deployment or paid services.

WASD move, Space jump, E pick up/set down a cube. Aim with mouse drag, arrow keys, or double-click the chamber for pointer lock. Shift slows keyboard turning. Left click / 1 / Q places cyan; right click / 2 / F places amber. H gives the chamber hint, R resets the whole chamber, Escape pauses. Menu inputs cannot place gateways or move the player. Mute and reduced-motion controls are in the menu. Browser-local progress unlocks replay after completion; a reload starts the latest unlocked chamber cleanly.

## Gateway rules and limits
Only marked pale SEAM panels accept gateways. A shot hits the nearest unobstructed eligible panel and snaps to its center; this is deliberate authored-surface placement, not arbitrary-wall cutting. Cyan is elliptical, amber is an eight-sided opening. Two gateways cannot share a panel. Placement/crossing checks static exit clearance, body fit, front-face approach and backing collision apertures. Floor-to-wall transforms conserve speed and rotate velocity and viewing direction. Gravity stays downward, and the player body stays upright. Momentum includes carried cubes, which follow the player; released cubes fall and can cross gateways. Cubes are not a general rigid-body stacking/throwing system.

Views use one transformed-camera render per linked gateway, with destination plane clipping. They have parallax but no recursive gateways or split-body rendering. Camera roll is reoriented to upright; a floor-to-wall crossing can briefly leave the camera looking upward, and arrow/drag controls restore the desired aim. Physics uses fixed substeps, swept portal plane tests, and axis-aligned collision rather than a general physics engine.

Desktop Chrome on this Mac is the tested device. Responsive menus are supported; physical touchscreen gameplay is not promised. There are no remote calls in gameplay or external assets. Storage failures leave the current session playable.

## Verification
`npm test`, `npm run typecheck`, `npm run build`, `npm audit`. CI repeats tests, build and audit. Physics/puzzle tests and Mac browser coverage are recorded separately in [docs/QA.md](docs/QA.md). See [docs/SPEC.md](docs/SPEC.md), [GLOSSARY.md](GLOSSARY.md), and [docs/adr](docs/adr) for acceptance criteria and decisions.
