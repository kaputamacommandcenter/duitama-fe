<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">
      Detail Kelompok: {{ group.group_name || 'Memuat...' }}
    </h1>

    <!-- Loading State -->
    <div v-if="loading" class="text-center p-10">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="mt-4">Memuat data kelompok...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error shadow-lg">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
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
          <!-- Anda bisa menambahkan informasi lain di sini -->
        </div>
      </div>

      <!-- Member List Card -->
      <div class="card bg-base-100 shadow-xl p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold">Daftar Anggota ({{ members.length }})</h2>
          <!-- Tombol Tambah Anggota (contoh) -->
          <button class="btn btn-primary btn-sm">
            Tambah Anggota
          </button>
        </div>

        <div v-if="members.length > 0" class="overflow-x-auto">
          <table class="table w-full">
            <thead>
              <tr>
                <th>No.</th>
                <th>Nama Anggota</th>
                <th>ID Payer/Member</th>
                <!-- Tambahkan kolom lain yang relevan -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="(member, index) in members" :key="member.id">
                <th>{{ index + 1 }}</th>
                <td>{{ member.member_name }}</td>
                <td>{{ member.member_id }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-5 text-gray-500">
          Belum ada anggota yang terdaftar dalam kelompok ini.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';
import { api } from '../../api/config';

const route = useRoute();
const groupId = route.params.id;

const group = ref({});
const members = ref([]);
const loading = ref(true);
const error = ref(null);

// Placeholder untuk struktur data member
// Sesuaikan dengan respon API Anda yang sebenarnya
// Struktur member diasumsikan: { id: 1, member_name: 'Nama Anggota', member_id: 'PAY001' }

const loadGroupDetails = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    // 1. Ambil Detail Kelompok
    const groupRes = await api.get(`payer-groups/${groupId}`);
    group.value = groupRes.data.data || groupRes.data;

    // 2. Ambil Daftar Anggota
    // Asumsi endpoint untuk anggota adalah /payer-groups/{id}/members
    const membersRes = await api.get(`payer-groups/${groupId}/members`);
    members.value = membersRes.data.data || membersRes.data;

  } catch (err) {
    console.error("Error loading group details:", err);
    error.value = "Terjadi kesalahan saat mengambil data.";
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
</script>