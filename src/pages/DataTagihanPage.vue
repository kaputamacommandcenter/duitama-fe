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
                <div v-if="payer.npm !== 'N/A'">
                  <span class="font-extrabold text-sm text-primary">{{ payer.npm }}</span>
                </div>
                <div v-if="payer.identity_number !== 'N/A'">
                  <span class="text-xs text-gray-500">{{ payer.identity_number }}</span>
                </div>
                <span v-if="payer.npm === 'N/A' && payer.identity_number === 'N/A'" class="text-gray-500">N/A</span>
              </td>
              <td class="flex flex-col space-y-1">
                <button @click="openDetailModal(payer)" class="btn btn-xs btn-outline btn-info">
                  Lihat Detail Tagihan
                </button>
                <button @click="openDiscountModal(payer)" class="btn btn-xs btn-warning">
                  Terapkan Potongan
                </button>
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

  <DetailTagihanModal
    :isVisible="detailModalVisible"
    :payerId="selectedPayerId"
    @close="detailModalVisible = false"
    :calculateTotal="calculateTotal"
    :formatRupiah="formatRupiah"
    :formatDiscountValue="formatDiscountValue"
  />

  <TerapkanPotonganModal
    :isVisible="discountModalVisible"
    :payerId="selectedPayerId"
    :availableDiscounts="availableDiscounts"
    @close="discountModalVisible = false"
    @changesSaved="fetchData"
    :calculateTotal="calculateTotal"
    :formatRupiah="formatRupiah"
    :formatDiscountValue="formatDiscountValue"
  />

  <GenerateInvoiceModal
    :isVisible="invoiceModalVisible"
    :payerId="selectedPayerId"
    @close="invoiceModalVisible = false"
    :calculateTotal="calculateTotal"
    :formatRupiah="formatRupiah"
    :formatDiscountValue="formatDiscountValue"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import Swal from 'sweetalert2';
import { api } from '../api/config';

// Impor komponen Modal
import DetailTagihanModal from '../components/bill/BillingDetailsModal.vue';
import TerapkanPotonganModal from '../components/bill/ApplyDiscountModal.vue';
import GenerateInvoiceModal from '../components/bill/GenerateInvoiceModal.vue';

const payers = ref([]);
const isProcessing = ref(false);

const detailModalVisible = ref(false);
const discountModalVisible = ref(false);
const invoiceModalVisible = ref(false);

const selectedPayerId = ref(null);
const availableDiscounts = ref([]);

// --- Fungsi Utility ---
const formatRupiah = (value) => new Intl.NumberFormat("id-ID").format(value);

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
    
    if (discountType === 'percentage') {
        discountAmount = Math.round((initialAmount * discountValue) / 100);
    } else if (discountType === 'nominal') {
        discountAmount = discountValue;
    }
    
    return Math.max(0, initialAmount - discountAmount);
};
// --- END Fungsi Utility ---


const fetchData = async () => {
    isProcessing.value = true;
    try {
        const response = await api.get('/get-payer-has-plan');
        
        let fetchedPayers = (response.data.data || []).map(p => ({
            id: p.id,
            name: p.payer_name,
            identity_number: p.identity_number || 'N/A',
            npm: p.npm || 'N/A'
        }));
        
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
            type: d.type,
            value: d.value,
            is_active: d.is_active 
        })).filter(d => d.is_active);
    } catch (error) {
        console.error("Gagal mengambil data Potongan Diskon:", error);
    }
};

const openDetailModal = (payer) => {
    selectedPayerId.value = payer.id;
    detailModalVisible.value = true;
};

const openDiscountModal = (payer) => {
    selectedPayerId.value = payer.id;
    discountModalVisible.value = true;
};

const openInvoiceModal = (payer) => {
    selectedPayerId.value = payer.id;
    invoiceModalVisible.value = true;
};

onMounted(() => {
    fetchData();
    fetchDiscounts();
});
</script>