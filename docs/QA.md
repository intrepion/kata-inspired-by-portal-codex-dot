# Verification evidence
## Simulation coverage
Gateway transforms: known floor-to-wall falling velocity, wall-to-wall offsets, arbitrary-vector inverse, swept high-speed plane crossing, backface and aperture rejection.
Simulation: nearest eligible target, occupied-panel rejection, occlusion/invalid replacement preservation, wall crossing and speed, floor launch, recrossing guard, cube release/power/exit gating, floor overlap regression, looking-down release, reset completeness, versioned save input.
Campaign: all five chambers solved through the public placement, movement and interaction APIs with physical paths and no state warps. Whole-campaign tests are simulation coverage, not browser evidence.

## Visible Mac Chrome run
On 2026-10-10/11 UTC, used the actual browser UI and normal drag-look, keyboard aiming/placement, WASD, E and menu buttons. No console commands or hidden level skips.
1. Placed cyan A / amber B, walked through A across the gap, reached exit. Completion message observed.
2. Targeted the exposed upper part of raised B, crossed from A to the gallery, reached exit. Completion observed.
3. Crossed to the far side, secured cube with E, reversed and returned through B while carrying it. Set it on receiver; POWERED state observed; exit completed.
4. Approached balcony edge, aimed down and placed floor A, aimed at raised wall B, walked off balcony. Crossing observed at ~17 m/s; exit shelf completion observed.
5. Carried cube through A→B onto middle gallery, deposited and aligned it on receiver, observed POWERED. Replaced cyan A with C, entered amber B to upper gallery, reached exit. RELAY RESTORED ending observed.

Browser issues found during play: a shallow post-crossing floor overlap (fixed with a regression test); drag release shooting unexpectedly (fixed by tracking drag movement); aiming down blocked cube release (fixed with floor clearance). The first iteration's floor intake was moved under the natural walking fall trajectory; campaign simulation verifies the revised launch.

Post-review visible regressions: chamber 1 repeated crossings including immediate return succeeded; chamber 3 was replayed with carried return, looking-down release, POWERED receiver and grounded exit completion; chamber 4 was replayed with a 16.8 m/s launch and grounded shelf completion. Esc paused movement, placement, interaction and restart; resume retained state. R cleared both gateways; falling recovered at spawn. Reload retained all five unlocked chambers. Mute/reduced-motion toggles were exercised. Linked destination floor and green exit were visible through the gateway; screenshots are in screenshots/.

Independent Standards and Specification reviews confirmed the significant fixes with no remaining high-priority findings. Final automated release checks and remote CI are recorded below. Browser coverage is Mac Chrome desktop; pointer-lock fallback was used, not touch/mobile or other browsers.

## Release checks
Final local run: 22 tests across 3 files passed; TypeScript passed; production build passed (535.78 kB JS / 139.42 kB gzip, a nonblocking Vite chunk-size advisory); npm audit found zero vulnerabilities. Independent session server HTTP 200 and actual Chrome reload verified on 5184. No game console errors. Fresh first chamber left open with unplaced gateways; all unlocked progress retained. No sidebar project registration API was available; local folder and browser deliverable exist.
