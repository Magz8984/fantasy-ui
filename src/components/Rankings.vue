```vue
<script setup>
import { onMounted, ref, computed } from "vue";
import bench from "../assets/bench.svg";

const players = ref([]);
const loading = ref(true);
const currentPage = ref(1);
const searchQuery = ref("");
const itemsPerPage = 50;

// Player currently selected for squad action
const selectedPlayer = ref(null);

// Controls the add-to-squad modal
const showSquadModal = ref(false);

// Loading state when adding a player
const addingToSquad = ref(false);

const filteredPlayers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) return players.value;

  return players.value.filter((player) =>
    Object.values(player).some((value) =>
      String(value).toLowerCase().includes(query),
    ),
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredPlayers.value.length / itemsPerPage),
);

const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;

  return filteredPlayers.value.slice(start, start + itemsPerPage);
});

// Reset pagination when searching
function handleSearch() {
  currentPage.value = 1;
}

// Go to next page
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// Go to previous page
function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
}

// Go directly to a page
function goToPage(page) {
  currentPage.value = page;
}

// Open the add-to-squad modal
function openAddSquadModal(player) {
  selectedPlayer.value = player;
  showSquadModal.value = true;
}

// Close the add-to-squad modal
function closeSquadModal() {
  showSquadModal.value = false;
  selectedPlayer.value = null;
}

// Add a player to the squad
// isBench = true means the player is on the bench
// isBench = false means the player is in the starting XI
async function addToSquad(isBench) {
  if (!selectedPlayer.value) return;

  addingToSquad.value = true;

  const player = selectedPlayer.value;

  try {
    const response = await fetch(
      "https://us-central1-fantasy-f1-3a499.cloudfunctions.net/main/add_player",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: player.id,
          in_bench: isBench,
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to add player: ${response.status}`);
    }

    // Update the player locally so the table changes immediately
    player.inSquad = true;
    player.inBench = isBench;

    closeSquadModal();
  } catch (error) {
    console.error("Error adding player to squad:", error);
  } finally {
    addingToSquad.value = false;
  }
}

