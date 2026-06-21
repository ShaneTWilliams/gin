"use strict";

/* ------------------------------------------------------------------ helpers */
const $ = (sel) => document.querySelector(sel);
const MON = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate = (iso) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-").map(Number);
  return d ? `${MON[m - 1]} ${d}, ${y}` : `${MON[m - 1]} ${y}`;
};
const COL = { T: PLAYERS.T.color, S: PLAYERS.S.color };

/* ------------------------------------------------------------ derived stats */
const totalGames = RECORD.T + RECORD.S;
const leader = RECORD.S === RECORD.T ? null : (RECORD.S > RECORD.T ? "S" : "T");
const trailer = leader === "S" ? "T" : "S";
const lead = Math.abs(RECORD.S - RECORD.T);

const sum = (a) => a.reduce((x, y) => x + y, 0);
const mean = (a) => sum(a) / a.length;
const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/* A side is either a number (final only) or an array of cumulative totals. */
const asSeq = (x) => (Array.isArray(x) ? x : [x]);
const deltas = (arr) => arr.map((v, i) => (i === 0 ? v : v - arr[i - 1]));

/*
 * Derive everything from each game. Dates carry forward: a game's date is its
 * own if set, otherwise the most recent one above it. Higher final score wins;
 * a null side is a loser whose score wasn't recorded — it still loses, but is
 * skipped by the score/margin stats. Hand-level info comes from the running-
 * total progression (sides given as arrays of length 2+).
 */
let carryDate = null;
const games = GAMES.map((g) => {
  if (g.date != null) carryDate = g.date;
  const date = g.date != null ? g.date : carryDate;

  const tKnown = g.T != null;
  const sKnown = g.S != null;
  const tSeq = tKnown ? asSeq(g.T) : [];
  const sSeq = sKnown ? asSeq(g.S) : [];
  const T = tKnown ? tSeq[tSeq.length - 1] : null;
  const S = sKnown ? sSeq[sSeq.length - 1] : null;

  let winner;
  if (tKnown && sKnown) winner = T === S ? null : T > S ? "T" : "S";
  else winner = tKnown ? "T" : sKnown ? "S" : null;

  const win = winner ? (winner === "T" ? T : S) : null;
  const lose = tKnown && sKnown && winner ? (winner === "T" ? S : T) : null;
  const margin = win != null && lose != null ? win - lose : null;

  /* Only sides with a real progression (2+ entries) contribute hands. */
  const hands = [];
  if (tSeq.length > 1) hands.push(...deltas(tSeq));
  if (sSeq.length > 1) hands.push(...deltas(sSeq));

  return { date, note: g.note ?? null, T, S, winner, win, lose, margin, hands, hasHands: hands.length > 0 };
});

const WINNING_SCORES = games.map((g) => g.win).filter((v) => v != null);
const margined = games.filter((g) => g.margin != null);
const margins = margined.map((g) => g.margin);

/* Span of play, derived from the dated games. */
const gameDates = games.map((g) => g.date).filter(Boolean).sort((a, b) => a.localeCompare(b));
const spanStart = gameDates[0] ?? null;
const spanEnd = gameDates[gameDates.length - 1] ?? null;

/* Hand-level stats, from games with a transcribed hand-by-hand progression. */
const handGames = games.filter((g) => g.hasHands);
const allHands = handGames.flatMap((g) => g.hands);
const biggestHand = allHands.length ? Math.max(...allHands) : 0;
const smallestHand = allHands.length ? Math.min(...allHands) : 0;
const longestGame = handGames.length ? Math.max(...handGames.map((g) => g.hands.length)) : 0;
const handsRecorded = allHands.length;

const biggestBlowout = margined.reduce((a, b) => (b.margin > a.margin ? b : a));
const closest = margined.reduce((a, b) => (b.margin < a.margin ? b : a));
const bestLoss = margined.reduce((a, b) => (b.lose > a.lose ? b : a));
const highestScore = Math.max(...WINNING_SCORES);
const lowestWin = Math.min(...WINNING_SCORES);
const avgWin = Math.round(mean(WINNING_SCORES));
const medianWin = median(WINNING_SCORES);
const avgMargin = Math.round(mean(margins));
const avgLoss = Math.round(mean(margined.map((g) => g.lose)));
const blowoutCount = margins.filter((m) => m >= 100).length;
const nailbiterCount = margins.filter((m) => m <= 30).length;

const winsBy = (k) => games.filter((g) => g.winner === k);
const avgWinScore = (k) => {
  const a = winsBy(k).map((g) => g.win);
  return a.length ? Math.round(mean(a)) : 0;
};
const winRate = (k) => Math.round((RECORD[k] / totalGames) * 100);

