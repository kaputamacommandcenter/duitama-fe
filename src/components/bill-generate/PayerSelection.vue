<template>
  <div>
    <!-- Mode Payer Selector -->
    <div class="mb-4">
      <label class="font-medium text-sm">Mode Payer</label>
      <select 
        :value="payerMode" 
        @change="$emit('update:payerMode', $event.target.value)" 
        class="select select-bordered w-full mt-1"
      >
        <option disabled value="">— pilih mode payer —</option>
        <option value="individual">Per Individu</option>
        <option value="group">Kelompok Payer</option>
      </select>
    </div>

    <!-- Payer Individu Selector -->
    <div v-if="payerMode === 'individual'" class="mb-4">
      <label class="font-medium text-sm">Pilih Payer Individu</label>
      
      <!-- Search Input -->
      <div class="mt-1 mb-3">
        <input 
          type="text"
          placeholder="Cari berdasarkan NPM, Nomor Identitas, atau Nama Payer..."
          :value="searchQuery"
          @input="$emit('update:searchQuery', $event.target.value)"
          class="input input-bordered w-full input-sm"
        >
      </div>

      <div class="flex items-center gap-3 mb-2">
        <input 
          type="checkbox" 
          :checked="selectAll"
          @change="$emit('update:selectAll', $event.target.checked)"
          class="checkbox checkbox-sm"
        > Pilih Semua ({{ filteredPayers.length }} dari {{ payers.length }} hasil)
      </div>
      
      <div class="max-h-48 overflow-y-auto border rounded p-3">
        <div v-for="p in filteredPayers" :key="p.id" class="flex items-center gap-3 mb-1">
          <input 
            type="checkbox" 
            :checked="selectedPayers.includes(p.id)"
            @change="handleIndividualSelection(p.id)"
            class="checkbox checkbox-sm"
          >
          <span>{{ p.identity_number }} - {{ p.name }}</span>
        </div>
        <p v-if="payers.length === 0" class="text-center py-2 text-gray-500 text-sm">
          Tidak ada data Payer Individu.
        </p>
        <p v-else-if="filteredPayers.length === 0" class="text-center py-2 text-gray-500 text-sm">
          Tidak ada hasil ditemukan untuk "{{ searchQuery }}".
        </p>
      </div>
    </div>

    <!-- Payer Group Selector -->
    <div v-if="payerMode === 'group'" class="mb-4">
      <label class="font-medium text-sm">Pilih Kelompok Payer</label>
      <div class="max-h-48 overflow-y-auto border rounded p-3 mt-2">
        <div v-for="g in payerGroups" :key="g.id" class="border p-2 rounded mb-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <input 
                type="checkbox" 
                :checked="selectedGroups.includes(g.id)"
                @change="handleGroupSelection(g.id)"
                class="checkbox checkbox-sm"
              >
              <span class="font-semibold">{{ g.name }}</span>
            </div>
            <button 
              class="btn btn-xs btn-outline"
              @click="$emit('openMembersModal', g)"
            >
              Lihat Anggota
            </button>
          </div>
        </div>
        <p v-if="payerGroups.length === 0" class="text-center py-2 text-gray-500 text-sm">
          Tidak ada data Kelompok Payer.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';

const props = defineProps({
  payerMode: { type: String, required: true },
  payers: { type: Array, required: true },
  payerGroups: { type: Array, required: true },
  selectedPayers: { type: Array, required: true },
  selectedGroups: { type: Array, required: true },
  selectAll: { type: Boolean, required: true },
  searchQuery: { type: String, default: '' } // Prop baru untuk query pencarian
});

const emit = defineEmits([
  'update:payerMode', 
  'update:selectedPayers', 
  'update:selectedGroups', 
  'update:selectAll',
  'update:searchQuery', // Event baru
  'openMembersModal'
]);

// Computed property untuk memfilter daftar payers
const filteredPayers = computed(() => {
    if (!props.searchQuery) {
        return props.payers;
    }

    const query = props.searchQuery.toLowerCase();
    
    return props.payers.filter(payer => {
        // Asumsi NPM ada di data payer (sudah ditambahkan di fetchIndividualPayers)
        const nameMatch = payer.name?.toLowerCase().includes(query);
        const identityMatch = payer.identity_number?.toLowerCase().includes(query);
        const npmMatch = payer.npm?.toLowerCase().includes(query); 
        
        return nameMatch || identityMatch || npmMatch;
    });
});

// --- Individual Handlers ---
const handleIndividualSelection = (id) => {
  const currentSelection = [...props.selectedPayers];
  const index = currentSelection.indexOf(id);

  if (index > -1) {
    currentSelection.splice(index, 1);
  } else {
    currentSelection.push(id);
  }
  emit('update:selectedPayers', currentSelection);
};

// --- Group Handlers ---
const handleGroupSelection = (id) => {
  const currentSelection = [...props.selectedGroups];
  const index = currentSelection.indexOf(id);

  if (index > -1) {
    currentSelection.splice(index, 1);
  } else {
    currentSelection.push(id);
  }
  emit('update:selectedGroups', currentSelection);
};

// Watcher untuk sinkronisasi selectAll <-> selectedPayers (Disesuaikan untuk filteredPayers)
watch(() => props.selectAll, (newVal) => {
  if (props.payerMode === "individual") {
    // Hanya pilih/hapus yang sedang difilter
    const visiblePayerIds = filteredPayers.value.map(p => p.id);
    let newSelectedPayers = [...props.selectedPayers];
    
    if (newVal) {
        // Tambahkan semua yang terlihat
        visiblePayerIds.forEach(id => {
            if (!newSelectedPayers.includes(id)) {
                newSelectedPayers.push(id);
            }
        });
    } else {
        // Hapus semua yang terlihat
        newSelectedPayers = newSelectedPayers.filter(id => !visiblePayerIds.includes(id));
    }
    
    emit('update:selectedPayers', newSelectedPayers);
  }
});

const calculatedSelectAll = computed(() => {
    // Cek apakah SEMUA yang difilter sudah terpilih
    const visiblePayerIds = filteredPayers.value.map(p => p.id);
    if (visiblePayerIds.length === 0) return false;
    
    return visiblePayerIds.every(id => props.selectedPayers.includes(id));
});

// Update parent's selectAll state if individual payers selection changes
watch(() => props.selectedPayers.length, () => {
    const newSelectAll = calculatedSelectAll.value;
    // Emit jika calculatedSelectAll berbeda dengan prop selectAll saat ini
    // Ini penting agar checkbox "Pilih Semua" di UI sinkron dengan hasil filter
    if (newSelectAll !== props.selectAll) {
        emit('update:selectAll', newSelectAll);
    }
});

// Clear selections when switching mode or setting to empty
watch(() => props.payerMode, () => {
    emit('update:selectedPayers', []);
    emit('update:selectedGroups', []);
    emit('update:searchQuery', ''); // Reset query
});
</script>