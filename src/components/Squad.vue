<script setup>
import { onMounted, ref, computed } from "vue";
import bench from "../assets/bench.svg";

const squad = ref([]);
const analysisData = ref(null); // full /analyze response: { gameweek, recommendations, squad }
const loading = ref(true);
const aiLoading = ref(false);
const aiError = ref("");

const startingXI = computed(() =>
  squad.value.filter((player) => !player.inBench),
);

const benchPlayers = computed(() =>
  squad.value.filter((player) => player.inBench),
);

const recommendations = computed(() => analysisData.value?.recommendations ?? null);

const gameweekLabel = computed(() =>
  analysisData.value?.gameweek ? `GW ${analysisData.value.gameweek}` : "Next GW",
);

const hasTransfers = computed(
  () => (recommendations.value?.transfers?.length ?? 0) > 0,
);

const hasSubstitutions = computed(
  () => (recommendations.value?.substitutions?.length ?? 0) > 0,
);

/*
 * Resolve an image for a player, whichever shape it comes in
 * (squad players carry `image` directly, AI recommendation players
 * only carry a `code` to build the standard PL asset URL from).
 */
function playerImg(player) {
  if (!player) return "";
  return (
    player.image ||
    `https://resources.premierleague.com/premierleague25/photos/players/110x140/${player.code}.png`
  );
}

function playerName(player) {
  if (!player) return "";
  return player.name || `${player.first_name || ""} ${player.second_name || ""}`.trim();
}

/*
 * Fetch the current squad from the backend.
 */
async function fetchSquad() {
  loading.value = true;

  try {
    const response = await fetch(
      "https://us-central1-fantasy-f1-3a499.cloudfunctions.net/main/squad",
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch squad: ${response.status}`);
    }

    const data = await response.json();

    squad.value = (data || []).map((player) => ({
      id: player.player_id || player.id,
      name: playerName(player),
      team: player.team_name || player.for,
      type: player.element_type_name || player.type,
      image: playerImg(player),
      inBench: Boolean(player.in_bench),
    }));
  } catch (error) {
    console.error("Error fetching squad:", error);
  } finally {
    loading.value = false;
  }
}

/*
 * Ask the AI backend for a recommendation for the next gameweek.
 */
async function generateSuggestion() {
  aiLoading.value = true;
  aiError.value = "";

  try {
    const response = await fetch(
      "https://us-central1-fantasy-f1-3a499.cloudfunctions.net/main/analyze",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to generate suggestion: ${response.status}`);
    }

    const data = await response.json();

    analysisData.value = data || null;

    if (!data?.recommendations) {
      aiError.value = "No recommendation was returned.";
    }
  } catch (error) {
    console.error("Error generating AI suggestion:", error);

    analysisData.value = null;
    aiError.value = "Unable to generate a recommendation right now.";
  } finally {
    aiLoading.value = false;
  }
}

onMounted(fetchSquad);
</script>

