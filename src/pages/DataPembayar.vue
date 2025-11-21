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
              <th>Nama Lengkap</th>
              <th>Jenis</th>
              <th>Jurusan</th>
              <th>Email</th>
              <th>Kelompok</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isFetchingMainData">
                <td colspan="7" class="text-center py-8">
                    <span class="loading loading-spinner loading-lg text-primary"></span>
                    <p class="mt-2 text-gray-500">Memuat Data Pembayar...</p>
                </td>
            </tr>
            <tr v-else-if="payers.length === 0">
                <td colspan="7" class="text-center py-4 text-gray-500">
                    Tidak ada data Pembayar.
                </td>
            </tr>
            <tr v-for="p in payers" :key="p.id">
              <td>
                <span class="font-bold">{{ p.identity_number }}</span>
                <br>
                <span class="text-xs opacity-50">{{ p.npm || '-' }}</span>
              </td>
              <td>{{ p.nama_lengkap }}</td> <!-- Diubah: nama_lengkap -->
              <td>
                <div class="badge" :class="p.payer_type === 'MAHASISWA' ? 'badge-info' : 'badge-ghost'">
                    {{ p.payer_type }}
                </div>
              </td>
              <td>{{ p.jurusan }}</td> <!-- Diubah: jurusan -->
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
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL 1: Tambah/Edit Payer Manual -->
    <input type="checkbox" id="modalPayerForm" class="modal-toggle" :checked="modalVisible" />
    <div class="modal" :class="{'modal-open': modalVisible}">
      <div class="modal-box w-11/12 max-w-lg">
        <h3 class="font-bold text-lg mb-4">
          {{ formMode === 'add' ? 'Tambah Pembayar Baru (UMUM)' : 'Edit Pembayar: ' + currentPayer.nama_lengkap }} <!-- Diubah: nama_lengkap -->
        </h3>

        <form @submit.prevent="savePayer" class="space-y-3">
          
          <div class="grid grid-cols-2 gap-3">
            <!-- Nama Lengkap -->
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nama Lengkap</span></div>
              <input type="text" v-model="currentPayer.nama_lengkap" class="input input-bordered w-full" required /> <!-- Diubah: nama_lengkap -->
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
              <span>Tipe Pembayar Otomatis: **UMUM**. Bidang NPM dan Jurusan diabaikan.</span> <!-- Diubah: Jurusan -->
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
                    <div class="label"><span class="label-text">Jurusan</span></div> <!-- Diubah: Jurusan -->
                    <select v-model="currentPayer.jurusan" class="select select-bordered w-full"> <!-- Diubah: jurusan -->
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
                        <option value="sia_user">RESTAPI-SIA (Endpoint /user)</option>
                        <option value="pmb">RESTAPI-PMB (Calon Mahasiswa - Simulasi)</option>
                    </select>
                </label>

                <div class="modal-action">
                    <button type="button" class="btn btn-outline" @click="importModalVisible = false">Batal</button>
                    <button class="btn btn-warning" @click="fetchDataFromSource" :disabled="isImporting">
                        <span v-if="isImporting" class="loading loading-spinner"></span>
                        {{ isImporting ? 'Mengambil Data...' : 'Ambil Data dari API' }}
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

                <!-- Input Pencarian Diperbarui -->
                <div class="mb-4">
                    <input type="text" v-model="searchTerm" placeholder="Cari berdasarkan Nama atau NPM..." 
                            class="input input-bordered w-full" />
                </div>

                <div class="overflow-x-auto max-h-80 mb-4 border rounded-lg">
                    <table class="table w-full table-compact">
                        <thead>
                            <tr class="bg-base-200">
                                <th>
                                    <input type="checkbox" class="checkbox checkbox-sm" v-model="selectAllImport">
                                </th>
                                <th>ID Number</th>
                                <th>NPM</th>
                                <th>Nama Lengkap</th>
                                <th>Jurusan</th>
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
                                <td>{{ data.identity_number }}</td>
                                <td>{{ data.npm || '-' }}</td>
                                <td>{{ data.nama_lengkap }}</td>
                                <td>{{ data.jurusan }}</td>
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
import { ref, computed, watch, onMounted } from "vue"; 
import { sia } from "../api/sia"; // API untuk import mahasiswa
import { api } from "../api/config"; // API untuk data utama /payers

