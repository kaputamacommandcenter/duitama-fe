<template>
  <div class="p-8 min-h-screen">
    <button class="btn btn-ghost btn-sm mb-4" @click="$router.go(-1)">
      &larr; Kembali ke Daftar Kelompok
    </button>
    <div class="flex flex-column md:flex-row md:justify-between">
      <h1 class="text-3xl font-bold mb-6">
        Detail Kelompok: {{ group.group_name || 'Memuat...' }}
      </h1>
      <button class="btn btn-primary btn-sm" @click="openModal">
        Tambah Anggota
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center p-10">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="mt-4">Memuat data kelompok...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error shadow-lg">
      <div>
        <span>Gagal memuat data kelompok: {{ error }}</span>
      </div>
    </div>

    <!-- Content -->
    <div v-else class="space-y-8">
      <!-- Group Info Card -->
      <div class="card bg-base-100 shadow-xl p-6">
        <h2 class="text-xl font-semibold mb-3">Informasi Kelompok</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span class="font-medium text-gray-500">ID Kelompok:</span>
            <p class="text-lg font-mono">{{ group.id }}</p>
          </div>
          <div>
            <span class="font-medium text-gray-500">Deskripsi:</span>
            <p class="text-lg">{{ group.description || 'Tidak ada deskripsi.' }}</p>
          </div>
        </div>
      </div>

      <!-- Member List Card -->
      <div class="card bg-base-100 shadow-xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Daftar Anggota ({{ members.length }})</h2>
        </div>

        <div v-if="members.length > 0" class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Anggota</th>
                <th>ID Payer/Member</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(member, index) in members" :key="member.id">
                <th>{{ index + 1 }}</th>
                <td>{{ member.payer_name }}</td>
                <td>{{ member.identity_number }}</td>
                <td>
                  <button class="btn btn-xs btn-error btn-outline" @click="confirmRemove(member.id, member.payer_name)">
                    Keluarkan
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-5 text-gray-500">
          Belum ada anggota yang terdaftar dalam kelompok ini.
        </div>
      </div>
    </div>
    
    <!-- Modal Tambah Anggota -->
    <ModalAddMember
      v-if="modalVisible"
      :visible="modalVisible"
      :group-id="groupId"
      @add-members="addMembers"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { api } from '../../api/config';
import ModalAddMember from '../../components/payer/ModalAddMember.vue'; // Asumsi path

const route = useRoute();
const groupId = route.params.id;

const group = ref({});
const members = ref([]);
const loading = ref(true);
const error = ref(null);
const modalVisible = ref(false);

const loadGroupDetails = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 1. Ambil Detail Kelompok (Endpoint lama tetap digunakan untuk mendapatkan metadata kelompok)
    const groupRes = await api.get(`payer-groups/${groupId}`);
    group.value = groupRes.data.data || groupRes.data;

    // 2. Ambil Daftar Anggota dari endpoint spesifik yang baru
    const membersRes = await api.get(`payers/get-by-group-id/${groupId}`);
    // Asumsi: Endpoint ini mengembalikan array data payer
    members.value = membersRes.data.data || membersRes.data || []; 

  } catch (err) {
    console.error("Error loading group details:", err);
    error.value = "Terjadi kesalahan saat mengambil data kelompok atau anggota.";
    Swal.fire("Error", "Gagal memuat detail kelompok dan anggota.", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (groupId) {
    loadGroupDetails();
  } else {
    error.value = "ID Kelompok tidak ditemukan.";
    loading.value = false;
  }
});

const openModal = () => {
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

// === FUNGSI TAMBAH ANGGOTA ===
// Menerima array objek LENGKAP dari modal (sesuai kebutuhan bulk-update)
const addMembers = async (payersToUpdate) => {
  if (payersToUpdate.length === 0) return;
  
  closeModal(); // Tutup modal saat proses dimulai

  try {
    const payload = {
      payers: payersToUpdate, 
    };
    
    // Panggil endpoint bulk update
    await api.post('payers/bulk-update', payload);

    Swal.fire("Berhasil", `${payersToUpdate.length} anggota berhasil ditambahkan ke kelompok.`, "success");
    loadGroupDetails(); // Muat ulang data anggota

  } catch (err) {
    console.error("Error adding members:", err);
    Swal.fire("Error", "Gagal menambahkan anggota ke kelompok.", "error");
  }
};

// === FUNGSI KELUARKAN ANGGOTA ===
const removeMember = async (payerId) => {
   try {
    // Membuat payload minimal untuk mengeluarkan 1 anggota (dengan data lengkap jika diperlukan)
    // Untuk saat ini, kita hanya mengirim ID dan payer_group_id: null, seperti yang sudah berfungsi sebelumnya
    const payersToUpdate = [{
      id: payerId,
      payer_group_id: null,
    }];

    const payload = {
      payers: payersToUpdate,
    };
    
    // Panggil endpoint bulk update
    await api.post('payers/bulk-update', payload);

    Swal.fire("Berhasil", "Anggota berhasil dikeluarkan dari kelompok.", "success");
    loadGroupDetails(); // Muat ulang data anggota

  } catch (err) {
    console.error("Error removing member:", err);
    Swal.fire("Error", "Gagal mengeluarkan anggota.", "error");
  }
};

const confirmRemove = (payerId, payerName) => {
  Swal.fire({
    title: `Keluarkan ${payerName}?`,
    text: "Anggota ini akan dihapus dari kelompok.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, Keluarkan",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      removeMember(payerId);
    }
  });
};
</script>