<template>
  <div class="p-8 min-h-screen">
    <p class="text-gray-700 font-medium mb-3">Kelola Data Kelompok</p>
    <div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-10">

      <!-- LEFT CARD (Current Users) -->
      <div
        class="rounded-3xl p-6 bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 
               hover:bg-white/30 transition-all duration-300"
      >
        <h2 class="font-extrabold text-lg mb-4 text-gray-800 drop-shadow">
          Current Users
        </h2>

        <div class="rounded-2xl overflow-hidden border border-white/40 bg-white/10 shadow-inner">
          <div class="bg-white/20 backdrop-blur-lg p-2 text-sm font-semibold text-gray-700">
            Current users ({{ currentUsers.length }})
          </div>

          <select
            multiple
            v-model="selectedCurrent"
            class="w-full h-80 p-3 text-sm bg-transparent text-gray-800 outline-none"
          >
            <option
              v-for="u in filteredCurrent"
              :key="u.id"
              :value="u"
              class="hover:bg-white/20 backdrop-blur-md p-1 cursor-pointer"
            >
              {{ u.npm }} - {{ u.nama_lengkap }} ({{ u.angkatan }})
            </option>
          </select>
        </div>

        <div class="mt-4 flex gap-3">
          <input
            v-model="searchCurrent"
            placeholder="Search"
            class="input input-bordered w-full bg-white/40 backdrop-blur-lg"
          />
          <button 
            class="btn btn-outline"
            @click="searchCurrent = ''"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- CENTER BUTTONS (Add / Remove) -->
      <div class="flex flex-col items-center justify-center gap-8 px-3">

        <button
          class="btn w-32 rounded-2xl bg-gradient-to-r from-blue-500/60 to-indigo-500/60
                 text-white backdrop-blur-lg border border-white/30 shadow-lg
                 hover:scale-110 hover:from-blue-500 hover:to-indigo-500 transition"
          @click="addSelected"
        >
        <i class="fa fa-arrow-left"></i> Add
        </button>

        <button
          class="btn w-32 rounded-2xl bg-gradient-to-r from-pink-500/60 to-red-500/60
                 text-white backdrop-blur-lg border border-white/30 shadow-lg
                 hover:scale-110 hover:from-pink-500 hover:to-red-500 transition"
          @click="removeSelected"
        >
          Remove <i class="fa fa-arrow-right"></i>
        </button>

      </div>

      <!-- RIGHT CARD (Potential Users) -->
      <div
        class="rounded-3xl p-6 bg-white/20 backdrop-blur-xl shadow-2xl border border-white/30 
               hover:bg-white/30 transition-all duration-300"
      >
        <h2 class="font-extrabold text-lg mb-4 text-gray-800 drop-shadow">
          Potential Users
        </h2>

        <div class="rounded-2xl overflow-hidden border border-white/40 bg-white/10 shadow-inner">
          <div class="bg-white/20 backdrop-blur-lg p-2 text-sm font-semibold text-gray-700">
            Potential matching users ({{ filteredPotential.length }})
          </div>

          <select
            multiple
            v-model="selectedPotential"
            class="w-full h-80 p-3 text-sm bg-transparent text-gray-800 outline-none"
          >
            <option
              v-for="u in filteredPotential"
              :key="u.npm"
              :value="u"
              class="hover:bg-white/20 backdrop-blur-md p-1 cursor-pointer"
            >
              {{ u.npm }} - {{ u.nama_lengkap }} ({{ u.angkatan }})
            </option>
          </select>
        </div>

        <div class="mt-4 flex gap-3">
          <input
            v-model="searchPotential"
            placeholder="Search"
            class="input input-bordered w-full bg-white/40 backdrop-blur-lg"
          />
          <button 
            class="btn btn-outline"
            @click="searchPotential = ''"
          >
            Clear
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { sia } from "../../api/sia";

/* Dummy Data Current Users */
const currentUsers = ref([
  { id: 1, npm: "21311021", nama_lengkap: "Aghelinta Bangun", angkatan: "2025" },
  { id: 2, npm: "21311019", nama_lengkap: "Aulia Khusnul Arif", angkatan: "2025" },
]);

/* Potential Users diambil dari API */
const potentialUsers = ref([]);

const selectedCurrent = ref([]);
const selectedPotential = ref([]);

const searchCurrent = ref("");
const searchPotential = ref("");

// Filtered List Current Users
const filteredCurrent = computed(() =>
  currentUsers.value.filter((u) => {
    const term = searchCurrent.value.toLowerCase();
    return (
      u.npm.toLowerCase().includes(term) ||
      u.nama_lengkap.toLowerCase().includes(term) ||
      String(u.angkatan).includes(term)
    );
  })
);

// Filtered List Potential Users hanya tampil saat ada search
const filteredPotential = computed(() => {
  const term = searchPotential.value.toLowerCase().trim();
  if (!term) return []; // kosong jika belum ada search
  return (potentialUsers.value || []).filter((u) => {
    return (
      u.npm.toLowerCase().includes(term) ||
      u.nama_lengkap.toLowerCase().includes(term) ||
      String(u.angkatan).includes(term)
    );
  });
});

/* Move Users */
function addSelected() {
  selectedPotential.value.forEach((u) => {
    currentUsers.value.push(u);
    potentialUsers.value = potentialUsers.value.filter((x) => x.npm !== u.npm);
  });
  selectedPotential.value = [];
}

function removeSelected() {
  selectedCurrent.value.forEach((u) => {
    potentialUsers.value.push(u);
    currentUsers.value = currentUsers.value.filter((x) => x.id !== u.id);
  });
  selectedCurrent.value = [];
}

/* Ambil data Potential Users dari endpoint */
async function fetchPotentialUsers() {
  try {
    const response = await sia.get("/users");
    potentialUsers.value = Array.isArray(response.data.data) ? response.data.data : [];
  } catch (error) {
    console.error("Gagal mengambil data mahasiswa:", error);
    potentialUsers.value = [];
  }
}

/* Ambil data saat komponen dimount */
onMounted(() => {
  fetchPotentialUsers();
});
</script>
