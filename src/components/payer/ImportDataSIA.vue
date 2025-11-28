<template>
  <div class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="font-bold text-lg mb-4">Import Data Pembayar dari REST API SIA</h3>

      <!-- Input Form API SIA -->
      <div class="card bg-base-200 p-4 mb-4">
        <h4 class="font-semibold mb-2">Pilih Data yang Akan Diimpor (Berdasarkan Keyword/NPM)</h4>
        <form @submit.prevent="fetchDataSIA" class="flex flex-wrap items-end gap-3">
          
          <label class="form-control flex-grow">
            <div class="label"><span class="label-text">Parameter Pencarian (Contoh: NPM/NIM)</span></div>
            <!-- Menggunakan NPM/NIM/Keyword untuk pencarian di SIA -->
            <input type="text" v-model="searchParam" placeholder="Masukkan NPM/NIM atau parameter lain" class="input input-bordered w-full" required :disabled="loading" />
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
          <p class="mt-2 text-gray-500">Mengambil data dari API SIA dan memfilter data yang sudah ada...</p>
        </div>
        
        <div v-else-if="fetchedData.length > 0">
          <h4 class="font-semibold mb-3">Hasil Ditemukan: {{ fetchedData.length }} Data (Belum Diimpor)</h4>
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
                <td>{{ data.npm || '-' }}</td>
                <td>{{ data.email_sia || '-' }}</td>
                <td>{{ data.nama_prodi || '-' }}</td>
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
import { api } from '../../api/config'; // Untuk menyimpan ke DB lokal
import { sia } from '../../api/sia'; // Untuk fetch data SIA

const props = defineProps({
  visible: Boolean,
});

const emit = defineEmits(['close', 'imported']);

const loading = ref(false);
const importing = ref(false);
const searchParam = ref(''); 
const fetchedData = ref([]);
const selectedData = ref([]);

// State untuk menyimpan ID yang sudah ada di DB lokal
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

// === LOAD EXISTING IDENTITIES ===
const loadExistingIdentities = async () => {
    try {
        // Muat semua data payer dan ambil identity_number
        const res = await api.get("payers");
        const existingIds = (res.data.data || res.data || [])
                            .map(p => String(p.identity_number))
                            .filter(id => id !== 'null'); 
        existingIdentities.value = new Set(existingIds);
    } catch (err) {
        console.error("Gagal memuat ID Payer lokal:", err);
        Swal.fire('Error', 'Gagal memuat daftar ID payer yang sudah ada. Filtering mungkin tidak akurat.', 'error');
    }
};

