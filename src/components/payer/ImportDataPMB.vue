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
          <h4 class="font-semibold mb-3">Hasil Ditemukan: {{ fetchedData.length }} Data (Belum Diimpor)</h4>
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
                <!-- Menampilkan register_number (bisa null) -->
                <td>{{ data.register_number || 'N/A' }}</td>
                <td class="font-medium">{{ data.nama }}</td>
                <!-- PERBAIKAN: Menampilkan nama_prodi -->
                <td>{{ data.nama_prodi || '-' }}</td>
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
import { api } from '../../api/config'; 
import { pmb } from '../../api/pmb'; 

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['close', 'imported']);

const loading = ref(false);
const importing = ref(false);
const searchParam = ref(''); 
const fetchedData = ref([]);
const selectedData = ref([]);

// State baru untuk menyimpan ID yang sudah ada di DB lokal
const existingIdentities = ref(new Set()); 

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

const customParamsSerializer = (params) => {
    const searchParams = new URLSearchParams();
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            searchParams.append(key, params[key]);
        }
    }
    return searchParams.toString().replace(/%2F/g, '/');
};

// === LOAD EXISTING IDENTITIES ===
const loadExistingIdentities = async () => {
    try {
        // Asumsi: Kita memuat semua data payer dan mengambil identity_number
        const res = await api.get("payers");
        const existingIds = (res.data.data || res.data || [])
                            .map(p => String(p.identity_number))
                            .filter(id => id !== 'null'); // Filter ID null
        existingIdentities.value = new Set(existingIds);
    } catch (err) {
        console.error("Gagal memuat ID Payer lokal:", err);
        Swal.fire('Error', 'Gagal memuat daftar ID payer yang sudah ada. Filtering mungkin tidak akurat.', 'error');
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
        // 1. Muat ID Payer yang sudah ada
        await loadExistingIdentities();
        
        // 2. Muat data dari PMB
        const res = await pmb.get(`get-verified-maba`, {
            params: {
                tahunAjaran: searchParam.value
            },
            paramsSerializer: customParamsSerializer 
        });

        const rawData = res.data.data || res.data; 
        
        const mapData = (d) => {
            // Priority: register_number > d.id > null
            const identity = d.register_number || d.id || null; 

            return {
                register_number: d.register_number || d.id, 
                nama: d.nama_lengkap || 'Tidak Ada Nama',
                email_pmb: d.email || '',
                prodi_kode: d.kode_prodi || '', 
                nama_prodi: d.nama_prodi || '', 
                phone_number: d.tlp || '',
                
                // Data untuk DB Payer lokal
                identity_number: identity, // Bisa null
                payer_type: 'mahasiswa', 
            };
        };


        if (Array.isArray(rawData)) {
            // 3. Mapping data PMB
            let mappedData = rawData.map(mapData);
            
            // 4. FILTERING: Hapus data yang identity_number-nya sudah ada di existingIdentities
            const filteredData = mappedData.filter(d => {
                // Konversi ke string karena Set menyimpan string dari DB lokal
                const idString = String(d.identity_number); 

                // Jika ID adalah null, kita tidak bisa mengecek keberadaannya, biarkan lolos.
                if (d.identity_number === null) {
                    return true;
                }
                
                // Jika ID sudah ada di Set, return false (sembunyikan)
                return !existingIdentities.value.has(idString);
            });
            
            fetchedData.value = filteredData;
            
            if (filteredData.length === 0) {
                 Swal.fire('Informasi', 'Tidak ada calon mahasiswa baru yang belum diimpor ditemukan untuk Tahun Ajaran ini.', 'info');
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

// === IMPORT DATA KE DB LOKAL (BULK INSERT) ===
const importSelectedData = async () => {
    if (selectedData.value.length === 0) return;
    
    importing.value = true;

    // 1. Memetakan data terpilih ke format bulk insert payload
    const payersToInsert = selectedData.value.map(data => ({
        payer_group_id: null, 
        // Pastikan identity_number adalah string (jika tidak null)
        identity_number: data.identity_number !== null ? String(data.identity_number) : null,
        npm: null,
        payer_name: data.nama,
        study_program_code: data.prodi_kode, 
        email: data.email_pmb,
        payer_type: data.payer_type, 
        phone_number: data.phone_number,
    }));
    
    // 2. Membuat payload akhir
    const payload = {
        payers: payersToInsert
    };

    try {
        // 3. Mengirim payload ke endpoint bulk insert
        const res = await api.post("bulk-insert-payers", payload);

        // --- Memproses respons API sesuai skema baru ---
        const responseData = res.data;
        const summary = responseData.summary || { success_count: 0, failed_count: 0 };
        const successCount = summary.success_count;
        const failCount = summary.failed_count;
        const failedDetails = responseData.failed_data || [];
        
        let failureHtml = '';
        
        if (failCount > 0 && failedDetails.length > 0) {
            // Membangun daftar pesan kegagalan dari failed_data
            const detailedMessages = failedDetails.map(detail => {
                const name = detail.payer_name || 'Data tanpa nama';
                // Menggabungkan semua error_messages menjadi satu string atau daftar
                const reasons = (detail.error_messages || []).join('; ');
                return `<li>• ${name}: ${reasons || 'Alasan tidak diketahui'}</li>`;
            }).join('');

            failureHtml = `
                <p class="mt-4 text-left font-medium">Detail Kegagalan:</p>
                <div class="max-h-32 overflow-y-auto p-2 bg-red-100 rounded text-sm text-red-700 text-left">
                    <ul>
                        ${detailedMessages}
                    </ul>
                </div>
            `;
        } else if (failCount > 0) {
             // Fallback jika hanya ada hitungan gagal tapi tanpa detail
             failureHtml = `
                <p class="mt-4 text-left font-medium">Detail Kegagalan:</p>
                <div class="p-2 bg-red-100 rounded text-sm text-red-700 text-left">
                    Gagal menyimpan ${failCount} data. Detail kegagalan tidak disediakan oleh API.
                </div>
            `;
        }

        Swal.fire({
            icon: failCount === 0 ? 'success' : 'warning',
            title: 'Impor Selesai!',
            html: `Berhasil mengimpor <b>${successCount}</b> data.<br>Gagal: <b>${failCount}</b> data. ${failureHtml}`,
            confirmButtonText: 'OK',
            width: failCount > 0 ? 600 : 400
        });

    } catch (err) {
        console.error("Error during bulk import:", err);
        // Tangani kegagalan API secara keseluruhan
        const errorMessage = err.response?.data?.message || err.message || "Kesalahan tak terduga pada server saat bulk insert.";

        Swal.fire({
            icon: 'error',
            title: 'Gagal Total Impor!',
            html: `Tidak dapat melakukan bulk insert.<br>Detail: <b>${errorMessage}</b>`,
            confirmButtonText: 'OK'
        });
        
    } finally {
        importing.value = false;
        // Reset dan tutup modal (terlepas dari hasil sukses/gagal)
        searchParam.value = '';
        fetchedData.value = [];
        selectedData.value = [];
        emit('imported'); 
        emit('close');
    }
};
</script>