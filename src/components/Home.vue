<script setup>
// Home / landing view — designed to render inside <RouterView /> in App.vue,
// using the app's existing daisyUI theme (base-100/200, primary) and the
// global h1/h2 styles already defined in style.css.
// Imagery is hand-drawn inline SVG (pitch/formation, ticker, podium) rather
// than photos, since real player/club imagery isn't something Claude can
// source or reproduce.

import { RouterLink } from "vue-router";

const squad = [
  { pos: "GK", initials: "AR" },
  { pos: "DF", initials: "TA" },
  { pos: "DF", initials: "VD" },
  { pos: "DF", initials: "WS" },
  { pos: "MF", initials: "KB" },
  { pos: "MF", initials: "BF" },
  { pos: "MF", initials: "MS" },
  { pos: "FW", initials: "EH", captain: true },
  { pos: "FW", initials: "BS" },
  { pos: "FW", initials: "MS" },
  { pos: "MF", initials: "GJ" },
];

const priceTicker = [
  { name: "Haaland", change: "+£0.1m", trend: "up" },
  { name: "Saka", change: "+£0.1m", trend: "up" },
  { name: "Sterling", change: "−£0.2m", trend: "down" },
];

const prizeBoard = [
  { place: "1st", gameweek: "£40", season: "£1,200" },
  { place: "2nd", gameweek: "£20", season: "£600" },
  { place: "3rd", gameweek: "£10", season: "£300" },
];
</script>

<template>
  <div class="landing">
    <!-- HERO -->
    <section class="hero-band -mx-4 px-4 py-16 lg:py-20 rounded-box mb-12 overflow-hidden relative">
      <div class="max-w-6xl mx-auto grid lg:grid-cols-5 gap-10 items-center relative">
        <div class="lg:col-span-2 text-white">
          <p class="text-sm font-semibold text-primary mb-3">Gameweek 7 · 1d 14h left</p>
          <h1 class="!text-white !m-0 !mb-8 text-4xl lg:text-5xl">
            Pick with confidence.
          </h1>
          <RouterLink to="/squad" class="btn btn-primary">
            Analyse my squad
          </RouterLink>
        </div>

        <!-- Formation illustration -->
        <div class="lg:col-span-3">
          <svg viewBox="0 0 600 340" class="w-full h-auto" role="img" aria-label="Squad formation on a pitch">
            <rect x="0" y="0" width="600" height="340" rx="16" fill="#1f1a3a" />
            <g stroke="rgba(255,255,255,0.15)" stroke-width="2" fill="none">
              <rect x="20" y="20" width="560" height="300" rx="8" />
              <line x1="300" y1="20" x2="300" y2="320" />
              <circle cx="300" cy="170" r="50" />
              <rect x="20" y="110" width="60" height="120" />
              <rect x="520" y="110" width="60" height="120" />
            </g>
            <g v-for="(p, i) in squad" :key="i">
              <circle
                :cx="60 + (i % 4) * 150 + (Math.floor(i / 4) % 2) * 30"
                :cy="55 + Math.floor(i / 4) * 95"
                r="20"
                :fill="p.captain ? '#aa3bff' : '#2e2657'"
                stroke="white"
                stroke-opacity="0.25"
              />
              <text
                :x="60 + (i % 4) * 150 + (Math.floor(i / 4) % 2) * 30"
                :y="55 + Math.floor(i / 4) * 95 + 5"
                text-anchor="middle"
                font-size="13"
                font-weight="600"
                fill="white"
              >{{ p.initials }}</text>
            </g>
          </svg>
        </div>
      </div>
    </section>

    <!-- FEATURE 1 — SQUAD IQ -->
    <section class="grid lg:grid-cols-2 gap-10 py-10 border-t border-base-300 items-center">
      <div class="order-2 lg:order-1">
        <svg viewBox="0 0 400 220" class="w-full h-auto">
          <rect width="400" height="220" rx="12" fill="var(--fallback-b2,oklch(var(--b2)))" />
          <g v-for="(row, i) in 3" :key="i">
            <rect x="20" :y="20 + i * 65" width="360" height="48" rx="8" fill="var(--fallback-b1,oklch(var(--b1)))" />
            <circle :cx="46" :cy="44 + i * 65" r="14" fill="#aa3bff" opacity="0.85" />
            <rect :x="72" :y="34 + i * 65" width="120" height="10" rx="5" fill="currentColor" opacity="0.4" />
            <rect :x="72" :y="50 + i * 65" width="180" height="8" rx="4" fill="currentColor" opacity="0.2" />
          </g>
        </svg>
      </div>
      <div class="order-1 lg:order-2">
        <h2 class="!mb-3">A team sheet, done for you</h2>
        <p class="text-base-content/70 mb-6">Captain, vice-captain, and transfers — every gameweek.</p>
        <RouterLink to="/squad" class="btn btn-primary btn-sm">Go to my squad</RouterLink>
      </div>
    </section>

    <!-- FEATURE 2 — LIVE INTEL -->
    <section class="grid lg:grid-cols-2 gap-10 py-10 border-t border-base-300 bg-base-200 -mx-4 px-4 rounded-box items-center">
      <div>
        <h2>Prices move fast. So do we.</h2>
        <p class="text-base-content/70">Transfers, price changes, and form — the moment they happen.</p>
      </div>
      <div>
        <svg viewBox="0 0 400 180" class="w-full h-auto">
          <polyline points="10,140 70,110 130,120 190,60 250,80 310,30 390,45"
            fill="none" stroke="#aa3bff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
          <g v-for="(p, i) in priceTicker" :key="p.name">
            <circle :cx="10 + i * 190" :cy="i === 0 ? 140 : i === 1 ? 120 : 30" r="6"
              :fill="p.trend === 'up' ? '#36d399' : '#f87272'" />
            <text :x="10 + i * 190" :y="(i === 0 ? 140 : i === 1 ? 120 : 30) - 14"
              font-size="13" font-weight="600" fill="currentColor">{{ p.name }}</text>
            <text :x="10 + i * 190" :y="(i === 0 ? 140 : i === 1 ? 120 : 30) + 22"
              font-size="12" :fill="p.trend === 'up' ? '#36d399' : '#f87272'">{{ p.change }}</text>
          </g>
        </svg>
      </div>
    </section>

    <!-- FEATURE 3 — PRIZE LEAGUES -->
    <section class="py-10 border-t border-base-300">
      <div class="grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <svg viewBox="0 0 400 220" class="w-full h-auto">
            <rect x="40" y="110" width="90" height="90" fill="#2e2657" rx="6" />
            <rect x="155" y="70" width="90" height="130" fill="#aa3bff" rx="6" />
            <rect x="270" y="140" width="90" height="60" fill="#2e2657" rx="6" />
            <text x="85" y="100" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">2nd</text>
            <text x="200" y="60" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">1st</text>
            <text x="315" y="130" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">3rd</text>
          </svg>
        </div>
        <div>
          <h2 class="!mb-3">Play for something real</h2>
          <p class="text-base-content/70 mb-6">Paid leagues, split by gameweek and by season.</p>
          <div class="stats stats-vertical sm:stats-horizontal shadow-sm border border-base-300 w-full mb-8">
            <div v-for="row in prizeBoard" :key="row.place" class="stat py-3 px-4">
              <div class="stat-title text-xs">{{ row.place }}</div>
              <div class="stat-value text-primary text-xl">{{ row.gameweek }}</div>
              <div class="stat-desc text-xs">{{ row.season }} / season</div>
            </div>
          </div>
          <RouterLink to="/rankings" class="btn btn-primary">Join a paid league</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero-band {
  background: #17132b;
}
</style>