/* ----------------------------------------------------------- head to head */
function renderScoreboard() {
  $("#span-line").textContent = `${fmtDate(spanStart)} — ${fmtDate(spanEnd)}`;
  $("#wins-T").dataset.target = RECORD.T;
  $("#wins-S").dataset.target = RECORD.S;

  const pct = (n) => Math.round((n / totalGames) * 100);
  $("#pct-T").textContent = `${pct(RECORD.T)}% win rate`;
  $("#pct-S").textContent = `${pct(RECORD.S)}% win rate`;

  if (leader) {
    $(`#card-${leader}`).classList.add("leading");
    const name = PLAYERS[leader].name;
    $("#leader-flag").textContent = `${name} leads by ${lead}`;
  } else {
    $("#leader-flag").textContent = "All square";
  }

  $("#winbar-total").textContent = `${totalGames} games played`;
  requestAnimationFrame(() => {
    $("#winbar-fill").style.width = `${(RECORD.T / totalGames) * 100}%`;
  });
}

/* --------------------------------------------------------------- stat cards */
function renderStats() {
  const groups = [
    { title: "Scoring", suit: "♥", items: [
      { val: avgWin, lbl: "Avg. winning score" },
      { val: avgLoss, lbl: "Avg. losing score" },
      { val: highestScore, lbl: "Highest winning total" },
      { val: lowestWin, lbl: "Lowest winning total" },
      { val: bestLoss.lose, lbl: "Highest losing score" },
      { val: `${avgWinScore("T")} / ${avgWinScore("S")}`, lbl: `Avg. winning score (${PLAYERS.T.name} / ${PLAYERS.S.name})` },
    ]},
    { title: "Margins", suit: "♦", items: [
      { val: `+${avgMargin}`, lbl: "Avg. margin of victory" },
      { val: `${biggestBlowout.win}–${biggestBlowout.lose}`, lbl: `Biggest blowout (${PLAYERS[biggestBlowout.winner].name})` },
      { val: `${closest.win}–${closest.lose}`, lbl: `Closest game (${PLAYERS[closest.winner].name})` },
      { val: blowoutCount, lbl: "Dominant wins (by 100+)" },
      { val: nailbiterCount, lbl: "Nail-biters (won by ≤30)" },
    ]},
    { title: "Hands", suit: "♣", items: [
      { val: biggestHand, lbl: "Most points in one hand" },
      { val: smallestHand, lbl: "Fewest points in one hand" },
      { val: longestGame, lbl: "Longest game (hands)" },
      { val: handsRecorded, lbl: "Hands recorded" },
    ]},
  ];
  $("#stats-groups").innerHTML = groups
    .map((g) => `
      <div class="stat-group">
        <h4 class="stat-group-title"><span class="sg-suit">${g.suit}</span>${g.title}</h4>
        <div class="stat-grid mini">
          ${g.items.map((c) => `<div class="stat"><div class="val">${c.val}</div><div class="lbl">${c.lbl}</div></div>`).join("")}
        </div>
      </div>`)
    .join("");
}

/* ------------------------------------------------------------------- charts */
const FONT = "Inter, sans-serif";
Chart.defaults.color = "#9fb3a8";
Chart.defaults.font.family = FONT;
Chart.defaults.borderColor = "rgba(255,255,255,0.06)";

