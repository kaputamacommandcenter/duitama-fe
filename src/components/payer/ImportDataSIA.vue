<template>
  <div class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="font-bold text-lg mb-4">Import Data Pembayar dari REST API SIA</h3>

      <!-- Input Form API SIA -->
      <div class="card bg-base-200 p-4 mb-4">
        <h4 class="font-semibold mb-2">Pilih Data yang Akan Diimpor</h4>
        <form @submit.prevent="fetchDataSIA" class="flex flex-wrap items-end gap-3">
          
          <label class="form-control flex-grow">
            <div class="label"><span class="label-text">Parameter Pencarian (Contoh: NPM/NIM)</span></div>
            <!-- Ganti dengan input yang relevan, di sini menggunakan contoh pencarian tunggal -->
            <input type="text" v-model="searchParam" placeholder="Masukkan NPM atau parameter lain" class="input input-bordered w-full" required :disabled="loading" />
          </label>

          <button type="submit" class="btn btn-info w-full md:w-auto" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"></span>
            <span v-else>Cari & Muat Data</span>
          </button>
        </form>
      </div>

      <!-- Tampilan Data Hasil Fetch -->
      <div class="max-h-96 overflow-y-auto border rounded-box p-3">
        <div v-if="loading" class="text-center py-10">
          <span class="loading loading-spinner loading-lg text-info"></span>
          <p class="mt-2 text-gray-500">Mengambil data dari API SIA...</p>
        </div>
        
        <div v-else-if="fetchedData.length > 0">
          <h4 class="font-semibold mb-3">Hasil Ditemukan: {{ fetchedData.length }} Data</h4>
          <table class="table w-full table-compact table-zebra">
            <thead>
              <tr>
                <th class="w-16">
                    <input type="checkbox" class="checkbox checkbox-sm" @change="toggleSelectAll" :checked="allSelected" />
                </th>
                <th>Nama</th>
                <th>NPM</th>
                <th>Email (SIA)</th>
                <th>Prodi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, index) in fetchedData" :key="index">
                <th>
                    <input type="checkbox" class="checkbox checkbox-sm" :value="data" v-model="selectedData" />
                </th>
                <td class="font-medium">{{ data.nama }}</td>
                <td>{{ data.npm }}</td>
                <td>{{ data.email_sia || '-' }}</td>
                <td>{{ data.prodi_kode || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-10 text-gray-500">
          Masukkan parameter dan klik "Cari & Muat Data"
        </div>
      </div>

      <!-- Modal Actions -->
      <div class="modal-action flex justify-between items-center mt-4">
        <button class="btn btn-error btn-outline" @click="$emit('close')">Tutup</button>
        
        <button class="btn btn-success" @click="importSelectedData" :disabled="selectedData.length === 0 || importing">
            <span v-if="importing" class="loading loading-spinner"></span>
            <span v-else>Import {{ selectedData.length }} Data Terpilih</span>
        </button>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Swal from 'sweetalert2';
// PERBAIKAN: Mengimpor instance 'sia' dan 'api' (untuk menyimpan ke DB lokal)
import { api } from '../../api/config'; 
import { sia } from '../../api/sia'; 

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['close', 'imported']);

const loading = ref(false);
const importing = ref(false);
const searchParam = ref(''); 
const fetchedData = ref([]);
const selectedData = ref([]);

// Computed property untuk cek apakah semua data terpilih
const allSelected = computed(() => {
    return fetchedData.value.length > 0 && selectedData.value.length === fetchedData.value.length;
});

// Fungsi untuk memilih/membatalkan semua data
const toggleSelectAll = () => {
    if (allSelected.value) {
        selectedData.value = [];
    } else {
        selectedData.value = [...fetchedData.value];
    }
};


// === FETCH DATA SIA ===
const fetchDataSIA = async () => {
    if (!searchParam.value) {
        Swal.fire('Perhatian', 'Harap masukkan parameter pencarian.', 'warning');
        return;
    }
    
    loading.value = true;
    fetchedData.value = [];
    selectedData.value = [];

    try {
        // PERBAIKAN: Menggunakan instance 'sia'
        // ASUMSI: Endpoint API SIA yang digunakan adalah untuk mencari mahasiswa berdasarkan NPM
        const res = await sia.get(`users/search`, { // Endpoint relatif: 'mahasiswa/search'
            params: {
                keyword: searchParam.value
            }
        });

        const rawData = res.data.data || res.data;
        
        if (Array.isArray(rawData)) {
            fetchedData.value = rawData.map(d => ({
                nama: d.nama_lengkap || d.nama || 'Tidak Ada Nama',
                npm: d.npm || d.nim || 'Tidak Ada NPM',
                email_sia: d.email || '',
                prodi_kode: d.jurusan || '',
                // Data untuk DB Payer lokal
                identity_number: d.npm || d.nim, 
                payer_type: 'mahasiswa', 
                phone_number: d.no_telp || '',
            }));
        } else if (rawData && typeof rawData === 'object') {
            fetchedData.value = [{
                nama: rawData.nama_mahasiswa || rawData.nama || 'Tidak Ada Nama',
                npm: rawData.npm || rawData.nim || 'Tidak Ada NPM',
                email_sia: rawData.email || '',
                prodi_kode: rawData.kode_prodi || '',
                identity_number: rawData.npm || rawData.nim,
                payer_type: 'mahasiswa',
                phone_number: rawData.telepon || '',
            }];
        } else {
            Swal.fire('Informasi', 'Data tidak ditemukan di API SIA.', 'info');
        }

    } catch (err) {
        console.error("Error fetching data from SIA API:", err);
        Swal.fire('Error', 'Gagal terhubung atau memuat data dari API SIA. Cek konsol untuk detail error.', 'error');
    } finally {
        loading.value = false;
    }
};

// === IMPORT DATA KE DB LOKAL ===
const importSelectedData = async () => {
    if (selectedData.value.length === 0) return;
    
    importing.value = true;
    let successCount = 0;
    let failCount = 0;
    
    const importPromises = selectedData.value.map(async (data) => {
        // Payload untuk diimpor ke endpoint 'payers' lokal
        const payerPayload = {
            payer_name: data.nama,
            identity_number: data.identity_number, 
            payer_type: data.payer_type, 
            email: data.email_sia,
            phone_number: data.phone_number,
            study_program_code: data.prodi_kode,
        };

        try {
            // PERBAIKAN: Menggunakan instance 'api' untuk menyimpan ke DB lokal
            await api.post("payers", payerPayload);
            successCount++;
        } catch (err) {
            failCount++;
            console.error(`Gagal mengimpor ${data.nama}:`, err.response?.data?.message || err.message);
        }
    });

    await Promise.all(importPromises);
    importing.value = false;

    Swal.fire({
        icon: 'success',
        title: 'Impor Selesai!',
        html: `Berhasil mengimpor <b>${successCount}</b> data.<br>Gagal: <b>${failCount}</b> data (Mungkin karena duplikasi ID).`,
        confirmButtonText: 'OK'
    });

    // Reset dan tutup modal
    searchParam.value = '';
    fetchedData.value = [];
    selectedData.value = [];
    emit('imported'); 
    emit('close');
};
</script>