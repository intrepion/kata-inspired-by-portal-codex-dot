# Parallax Relay acceptance criteria
An original five-chamber first-person puzzle campaign about restoring a remote orbital relay. Desktop keyboard/mouse is the supported device.

- Two differently shaped/colored gateways placed by aiming at visibly marked fixed panels. Invalid, occluded and occupied-panel shots reject without destroying an existing gateway.
- Continuous spatial crossings, transforming offset, forward direction and velocity. Fixed 120 Hz stepping plus swept plane tests prevent high-speed tunneling. Upright gravity-aligned player collision; projected body extents fit the opening. Exit clearance and suppression of immediate recrossing.
- Five genuine puzzles: gap travel, raised destination, returning a carryable relay cube to a pressure switch, falling into a floor gateway to cross a launch gap, and cube/elevation/replacement synthesis.
- Every chamber has restart and fall recovery. Cube delivery governs doors. Chamber completion requires reaching the door normally; no skip controls.
- Aiming, placement feedback, readable objective and controls; drag-look and keyboard-look fallback for pointer lock; pause isolates game inputs. Mute and reduced motion.
- Validated versioned local progress, unlocked chamber replay, clear final ending. Reset rebuilds all mutable chamber state.
- Linked perspective views: one recursion level, clipped at destination, screen-projected texture. No promises of infinite recursion or physically simulated mobile controls.

## Test seams (delegated recommended decisions)
Gateway geometry/transform/placement: catches mathematical orientation and ray/crossing errors, misses GPU appearance.
Simulation step/interact/reset/progress: catches movement, cube/switch/door and campaign state; misses actual DOM inputs.
Visible Mac browser: covers normal controls, every puzzle solution, presentation and reload; distinct from simulation scripts.

## Decision tree
Recommended decisions accepted under the user's explicit delegation: desktop Three.js/TypeScript; fixed eligible panels for bounded collision holes; five rooms; no arbitrary-wall placement; fixed-step custom controller rather than a general rigid-body engine; cube follows player while held and falls when dropped; public behavioral seams above; initial empty commit as review baseline. No paid services or deployment.
