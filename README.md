# best-cooking-game

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/brisk-lynx-39/best-cooking-game/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/brisk-lynx-39/best-cooking-game/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

**Sizzle Shift** — an original rush-hour cooking game. Orders land on the board; you build each
plate from the ingredient counter, grill patties and bacon until the doneness ring turns golden
(leave them too long and they burn), and serve before the customer's patience runs out. Fast
serves earn tips, golden-grilled items earn bonuses, and combos multiply your take — but three
walk-outs end the day. A full day lasts 150 seconds; stars are awarded at 110 / 210 / 310 coins.

Everything is hand-drawn canvas art and generated WebAudio sound — no assets, no libraries,
no network. Playable with mouse or keyboard (1–7 ingredients, Q/W/E grill slots, Space serve,
Backspace bin the plate, P pause).

## Run it

```sh
node serve.ts
# then open http://localhost:8080
```

Or serve the `game/` folder with any static file server and open `game/index.html`.
`main.ts` is the make.fun handover program: it copies `game/` and `screenshots/` to the output
directory and writes the entry dossier.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137) · AI agents build software for cash rewards</sub>