// =================== STATE DUMMY DATA =====================
const dummyStudyPrograms = ref(['TK', 'MI', 'SI', 'AK', 'MN', 'TI']);

const payerGroups = ref([
  { id: 101, name: "Angkatan 2024 - Kelas Pagi A" },
  { id: 102, name: "Angkatan 2024 - Kelas Pagi B" },
]);

// Data Pembayar akan diisi dari API /payers
const payers = ref([]);
const isFetchingMainData = ref(true); // State untuk loading tabel utama

// =================== LOGIKA FETCH DATA UTAMA (/payers) =====================

const fetchPayers = async () => {
    isFetchingMainData.value = true;
    try {
        // Menggunakan instance 'api' untuk mengambil data utama
        const response = await api.get('/payers'); 
        
        const rawData = response.data.data || response.data;

        if (Array.isArray(rawData)) {
            // Asumsikan struktur data dari /payers sudah sesuai dengan format Payer lokal
            payers.value = rawData;
        } else {
            Swal.fire('Error Data', 'Struktur respons API /payers tidak valid.', 'error');
            payers.value = [];
        }
    } catch (error) {
        console.error("Error fetching payers data:", error);
        const errorMessage = error.response ? `Gagal mengambil data pembayar: ${error.response.status} - ${error.response.statusText}` : 'Koneksi ke API Pembayar gagal.';
        Swal.fire('Gagal Ambil Data', errorMessage, 'error');
        // Fallback ke array kosong
        payers.value = [];
    } finally {
        isFetchingMainData.value = false;
    }
};

// Panggil fetchPayers saat komponen dimuat
onMounted(fetchPayers);


// =================== STATE MANAGEMENT FORM =====================
const modalVisible = ref(false);
const formMode = ref('add'); // 'add' atau 'edit'

const initialPayer = { 
  id: null, 
  identity_number: '', 
  npm: '', 
  nama_lengkap: '', 
  jurusan: '',     
  email: '', 
  payer_type: 'MAHASISWA', 
  phone_number: '', 
  payer_group_id: null 
};
const currentPayer = ref({...initialPayer});

// =================== STATE MANAGEMENT IMPORT =====================
const importModalVisible = ref(false);
const importSource = ref('sia_user'); 
const isImporting = ref(false);
const importedData = ref([]); 
const selectedImportIds = ref([]); 
const searchTerm = ref(''); 

// Computed untuk data yang difilter (Pencarian Nama atau NPM saja)
const filteredImportedData = computed(() => {
  if (!searchTerm.value) {
    return importedData.value;
  }
  const term = searchTerm.value.toLowerCase();
  
  return importedData.value.filter(data => 
    // Pencarian berdasarkan Nama Lengkap (nama_lengkap)
    data.nama_lengkap.toLowerCase().includes(term) || 
    // Pencarian berdasarkan NPM
    (data.npm && data.npm.includes(term))
  );
});

