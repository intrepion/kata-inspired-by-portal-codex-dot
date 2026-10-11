# Skill usage and delegated adaptations
Read local `.agents/skills/{grill-with-docs,grilling,domain-modeling,implement,tdd,code-review}/SKILL.md`, TDD tests/mocking guidance, and local ADR/context formats. Checked the current official Matt Pocock grill-with-docs and implement sources on GitHub, plus productivity/grilling and engineering/domain-modeling, tdd and code-review. Current domain-modeling uses GLOSSARY.md; the older installed version uses CONTEXT.md. This project follows the current glossary vocabulary and keeps implementation tradeoffs in ADRs.

User explicitly delegated recommended decisions and prohibited design questions, so interview confirmations and TDD seam confirmation were accepted under that delegation. The design tree and seams are recorded in SPEC.md. Implement produced vertical physics/puzzle slices with regular targeted tests/typechecking. Actual red/green cycles: missing gateway module then implemented floor-to-wall transform; missing simulation then nearest-panel placement; regression failure for settling after crossing then collision correction; looking-down cube release failure then floor clearance correction. Additional geometry and whole-campaign tests were added against the public simulation seam after implementation; this was targeted TDD, not universal test-first development of rendering or UI.

Code-review uses independent standards and specification agents, comparing against empty baseline commit e142bb4. The originating spec is docs/SPEC.md; standards are CODING_STANDARDS.md and the skill's Fowler smell baseline. Review findings and resolutions are saved in docs/REVIEW.md. No issue tracker was needed for this direct delegated build; no setup skill or extra account was installed.

Official sources:
- https://github.com/mattpocock/skills/blob/main/skills/engineering/grill-with-docs/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/implement/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/productivity/grilling/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/tdd/SKILL.md
- https://github.com/mattpocock/skills/blob/main/skills/engineering/code-review/SKILL.md

Technical primary references consulted: Three.js WebGLRenderer/camera/plane/render-target documentation https://threejs.org/docs/ and MDN Pointer Lock API https://developer.mozilla.org/en-US/docs/Web/API/Pointer_Lock_API .