function gamesChart() {
  new Chart($("#chart-games"), {
    type: "bar",
    data: {
      labels: games.map((g, i) => i + 1),
      datasets: [
        { label: PLAYERS.T.name, data: games.map((g) => g.T), backgroundColor: COL.T, borderRadius: 3 },
        { label: PLAYERS.S.name, data: games.map((g) => g.S), backgroundColor: COL.S, borderRadius: 3 },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      categoryPercentage: 0.78,
      barPercentage: 0.92,
      plugins: {
        legend: { position: "top", labels: { padding: 16, boxWidth: 12, boxHeight: 12, usePointStyle: true } },
        tooltip: {
          callbacks: {
            title: (items) => {
              const g = games[items[0].dataIndex];
              return `Game ${items[0].dataIndex + 1}${g.date ? " · " + fmtDate(g.date) : ""}`;
            },
            label: (c) => ` ${c.dataset.label}: ${c.raw == null ? "not recorded" : c.raw}`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { autoSkip: true, maxRotation: 0, font: { size: 10 } }, title: { display: true, text: "Game (oldest → newest)", color: "#9fb3a8" } },
        y: { beginAtZero: true, title: { display: true, text: "Final score", color: "#9fb3a8" } },
      },
    },
  });
}

function histogramScores() {
  const bins = [
    { lo: 100, hi: 109, label: "100–109" },
    { lo: 110, hi: 119, label: "110–119" },
    { lo: 120, hi: 129, label: "120–129" },
    { lo: 130, hi: 139, label: "130–139" },
    { lo: 140, hi: 149, label: "140–149" },
    { lo: 150, hi: 200, label: "150+" },
  ];
  const counts = bins.map((b) => WINNING_SCORES.filter((s) => s >= b.lo && s <= b.hi).length);
  new Chart($("#chart-scores"), {
    type: "bar",
    data: {
      labels: bins.map((b) => b.label),
      datasets: [{
        label: "Games",
        data: counts,
        backgroundColor: (ctx) => {
          const { chart } = ctx;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return COL.S;
          const g = c.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          g.addColorStop(0, "rgba(231,200,115,0.35)");
          g.addColorStop(1, "rgba(231,200,115,0.95)");
          return g;
        },
        borderRadius: 8,
        maxBarThickness: 70,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => ` ${c.raw} game${c.raw === 1 ? "" : "s"}` } } },
      scales: {
        x: { grid: { display: false }, title: { display: true, text: "Winning total", color: "#9fb3a8" } },
        y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: "Number of games", color: "#9fb3a8" } },
      },
    },
  });
}

function marginsChart() {
  const data = [...margined].sort((a, b) => b.margin - a.margin);
  new Chart($("#chart-margins"), {
    type: "bar",
    data: {
      labels: data.map((g) => `${g.win}–${g.lose}${g.date ? "  ·  " + fmtDate(g.date) : ""}`),
      datasets: [{
        label: "Margin",
        data: data.map((g) => g.margin),
        backgroundColor: data.map((g) => COL[g.winner]),
        borderRadius: 6,
        maxBarThickness: 26,
      }],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (c) => ` ${PLAYERS[data[c.dataIndex].winner].name} won by ${c.raw}` } },
      },
      scales: {
        x: { beginAtZero: true, title: { display: true, text: "Points won by", color: "#9fb3a8" } },
        y: { grid: { display: false }, ticks: { font: { size: 11 } } },
      },
    },
  });
}

/* ----------------------------------------------------------------- timeline */
function renderTimeline() {
  const byDate = {};
  games.forEach((g) => {
    if (!g.date) return;
    (byDate[g.date] ||= { n: 0, notes: [] });
    byDate[g.date].n += 1;
    if (g.note) byDate[g.date].notes.push(g.note);
  });
  const dates = Object.keys(byDate).sort((a, b) => a.localeCompare(b));
  $("#timeline").innerHTML = dates
    .map((d) => {
      const { n, notes } = byDate[d];
      const lbl = `${n} game${n === 1 ? "" : "s"} logged`;
      const note = notes.length ? notes.join(" · ") + " · " : "";
      return `<li><div class="t-title">${fmtDate(d)}</div><div class="t-text">${note}${lbl}</div></li>`;
    })
    .join("");
}

/* --------------------------------------------------------------- game table */
function renderTable() {
  const rows = [...games].sort((a, b) => (b.date || "0").localeCompare(a.date || "0"));
  $("#log-table tbody").innerHTML = rows
    .map((g) => {
      const who = g.winner ? `<span class="win-pill ${g.winner}">${PLAYERS[g.winner].name}</span>` : "Tie";
      const lose = g.lose != null ? g.lose : "—";
      const margin = g.margin != null ? `<span class="margin-tag">+${g.margin}</span>` : "—";
      return `<tr>
        <td>${fmtDate(g.date)}</td>
        <td>${who}</td>
        <td class="num">${g.win}</td>
        <td class="num">${lose}</td>
        <td class="num">${margin}</td>
        <td class="note-cell">${g.note || ""}</td>
      </tr>`;
    })
    .join("");
}

/* ----------------------------------------------------------------- effects */
function animateCounters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = +el.dataset.target;
    const dur = 1100;
    const start = performance.now();
    function step(now) {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}

function revealOnScroll() {
  const els = document.querySelectorAll(".panel");
  els.forEach((el) => el.classList.add("reveal"));
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }),
    { threshold: 0.12 }
  );
  els.forEach((el) => io.observe(el));
}

/* --------------------------------------------------------------------- init */
window.addEventListener("DOMContentLoaded", () => {
  renderScoreboard();
  renderStats();
  renderTimeline();
  renderTable();
  gamesChart();
  histogramScores();
  marginsChart();
  animateCounters();
  revealOnScroll();
});
