# Assets and AI-use disclosure

## Brand art (AI-generated)
`assets/fries-mascot*.png`, `assets/cup-mascot*.png`, `assets/burger-twins*.png` are original retro-diner mascot
illustrations generated with an AI image tool (ChatGPT image generation) from the author's art direction on
2026-11-21, then supplied as transparent PNGs. The `-720` files are downsized copies of the full-size files.
They were created during the contest period.

## AI use in building this project
This project was planned and built with heavy AI assistance, by one human director (Victoria Tapscott) working with several AI assistants:
- **Claude (Anthropic)** wrote the application code, graph model, Cypher queries and tests, and ran them.
- **ChatGPT** drafted the concept memo and brand copy and generated the mascot art.
- **GLM (Z.ai)** reviewed scope, contest rules and technical feasibility.
The human director chose the concept, set the product rules (unknown is never "safe", no medical claims), approved the assets and made every scope decision.

## Third-party code
`vendor/relate/` is the unmodified `@relate/relate-wasm` 1.2.0 npm package (Relate by Neo4j, Apache-2.0), vendored for a reproducible, offline setup. See `vendor/relate/PACKAGE.json`.

## Data
All menu items, restaurants, evidence notes and dates are **fictional demo data** (see `seed-data.js`). Nothing describes a real restaurant or kitchen.
