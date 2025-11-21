<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Kelola Data Pembayar (Payer)</h1>

    <!-- CATATAN: Pastikan library Font Awesome telah dimuat secara global di proyek Anda. -->
    
    <div class="card bg-base-100 shadow-xl p-6">
      <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 class="text-xl font-medium">Daftar Pembayar</h2>
        <div class="flex gap-2">
          <!-- Tombol untuk Import Data dari API - Ikon Font Awesome: fa-file-import -->
          <!-- Disesuaikan: Gunakan kelas `flex items-center` pada tombol untuk perataan vertikal yang lebih baik. Hapus h-5 w-5 dari <i> agar tidak bentrok. -->
          <button class="btn btn-warning btn-sm flex items-center gap-2" @click="openImportModal">
            <i class="fa-solid fa-file-import"></i>
            Import Data
          </button>
          
          <!-- Tombol untuk Tambah Manual - Ikon Font Awesome: fa-plus -->
          <button class="btn btn-primary btn-sm flex items-center gap-2" @click="openForm('add')">
            <i class="fa-solid fa-plus"></i>
            Tambah Payer
          </button>
        </div>
      </div>

      <!-- Tabel Pembayar -->
      <div class="overflow-x-auto">
        <table class="table w-full table-zebra">
          <thead>
            <tr>
              <th>ID/NPM</th>
              <th>Nama</th>
              <th>Jenis</th>
              <th>Program Studi</th>
              <th>Email</th>
              <th>Kelompok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in payers" :key="p.id">
              <td>
                <span class="font-bold">{{ p.identity_number }}</span>
                <br>
                <span class="text-xs opacity-50">{{ p.npm || '-' }}</span>
              </td>
              <td>{{ p.name }}</td>
              <td>
                <div class="badge" :class="p.payer_type === 'MAHASISWA' ? 'badge-info' : 'badge-ghost'">
                    {{ p.payer_type }}
                </div>
              </td>
              <td>{{ p.study_program_code }}</td>
              <td>{{ p.email }}</td>
              <td>
                <span v-if="getGroupName(p.payer_group_id)" class="badge badge-success badge-outline">
                  {{ getGroupName(p.payer_group_id) }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="flex gap-2">
                <button class="btn btn-xs btn-warning btn-outline" @click="openForm('edit', p)">Edit</button>
                <button class="btn btn-xs btn-error btn-outline" @click="confirmDelete(p.id)">Hapus</button>
              </td>
            </tr>
            <tr v-if="payers.length === 0">
                <td colspan="7" class="text-center py-4 text-gray-500">
                    Tidak ada data Pembayar.
                </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL 1: Tambah/Edit Payer Manual -->
    <input type="checkbox" id="modalPayerForm" class="modal-toggle" :checked="modalVisible" />
    <div class="modal" :class="{'modal-open': modalVisible}">
      <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg mb-4">
          {{ formMode === 'add' ? 'Tambah Pembayar Baru (UMUM)' : 'Edit Pembayar: ' + currentPayer.name }}
        </h3>

        <form @submit.prevent="savePayer" class="space-y-3">
          
          <div class="grid grid-cols-2 gap-3">
            <!-- Nama -->
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nama Lengkap</span></div>
              <input type="text" v-model="currentPayer.name" class="input input-bordered w-full" required />
            </label>
            <!-- ID Number -->
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nomor Identitas (Wajib Unik)</span></div>
              <input type="text" v-model="currentPayer.identity_number" class="input input-bordered w-full" required />
            </label>
          </div>

          <!-- Keterangan Otomatis Tipe Pembayar -->
          <div v-if="formMode === 'add'" class="alert alert-info shadow-lg p-3 text-sm">
              <!-- Menggunakan Font Awesome: fa-circle-info -->
              <i class="fa-solid fa-circle-info flex-shrink-0 w-6 h-6"></i>
              <span>Tipe Pembayar Otomatis: **UMUM**. Bidang NPM dan Program Studi diabaikan.</span>
          </div>

          <!-- Email -->
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Email</span></div>
            <input type="email" v-model="currentPayer.email" class="input input-bordered w-full" required />
          </label>
          
          <div class="grid grid-cols-2 gap-3">
            
            <!-- Phone Number -->
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nomor Telepon</span></div>
              <input type="tel" v-model="currentPayer.phone_number" class="input input-bordered w-full" />
            </label>

            <!-- Kelompok Payer (Opsional) -->
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Kelompok Payer (Opsional)</span></div>
              <select v-model="currentPayer.payer_group_id" class="select select-bordered w-full">
                <option :value="null">-- Tidak Ada Kelompok --</option>
                <option v-for="g in payerGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </label>
          </div>
          
          <!-- HANYA TAMPILKAN BIDANG MAHASISWA/CALON MAHASISWA JIKA MODE EDIT DAN TIPE BUKAN UMUM -->
          <template v-if="formMode === 'edit' && currentPayer.payer_type !== 'UMUM'">
            <div class="grid grid-cols-2 gap-3 border-t pt-4 mt-4">
                <label class="form-control w-full">
                  <div class="label"><span class="label-text">NPM/NIM (Opsional)</span></div>
                  <input type="text" v-model="currentPayer.npm" class="input input-bordered w-full" />
                </label>
                <label class="form-control w-full">
                    <div class="label"><span class="label-text">Kode Program Studi</span></div>
                    <select v-model="currentPayer.study_program_code" class="select select-bordered w-full">
                        <option disabled value="">Pilih Program Studi</option>
                        <option v-for="sp in dummyStudyPrograms" :key="sp" :value="sp">{{ sp }}</option>
                    </select>
                </label>
            </div>
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Tipe Pembayar</span></div>
              <select v-model="currentPayer.payer_type" class="select select-bordered w-full" required>
                <option value="MAHASISWA">MAHASISWA</option>
                <option value="CALON_MAHASISWA">CALON MAHASISWA</option>
                <option value="UMUM">UMUM</option>
              </select>
            </label>
          </template>


          <div class="modal-action">
            <button type="button" class="btn btn-outline" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-success">
              {{ formMode === 'add' ? 'Tambah Payer' : 'Simpan Perubahan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- MODAL 2: Import Data dari API (Sekarang 2 Tahap) -->
    <input type="checkbox" id="modalImportData" class="modal-toggle" :checked="importModalVisible" />
    <div class="modal" :class="{'modal-open': importModalVisible}">
        <div class="modal-box w-11/12 max-w-5xl">
            <h3 class="font-bold text-lg mb-4">Import Data Pembayar</h3>

            <!-- TAHAP 1: Pemilihan Sumber & Fetch -->
            <div v-if="!importedData.length" class="space-y-4">
                <label class="form-control w-full">
                    <div class="label"><span class="label-text">Pilih Sumber Data API</span></div>
                    <select v-model="importSource" class="select select-bordered w-full">
                        <option value="sia">RESTAPI-SIA (Mahasiswa Aktif)</option>
                        <option value="pmb">RESTAPI-PMB (Calon Mahasiswa)</option>
                    </select>
                </label>

                <div class="modal-action">
                    <button type="button" class="btn btn-outline" @click="importModalVisible = false">Batal</button>
                    <button class="btn btn-warning" @click="fetchDataFromSource" :disabled="isImporting">
                        <span v-if="isImporting" class="loading loading-spinner"></span>
                        {{ isImporting ? 'Mengambil Data...' : 'Ambil Data (Simulasi)' }}
                    </button>
                </div>
            </div>
            
            <!-- TAHAP 2: Filter dan Konfirmasi Import -->
            <div v-else>
                <div class="alert alert-info shadow-lg mb-4 text-sm">
                    <div>
                        <!-- Menggunakan Font Awesome: fa-circle-info -->
                        <i class="fa-solid fa-circle-info flex-shrink-0 w-6 h-6"></i>
                        <span>Pilih data yang ingin Anda masukkan ke dalam Daftar Pembayar. Duplikasi (berdasarkan Nomor Identitas) akan otomatis diabaikan pada proses penyimpanan.</span>
                    </div>
                </div>

                <!-- Input Pencarian Baru -->
                <div class="mb-4">
                    <input type="text" v-model="searchTerm" placeholder="Cari berdasarkan Nama atau ID Number..." 
                           class="input input-bordered w-full" />
                </div>

                <div class="overflow-x-auto max-h-80 mb-4 border rounded-lg">
                    <table class="table w-full table-compact">
                        <thead>
                            <tr class="bg-base-200">
                                <th>
                                    <input type="checkbox" class="checkbox checkbox-sm" v-model="selectAllImport">
                                </th>
                                <th>Nama</th>
                                <th>ID Number</th>
                                <th>NPM</th>
                                <th>Prodi</th>
                                <th>Tipe</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(data, index) in filteredImportedData" :key="index">
                                <td>
                                    <!-- Checkbox menggunakan ID Number yang ada di data yang sudah difilter -->
                                    <input type="checkbox" class="checkbox checkbox-sm" :value="data.identity_number" v-model="selectedImportIds">
                                </td>
                                <td>{{ data.name }}</td>
                                <td>{{ data.identity_number }}</td>
                                <td>{{ data.npm || '-' }}</td>
                                <td>{{ data.study_program_code }}</td>
                                <td><div class="badge badge-outline badge-sm">{{ data.payer_type }}</div></td>
                                <td>
                                    <div v-if="isDuplicate(data.identity_number)" class="badge badge-error badge-sm">Duplikat</div>
                                    <div v-else class="badge badge-success badge-sm">Baru</div>
                                </td>
                            </tr>
                            <tr v-if="filteredImportedData.length === 0">
                                <td colspan="7" class="text-center py-4 text-gray-500">
                                    {{ importedData.length === 0 ? 'Tidak ada data yang diambil.' : 'Pencarian tidak ditemukan.' }}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="modal-action">
                    <button type="button" class="btn btn-ghost" @click="resetImportData">Ambil Data Baru</button>
                    <!-- Button Simpan sekarang menggunakan jumlah ID terpilih, bukan yang difilter -->
                    <button class="btn btn-success" @click="confirmImport" :disabled="selectedImportIds.length === 0">
                        Simpan {{ selectedImportIds.length }} Payer Terpilih
                    </button>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<script setup>
import Swal from "sweetalert2";
import { ref, computed, watch } from "vue";
import { useRouter } from 'vue-router'; 

const router = useRouter(); 

// =================== STATE DUMMY DATA =====================
const dummyStudyPrograms = ref(['TK', 'MI', 'SI', 'AK', 'MN', 'TI']);

const payerGroups = ref([
 { id: 101, name: "Angkatan 2024 - Kelas Pagi A" },
 { id: 102, name: "Angkatan 2024 - Kelas Pagi B" },
]);

const payers = ref([
 { id: 1, identity_number: "20240001", npm: "20240001", name: "Budi Santoso", study_program_code: "SI", email: "budi.s@mail.com", payer_type: "MAHASISWA", phone_number: "081234567890", payer_group_id: 101 },
 { id: 2, identity_number: "20240002", npm: "20240002", name: "Siti Aisyah", study_program_code: "TK", email: "siti.a@mail.com", payer_type: "MAHASISWA", phone_number: "081234567891", payer_group_id: null },
 { id: 3, identity_number: "20250001", npm: null, name: "Rahmat Hidayat", study_program_code: "MI", email: "rahmat.h@mail.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567892", payer_group_id: 102 }
]);

// =================== STATE MANAGEMENT FORM =====================
const modalVisible = ref(false);
const formMode = ref('add'); // 'add' atau 'edit'

const initialPayer = { 
 id: null, 
 identity_number: '', 
 npm: '', 
 name: '', 
 study_program_code: '', 
 email: '', 
 payer_type: 'MAHASISWA', 
 phone_number: '', 
 payer_group_id: null 
};
const currentPayer = ref({...initialPayer});

// =================== STATE MANAGEMENT IMPORT =====================
const importModalVisible = ref(false);
const importSource = ref('sia'); // 'sia' atau 'pmb'
const isImporting = ref(false);
const importedData = ref([]); // Data yang diambil dari sumber (perlu difilter)
const selectedImportIds = ref([]); // ID Number data yang dipilih untuk di-import
const searchTerm = ref(''); // State baru untuk pencarian

// Computed untuk data yang difilter
const filteredImportedData = computed(() => {
 if (!searchTerm.value) {
  return importedData.value;
 }
 const term = searchTerm.value.toLowerCase();
 return importedData.value.filter(data => 
  data.name.toLowerCase().includes(term) || 
  data.identity_number.includes(term) ||
  (data.npm && data.npm.includes(term))
 );
});

// Computed untuk select all
const selectAllImport = computed({
 get: () => selectedImportIds.value.length === importedData.value.length && importedData.value.length > 0,
 set: (value) => {
  if (value) {
   // Pilih semua ID dari data ASLI (importedData)
   selectedImportIds.value = importedData.value.map(d => d.identity_number);
  } else {
   selectedImportIds.value = [];
  }
 }
});

// WATCHER: Reset pencarian saat modal ditutup
watch(importModalVisible, (newVal) => {
 if (!newVal) {
  searchTerm.value = '';
 }
});

// =================== LOGIKA UMUM =====================

const getGroupName = (groupId) => {
 const group = payerGroups.value.find(g => g.id === groupId);
 return group ? group.name : null;
};

// Cek Duplikasi
const isDuplicate = (identityNumber) => {
 return payers.value.some(p => p.identity_number === identityNumber);
};

// =================== LOGIKA CRUD MANUAL =====================

const openForm = (mode, payer = null) => {
 formMode.value = mode;

 if (mode === 'add') {
 currentPayer.value = { 
  ...initialPayer,
  payer_type: 'UMUM', // Set otomatis ke UMUM untuk mode tambah baru
  npm: '',
  study_program_code: ''
 };
 } else {
 // Mode Edit: Clone objek
 currentPayer.value = JSON.parse(JSON.stringify(payer));
 }

 modalVisible.value = true;
};

const closeModal = () => {
 modalVisible.value = false;
};

const savePayer = () => {
 // 1. Validasi Kolom Wajib (Nama, ID Number, Email)
 if (!currentPayer.value.name || !currentPayer.value.identity_number || !currentPayer.value.email) {
 Swal.fire('Validasi Gagal', 'Harap isi Nama Lengkap, Nomor Identitas, dan Email.', 'warning');
 return;
 }
 
 // 2. Validasi Program Studi (Hanya berlaku untuk EDIT jika tipe BUKAN UMUM)
 if (formMode.value === 'edit' && currentPayer.value.payer_type !== 'UMUM' && !currentPayer.value.study_program_code) {
  Swal.fire('Validasi Gagal', 'Program Studi wajib diisi untuk tipe Pembayar MAHASISWA atau CALON MAHASISWA.', 'warning');
  return;
 }

 // 3. Cek duplikasi Identity Number (kecuali untuk item yang sedang diedit)
 const isDuplicateId = payers.value.some(p => 
  p.identity_number === currentPayer.value.identity_number && p.id !== currentPayer.value.id
 );

 if (isDuplicateId) {
 Swal.fire('Validasi Gagal', 'Nomor Identitas harus unik.', 'error');
 return;
 }

 if (formMode.value === 'add') {
 // Pastikan bidang yang dihapus tetap kosong/default untuk konsistensi data
 currentPayer.value.npm = null;
 currentPayer.value.study_program_code = null;
 currentPayer.value.payer_type = 'UMUM';

 // Tentukan ID baru
 const newId = payers.value.length ? Math.max(...payers.value.map(p => p.id)) + 1 : 1;
 currentPayer.value.id = newId;

 payers.value.push({ ...currentPayer.value });
 Swal.fire('Berhasil!', `Pembayar ${currentPayer.value.name} berhasil ditambahkan sebagai UMUM.`, 'success');
 } else {
 // Mode Edit
 const index = payers.value.findIndex(p => p.id === currentPayer.value.id);
 if (index !== -1) {
  payers.value[index] = { ...currentPayer.value };
  Swal.fire('Berhasil!', `Pembayar ${currentPayer.value.name} berhasil diperbarui.`, 'success');
 }
 }

 closeModal();
};

const confirmDelete = (id) => {
 Swal.fire({
 title: 'Apakah Anda Yakin?',
 text: "Menghapus data pembayar ini?",
 icon: 'warning',
 showCancelButton: true,
 confirmButtonColor: '#d33',
 cancelButtonColor: '#3085d6',
 confirmButtonText: 'Ya, Hapus!'
 }).then((result) => {
 if (result.isConfirmed) {
  deletePayer(id);
  Swal.fire(
  'Terhapus!',
  'Pembayar berhasil dihapus.',
  'success'
  );
 }
 });
};

const deletePayer = (id) => {
 const index = payers.value.findIndex(p => p.id === id);
 if (index !== -1) {
 payers.value.splice(index, 1);
 }
};


// =================== LOGIKA IMPORT API (SIMULASI 2 TAHAP) =====================

const openImportModal = () => {
 // Reset data tahap 2 saat modal dibuka
 importedData.value = []; 
 selectedImportIds.value = [];
 importModalVisible.value = true;
};

const resetImportData = () => {
 // Kembali ke tahap 1
 importedData.value = [];
 selectedImportIds.value = [];
 isImporting.value = false;
 searchTerm.value = ''; // Reset pencarian
};

// TAHAP 1: Mengambil data dari sumber (Simulasi Fetch)
const fetchDataFromSource = () => {
 isImporting.value = true;
 
 // SIMULASI Fetch Data dari API (Ganti dengan panggilan API sesungguhnya)
 setTimeout(() => {
  let newPayers = [];
  
  if (importSource.value === 'sia') {
   // Data simulasi dari SIA (Mahasiswa Aktif)
   newPayers = [
    { identity_number: "20240004", npm: "20240004", name: "Dewi Kartika", study_program_code: "AK", email: "dewi.k@sia.com", payer_type: "MAHASISWA", phone_number: "081234567893", payer_group_id: 102 },
    { identity_number: "20240005", npm: "20240005", name: "Joko Susilo", study_program_code: "MN", email: "joko.s@sia.com", payer_type: "MAHASISWA", phone_number: "081234567894", payer_group_id: null },
    { identity_number: "20240001", npm: "20240001", name: "Budi Santoso", study_program_code: "SI", email: "budi.s@sia.com", payer_type: "MAHASISWA", phone_number: "081234567890", payer_group_id: 101 }, // Duplikat
    { identity_number: "20240006", npm: "20240006", name: "Alif Syahputra", study_program_code: "TK", email: "alif.s@sia.com", payer_type: "MAHASISWA", phone_number: "081234567897", payer_group_id: 101 },
    { identity_number: "20240007", npm: "20240007", name: "Citra Dewi", study_program_code: "SI", email: "citra.d@sia.com", payer_type: "MAHASISWA", phone_number: "081234567898", payer_group_id: null },
   ];
  } else {
   // Data simulasi dari PMB (Calon Mahasiswa)
   newPayers = [
    { identity_number: "20250002", npm: null, name: "Maria Ulfa", study_program_code: "TI", email: "maria.u@pmb.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567895", payer_group_id: null },
    { identity_number: "20250003", npm: null, name: "Ahmad Yani", study_program_code: "SI", email: "ahmad.y@pmb.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567896", payer_group_id: null },
    { identity_number: "20250001", npm: null, name: "Rahmat Hidayat", study_program_code: "MI", email: "rahmat.h@pmb.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567892", payer_group_id: 102 }, // Duplikat
    { identity_number: "20250004", npm: null, name: "Sari Mulia", study_program_code: "AK", email: "sari.m@pmb.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567899", payer_group_id: null },
    { identity_number: "20250005", npm: null, name: "Zulkifli Anwar", study_program_code: "MN", email: "zul.a@pmb.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567900", payer_group_id: null },
   ];
  }

  importedData.value = newPayers;
  selectedImportIds.value = newPayers.map(d => d.identity_number); // Default: pilih semua
  isImporting.value = false;

 }, 1500); // Simulasi loading API 1.5 detik
};

// TAHAP 2: Konfirmasi Import data yang dipilih
const confirmImport = () => {
 isImporting.value = true;
 
 setTimeout(() => {
  let newCount = 0;
  let duplicateCount = 0;
  let maxId = payers.value.length ? Math.max(...payers.value.map(p => p.id)) : 0;
  
  // Filter data yang dipilih DAN yang bukan duplikat
  const payersToImport = importedData.value.filter(data => 
   selectedImportIds.value.includes(data.identity_number) && !isDuplicate(data.identity_number)
  );

  payersToImport.forEach(p => {
   maxId++;
   p.id = maxId;
   payers.value.push(p);
   newCount++;
  });

  // Hitung total duplikat dari data yang dipilih
  duplicateCount = importedData.value.filter(data => 
   selectedImportIds.value.includes(data.identity_number) && isDuplicate(data.identity_number)
  ).length;

  isImporting.value = false;
  
  Swal.fire(
   'Import Selesai!', 
   `Berhasil mengimpor ${newCount} data baru. (${duplicateCount} data duplikat yang dipilih diabaikan).`, 
   'success'
  );
  
  // Tutup modal setelah selesai
  importModalVisible.value = false;
  resetImportData();

 }, 1500);
};

</script>