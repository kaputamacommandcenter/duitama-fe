<template>
  <div class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="font-bold text-lg mb-4">Import Data Pembayar dari REST API PMB</h3>

      <!-- Input Form API PMB -->
      <div class="card bg-base-200 p-4 mb-4">
        <h4 class="font-semibold mb-2">Masukkan Tahun Ajaran untuk Memuat Data Calon Mahasiswa Terverifikasi</h4>
        <form @submit.prevent="fetchDataPMB" class="flex flex-wrap items-end gap-3">
          
          <label class="form-control flex-grow">
            <!-- Diubah untuk meminta Tahun Ajaran -->
            <div class="label"><span class="label-text">Tahun Ajaran (Contoh: 2025/2026)</span></div>
            <input type="text" v-model="searchParam" placeholder="Contoh: 2025/2026" class="input input-bordered w-full" required :disabled="loading" />
          </label>

          <button type="submit" class="btn btn-info w-full md:w-auto" :disabled="loading">
            <span v-if="loading" class="loading loading-spinner"></span>
            <span v-else>Muat Data Calon Mhs</span>
          </button>
        </form>
      </div>

      <!-- Tampilan Data Hasil Fetch -->
      <div class="max-h-96 overflow-y-auto border rounded-box p-3">
        <div v-if="loading" class="text-center py-10">
          <span class="loading loading-spinner loading-lg text-info"></span>
          <p class="mt-2 text-gray-500">Mengambil data dari API PMB...</p>
        </div>
        
        <div v-else-if="fetchedData.length > 0">
          <h4 class="font-semibold mb-3">Hasil Ditemukan: {{ fetchedData.length }} Data</h4>
          <table class="table w-full table-compact table-zebra">
            <thead>
              <tr>
                <th class="w-16">
                    <input type="checkbox" class="checkbox checkbox-sm" @change="toggleSelectAll" :checked="allSelected" />
                </th>
                <th>No. Pendaftaran</th>
                <th>Nama Calon</th>
                <th>Prodi Pilihan</th>
                <th>Email</th>
                <th>No. Telepon</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, index) in fetchedData" :key="index">
                <th>
                    <input type="checkbox" class="checkbox checkbox-sm" :value="data" v-model="selectedData" />
                </th>
                <td>{{ data.register_number || 'N/A' }}</td>
                <td class="font-medium">{{ data.nama }}</td>
                <td>{{ data.prodi_kode || '-' }}</td>
                <td>{{ data.email_pmb || '-' }}</td>
                <td>{{ data.phone_number || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="text-center py-10 text-gray-500">
          Masukkan Tahun Ajaran dan klik "Muat Data Calon Mhs"
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
// Mengimpor instance 'api' (untuk menyimpan ke DB lokal) dan 'pmb' (untuk fetch data PMB)
import { api } from '../../api/config'; 
import { pmb } from '../../api/pmb'; 

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['close', 'imported']);

const loading = ref(false);
const importing = ref(false);
// searchParam kini memegang nilai Tahun Ajaran
const searchParam = ref(''); 
const fetchedData = ref([]);
const selectedData = ref([]);

const allSelected = computed(() => {
    return fetchedData.value.length > 0 && selectedData.value.length === fetchedData.value.length;
});

const toggleSelectAll = () => {
    if (allSelected.value) {
        selectedData.value = [];
    } else {
        selectedData.value = [...fetchedData.value];
    }
};


// === FETCH DATA PMB ===
const fetchDataPMB = async () => {
    if (!searchParam.value) {
        Swal.fire('Perhatian', 'Harap masukkan Tahun Ajaran.', 'warning');
        return;
    }
    
    loading.value = true;
    fetchedData.value = [];
    selectedData.value = [];

    try {
        // PERUBAHAN ENDPOINT DAN PARAMETER
        const res = await pmb.get(`get-verified-maba`, {
            params: {
                tahunAjaran: searchParam.value
            }
        });

        // ASUMSI: Respons API PMB mengembalikan array data langsung
        const rawData = res.data.data || res.data; 
        
        // Fungsi helper untuk memetakan data tunggal
        const mapData = (d) => ({
            // Pemetaan sesuai struktur respons PMB yang baru
            register_number: d.register_number, // Digunakan di tabel
            nama: d.nama_lengkap || 'Tidak Ada Nama',
            email_pmb: d.email || '',
            prodi_kode: d.kode_prodi || '', 
            phone_number: d.tlp || '',
            
            // Data untuk DB Payer lokal
            identity_number: d.register_number, // Kunci unik untuk Payer
            payer_type: 'calon_mahasiswa', // Tipe Payer: Calon Mahasiswa
        });


        if (Array.isArray(rawData)) {
            // Filter data yang mungkin memiliki register_number null jika itu adalah kunci unik
            fetchedData.value = rawData
                .filter(d => d.register_number) // Hanya proses yang memiliki No. Pendaftaran
                .map(mapData);
            
            if (fetchedData.value.length === 0) {
                 Swal.fire('Informasi', 'Tidak ada calon mahasiswa terverifikasi ditemukan untuk Tahun Ajaran ini.', 'info');
            }
            
        } else {
            Swal.fire('Informasi', 'Data tidak ditemukan atau format respons API tidak sesuai.', 'info');
        }

    } catch (err) {
        console.error("Error fetching data from PMB API:", err);
        Swal.fire('Error', 'Gagal terhubung atau memuat data dari API PMB. Cek konsol untuk detail error.', 'error');
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
            // Gunakan register_number sebagai kunci identitas utama (identity_number)
            identity_number: data.register_number, 
            payer_type: data.payer_type, 
            email: data.email_pmb,
            phone_number: data.phone_number,
            study_program_code: data.prodi_kode,
        };

        try {
            // Menggunakan instance 'api' untuk menyimpan ke DB lokal
            await api.post("payers", payerPayload);
            successCount++;
        } catch (err) {
            failCount++;
            console.error(`Gagal mengimpor ${data.nama} (ID: ${data.identity_number}):`, err.response?.data?.message || err.message);
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