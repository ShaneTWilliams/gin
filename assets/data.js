/*
 * ============================================================================
 *  GIN RUMMY LEDGER — DATA
 * ============================================================================
 *  This is the only file you edit. Everything the site shows is derived in
 *  app.js from the GAMES list below.
 *
 *  EACH GAME records the running score as written on the sheet — the list of
 *  cumulative totals each player reached, hand by hand. The last number is the
 *  final score; the jumps between numbers are the hands. This is what powers
 *  the hand-level stats (biggest single hand, longest game, hands played).
 *
 *      { T: [27, 87, 112], S: [77, 91] }   // Dad 112, Shane 91, over 5 hands
 *
 *  If you only know the final score, just write the number:  { T: 138, S: 96 }
 *  Use [0] when a side wasn't recorded on the sheet (loser left blank); that
 *  game still counts as a win for the other player but is skipped by the
 *  score/margin stats.  0 means a true shutout (written as a 0 on the sheet).
 *
 *  DATES carry forward: a "date" applies to that game and every game after it
 *  until a new "date" appears. Omit "date" to keep the previous one. Use
 *  "YYYY-MM-DD" (or "YYYY-MM" when the day isn't known). The higher final
 *  score wins.
 *
 *  Players: T = Dad, S = Shane  (the initials written on the sheet).
 * ============================================================================
 */

const PLAYERS = {
  T: { key: "T", name: "Dad",   color: "#e0a96d" },
  S: { key: "S", name: "Shane", color: "#5fb0c4" },
};

/*
 * Lifetime record from the tally box on the sheet (Dad 26, Shane 32 — all 58
 * games ever played). GAMES below holds the 56 that were legible enough to
 * transcribe in full, so the headline record lives here rather than derived.
 */
const RECORD = { T: 26, S: 32 };

const GAMES = [

  /* Apr 2023 */
  { date: "2023-04", T: 17, S: [26, 32, 79, 161] },
  { T: 52, S: [25, 66, 95, 117] },
  { T: [39, 78, 114], S: 28 },
  { T: [63, 95], S: [44, 143] },
  { T: [32, 107], S: 29 },
  { T: [40, 99, 138], S: [51, 93, 96] },
  { T: 48, S: [32, 89, 129] },
  { T: 0, S: [54, 85, 159] },
  { T: [38, 78], S: [34, 64, 117] },
  { T: [29, 76, 104], S: [0] },
  { T: 44, S: [50, 80, 131] },
  { T: 44, S: [32, 86, 102] },
  { T: 43, S: [26, 30, 82, 111] },
  { T: 64, S: [30, 37, 126] },
  { T: 29, S: [61, 99, 129] },
  { T: [0], S: [41, 110] },
  { T: 35, S: [29, 64, 118] },
  { T: 37, S: [57, 65, 112] },
  { T: [35, 36, 71], S: [4, 5, 25, 57, 94, 147] },
  { T: [27, 60, 87, 117], S: [22, 26] },
  { T: [26, 65, 95, 125], S: [29, 65] },
  { T: [18, 49, 65], S: [25, 67, 93, 176] },
  { T: [33, 64], S: [43, 71, 119] },
  { T: 41, S: [81, 174] },
  { T: [31, 60, 79, 137], S: 51 },
  { T: [0], S: [28, 74, 109] },
  { T: [60, 117], S: [31, 67] },
  { T: [32, 95, 117], S: [5, 18, 48, 74] },
  { T: [41, 82, 115], S: [49, 50] },
  { T: 40, S: [45, 123] },
  { T: [47, 103], S: [51, 66, 93] },
  { T: [49, 105], S: [0] },
  { T: [31, 83, 133], S: [28, 82] },
  { T: [30, 37], S: [17, 35, 70, 125] },

  /* Dec 2023 */
  { date: "2023-12", T: [0], S: [29, 72, 101] },
  { T: 46, S: [53, 81, 122] },
  { T: 6, S: [35, 71, 116] },
  { T: 55, S: [51, 108] },
  { T: [0], S: [73, 133] },

  /* Jul 2024 */
  { date: "2024-07", T: [21, 63], S: [15, 17, 32, 74, 111] },
  { T: [70, 120], S: [0] },
  { T: [30, 74, 109], S: [0] },

  /* Dec 2024 */
  { date: "2024-12", T: [0], S: [50, 95, 126] },
  { T: [26, 79, 90, 120], S: [43, 89, 91] },
  { T: [29, 58, 103], S: [0] },
  { T: [27, 87, 112], S: [77, 91] },
  { T: [27, 93, 125], S: 42 },
  { T: [27, 84, 126], S: [0] },
  { T: [70, 108], S: 39 },

  /* Jun 2025 */
  { date: "2025-06", T: 29, S: [41, 71, 86, 124] },
  { T: [0], S: [42, 45, 74, 136] },
  { T: [27, 100], S: [0] },
  { T: 51, S: [30, 57, 117] },
  { T: [26, 77, 106], S: [35, 64] },
  { T: [27, 55, 131], S: 49 },
  { T: [78, 113], S: [0] },

  { date: "2025-10", T: [26, 81], S: [29, 88, 121] },
  { T: [0], S: [38, 64, 94, 140] },
  { T: [43, 73, 149], S: [0] },
  { T: [51, 78], S: [27, 114] },
  { T: [31, 76], S: [38, 82, 112] },

  { date: "2025-12", T: [92, 125], S: [52] },
  { T: [28, 35, 69, 96, 134], S: [36] },
  { T: [55, 98], S: [36, 68, 115] },
  { T: [32], S: [30, 70, 118] },

  { date: "2026-04", T: [61, 87, 125], S: [62] },
];