// Computed untuk select all
const selectAllImport = computed({
  get: () => selectedImportIds.value.length === filteredImportedData.value.length && filteredImportedData.value.length > 0,
  set: (value) => {
    if (value) {
      // Pilih semua ID dari data yang difilter (untuk select all sesuai tampilan)
      selectedImportIds.value = filteredImportedData.value.map(d => d.identity_number);
    } else {
      // Hapus semua ID yang ada di data yang difilter dari array selectedImportIds
      const filteredIds = filteredImportedData.value.map(d => d.identity_number);
      selectedImportIds.value = selectedImportIds.value.filter(id => !filteredIds.includes(id));
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

// =================== LOGIKA CRUD MANUAL (API-DRIVEN) =====================

const openForm = (mode, payer = null) => {
  formMode.value = mode;

  if (mode === 'add') {
    currentPayer.value = { 
      ...initialPayer,
      payer_type: 'UMUM', // Set otomatis ke UMUM untuk mode tambah baru
      npm: '',
      jurusan: '' 
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

const savePayer = async () => {
  // 1. Validasi Kolom Wajib
  if (!currentPayer.value.nama_lengkap || !currentPayer.value.identity_number || !currentPayer.value.email) {
    Swal.fire('Validasi Gagal', 'Harap isi Nama Lengkap, Nomor Identitas, dan Email.', 'warning');
    return;
  }
  
  // 2. Validasi Jurusan
  if (formMode.value === 'edit' && currentPayer.value.payer_type !== 'UMUM' && !currentPayer.value.jurusan) {
    Swal.fire('Validasi Gagal', 'Jurusan wajib diisi untuk tipe Pembayar MAHASISWA atau CALON MAHASISWA.', 'warning');
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

  const payload = { ...currentPayer.value };
  
  // Cleanup fields for 'add' (UMUM) if they exist
  if (formMode.value === 'add') {
      // Pastikan bidang yang tidak relevan untuk UMUM di mode 'add' dikirim sebagai null/tidak ada
      payload.npm = null;
      payload.jurusan = null;
      payload.payer_type = 'UMUM';
      // Hapus ID lama (yang masih null) dari payload POST
      delete payload.id;
  }

  try {
      let successMessage = '';

      if (formMode.value === 'add') {
          // Operasi Tambah (POST)
          await api.post('/payers', payload);
          successMessage = `Pembayar ${payload.nama_lengkap} berhasil ditambahkan.`; 
      } else {
          // Operasi Edit (PUT)
          // ID digunakan di URL untuk mengidentifikasi resource
          await api.put(`/payers/${payload.id}`, payload);
          successMessage = `Pembayar ${payload.nama_lengkap} berhasil diperbarui.`;
      }
      
      closeModal();
      await fetchPayers(); // Refresh data utama dari API
      Swal.fire('Berhasil!', successMessage, 'success');

  } catch (error) {
      console.error("Error saving payer data:", error);
      const errorDetail = error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan atau validasi.';
      Swal.fire('Gagal Simpan', `Gagal menyimpan data: ${errorDetail}`, 'error');
  }
};

const deletePayer = async (id) => {
    try {
        // Operasi Hapus (DELETE)
        await api.delete(`/payers/${id}`);
    } catch (error) {
        console.error("Error deleting payer data:", error);
        const errorDetail = error.response?.data?.message || error.message || 'Terjadi kesalahan jaringan atau validasi.';
        // Lempar error agar bisa ditangkap oleh confirmDelete
        throw new Error(errorDetail); 
    }
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
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
          await deletePayer(id); // Panggil fungsi delete API
          await fetchPayers(); // Refresh data utama dari API
          Swal.fire(
            'Terhapus!',
            'Pembayar berhasil dihapus.',
            'success'
          );
      } catch (error) {
           Swal.fire('Gagal Hapus', error.message || 'Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
  });
};


// =================== LOGIKA IMPORT API (SIA) =====================

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

/**
 * Fungsi untuk memproses data user dari API SIA menjadi format Payer yang sesuai.
 * @param {Array} apiUsers - Array objek user dari response API SIA.
 * @returns {Array} Array objek Payer yang terstruktur.
 */
const transformSIAUserToPayer = (apiUsers) => {
    return apiUsers.map(user => ({
        // LOGIKA: Gunakan no_ktp, jika kosong gunakan npm. Jika keduanya kosong, gunakan user_id.
        identity_number: user.no_ktp || user.npm || user.user_id.toString(), 
        npm: user.npm || null,
        nama_lengkap: user.nama_lengkap || user.name || user.full_name || 'Nama Tidak Tersedia', 
        jurusan: user.jurusan || user.prodi_kode || null,     
        email: user.email || 'email@default.com',
        // Asumsi data dari /user adalah Mahasiswa atau sejenisnya
        payer_type: user.is_active === 1 ? 'MAHASISWA' : 'CALON_MAHASISWA', 
        phone_number: user.no_telp || user.phone || null,
        payer_group_id: null // Kelompok diisi manual atau dari data lain
    }));
};

// TAHAP 1: Mengambil data dari sumber (Panggilan API Sesungguhnya)
const fetchDataFromSource = async () => {
  isImporting.value = true;
  importedData.value = [];
  selectedImportIds.value = [];

  if (importSource.value === 'sia_user') {
    // Menggunakan instance sia yang sudah diimpor, endpoint adalah '/user'
    const url = '/user'; 

    try {
        // Panggilan menggunakan instance sia.get()
        const response = await sia.get(url); 
        const rawData = response.data.data || response.data; 

        if (Array.isArray(rawData) && rawData.length > 0) {
            importedData.value = transformSIAUserToPayer(rawData);
            Swal.fire('Berhasil', `Berhasil mengambil ${rawData.length} data dari RESTAPI-SIA ${url}. Sekarang pilih data yang ingin diimpor.`, 'info');
        } else {
            importedData.value = [];
            Swal.fire('Informasi', 'Data API kosong atau struktur respons tidak sesuai.', 'warning');
        }

    } catch (error) {
        console.error("Error fetching data from SIA API:", error);
        const errorMessage = error.response ? `Gagal mengambil data: ${error.response.status} - ${error.response.statusText}` : 'Koneksi API SIA gagal.';
        Swal.fire('Gagal Import API', errorMessage, 'error');
    }
  
  } else if (importSource.value === 'pmb') {
    // Data simulasi dari PMB (Calon Mahasiswa) - Tetap sebagai simulasi
    const newPayers = [
      { identity_number: "20250002", npm: null, nama_lengkap: "Maria Ulfa (PMB Sim)", jurusan: "TI", email: "maria.u@pmb.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567895", payer_group_id: null },
      { identity_number: "20250003", npm: null, nama_lengkap: "Ahmad Yani (PMB Sim)", jurusan: "SI", email: "ahmad.y@pmb.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567896", payer_group_id: null },
      { identity_number: "20250001", npm: null, nama_lengkap: "Rahmat Hidayat (Duplikat)", jurusan: "MI", email: "rahmat.h@pmb.com", payer_type: "CALON_MAHASISWA", phone_number: "081234567892", payer_group_id: 102 }, // Duplikat
    ];
    importedData.value = newPayers;
    Swal.fire('Simulasi', `Berhasil mengambil ${newPayers.length} data dari RESTAPI-PMB (Simulasi). Sekarang pilih data yang ingin diimpor.`, 'info');
  }

  isImporting.value = false;
};

// TAHAP 2: Konfirmasi Import data yang dipilih
const confirmImport = async () => {
  isImporting.value = true;
  
  // 1. Filter data yang dipilih DAN yang bukan duplikat
  const payersToImport = importedData.value.filter(data => 
    selectedImportIds.value.includes(data.identity_number) && !isDuplicate(data.identity_number)
  );

  // 2. Hitung duplikat yang diabaikan
  let duplicateCount = importedData.value.filter(data => 
    selectedImportIds.value.includes(data.identity_number) && isDuplicate(data.identity_number)
  ).length;

  try {
      if (payersToImport.length > 0) {
          // Operasi Batch Import (asumsi API mendukung POST array data ke /payers/batch atau sejenisnya)
          // Karena kita tidak memiliki endpoint batch, kita akan simulasikan satu per satu.
          
          let successCount = 0;
          
          // Menggunakan Promise.all atau loop for...of untuk API POST
          for (const payerData of payersToImport) {
              // Hapus ID yang dibuat di sisi klien (jika ada) karena ini POST baru
              const payload = { ...payerData };
              delete payload.id; 
              
              try {
                  // Anggap semua data yang diimpor adalah MAHASISWA/CALON MAHASISWA dari SIA/PMB
                  await api.post('/payers', payload); 
                  successCount++;
              } catch (postError) {
                  console.error(`Gagal menyimpan payer ${payerData.identity_number}:`, postError);
                  // Lanjutkan ke data berikutnya meskipun ada yang gagal
              }
          }

          if (successCount > 0) {
              await fetchPayers(); // Refresh data utama setelah impor API
          }

          Swal.fire(
            'Import Selesai!', 
            `Berhasil mengimpor ${successCount} data baru. (${duplicateCount} data duplikat dan ${payersToImport.length - successCount} data gagal diimpor diabaikan).`, 
            'success'
          );

      } else {
           Swal.fire('Informasi', `Tidak ada data baru yang dipilih atau semua data yang dipilih merupakan duplikat (${duplicateCount} duplikat diabaikan).`, 'info');
      }

  } catch (error) {
      Swal.fire('Gagal Import', 'Terjadi kesalahan saat memproses impor data.', 'error');
  } finally {
      isImporting.value = false;
      // Tutup modal setelah selesai
      importModalVisible.value = false;
      resetImportData();
  }
};

</script>