// Remove a player from the squad
async function removeFromSquad(player) {
  try {
    const response = await fetch(
      `https://us-central1-fantasy-f1-3a499.cloudfunctions.net/main/remove_player/${player.id}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      throw new Error(`Failed to remove player: ${response.status}`);
    }

    // Update the player locally so the table changes immediately
    player.inSquad = false;
    player.inBench = false;
  } catch (error) {
    console.error("Error removing player from squad:", error);
  }
}

onMounted(async () => {
  try {
    // Fetch player rankings
    const response = await fetch(
      "https://us-central1-fantasy-f1-3a499.cloudfunctions.net/main/api/player_ranking",
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Failed to fetch players: ${response.status}`);
    }

    if (data.message) {
      players.value = data.message.map((player) => ({
        // Keep the original player ID for squad actions
        id: player.id,

        name: player.first_name + " " + player.second_name,

        for: player.team_name,

        xGI: player.expected_goal_involvements,

        ICT: player.ict_index,

        image: `https://resources.premierleague.com/premierleague25/photos/players/110x140/${player.code}.png`,

        Form: player.form,

        CF: Math.round(player.calculated_form * 100) / 100,

        Cost: Math.round(player.now_cost * 100) / 100,

        FER: Math.round(player.f_e_r * 100) / 100,

        type: player.element_type_name,

        // Indicates whether the player is in the squad
        inSquad: player.in_squad,

        // Indicates whether the player is on the bench
        inBench: player.in_bench,
      }));
    }
  } catch (error) {
    console.error("Error fetching players:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="p-8">
    <!-- Search -->
    <div class="mb-4 flex justify-end">
      <label class="input flex items-center gap-2 w-full max-w-sm">
        <!-- Search icon -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          class="h-4 w-4 opacity-60"
        >
          <circle cx="11" cy="11" r="8" />

          <path d="m21 21-4.3-4.3" />
        </svg>

        <!-- Search input -->
        <input
          v-model="searchQuery"
          @input="handleSearch"
          type="search"
          placeholder="Search players..."
          class="grow"
        />
      </label>
    </div>

    <!-- Table title -->
    <span class="text-sm"> Rankings </span>

    <!-- Players table -->
    <div
      class="overflow-x-auto overflow-y-visible rounded-box border border-base-content/5 bg-base-100 min-h-125"
    >
      <table class="table">
        <!-- Table header -->
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Team</th>
            <th>Type</th>
            <th>Form</th>
            <th data-tip="System Computed Form">CF</th>
            <th data-tip="Current price">Cost</th>
            <th data-tip="Form to expected return">FER</th>

            <!-- Actions column -->
            <th class="text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading state -->
          <tr v-if="loading">
            <td colspan="9" class="h-64">
              <div class="flex h-full w-full items-center justify-center">
                <span class="loading loading-spinner loading-md"></span>
              </div>
            </td>
          </tr>

          <!-- Players -->
          <tr
            v-for="(player, index) in paginatedPlayers"
            :key="`${player.name}-${player.for}`"
            :class="{
              'bg-success/20': player.inSquad,
            }"
          >
            <!-- Player ranking and bench indicator -->
            <td>
              <div class="flex items-center gap-2">
                <!-- Ranking number -->
                <span>
                  {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                </span>

                <!-- Bench icon -->
                <img
                  v-if="player.inBench"
                  :src="bench"
                  alt="Bench"
                  class="w-6 h-6 filter-[brightness(0)]"
                />
              </div>
            </td>

            <!-- Player name -->
            <td class="font-bold">
              {{ player.name }}
            </td>

            <!-- Team -->
            <td>
              {{ player.for }}
            </td>

            <!-- Player type -->
            <td>
              {{ player.type }}
            </td>

            <!-- Current form -->
            <td>
              {{ player.Form }}
            </td>

            <!-- Calculated form -->
            <td>
              {{ player.CF }}
            </td>

            <!-- Player cost -->
            <td class="font-bold">{{ player.Cost }}m€</td>

            <!-- Form to expected return -->
            <td>
              {{ player.FER }}
            </td>

            <!-- Player actions -->
            <td class="text-right">
              <!-- Three-dot dropdown -->
              <div class="dropdown dropdown-end">
                <!-- Actions button -->
                <button
                  tabindex="0"
                  class="btn btn-ghost btn-sm btn-circle"
                  aria-label="Player actions"
                >
                  <span class="text-xl leading-none"> ⋮ </span>
                </button>

                <!-- Actions menu -->
                <ul
                  tabindex="0"
                  class="dropdown-content menu bg-base-100 rounded-box z-50 w-52 p-2 shadow-lg border border-base-content/10"
                >
                  <!-- Player is not currently in the squad -->
                  <template v-if="!player.inSquad">
                    <!-- Add player option -->
                    <li>
                      <button disabled @click="openAddSquadModal(player)">
                        <span>＋</span>
                        Add to squad
                      </button>
                    </li>
                  </template>

                  <!-- Player is already in the squad -->
                  <template v-else>
                    <!-- Remove player option -->
                    <li>
                      <button
                        disabled
                        class="text-error"
                        @click="removeFromSquad(player)"
                      >
                        <span>×</span>
                        Remove from squad
                      </button>
                    </li>
                  </template>
                </ul>
              </div>
            </td>
          </tr>

          <!-- No players found -->
          <tr v-if="paginatedPlayers.length === 0 && !loading">
            <td colspan="9" class="text-center py-8">No players found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between mt-4">
      <!-- Results count -->
      <div class="text-sm opacity-60">
        Showing
        {{
          filteredPlayers.length === 0
            ? 0
            : (currentPage - 1) * itemsPerPage + 1
        }}
        -
        {{ Math.min(currentPage * itemsPerPage, filteredPlayers.length) }}
        of {{ filteredPlayers.length }}
      </div>

      <!-- Pagination controls -->
      <div v-if="totalPages > 1" class="join">
        <!-- Previous page -->
        <button
          class="join-item btn"
          :disabled="currentPage === 1"
          @click="previousPage"
        >
          «
        </button>

        <!-- Page numbers -->
        <button
          v-for="page in totalPages"
          :key="page"
          class="join-item btn"
          :class="{
            'btn-active': currentPage === page,
          }"
          @click="goToPage(page)"
        >
          {{ page }}
        </button>

        <!-- Next page -->
        <button
          class="join-item btn"
          :disabled="currentPage === totalPages"
          @click="nextPage"
        >
          »
        </button>
      </div>
    </div>
  </div>

  <!-- Add player to squad modal -->
  <dialog
    class="modal"
    :class="{
      'modal-open': showSquadModal,
    }"
  >
    <div class="modal-box">
      <!-- Modal title -->
      <h3 class="text-lg font-bold">Add player to squad</h3>

      <!-- Selected player -->
      <p class="py-4">
        How do you want to use

        <strong>
          {{ selectedPlayer?.name }}
        </strong>

        ?
      </p>

      <!-- Squad position options -->
      <div class="grid grid-cols-1 gap-3">
        <!-- Starting XI option -->
        <button
          class="btn btn-primary"
          :disabled="addingToSquad"
          @click="addToSquad(false)"
        >
          <span>⚽</span>
          Starting XI
        </button>

        <!-- Bench option -->
        <button
          class="btn btn-outline"
          :disabled="addingToSquad"
          @click="addToSquad(true)"
        >
          <img :src="bench" alt="" class="w-5 h-5 filter-[brightness(0)]" />

          Bench
        </button>
      </div>

      <!-- Modal actions -->
      <div class="modal-action">
        <!-- Cancel button -->
        <button
          class="btn btn-ghost"
          :disabled="addingToSquad"
          @click="closeSquadModal"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Modal backdrop -->
    <div class="modal-backdrop" @click="closeSquadModal"></div>
  </dialog>
</template>

<style scoped>
h1 {
  position: absolute;
  left: 50%;
  margin: 0;
  transform: translateX(-50%);
  font-size: 1.5rem;
  white-space: nowrap;
}
</style>
```