<template>
  <div class="p-8">
    <!-- Page heading -->
    <div class="mb-6">
      <h2 class="text-2xl font-bold">My Squad</h2>
      <p class="text-sm opacity-60">
        Review your current squad and prepare for the next gameweek.
      </p>
    </div>

    <!-- Main two-column layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <!-- ========================= -->
      <!-- CURRENT SQUAD -->
      <!-- ========================= -->
      <div class="rounded-box border border-base-content/5 bg-base-100 p-5">
        <div class="flex items-center justify-between mb-5">
          <div>
            <h3 class="font-bold text-lg">Current Squad</h3>
            <p class="text-xs opacity-60">{{ squad.length }} players</p>
          </div>

          <div class="badge badge-primary p-2">
            {{ startingXI.length }} Starting
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex h-64 items-center justify-center">
          <span class="loading loading-spinner loading-md"></span>
        </div>

        <div v-else>
          <!-- ========================= -->
          <!-- STARTING XI -->
          <!-- ========================= -->
          <div class="mb-6">
            <div class="flex items-center gap-2 mb-3">
              <h4 class="font-semibold">Starting XI</h4>

              <span class="badge badge-sm badge-success p-2">
                {{ startingXI.length }}
              </span>
            </div>

            <div v-if="startingXI.length" class="space-y-2">
              <div
                v-for="(player, index) in startingXI"
                :key="player.id || `${player.name}-${index}`"
                class="flex items-center gap-3 rounded-lg border border-base-content/5 p-3 hover:bg-base-200 transition"
              >
                <!-- Player image -->
                <img
                  :src="player.image"
                  :alt="player.name"
                  class="w-10 h-10 rounded-full object-cover"
                />

                <!-- Player information -->
                <div class="min-w-0 flex-1">
                  <p class="font-semibold truncate">
                    {{ player.name }}
                  </p>

                  <div class="flex items-center gap-2 text-xs opacity-60">
                    <span>{{ player.team }}</span>
                    <span>•</span>
                    <span>{{ player.type }}</span>
                  </div>
                </div>

                <!-- Position number -->
                <span class="text-xs opacity-40">
                  {{ index + 1 }}
                </span>
              </div>
            </div>

            <div
              v-else
              class="rounded-lg border border-dashed border-base-content/10 p-6 text-center text-sm opacity-60"
            >
              No starting players found.
            </div>
          </div>

          <!-- ========================= -->
          <!-- BENCH -->
          <!-- ========================= -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <h4 class="font-semibold">Bench</h4>

              <span class="badge badge-sm">
                {{ benchPlayers.length }}
              </span>
            </div>

            <div v-if="benchPlayers.length" class="space-y-2">
              <div
                v-for="player in benchPlayers"
                :key="player.id || player.name"
                class="flex items-center gap-3 rounded-lg border border-base-content/5 p-3"
              >
                <img
                  :src="player.image"
                  :alt="player.name"
                  class="w-10 h-10 rounded-full object-cover opacity-80"
                />

                <div class="min-w-0 flex-1">
                  <p class="font-semibold truncate">
                    {{ player.name }}
                  </p>

                  <div class="flex items-center gap-2 text-xs opacity-60">
                    <span>{{ player.team }}</span>
                    <span>•</span>
                    <span>{{ player.type }}</span>
                  </div>
                </div>

                <img
                  :src="bench"
                  alt="Bench"
                  class="w-5 h-5 filter-[brightness(0)] opacity-50"
                />
              </div>
            </div>

            <div
              v-else
              class="rounded-lg border border-dashed border-base-content/10 p-6 text-center text-sm opacity-60"
            >
              No bench players found.
            </div>
          </div>
        </div>
      </div>

      <!-- ========================= -->
      <!-- AI SUGGESTION -->
      <!-- ========================= -->
      <div class="rounded-box border border-base-content/5 bg-base-100 p-5">
        <div class="flex items-center justify-between mb-5">
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-lg">AI Squad Analysis</h3>
              <span class="badge badge-secondary p-2">{{ gameweekLabel }}</span>
            </div>

            <p class="text-sm opacity-60 mt-1">
              Get recommendations based on your current squad and upcoming
              gameweek.
            </p>
          </div>

          <button
            class="btn btn-primary btn-sm shrink-0"
            :disabled="aiLoading || loading || squad.length === 0"
            @click="generateSuggestion"
          >
            <span
              v-if="aiLoading"
              class="loading loading-spinner loading-xs"
            ></span>

            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M12 3v18" />
              <path d="m7 8 5-5 5 5" />
              <path d="M5 21h14" />
            </svg>

            {{ aiLoading ? "Analyzing..." : "Analyze Squad" }}
          </button>
        </div>

        <!-- Loading state -->
        <div
          v-if="aiLoading"
          class="flex h-64 items-center justify-center"
        >
          <span class="loading loading-spinner loading-md"></span>
        </div>

        <!-- Error state -->
        <div v-else-if="aiError" role="alert" class="alert alert-error mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
          <span class="text-sm">{{ aiError }}</span>
        </div>

        <!-- Empty state (never analyzed yet) -->
        <div
          v-else-if="!recommendations"
          class="rounded-lg border border-dashed border-base-content/10 p-10 text-center text-sm opacity-60"
        >
          Run the analysis to see captain, transfer and substitution
          recommendations for {{ gameweekLabel }}.
        </div>

        <!-- Recommendations -->
        <div v-else class="space-y-6">
          <!-- Captain / Vice-Captain -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-if="recommendations.captain"
              class="flex items-center gap-3 rounded-lg border border-base-content/5 p-3"
            >
              <div class="avatar">
                <div
                  class="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2"
                >
                  <img :src="playerImg(recommendations.captain)" />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-semibold truncate">
                    {{ playerName(recommendations.captain) }}
                  </p>
                  <span class="badge badge-primary badge-sm p-2">C</span>
                </div>
                <p class="text-xs opacity-60">
                  {{ recommendations.captain.team_name }} · Form
                  {{ recommendations.captain.form }}
                </p>
              </div>
            </div>

            <div
              v-if="recommendations.vice_captain"
              class="flex items-center gap-3 rounded-lg border border-base-content/5 p-3"
            >
              <div class="avatar">
                <div
                  class="w-12 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-2"
                >
                  <img :src="playerImg(recommendations.vice_captain)" />
                </div>
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <p class="font-semibold truncate">
                    {{ playerName(recommendations.vice_captain) }}
                  </p>
                  <span class="badge badge-secondary badge-sm p-2">VC</span>
                </div>
                <p class="text-xs opacity-60">
                  {{ recommendations.vice_captain.team_name }} · Form
                  {{ recommendations.vice_captain.form }}
                </p>
              </div>
            </div>
          </div>

          <!-- Transfers -->
          <div v-if="hasTransfers">
            <div class="flex items-center gap-2 mb-3">
              <h4 class="font-semibold text-sm">Suggested Transfers</h4>
              <span class="badge badge-sm">{{ recommendations.transfers.length }}</span>
            </div>

            <div class="space-y-3">
              <div
                v-for="(t, index) in recommendations.transfers"
                :key="`transfer-${index}`"
                class="rounded-lg border border-base-content/5 p-3"
              >
                <div class="flex items-center gap-3">
                  <!-- OUT -->
                  <div class="flex-1 min-w-0">
                    <span class="badge badge-error badge-outline badge-xs mb-1">OUT</span>
                    <div class="flex items-center gap-2 min-w-0">
                      <img
                        :src="playerImg(t.player_out)"
                        :alt="playerName(t.player_out)"
                        class="w-9 h-9 rounded-full object-cover opacity-70"
                      />
                      <div class="min-w-0">
                        <p class="text-sm font-semibold truncate">
                          {{ playerName(t.player_out) }}
                        </p>
                        <p class="text-xs opacity-60 truncate">
                          {{ t.player_out.team_name }} £{{ t.player_out.now_cost }}m
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Arrow -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 opacity-40 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>

                  <!-- IN -->
                  <div class="flex-1 min-w-0 text-right">
                    <span class="badge badge-success badge-outline badge-xs mb-1">IN</span>
                    <div class="flex items-center gap-2 min-w-0 justify-end">
                      <div class="min-w-0">
                        <p class="text-sm font-semibold truncate">
                          {{ playerName(t.player_in) }}
                        </p>
                        <p class="text-xs opacity-60 truncate">
                          {{ t.player_in.team_name }} £{{ t.player_in.now_cost }}m
                        </p>
                      </div>
                      <img
                        :src="playerImg(t.player_in)"
                        :alt="playerName(t.player_in)"
                        class="w-9 h-9 rounded-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="flex items-center justify-between mt-3 pt-3 border-t border-base-content/5 text-xs opacity-70"
                >
                  <span>Form {{ t.player_out.form }}</span>
                  <span>Form {{ t.player_in.form }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Substitutions -->
          <div v-if="hasSubstitutions">
            <div class="flex items-center gap-2 mb-3">
              <h4 class="font-semibold text-sm">Suggested Substitutions</h4>
              <span class="badge badge-sm">{{ recommendations.substitutions.length }}</span>
            </div>

            <div class="space-y-3">
              <div
                v-for="(s, index) in recommendations.substitutions"
                :key="`sub-${index}`"
                class="rounded-lg border border-base-content/5 p-3"
              >
                <div class="flex items-center gap-3">
                  <!-- OFF (bench) -->
                  <div class="flex-1 min-w-0">
                    <span class="badge badge-error badge-outline badge-xs mb-1">BENCH</span>
                    <div class="flex items-center gap-2 min-w-0">
                      <img
                        :src="playerImg(s.player_out)"
                        :alt="playerName(s.player_out)"
                        class="w-9 h-9 rounded-full object-cover opacity-70"
                      />
                      <div class="min-w-0">
                        <p class="text-sm font-semibold truncate">
                          {{ playerName(s.player_out) }}
                        </p>
                        <p class="text-xs opacity-60 truncate">
                          {{ s.player_out.team_name }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Arrow -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 opacity-40 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>

                  <!-- ON (starting) -->
                  <div class="flex-1 min-w-0 text-right">
                    <span class="badge badge-success badge-outline badge-xs mb-1">STARTS</span>
                    <div class="flex items-center gap-2 min-w-0 justify-end">
                      <div class="min-w-0">
                        <p class="text-sm font-semibold truncate">
                          {{ playerName(s.player_in) }}
                        </p>
                        <p class="text-xs opacity-60 truncate">
                          {{ s.player_in.team_name }}
                        </p>
                      </div>
                      <img
                        :src="playerImg(s.player_in)"
                        :alt="playerName(s.player_in)"
                        class="w-9 h-9 rounded-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div
                  class="flex items-center justify-between mt-3 pt-3 border-t border-base-content/5 text-xs opacity-70"
                >
                  <span>Form {{ s.player_out.form }}</span>
                  <span>Form {{ s.player_in.form }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Full summary -->
          <details class="collapse collapse-arrow border border-base-content/5 rounded-lg" open>
            <summary class="collapse-title text-sm font-semibold min-h-0 py-3">
              Full analysis summary
            </summary>
            <div class="collapse-content">
              <textarea
                :value="recommendations.summary"
                readonly
                class="textarea textarea-bordered w-full min-h-[220px] resize-none text-sm"
              ></textarea>
            </div>
          </details>
        </div>
      </div>
    </div>
  </div>
</template>