// Fungsi helper untuk memetakan data SIA
const mapDataSIA = (d) => {
    // KUNCI PERBAIKAN: Normalisasi NPM/NIM menjadi string, di-trim, dan di-uppercase
    const normalizedNPM = d.npm ? String(d.npm).trim().toUpperCase() : null;

    return {
        nama: d.nama_lengkap || 'Tidak Ada Nama',
        npm: normalizedNPM, // Gunakan NPM yang sudah dinormalisasi
        email_sia: d.email || '',
        prodi_kode: d.jurusan || '', // Kode Prodi
        nama_prodi: d.nama_jur || '', // Nama Prodi (untuk tampilan)
        phone_number: d.no_telp || '',
        
        // Data untuk DB Payer lokal
        identity_number: normalizedNPM, // Identity number adalah NPM yang sudah dinormalisasi
        payer_type: 'mahasiswa', 
    };
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
        // 1. Muat ID Payer yang sudah ada
        await loadExistingIdentities();
        
        // 2. Muat data dari SIA
        const res = await sia.get(`mahasiswa/search`, { // Asumsi endpoint SIA
            params: {
                keyword: searchParam.value
            }
        });

        const rawData = res.data.data || res.data; 
        
        if (Array.isArray(rawData) || (rawData && typeof rawData === 'object')) {
            let rawArray = Array.isArray(rawData) ? rawData : (rawData ? [rawData] : []);
            
            // Variabel untuk melacak NPM yang sudah dilihat dalam batch ini
            const seenNPMs = new Set();
            const duplicatedNames = []; 
            
            // Menggunakan reduce untuk filter duplikat internal dan lokal secara efisien
            const uniqueAndFilteredData = rawArray.reduce((acc, d) => {
                const mapped = mapDataSIA(d);
                const currentNPM = mapped.npm; // Sudah dinormalisasi di mapDataSIA
                const idString = mapped.identity_number; // Sudah dinormalisasi

                // Cek 1: Duplikat Internal (NPM yang sama dalam hasil pencarian)
                if (currentNPM !== null) {
                    if (seenNPMs.has(currentNPM)) {
                        // CAPTURE DUPLICATE NAME: Simpan nama dan NPM yang terduplikasi
                        duplicatedNames.push({ name: mapped.nama, npm: currentNPM }); 
                        return acc; // Lewati duplikat internal
                    }
                    seenNPMs.add(currentNPM);
                }
                
                // Cek 2: Duplikat Lokal DB (Identity Number yang sudah ada)
                if (idString !== null && existingIdentities.value.has(idString)) {
                    // Lewati duplikat DB lokal
                    return acc; 
                }
                
                // Lolos semua filter, masukkan ke data unik
                acc.push(mapped);
                return acc;
            }, []);
            
            // 4. Setelah filtering, yang tersisa hanyalah data yang valid dan unik
            fetchedData.value = uniqueAndFilteredData;
            
            // Tampilkan peringatan jika ditemukan duplikat internal
            if (duplicatedNames.length > 0) {
                const duplicateList = duplicatedNames.map(d => 
                    `<li>• ${d.name} (NPM: ${d.npm})</li>`
                ).join('');

                 Swal.fire({
                    icon: 'warning',
                    title: 'Duplikasi Internal Ditemukan!',
                    html: `Ditemukan ${duplicatedNames.length} data dengan NPM/NIM yang sama dalam hasil pencarian ini. Data tersebut telah dihapus dari daftar.<br>
                           <p class="mt-2 text-left font-medium">Data Duplikat yang Dihapus:</p>
                           <div class="max-h-24 overflow-y-auto p-2 bg-yellow-100 rounded text-sm text-left">
                               <ul>${duplicateList}</ul>
                           </div>`,
                });
            }
            
            if (fetchedData.value.length === 0 && duplicatedNames.length === 0) {
                 Swal.fire('Informasi', 'Tidak ada data mahasiswa baru yang belum diimpor ditemukan.', 'info');
            } else if (fetchedData.value.length === 0 && duplicatedNames.length > 0) {
                 Swal.fire('Informasi', 'Semua data yang ditemukan sudah ada atau merupakan duplikat internal.', 'info');
            }
            
        } else {
            Swal.fire('Informasi', 'Data tidak ditemukan atau format respons API tidak sesuai.', 'info');
        }

    } catch (err) {
        console.error("Error fetching data from SIA API:", err);
        Swal.fire('Error', 'Gagal terhubung atau memuat data dari API SIA. Cek konsol untuk detail error.', 'error');
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
        npm: data.npm, // Mengirim NPM/NIM ke kolom NPM
        payer_name: data.nama,
        study_program_code: data.prodi_kode, 
        email: data.email_sia,
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

        // --- Memproses respons API sesuai skema yang Anda berikan ---
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
                // KUNCI PERBAIKAN: Mencetak setiap pesan error secara terpisah
                const reasonsList = (detail.error_messages || [])
                                    .map(reason => `<span>— ${reason}</span>`)
                                    .join('<br>');
                
                // Menggunakan <p> dan <div> di dalam <li> agar formatting tetap valid
                return `<li><p class="font-bold">${name} (NPM: ${detail.npm || 'N/A'})</p>
                            <div class="ml-4 text-sm">${reasonsList}</div>
                        </li>`;
            }).join('');

            failureHtml = `
                <p class="mt-4 text-left font-medium">Detail Kegagalan:</p>
                <div class="max-h-32 overflow-y-auto p-2 bg-red-100 rounded text-sm text-red-700 text-left">
                    <ul class="space-y-2 list-disc list-inside">
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
        // --- BLOK CATCH UTAMA: MENGATASI GAGAL TOTAL KARENA ERROR HTTP ---
        
        // 1. Cek apakah ada respons (berarti bukan error koneksi)
        if (err.response) {
            const responseData = err.response.data;

            // 2. Cek apakah respons error memiliki struktur BULK INSERT yang gagal (ada summary/failed_data)
            if (responseData.summary || responseData.failed_data) {
                
                // Jika ya, olah respons seolah-olah masuk blok 'try' (Gagal Parsial)
                const summary = responseData.summary || { success_count: 0, failed_count: 0 };
                const successCount = summary.success_count;
                const failCount = summary.failed_count;
                const failedDetails = responseData.failed_data || [];
                
                let failureHtml = '';
                
                if (failCount > 0 && failedDetails.length > 0) {
                    const detailedMessages = failedDetails.map(detail => {
                        const name = detail.payer_name || 'Data tanpa nama';
                        const reasonsList = (detail.error_messages || [])
                                            .map(reason => `<span>— ${reason}</span>`)
                                            .join('<br>');
                        
                        return `<li><p class="font-bold">${name} (NPM: ${detail.npm || 'N/A'})</p>
                                    <div class="ml-4 text-sm">${reasonsList}</div>
                                </li>`;
                    }).join('');

                    failureHtml = `
                        <p class="mt-4 text-left font-medium">Detail Kegagalan:</p>
                        <div class="max-h-32 overflow-y-auto p-2 bg-red-100 rounded text-sm text-red-700 text-left">
                            <ul class="space-y-2 list-disc list-inside">
                                ${detailedMessages}
                            </ul>
                        </div>
                    `;
                } else if (failCount > 0) {
                     failureHtml = `
                        <p class="mt-4 text-left font-medium">Detail Kegagalan:</p>
                        <div class="p-2 bg-red-100 rounded text-sm text-red-700 text-left">
                            Gagal menyimpan ${failCount} data. Detail kegagalan tidak disediakan oleh API.
                        </div>
                    `;
                }

                // Tampilkan SweetAlert Gagal Parsial (dari blok catch)
                Swal.fire({
                    icon: 'warning',
                    title: 'Impor Selesai (Gagal Parsial)!',
                    html: `Berhasil mengimpor <b>${successCount}</b> data.<br>Gagal: <b>${failCount}</b> data. ${failureHtml}`,
                    confirmButtonText: 'OK',
                    width: 600
                });
                
                // PENTING: Karena ini sudah ditangani, kita keluar dari blok catch
                return;
            }
        } 
        
        // --- Penanganan Gagal Total Murni (Error Koneksi/Struktur Respons Tidak Dikenal) ---
        console.error("Error during bulk import:", err);
        const errorMessage = err.response?.data?.message || err.message || "Kesalahan tak terduga pada server saat bulk insert.";
        
        let errorDetail = errorMessage;
        if (err.response && err.response.data) {
            errorDetail = JSON.stringify(err.response.data, null, 2);
        }

        Swal.fire({
            icon: 'error',
            title: 'Gagal Total Impor!',
            html: `Tidak dapat melakukan bulk insert.<br>
                   Detail: <div class="max-h-24 overflow-y-auto p-2 bg-red-100 rounded text-sm text-red-700 text-left mt-2">
                   ${errorDetail}
                   </div>`,
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