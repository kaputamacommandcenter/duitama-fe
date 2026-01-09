<template>
  <div class="p-6 bg-white rounded-xl shadow-lg">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">Daftar Invoice (Tagihan)</h2>

    <div v-if="loading" class="text-center py-10 text-sky-600">
      <i class="fas fa-spinner fa-spin fa-2x"></i>
      <p class="mt-2">Memuat data tagihan...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">Gagal memuat data: {{ error }}</span>
    </div>

    <div v-else-if="invoices.length" class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. Invoice</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Pembayar</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NPM/ID</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Jumlah</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tgl. Jatuh Tempo</th>
            <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="invoice in invoices" :key="invoice.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ invoice.invoice_number }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
              <div class="font-semibold">{{ invoice.payer_name }}</div>
              <div class="text-xs text-gray-400">VA: {{ invoice.va_number }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ invoice.npm }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-sky-700">
              {{ formatCurrency(invoice.total_amount) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ formatDate(invoice.due_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span 
                :class="statusClass(invoice.status)"
                class="px-3 inline-flex text-xs leading-5 font-semibold rounded-full"
              >
                {{ invoice.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="openFakturModal(invoice.id)"
                class="text-sky-600 hover:text-sky-900 transition font-medium"
              >
                Lihat Faktur
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div class="mt-4 flex justify-between items-center border-t border-gray-200 pt-4">
        <div class="text-sm text-gray-700">
          Menampilkan {{ pagination.from }} sampai {{ pagination.to }} dari {{ pagination.total }} hasil.
        </div>
        <div class="flex space-x-1">
          <button 
            v-for="link in pagination.links" 
            :key="link.label"
            :disabled="!link.url"
            @click="fetchInvoices(link.url)"
            class="px-3 py-1 text-sm rounded-lg transition"
            :class="[link.active ? 'bg-sky-600 text-white font-bold' : 'bg-gray-100 text-gray-700 hover:bg-gray-200', {'opacity-50 cursor-not-allowed': !link.url}]"
            v-html="link.label"
          ></button>
        </div>
      </div>
    </div>
    
    <div v-else class="text-center py-10 text-gray-500">
      <i class="fas fa-exclamation-circle fa-2x"></i>
      <p class="mt-2">Tidak ada data tagihan yang ditemukan.</p>
    </div>
  </div>

  <transition name="modal-fade">
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-50 flex justify-center items-center p-4" 
      @click.self="isModalOpen = false"
    >
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl p-0 relative" @click.stop>
        
        <button 
          @click="isModalOpen = false" 
          class="absolute top-4 right-4 z-10 text-gray-500 hover:text-gray-800 bg-white rounded-full p-2 shadow-lg transition"
        >
          <i class="fa-solid fa-xmark text-xl"></i>
        </button>

        <div class="max-h-[90vh] overflow-y-auto p-6"> 
        
            <div v-if="detailLoading" class="text-center py-10 text-sky-600">
              <i class="fas fa-spinner fa-spin fa-2x"></i>
              <p class="mt-2">Mengambil data faktur...</p>
            </div>

            <div v-else-if="detailError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <strong class="font-bold">Error:</strong> {{ detailError }}
            </div>
            
            <div v-else-if="selectedInvoice" class="font-sans">
              
              <div class="text-center border-b-2 border-sky-600 pb-3 mb-6">
                <h2 class="text-2xl font-bold text-sky-600 m-0">FAKTUR PEMBAYARAN</h2>
                <p class="text-sm mt-1 text-gray-500">(Contoh / Simulasi Pembayaran)</p>
              </div>

              <div class="flex justify-between items-start border-b border-gray-300 pb-3 mb-4">
                  <div>
                    <p class="text-gray-500 text-sm italic mb-1">(Invoice: {{ selectedInvoice.status }})</p>
                    <p class="mb-1 text-gray-700"><strong>Kepada:</strong></p>
                    <p class="font-semibold text-xl text-gray-800">{{ selectedInvoice.payer_name || 'N/A' }}</p>
                    <p class="text-base text-gray-600">ID/NPM: {{ selectedInvoice.identity_number || selectedInvoice.npm || 'N/A' }}</p>
                    <p class="text-base text-sky-700 mt-1">VA: <span class="font-mono font-bold">{{ selectedInvoice.va_number }}</span></p>
                  </div>
                  <div class="text-right">
                    <p class="mb-1 text-gray-700"><strong>No. Invoice:</strong> <span class="font-medium text-gray-900">{{ selectedInvoice.invoice_number || 'N/A' }}</span></p>
                    <p class="text-gray-600"><strong>Tanggal Dibuat:</strong> {{ formatDateSimple(selectedInvoice.date) || 'N/A' }}</p>
                    <p class="text-sm text-red-600 mt-1">
                        <span class="font-bold">Jatuh Tempo:</span> {{ formatDateSimple(selectedInvoice.due_date, true) || 'N/A' }}
                    </p>
                  </div>
              </div>

              <table class="w-full border-collapse mb-6 text-sm">
                <thead>
                  <tr class="bg-sky-100 border border-gray-300">
                    <th class="p-3 border border-gray-300 text-center w-12">No</th>
                    <th class="p-3 border border-gray-300 text-left">Deskripsi Tagihan</th>
                    <th class="p-3 border border-gray-300 text-right w-32">Nominal Awal</th>
                    <th class="p-3 border border-gray-300 text-right w-32">Potongan</th>
                    <th class="p-3 border border-gray-300 text-right w-32">Total Bayar</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in selectedInvoice.details" :key="item.id" class="even:bg-gray-50">
                    <td class="p-3 border border-gray-300 text-center">{{ index + 1 }}</td>
                    <td class="p-3 border border-gray-300 text-left">
                        {{ item.detail_name }}
                        <div v-if="item.discount_name" class="text-orange-600 text-xs mt-0.5">
                            (Diskon: {{ item.discount_name }})
                        </div>
                    </td>
                    <td class="p-3 border border-gray-300 text-right">{{ formatCurrency(item.base_amount) }}</td>
                    <td class="p-3 border border-gray-300 text-right text-red-600">
                      - Rp {{ formatRupiah(item.base_amount - item.total_amount) }}
                    </td>
                    <td class="p-3 border border-gray-300 text-right font-medium">
                      {{ formatCurrency(item.total_amount) }}
                    </td>
                  </tr>
                  <tr v-if="selectedInvoice.details.length === 0">
                    <td colspan="5" class="p-3 text-center text-gray-500">Tidak ada rincian tagihan.</td>
                  </tr>
                </tbody>
              </table>

              <div class="flex justify-end text-base">
                <div class="w-full md:w-96">
                  <div class="flex justify-between p-2">
                    <span>Subtotal (Base):</span>
                    <span class="font-bold">{{ formatCurrency(subtotalBase) }}</span>
                  </div>
                  <div class="flex justify-between p-2">
                    <span>Total Potongan:</span>
                    <span class="font-bold text-red-600">- Rp {{ formatRupiah(totalDiscountCalculated) }}</span>
                  </div>
                  <div class="flex justify-between p-3 border-t border-b-2 border-sky-600 text-lg bg-sky-50 mt-2">
                    <span class="font-extrabold text-gray-800">TOTAL TAGIHAN:</span>
                    <span class="font-extrabold text-sky-700">{{ formatCurrency(selectedInvoice.total_amount) }}</span>
                  </div>
                </div>
              </div>
              
              <p class="mt-6 text-center text-xs text-gray-500">Terima kasih telah melakukan pembayaran.</p>

            </div>
            <div v-else class="text-center py-5 text-gray-500">
              Data faktur tidak ditemukan.
            </div>
            
        </div>
        
        <div class="mt-4 pt-3 border-t p-4 flex justify-end bg-white rounded-b-xl sticky bottom-0">
          <button @click="isModalOpen = false" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
            Tutup Jendela
          </button>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { api } from '../api/config'; // Pastikan path alias benar

// --- TIPE DATA ---
interface InvoiceDetailItem { id: number; invoice_id: number; detail_name: string; discount_name: string | null; base_amount: number; total_amount: number; }
interface Invoice { id: number; payer_id: number; payer_name: string; npm: string; invoice_number: string; va_number: string; due_date: string; total_amount: number; status: 'Pending' | 'Paid' | 'Expired'; }
interface InvoiceDetail extends Invoice {
    details: InvoiceDetailItem[];
    date: string; identity_number: string; created_at: string; updated_at: string;
}
interface PaginationLink { url: string | null; label: string; page: number | null; active: boolean; }
interface PaginationData {
    current_page: number; data: Invoice[]; from: number; to: number; total: number; links: PaginationLink[]; path: string; per_page: number;
}

// --- STATE MANAGEMENT ---
const invoices = ref<Invoice[]>([]);
const pagination = ref<Partial<PaginationData>>({});
const loading = ref(false);
const error = ref<string | null>(null);

const isModalOpen = ref(false);
const selectedInvoice = ref<InvoiceDetail | null>(null); 
const detailLoading = ref(false);
const detailError = ref<string | null>(null);

// --- COMPUTED PROPERTIES UNTUK FAKTUR ---
const subtotalBase = computed(() => {
    if (!selectedInvoice.value?.details) return 0;
    return selectedInvoice.value.details.reduce((sum, item) => sum + item.base_amount, 0);
});

const totalDiscountCalculated = computed(() => {
    if (!selectedInvoice.value?.details) return 0;
    return selectedInvoice.value.details.reduce((sum, item) => sum + (item.base_amount - item.total_amount), 0);
});

// --- FUNGSI DATA FETCHING DAFTAR UTAMA ---
const fetchInvoices = async (fullUrl: string = 'invoices') => {
  loading.value = true;
  error.value = null;
  const relativePath = fullUrl.includes('http') ? fullUrl.split('api/')[1] : fullUrl; 
  try {
    const response = await api.get(relativePath);
    const responseData = response.data.data;
    invoices.value = responseData.data;
    pagination.value = {
        current_page: responseData.current_page,
        from: responseData.from,
        to: responseData.to,
        total: responseData.total,
        links: responseData.links,
        path: responseData.path,
        per_page: responseData.per_page,
    };
  } catch (err) {
    console.error(err);
    error.value = 'Terjadi kesalahan saat menghubungi server.';
    if (api.isAxiosError(err) && err.response) { error.value = err.response.data.message || 'Gagal mengambil data tagihan.'; }
    invoices.value = [];
    pagination.value = {};
  } finally { loading.value = false; }
};

// --- FUNGSI DATA FETCHING FAKTUR ---
const fetchInvoiceDetail = async (invoiceId: number) => {
  detailLoading.value = true;
  detailError.value = null;
  selectedInvoice.value = null;
  
  const endpoint = `invoices/${invoiceId}`; 
  
  try {
    const response = await api.get(endpoint);
    selectedInvoice.value = response.data.data as InvoiceDetail; 
  } catch (err) {
    console.error(err);
    detailError.value = 'Gagal memuat detail faktur.';
    if (api.isAxiosError(err) && err.response) { detailError.value = err.response.data.message || 'Error server saat mengambil detail.'; }
  } finally {
    detailLoading.value = false;
  }
};

// --- FUNGSI MODAL ---
const openFakturModal = async (invoiceId: number) => {
  isModalOpen.value = true;
  await fetchInvoiceDetail(invoiceId);
};

// --- UTILITY FUNCTIONS ---
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(amount);
};

const formatRupiah = (amount: number): string => {
   // Mengembalikan nilai angka tanpa simbol 'Rp'
   return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0
  }).format(amount);
};

const formatDateSimple = (dateString: string, includeTime = false): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
  };
  if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
      // Menggunakan toLocaleString untuk mendapatkan format waktu yang sesuai (pukul HH.MM)
      return date.toLocaleDateString('id-ID', options) + ` pukul ${date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return date.toLocaleDateString('id-ID', options);
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { 
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const statusClass = (status: Invoice['status']): string => {
  switch (status) {
    case 'Paid': return 'bg-green-100 text-green-800';
    case 'Expired': return 'bg-red-100 text-red-800';
    case 'Pending': default: return 'bg-yellow-100 text-yellow-800';
  }
};

// --- LIFECYCLE HOOKS ---
onMounted(() => {
  fetchInvoices();
});
</script>

<style scoped>
/* Transisi untuk Modal */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>