<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Kelola Kelompok Payer</h1>

    <div class="card bg-base-100 shadow-xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-medium">Daftar Kelompok</h2>
        <button class="btn btn-primary btn-sm" @click="openForm('add')">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Tambah Kelompok
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Nama Kelompok</th>
              <th>Deskripsi</th>
              <th>Jumlah Anggota</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="g in payerGroups" :key="g.id">
              <td>{{ g.name }}</td>
              <td>{{ g.description || '-' }}</td>
              <td>{{ g.members.length }}</td>
              <td>
                <router-link :to="{ name: 'detail-kelompok', params: { id: g.id } }"
                             class="btn btn-xs btn-info btn-outline mr-2">
                  Detail Anggota
                </router-link>
                <button class="btn btn-xs btn-warning btn-outline mr-2" @click="openForm('edit', g)">Edit</button>
                <button class="btn btn-xs btn-error btn-outline" @click="confirmDelete(g.id)">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <input type="checkbox" id="modalGroupForm" class="modal-toggle" :checked="modalVisible" />
    
    <div class="modal" :class="{'modal-open': modalVisible}">
      <div class="modal-box w-11/12 max-w-md">
        <h3 class="font-bold text-lg mb-4">
          {{ formMode === 'add' ? 'Tambah Kelompok Baru' : 'Edit Kelompok: ' + currentGroup.name }}
        </h3>

        <div class="space-y-4">
          <div>
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nama Kelompok</span></div>
              <input type="text" v-model="currentGroup.name" class="input input-bordered w-full" required />
            </label>
          </div>
          <div>
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Deskripsi (Opsional)</span></div>
              <input type="text" v-model="currentGroup.description" class="input input-bordered w-full" />
            </label>
          </div>
        </div>
        
        <div class="modal-action">
          <button class="btn btn-outline" @click="closeModal">Batal</button>
          <button class="btn btn-success" @click="saveGroup" :disabled="!currentGroup.name">
            Simpan Kelompok
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import Swal from "sweetalert2";
import { ref } from "vue";
import { useRouter } from 'vue-router'; // Digunakan untuk navigasi ke Detail Anggota

const router = useRouter(); 

// =================== DUMMY DATA =====================
const payerGroups = ref([
  {
    id: 101,
    name: "Angkatan 2024 - Kelas Pagi A",
    description: "Mahasiswa angkatan 2024 kelas pagi shift A",
    members: [
      { id: 1, name: "Budi Santoso", identity_number: "20250101" },
      { id: 2, name: "Siti Aisyah", identity_number: "20250102" }
    ]
  },
  {
    id: 102,
    name: "Angkatan 2024 - Kelas Pagi B",
    description: "Mahasiswa angkatan 2024 kelas pagi shift B",
    members: [
      { id: 3, name: "Rahmat Hidayat", identity_number: "20250103" },
      { id: 4, name: "Kartika Dewi", identity_number: "20250104" }
    ]
  }
]);

// =================== STATE MANAGEMENT FORM =====================
const modalVisible = ref(false);
const formMode = ref('add'); // 'add' atau 'edit'

const currentGroup = ref({ id: null, name: '', description: '', members: [] });

// =================== LOGIKA FORM =====================

const openForm = (mode, group = null) => {
  formMode.value = mode;

  if (mode === 'add') {
    currentGroup.value = { id: null, name: '', description: '', members: [] };
  } else {
    // Mode Edit: Clone objek agar perubahan tidak langsung memengaruhi tabel
    currentGroup.value = JSON.parse(JSON.stringify(group));
  }
  
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

const saveGroup = () => {
  if (!currentGroup.value.name) {
    Swal.fire('Validasi Gagal', 'Nama kelompok tidak boleh kosong.', 'warning');
    return;
  }
  
  if (formMode.value === 'add') {
    // Tentukan ID baru
    const newId = payerGroups.value.length ? Math.max(...payerGroups.value.map(g => g.id)) + 1 : 101;
    currentGroup.value.id = newId;
    
    // Simpan members sebagai array kosong saat pertama kali dibuat
    currentGroup.value.members = [];
    
    payerGroups.value.push({ ...currentGroup.value });
    Swal.fire('Berhasil!', `Kelompok ${currentGroup.value.name} berhasil ditambahkan.`, 'success');
  } else {
    // Mode Edit
    const index = payerGroups.value.findIndex(g => g.id === currentGroup.value.id);
    if (index !== -1) {
      // Pertahankan data members lama
      const existingMembers = payerGroups.value[index].members;
      payerGroups.value[index] = { ...currentGroup.value, members: existingMembers };
      Swal.fire('Berhasil!', `Kelompok ${currentGroup.value.name} berhasil diperbarui.`, 'success');
    }
  }

  closeModal();
};

const confirmDelete = (id) => {
  Swal.fire({
    title: 'Apakah Anda Yakin?',
    text: "Menghapus kelompok tidak akan menghapus anggota!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteGroup(id);
      Swal.fire(
        'Terhapus!',
        'Kelompok berhasil dihapus.',
        'success'
      );
    }
  });
};

const deleteGroup = (id) => {
  const index = payerGroups.value.findIndex(g => g.id === id);
  if (index !== -1) {
    payerGroups.value.splice(index, 1);
  }
  // Catatan: Dalam aplikasi nyata, Anda akan memanggil API DELETE di sini.
};

// Fungsi navigasi, meskipun tidak digunakan langsung di template ini (menggunakan router-link)
const goToDetail = (groupId) => {
    router.push({ name: 'detail-kelompok', params: { id: groupId } });
};

</script>