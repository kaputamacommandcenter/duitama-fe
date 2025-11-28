<template>
  <div class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box w-11/12 max-w-4xl">
      <h3 class="font-bold text-lg mb-4">Tambah Anggota ke Kelompok (ID: {{ groupId }})</h3>

      <!-- Search and Filter -->
      <div class="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari nama, ID, atau NPM..."
          class="input input-bordered flex-grow"
          :disabled="loading"
        />
        <!-- Filter untuk menyembunyikan anggota yang sudah ada di grup ini -->
        <label class="label cursor-pointer gap-2">
          <input type="checkbox" v-model="hideExistingMembers" class="checkbox checkbox-primary checkbox-sm" />
          <span class="label-text">Sembunyikan Anggota Grup Ini</span>
        </label>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center p-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-4">Memuat data pembayar...</p>
      </div>

      <!-- Member List Table -->
      <div v-else class="max-h-80 overflow-y-auto border rounded-lg">
        <table class="table table-compact w-full">
          <thead>
            <tr>
              <th class="w-16">Pilih</th>
              <th>Nama Payer</th>
              <th>ID/NPM</th>
              <th>Tipe</th>
              <th>Prodi</th>
              <th>Email/HP</th>
              <th>Kelompok Saat Ini</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredPayers.length === 0">
              <td colspan="7" class="text-center text-gray-500 py-4">
                {{ searchQuery ? 'Tidak ada payer yang cocok.' : 'Tidak ada data payer.' }}
              </td>
            </tr>
            <tr v-for="payer in filteredPayers" :key="payer.id" class="hover:bg-base-200">
              <th>
                <!-- Checkbox untuk memilih anggota -->
                <input
                  type="checkbox"
                  class="checkbox checkbox-sm"
                  :value="payer.id"
                  v-model="selectedMemberIds"
                />
              </th>
              <td>{{ payer.payer_name }}</td>
              <td>
                <span class="font-mono text-sm">{{ payer.identity_number }}</span>
                <span v-if="payer.npm" class="text-xs opacity-50 ml-1">({{ payer.npm }})</span>
              </td>
              <td><div class="badge badge-sm">{{ payer.payer_type || '-' }}</div></td>
              <td>{{ payer.study_program_name || '-' }}</td>
              <td>
                <span v-if="payer.email">{{ payer.email }}</span>
                <span v-else-if="payer.phone_number">{{ payer.phone_number }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <span v-if="payer.payer_group_id === groupId" class="badge badge-success badge-sm">Grup Ini</span>
                <span v-else-if="payer.group_name" class="badge badge-info badge-sm">{{ payer.group_name }}</span>
                <span v-else>-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Footer and Actions -->
      <div class="modal-action mt-4 flex justify-between items-center">
        <button class="btn btn-outline" @click="$emit('close')">Batal</button>
        
        <div class="text-sm font-medium mr-4">
            {{ selectedMemberIds.length }} Anggota Terpilih
        </div>

        <button
          class="btn btn-success"
          :disabled="selectedMemberIds.length === 0"
          @click="addSelectedMembers"
        >
          Tambahkan ke Kelompok
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Swal from 'sweetalert2';
import { api } from '../../api/config';

const props = defineProps({
  visible: Boolean,
  groupId: [String, Number], // ID kelompok saat ini
});

const emit = defineEmits(['close', 'add-members']);

const loading = ref(true);
const allPayers = ref([]); // Semua data payer dari backend
const selectedMemberIds = ref([]);
const searchQuery = ref('');
const hideExistingMembers = ref(true); // Default: sembunyikan anggota yang sudah ada

const loadAllPayers = async () => {
  loading.value = true;
  try {
    const res = await api.get('payers');
    const rawData = res.data.data || [];
    
    // PERBAIKAN KRUSIAL: Mapping secara eksplisit untuk memastikan semua field ada
    // Dan disimpan sebagai objek non-reactive untuk pengiriman
    allPayers.value = rawData.map(payer => ({
        id: payer.id,
        payer_group_id: payer.payer_group_id,
        identity_number: payer.identity_number,
        npm: payer.npm,
        payer_name: payer.payer_name,
        study_program_code: payer.study_program_code,
        study_program_name: payer.study_program.study_program_name,
        email: payer.email,
        payer_type: payer.payer_type,
        phone_number: payer.phone_number,
        group_name: payer.payer_group ? payer.payer_group.group_name : null, // Ambil nama grup
    }));

  } catch (err) {
    console.error("Error loading all payers:", err);
    Swal.fire("Error", "Gagal memuat daftar pembayar.", "error");
    emit('close');
  } finally {
    loading.value = false;
  }
};

onMounted(loadAllPayers);

// Menghitung daftar payer yang ditampilkan berdasarkan search query dan filter grup
const filteredPayers = computed(() => {
  const query = searchQuery.value.toLowerCase();
  const currentGroupId = props.groupId;

  return allPayers.value.filter(payer => {
    // 1. Filter: Sembunyikan anggota grup ini (jika checkbox dicentang)
    if (hideExistingMembers.value && payer.payer_group_id === currentGroupId) {
      return false;
    }

    // 2. Search: Filter berdasarkan query
    const name = payer.payer_name?.toLowerCase() || '';
    const id = payer.identity_number?.toLowerCase() || '';
    const npm = payer.npm?.toLowerCase() || '';
    const groupName = payer.group_name?.toLowerCase() || '';
    // Tambahan search field
    const email = payer.email?.toLowerCase() || '';
    const phone = payer.phone_number?.toLowerCase() || '';
    const type = payer.payer_type?.toLowerCase() || '';
    const study = payer.study_program_code?.toLowerCase() || '';


    if (!query) return true;

    return name.includes(query) ||
           id.includes(query) ||
           npm.includes(query) ||
           email.includes(query) ||
           phone.includes(query) ||
           type.includes(query) ||
           study.includes(query) ||
           groupName.includes(query);
  });
});

// Watcher untuk membersihkan pilihan jika data yang ditampilkan berubah (misalnya setelah filter)
watch(filteredPayers, (newVal, oldVal) => {
    if (newVal.length < oldVal.length) {
         // Hapus ID yang sudah tidak ada di tampilan baru
        const validIds = newVal.map(p => p.id);
        selectedMemberIds.value = selectedMemberIds.value.filter(id => validIds.includes(id));
    }
});


const addSelectedMembers = () => {
  if (selectedMemberIds.value.length > 0) {
    
    // 1. Ambil objek payer yang terpilih
    const selectedPayers = allPayers.value.filter(payer =>
        selectedMemberIds.value.includes(payer.id)
    );

    // 2. Petakan ke format LENGKAP yang diperlukan: [{...full_payer_data, payer_group_id: X}, ...]
    // Karena allPayers sudah di-map secara eksplisit di loadAllPayers, spread operator ini
    // seharusnya mengirim SEMUA field.
    const payersToUpdate = selectedPayers.map(payer => {
        // PERHATIAN: Hapus field 'group_name' saat mengirim payload, karena backend hanya butuh kode/ID.
        const { group_name, ...payloadPayer } = payer; 
        
        return {
            ...payloadPayer, 
            payer_group_id: props.groupId, // Timpa ID grup
        };
    });
    
    // 3. Kirim array objek LENGKAP ke komponen induk.
    emit('add-members', payersToUpdate); 
  }
};
</script>