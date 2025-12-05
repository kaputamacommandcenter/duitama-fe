<template>
  <div class="p-8 min-h-screen bg-base-200">
    <h1 class="text-2xl font-semibold mb-6">Daftar Payer dengan Payment Plan Aktif</h1>

    <div class="card bg-base-100 shadow-xl p-6">
      <div v-if="isProcessing" class="text-center py-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-3">Memuat data Payer...</p>
      </div>

      <div v-else-if="payers.length === 0" class="text-center py-10">
        <div class="alert alert-info shadow-lg inline-flex max-w-md">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Tidak ada data Payer yang memiliki Payment Plan aktif.</span>
        </div>
      </div>

      <div v-else class="overflow-x-auto">
        <p class="text-sm text-gray-500 mb-4">Ditemukan total {{ payers.length }} Payer.</p>
        <table class="table w-full table-zebra">
          <thead>
            <tr class="bg-base-300">
              <th>No</th>
              <th>Nama Payer</th>
              <th>ID / NPM</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payer, index) in payers" :key="payer.id">
              <td class="font-bold">{{ index + 1 }}</td>
              <td>{{ payer.name }}</td>
              <td>
                <!-- PERUBAHAN: Tampilan NPM di atas ID -->
                <div v-if="payer.npm !== 'N/A'">
                  <span class="font-extrabold text-sm text-primary">{{ payer.npm }}</span>
                </div>
                <div v-if="payer.identity_number !== 'N/A'">
                  <span class="text-xs text-gray-500">{{ payer.identity_number }}</span>
                </div>
                <span v-if="payer.npm === 'N/A' && payer.identity_number === 'N/A'" class="text-gray-500">N/A</span>
              </td>
              <td class="flex flex-col space-y-1">
                <!-- Tombol Lihat Detail -->
                <button @click="openDetailModal(payer)" class="btn btn-xs btn-outline btn-info">
                  Lihat Detail Tagihan
                </button>
                <!-- Tombol Terapkan Potongan -->
                 <button @click="openDiscountModal(payer)" class="btn btn-xs btn-warning">
                  Terapkan Potongan
                </button>
                <!-- Tombol Generate Invoice Baru -->
                 <button @click="openInvoiceModal(payer)" class="btn btn-xs btn-success mt-1">
                  Generate Invoice
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
  
  <!-- Modal Rincian Tagihan (Detail Modal) -->
  <input type="checkbox" id="detail_modal" class="modal-toggle" :checked="detailModalVisible" />
  <div class="modal" :class="{'modal-open': detailModalVisible}">
    <div class="modal-box w-11/12 max-w-4xl">
      <h3 class="font-bold text-xl mb-4">Rincian Payment Plan</h3>

      <div v-if="modalLoading" class="text-center py-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-3">Memuat detail tagihan...</p>
      </div>

      <div v-else-if="!activePayerDetails || activePayerDetails.length === 0" class="alert alert-warning">
        Tidak ada Payment Plan yang ditemukan untuk Payer ini.
      </div>

      <div v-else>
        <div class="mb-4 p-3 bg-base-200 rounded-lg">
          <p class="text-sm">Payer: <span class="font-semibold">{{ activePayerDetails[0].payer.payer_name }}</span></p>
          <p class="text-sm">Identitas: <span class="font-semibold">{{ activePayerDetails[0].payer.identity_number }}</span></p>
          <p class="text-lg font-bold mt-2">
            Total Tagihan: Rp {{ formatRupiah(activePayerDetails.reduce((sum, plan) => sum + calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type), 0)) }}
          </p>
        </div>
        
        <div class="overflow-x-auto max-h-96">
          <table class="table w-full table-zebra table-compact">
            <thead>
              <tr class="bg-base-300">
                <th>Item Tagihan</th>
                <th class="text-right">Nominal Awal</th>
                <th>Potongan</th>
                <th>Jatuh Tempo</th>
                <th class="text-right font-bold">Total Akhir</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in activePayerDetails" :key="plan.id">
                <td>{{ plan.item.name }}</td>
                <td class="text-right">Rp {{ formatRupiah(plan.item.amount) }}</td>
                <td>
                  <span v-if="plan.discount" class="badge badge-warning badge-sm">
                    <!-- Menampilkan nilai diskon yang sesuai (Rp atau %) -->
                    -{{ formatDiscountValue(plan.discount.value, plan.discount.type) }} ({{ plan.discount.description }})
                  </span>
                  <span v-else class="text-gray-400">Nihil</span>
                </td>
                <td>{{ plan.item.due_date }}</td>
                <td class="text-right font-bold">
                  Rp {{ formatRupiah(calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="detailModalVisible = false">Tutup</button>
      </div>
    </div>
  </div>
  
  <!-- Modal Terapkan Potongan (Discount Modal) -->
  <input type="checkbox" id="discount_modal" class="modal-toggle" :checked="discountModalVisible" />
  <div class="modal" :class="{'modal-open': discountModalVisible}">
    <div class="modal-box w-11/12 max-w-4xl">
      <h3 class="font-bold text-xl mb-4">Terapkan Potongan Manual</h3>

      <div v-if="modalLoading" class="text-center py-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-3">Memuat data potongan dan tagihan...</p>
      </div>
      
      <div v-else-if="!activePayerDetails || activePayerDetails.length === 0">
        <div class="alert alert-warning">
          Tidak ada item tagihan untuk diterapkan potongan.
        </div>
      </div>

      <div v-else>
        <!-- Informasi Payer -->
        <div class="mb-4 p-3 bg-base-200 rounded-lg">
          <p class="text-sm">Payer: <span class="font-semibold">{{ activePayerDetails[0].payer.payer_name }}</span></p>
          <p class="text-sm">ID/NPM: <span class="font-semibold">{{ activePayerDetails[0].payer.identity_number }}</span></p>
          <p class="text-lg font-bold mt-2">
            <!-- 🚨 PERUBAHAN KRITIS: Computed Total Akhir di Header Modal -->
            Total Akhir: Rp {{ formatRupiah(activePayerDetails.reduce((sum, plan) => sum + calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type), 0)) }}
          </p>
        </div>

        <!-- Daftar Item untuk Potongan -->
        <div class="overflow-x-auto max-h-96 space-y-4">
          <div v-for="(plan, index) in activePayerDetails" :key="plan.id" class="p-3 border rounded-lg bg-base-100">
            <p class="font-semibold text-md mb-2">{{ plan.item.name }}</p>
            <p class="text-sm text-gray-500 mb-2">Nominal Awal: Rp {{ formatRupiah(plan.item.amount) }}</p>
            
            <div class="flex items-center gap-3">
              <select 
                :value="plan.discount?.id || ''"
                @change="applyDiscount(plan, $event.target.value)"
                class="select select-bordered select-sm w-full"
              >
                <option value="">-- Tidak Ada Potongan --</option>
                <option v-for="d in availableDiscounts" :key="d.id" :value="d.id">
                  <!-- Menampilkan nilai diskon yang sesuai (Rp atau %) di dropdown -->
                  {{ d.name }} ({{ formatDiscountValue(d.value, d.type) }})
                </option>
              </select>
              
              <button 
                v-if="plan.discount" 
                @click="applyDiscount(plan, null)" 
                class="btn btn-sm btn-error btn-outline"
              >
                Hapus
              </button>
            </div>

            <p v-if="plan.discount" class="text-sm mt-2 text-warning font-semibold">
              Potongan Diterapkan: -{{ formatDiscountValue(plan.discount.value, plan.discount.type) }}
            </p>

            <p class="text-lg font-extrabold mt-2 text-right">
              Total Akhir: Rp {{ formatRupiah(calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type)) }}
            </p>
          </div>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-success" @click="saveDiscountChanges">Simpan Perubahan Potongan</button>
        <button class="btn btn-neutral" @click="discountModalVisible = false">Batal</button>
      </div>
    </div>
  </div>

  <!-- Modal Generate Invoice (Payment Selection Modal) -->
  <input type="checkbox" id="invoice_modal" class="modal-toggle" :checked="invoiceModalVisible" />
  <div class="modal" :class="{'modal-open': invoiceModalVisible}">
    <div class="modal-box w-11/12 max-w-2xl">
      <h3 class="font-bold text-xl mb-4">Pilih Item untuk Pembayaran</h3>

      <div v-if="modalLoading" class="text-center py-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-3">Memuat tagihan Payer...</p>
      </div>

      <div v-else-if="!activePayerDetails || activePayerDetails.length === 0" class="alert alert-warning">
        Payer ini tidak memiliki tagihan aktif yang dapat dibayar.
      </div>

      <div v-else>
        <!-- Informasi Payer -->
        <div class="mb-4 p-3 bg-base-200 rounded-lg">
          <p class="text-sm">Payer: <span class="font-semibold">{{ activePayerDetails[0].payer.payer_name }}</span></p>
          <p class="text-sm">Tagihan Total: <span class="font-bold">Rp {{ formatRupiah(totalSelectedAmount) }}</span></p>
        </div>

        <!-- Daftar Tagihan dengan Checkbox -->
        <div class="max-h-64 overflow-y-auto border rounded-lg p-3">
          <table class="table w-full table-compact">
            <thead>
              <tr class="bg-base-300">
                <th>Pilih</th>
                <th>Item</th>
                <th class="text-right">Nominal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in activePayerDetails" :key="plan.id">
                <td>
                  <input 
                    type="checkbox" 
                    :checked="selectedPlansForPayment.includes(plan.id)"
                    @change="togglePlanSelection(plan.id)"
                    class="checkbox checkbox-primary checkbox-sm"
                  >
                </td>
                <td>
                  {{ plan.item.name }}
                  <div v-if="plan.discount" class="text-warning text-xs">
                    (Potongan: {{ formatDiscountValue(plan.discount.value, plan.discount.type) }})
                  </div>
                </td>
                <td class="text-right font-bold">
                  Rp {{ formatRupiah(calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-action">
        <button 
          @click="processPayment" 
          class="btn btn-success" 
          :disabled="selectedPlansForPayment.length === 0"
        >
          Proses Pembayaran ({{ selectedPlansForPayment.length }} Item)
        </button>
        <button class="btn btn-neutral" @click="invoiceModalVisible = false">Batal</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import Swal from 'sweetalert2';
import { api } from '../api/config'; // Asumsi: API config tersedia

const payers = ref([]);
const isProcessing = ref(false);

const detailModalVisible = ref(false); // Modal rincian tagihan
const discountModalVisible = ref(false); // Modal potongan
const invoiceModalVisible = ref(false); // Modal Generate Invoice

const modalLoading = ref(false);
const activePayerDetails = ref(null); // Data plan yang sedang aktif (di modal)
const availableDiscounts = ref([]); // Daftar potongan dari /discounts
const selectedPlansForPayment = ref([]); // ID plan yang dipilih untuk dibayar

const formatRupiah = (value) => new Intl.NumberFormat("id-ID").format(value);

// Computed property untuk menghitung total item yang dipilih untuk pembayaran
const totalSelectedAmount = computed(() => {
    if (!activePayerDetails.value) return 0;
    
    return activePayerDetails.value
        .filter(plan => selectedPlansForPayment.value.includes(plan.id))
        .reduce((sum, plan) => sum + calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type), 0);
});

// Fungsi Baru: Untuk memformat tampilan nilai diskon (Rp atau %)
const formatDiscountValue = (value, type) => {
    if (type === 'percentage') {
        return `${value}%`;
    }
    return `Rp ${formatRupiah(value)}`;
};


const calculateTotal = (initialAmount, discountValue, discountType) => {
    if (!discountValue || discountValue === 0) {
        return initialAmount;
    }
    
    let discountAmount = 0;
    
    // Perhitungan menggunakan tipe 'percentage' atau 'nominal'
    if (discountType === 'percentage') {
        discountAmount = Math.round((initialAmount * discountValue) / 100);
    } else if (discountType === 'nominal') {
        discountAmount = discountValue;
    }
    
    return Math.max(0, initialAmount - discountAmount);
};

const fetchData = async () => {
    isProcessing.value = true;
    try {
        const response = await api.get('/get-payer-has-plan');
        
        // Mapping data sesuai struktur response yang diberikan
        let fetchedPayers = (response.data.data || []).map(p => ({
            id: p.id,
            name: p.payer_name,
            identity_number: p.identity_number || 'N/A',
            npm: p.npm || 'N/A'
        }));
        
        // 🚨 PERUBAHAN: Urutkan data berdasarkan ID secara descending
        fetchedPayers.sort((a, b) => b.id - a.id);

        payers.value = fetchedPayers;

    } catch (error) {
        console.error("Gagal mengambil data Payer dengan Plan:", error);
        Swal.fire("Error", "Gagal memuat daftar Payer. Silakan cek koneksi API.", "error");
        payers.value = [];
    } finally {
        isProcessing.value = false;
    }
};

const fetchDiscounts = async () => {
    try {
        const response = await api.get('/discounts');
        availableDiscounts.value = (response.data.data || []).map(d => ({
            id: d.id,
            description: d.description,
            name: d.description,
            type: d.type, // type: 'percentage' atau 'nominal'
            value: d.value,
            is_active: d.is_active 
        })).filter(d => d.is_active);
    } catch (error) {
        console.error("Gagal mengambil data Potongan Diskon:", error);
    }
};

const fetchPaymentPlanDetails = async (payerId) => {
    modalLoading.value = true;
    activePayerDetails.value = null;
    selectedPlansForPayment.value = []; // Reset seleksi saat fetch baru

    try {
        const response = await api.get(`/payment-plans?payer_id=${payerId}`);
        activePayerDetails.value = response.data.data || [];
    } catch (error) {
        console.error(`Gagal memuat Payment Plan untuk Payer ID ${payerId}:`, error);
        Swal.fire("Error", "Gagal memuat rincian Payment Plan. Silakan coba lagi.", "error");
        activePayerDetails.value = [];
    } finally {
        modalLoading.value = false;
    }
};

const openDetailModal = async (payer) => {
    detailModalVisible.value = true;
    await fetchPaymentPlanDetails(payer.id);
};

const openDiscountModal = async (payer) => {
    discountModalVisible.value = true;
    await fetchPaymentPlanDetails(payer.id);
};

const openInvoiceModal = async (payer) => {
    invoiceModalVisible.value = true;
    // Panggil fetch detail untuk mendapatkan data yang akan dibayar
    await fetchPaymentPlanDetails(payer.id);
};

const togglePlanSelection = (planId) => {
    const index = selectedPlansForPayment.value.indexOf(planId);
    if (index === -1) {
        selectedPlansForPayment.value.push(planId);
    } else {
        selectedPlansForPayment.value.splice(index, 1);
    }
};

const processPayment = () => {
    if (selectedPlansForPayment.value.length === 0) {
        Swal.fire("Peringatan", "Pilih minimal satu item tagihan untuk diproses pembayaran.", "warning");
        return;
    }

    const totalAmount = formatRupiah(totalSelectedAmount.value);
    
    // Placeholder untuk proses pembayaran final
    Swal.fire({
        title: 'Konfirmasi Pembayaran',
        html: `Anda akan memproses pembayaran untuk <b>${selectedPlansForPayment.value.length}</b> item dengan total <b>Rp ${totalAmount}</b>. Implementasi proses pembayaran ke API akan ditambahkan di sini.`,
        icon: 'info',
        confirmButtonText: 'Lanjutkan Pembayaran'
    }).then(() => {
        // Setelah konfirmasi/pembayaran, tutup modal
        invoiceModalVisible.value = false;
        selectedPlansForPayment.value = [];
    });
};

// Logika Penerapan Potongan (Hanya di Frontend)
const applyDiscount = (plan, discountId) => {
    let discount = null;
    let discountDetails = null;

    if (discountId) {
        // Temukan detail diskon yang dipilih
        discountDetails = availableDiscounts.value.find(d => d.id == discountId);
        if (discountDetails) {
            discount = {
                id: discountDetails.id,
                description: discountDetails.description,
                type: discountDetails.type,
                value: discountDetails.value 
            };
        }
    }
    
    // Perbarui objek plan secara reaktif. Ini memicu perhitungan ulang di template.
    plan.discount = discount;
};

// Logika Penyimpanan Perubahan Potongan (Ke Backend)
const saveDiscountChanges = async () => {
    if (!activePayerDetails.value || activePayerDetails.value.length === 0) return;

    modalLoading.value = true;
    
    let successCount = 0;
    let failCount = 0;
    
    for (const plan of activePayerDetails.value) {
        try {
            // Asumsi: Terdapat endpoint UPDATE (PUT/PATCH) untuk plan individual
            const updatePayload = {
                 id: plan.id, 
                 payer_id: plan.payer_id, 
                 discount_id: plan.discount?.id || null, // Menyertakan Discount ID
                 payment_template_detail_id: plan.payment_template_detail_id // Menyertakan payment_template_detail_id
            };

            // 🚨 PERUBAHAN: Menggunakan endpoint /payment-plans/{plan.id}
            const response = await api.patch(`/payment-plans/${plan.id}`, updatePayload); 
            
            if (response.data.success) {
                successCount++;
            } else {
                failCount++;
            }
        } catch (error) {
            console.error(`Gagal menyimpan diskon untuk Plan ID ${plan.id}:`, error);
            failCount++;
        }
    }
    
    modalLoading.value = false;
    discountModalVisible.value = false;

    if (failCount === 0) {
        Swal.fire('Berhasil!', `${successCount} perubahan potongan berhasil disimpan.`, 'success');
        fetchData(); // Muat ulang tabel utama
    } else {
        Swal.fire('Peringatan!', `Gagal menyimpan ${failCount} perubahan potongan.`, 'warning');
    }
}


onMounted(() => {
    fetchData();
    fetchDiscounts(); // Fetch data diskon saat mount
});
</script>