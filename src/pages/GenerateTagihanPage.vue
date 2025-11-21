<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Generate Tagihan Mutlak</h1>

    <div class="card bg-base-100 shadow-xl p-6">
      
      <div class="mb-4">
        <label class="font-medium text-sm">Template Pembayaran</label>
        <select v-model="selectedTemplate" @change="loadTemplateDetails"
          class="select select-bordered w-full mt-1">
          <option disabled value="">-- Pilih Template --</option>
          <option v-for="t in templates" :key="t.id" :value="t.id">
            {{ t.name }}
          </option>
        </select>
      </div>

      <div v-if="templateDetails.length" class="mb-6">
        <p class="font-semibold mb-2">Billing Items di Template:</p>
        <table class="table w-full">
          <thead>
            <tr>
              <th>Item</th>
              <th>Nominal</th>
              <th>Jatuh Tempo (Tanggal Mutlak)</th>
            </tr>
          </thead>
            <tbody>
              <tr v-for="item in templateDetails" :key="item.id">
                <td>{{ item.billing_item_name }}</td>
                <td>Rp {{ formatRupiah(item.amount) }}</td>
                <td>{{ item.due_date }}</td>
              </tr>
            </tbody>
        </table>
      </div>

      <hr class="my-4" />

      <div class="mb-4">
        <label class="font-medium text-sm">Mode Payer</label>
        <select v-model="payerMode" class="select select-bordered w-full mt-1">
          <option value="individual">Per Individu</option>
          <option value="group">Kelompok Payer</option>
        </select>
      </div>

      <div v-if="payerMode === 'individual'" class="mb-4">
        <label class="font-medium text-sm">Pilih Payer Individu</label>
        <div class="flex items-center gap-3 mt-1">
          <input type="checkbox" v-model="selectAll" class="checkbox checkbox-sm"> Pilih Semua
        </div>
        <div class="max-h-48 overflow-y-auto border rounded p-3 mt-2">
          <div v-for="p in payers" :key="p.id" class="flex items-center gap-3 mb-1">
            <input type="checkbox" v-model="selectedPayers" :value="p.id" class="checkbox checkbox-sm">
            <span>{{ p.name }} ({{ p.identity_number }})</span>
          </div>
          <p v-if="payers.length === 0" class="text-center py-2 text-gray-500 text-sm">
            Tidak ada data Payer Individu.
          </p>
        </div>
      </div>

      <div v-if="payerMode === 'group'" class="mb-4">
        <label class="font-medium text-sm">Pilih Kelompok Payer</label>
        <div class="max-h-48 overflow-y-auto border rounded p-3 mt-2">
          <div v-for="g in payerGroups" :key="g.id" class="border p-2 rounded mb-2">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <input type="checkbox" v-model="selectedGroups" :value="g.id" class="checkbox checkbox-sm">
                <span class="font-semibold">{{ g.name }} ({{ g.members.length }} anggota)</span>
              </div>
              <button 
                class="btn btn-xs btn-outline"
                @click="openMembersModal(g)"
              >
                Lihat Anggota
              </button>
            </div>
          </div>
            <p v-if="payerGroups.length === 0" class="text-center py-2 text-gray-500 text-sm">
            Tidak ada data Kelompok Payer.
          </p>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <button @click="resetForm" class="btn btn-neutral btn-outline" :disabled="isProcessing">
          Reset Form
        </button>
        <button @click="generateTagihan" class="btn btn-primary" 
                :disabled="!selectedTemplate || isProcessing">
            <span v-if="isProcessing" class="loading loading-spinner"></span>
            {{ isProcessing ? 'Memproses...' : 'Generate Tagihan' }}
        </button>
      </div>

    </div>

    <div v-if="generatedSummary.length" class="card bg-base-200 mt-6 shadow-xl p-6">
      <h2 class="text-xl font-semibold mb-4">Hasil Generate Tagihan (Pratinjau)</h2>

      <div class="flex justify-between items-center mb-4">
          <p class="text-sm text-gray-600">Total **{{ generatedSummary.length }}** Payer akan digenerate.</p>
          <button @click="openDiscountModal" class="btn btn-warning">
              Terapkan Potongan Manual (Admin)
          </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Payer</th>
              <th>Total Tagihan</th>
              <th>Jumlah Item</th>
              <th>Rincian</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="summary in generatedSummary" :key="summary.payer_id">
              <td>{{ summary.name }} ({{ summary.identity_number }})</td>
              <td>Rp {{ formatRupiah(summary.total) }}</td>
              <td>{{ summary.invoices.length }} Item</td>
              <td>
                <button class="btn btn-xs btn-info btn-outline"
                        @click="openSummaryDetailModal(summary)"> 
                    Lihat Detail
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>
  
  <input type="checkbox" id="modalSummaryDetail" class="modal-toggle" :checked="summaryDetailVisible" />

  <div class="modal" :class="{'modal-open': summaryDetailVisible}">
    <div class="modal-box w-11/12 max-w-2xl"> 
      <h3 class="font-bold text-lg mb-3">Rincian Tagihan Payer: {{ activeSummary?.name }}</h3>
      
      <div v-if="activeSummary" class="space-y-4">
          <div class="bg-base-200 p-3 rounded-lg">
              <p class="text-sm">Payer: 
                  <span class="font-semibold">{{ activeSummary.name }} ({{ activeSummary.identity_number }})</span>
              </p>
              <p class="text-sm">Total Tagihan (Final): 
                  <span class="font-semibold">Rp {{ formatRupiah(activeSummary.total) }}</span>
              </p>
          </div>

          <p class="font-medium text-sm">Item Tagihan:</p>
          
          <div class="space-y-4 max-h-80 overflow-y-auto">
              <div v-for="group in groupedInvoices" :key="group.template_name">
                  <p class="font-semibold mt-2 mb-1 text-sm">
                      Template: {{ group.template_name }} 
                      <span class="text-xs text-gray-500 ml-2">(Total Template: Rp {{ formatRupiah(group.total_tagihan_template) }})</span>
                  </p>

                  <div class="border rounded-lg">
                      <table class="table w-full table-compact">
                          <thead>
                              <tr class="bg-base-300">
                                  <th>Item</th>
                                  <th>Jatuh Tempo</th>
                                  <th>Potongan</th>
                                  <th class="text-right">Nominal Awal</th>
                                  <th class="text-right">Total Akhir</th>
                              </tr>
                          </thead>
                          <tbody>
                              <tr v-for="(d, index) in group.items" :key="index">
                                  <td>{{ d.billing_item_name }}</td>
                                  <td>{{ d.due_date }}</td>
                                  <td>
                                    <span v-if="d.discount_name" class="badge badge-warning badge-sm">
                                        -Rp {{ formatRupiah(d.discount_amount) }} ({{ d.discount_name }})
                                    </span>
                                    <span v-else class="text-gray-400">Nihil</span>
                                  </td>
                                  <td class="text-right">Rp {{ formatRupiah(d.initial_amount) }}</td>
                                  <td class="text-right font-bold">Rp {{ formatRupiah(d.total) }}</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
              <p v-if="groupedInvoices.length === 0" class="text-center py-4 text-gray-500">Tidak ada item tagihan yang ditemukan.</p>
          </div>
          
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="summaryDetailVisible = false">Tutup</button>
      </div>
    </div>
  </div>
  
  <input type="checkbox" id="modalApplyDiscount" class="modal-toggle" :checked="discountModalVisible" />
  <div class="modal" :class="{'modal-open': discountModalVisible}">
    <div class="modal-box w-11/12 max-w-4xl">
      <h3 class="font-bold text-lg mb-4">Terapkan Potongan Manual pada Tagihan</h3>
      
      <div class="alert alert-info shadow-lg mb-4">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current flex-shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <span>Pilih Payer, lalu terapkan potongan pada **setiap item tagihan**. Tagihan akan diperbarui secara real-time.</span>
        </div>
      </div>

      <div class="flex gap-4 mb-4 max-h-96">
        <div class="w-1/3 border rounded-lg p-3 bg-base-100 overflow-y-auto">
          <p class="font-semibold text-sm mb-2">Pilih Payer:</p>
          <div 
            v-for="summary in generatedSummary" :key="summary.payer_id"
            :class="['p-2 rounded cursor-pointer mb-1', {'bg-primary text-primary-content': summary.payer_id === activeDiscountPayer?.payer_id}]"
            @click="activeDiscountPayer = summary"
          >
            <span class="font-medium">{{ summary.name }}</span> <br>
            <span class="text-xs opacity-70">{{ summary.identity_number }}</span>
          </div>
          <p v-if="generatedSummary.length === 0" class="text-center text-sm py-4 text-gray-500">Tidak ada Payer</p>
        </div>

        <div class="w-2/3 border rounded-lg p-3 overflow-y-auto">
          <div v-if="activeDiscountPayer">
            <h4 class="font-bold mb-3">Item Tagihan untuk {{ activeDiscountPayer.name }}</h4>
            <div class="space-y-4">
              <div v-for="(invoice, index) in activeDiscountPayer.invoices" :key="invoice.invoice_id + '-' + index"
                   class="border p-3 rounded-lg bg-base-100">
                
                <div class="flex justify-between items-start mb-2">
                  <p class="font-semibold">{{ invoice.billing_item_name }}</p>
                  <p class="text-lg font-extrabold" 
                     :class="invoice.discount_amount > 0 ? 'text-warning' : 'text-success'">
                    Rp {{ formatRupiah(invoice.total) }}
                  </p>
                </div>

                <p class="text-sm text-gray-500 mb-2">Nominal Awal: Rp {{ formatRupiah(invoice.initial_amount) }}</p>

                <div class="flex items-center gap-3">
                    <select v-model="invoice.selected_discount_id" class="select select-bordered select-sm w-full"
                            @change="applyDiscountToInvoice(invoice)">
                        <option value="">-- Tidak Ada Potongan --</option>
                        <option v-for="d in availableDiscounts.filter(d => d.is_active)" :key="d.id" :value="d.id">
                            {{ d.name }} ({{ d.type === 'percent' ? d.value + '%' : 'Rp ' + formatRupiah(d.value) }})
                        </option>
                    </select>
                    <button class="btn btn-sm btn-error btn-outline"
                            @click="clearDiscount(invoice)">
                        Hapus
                    </button>
                </div>
                
                <p v-if="invoice.discount_amount > 0" class="text-sm mt-2 text-warning font-semibold">
                    Potongan Diterapkan: -Rp {{ formatRupiah(invoice.discount_amount) }}
                </p>

              </div>
            </div>
          </div>
          <p v-else class="text-center py-10 text-gray-500">Pilih salah satu Payer di samping untuk mulai menerapkan potongan.</p>
        </div>
      </div>
      
      <div class="modal-action">
        <button class="btn btn-primary" @click="closeDiscountModal">Selesai Menerapkan Potongan</button>
      </div>
    </div>
  </div>

  <input type="checkbox" id="modalMembers" class="modal-toggle" :checked="modalVisible" />
  <div class="modal" :class="{'modal-open': modalVisible}">
    <div class="modal-box w-11/12 max-w-2xl">
      <h3 class="font-bold text-lg mb-3">Anggota {{ activeGroup?.name }}</h3>

      <div class="max-h-96 overflow-y-auto">
        <table class="table w-full table-zebra table-compact">
          <thead>
            <tr>
              <th>ID Payer</th>
              <th>Nama</th>
              <th>Nomor Identitas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in activeGroup?.members" :key="m.id">
              <td>{{ m.id }}</td>
              <td>{{ m.name }}</td>
              <td>{{ m.identity_number }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="activeGroup?.members?.length === 0" class="text-center py-4 text-gray-500">
            Tidak ada anggota dalam kelompok ini.
        </p>
      </div>

      <div class="modal-action">
        <button class="btn" @click="modalVisible = false">Tutup</button>
      </div>
    </div>
  </div>
</template>
<script setup>
import Swal from "sweetalert2";
import { ref, watch, onMounted, computed, nextTick } from "vue"; 

// =================== STATE MANAGEMENT =====================
const modalVisible = ref(false); 
const activeGroup = ref(null);

const summaryDetailVisible = ref(false); 
const activeSummary = ref(null); 

const discountModalVisible = ref(false); // State baru untuk modal potongan
const activeDiscountPayer = ref(null);   // Payer yang sedang di-edit potongannya

const payerMode = ref("individual");
const selectedPayers = ref([]);
const selectedGroups = ref([]);
const selectAll = ref(false); 

const selectedTemplate = ref("");
const templateDetails = ref([]);

const generatedResults = ref([]); // Daftar semua invoice (flat list)
const generatedSummary = ref([]); // Daftar ringkasan per Payer
const isProcessing = ref(false); 


// ======================= DUMMY DATA (SINKRONISASI) =========================

const templates = ref([
  { id: 1, name: "S1 Pagi - TA. 2025/2026", description: "Cicilan I + MOMB + Seragam" }, 
  { id: 2, name: "S1 Pagi - TA. 2025/2026", description: "Biaya Kuliah + Pengembangan Lengkap" }
]);

const dummyDetails = {
  1: [
    { id: 1, billing_item_id: 1, billing_item_name: "Biaya Kuliah - Cicilan I", amount: 800000, due_date: "2025-09-20" }, 
    { id: 2, billing_item_id: 2, billing_item_name: "Biaya Pengembangan - Cicilan I", amount: 200000, due_date: "2025-09-20" }, 
    { id: 3, billing_item_id: 3, billing_item_name: "Biaya MOMB", amount: 300000, due_date: "2025-09-20" }, 
    { id: 4, billing_item_id: 4, billing_item_name: "Biaya Seragam (2 Buah)", amount: 350000, due_date: "2025-09-20" }, 
  ],
  2: [
    { id: 12, billing_item_id: 12, billing_item_name: "Biaya Kuliah - Cicilan II", amount: 1000000, due_date: "2025-11-15" },
    { id: 13, billing_item_id: 13, billing_item_name: "Biaya Pengembangan - Cicilan II", amount: 150000, due_date: "2025-11-15" },
    { id: 14, billing_item_id: 14, billing_item_name: "Biaya Kuliah - Cicilan III", amount: 1000000, due_date: "2025-12-15" },
    { id: 15, billing_item_id: 15, billing_item_name: "Biaya Pengembangan - Cicilan III", amount: 150000, due_date: "2025-12-15" },
    { id: 16, billing_item_id: 16, billing_item_name: "Biaya Kuliah - Cicilan IV", amount: 900000, due_date: "2026-01-15" },
    { id: 17, billing_item_id: 17, billing_item_name: "Biaya Pengembangan - Cicilan IV", amount: 150000, due_date: "2026-01-15" },
    { id: 18, billing_item_id: 18, billing_item_name: "Biaya Kuliah - Cicilan V", amount: 1000000, due_date: "2026-02-15" },
    { id: 19, billing_item_id: 19, billing_item_name: "Biaya Pengembangan - Cicilan V", amount: 150000, due_date: "2026-02-15" },
    { id: 20, billing_item_id: 20, billing_item_name: "Biaya Kuliah - Cicilan VI", amount: 1000000, due_date: "2026-03-15" },
    { id: 21, billing_item_id: 21, billing_item_name: "Biaya Pengembangan - Cicilan VI", amount: 200000, due_date: "2026-03-15" },
  ]
};

const payers = ref([
  { id: 1, name: "Budi Santoso", identity_number: "20250101" },
  { id: 2, name: "Siti Aisyah", identity_number: "20250102" },
  { id: 3, name: "Rahmat Hidayat", identity_number: "20250103" },
  { id: 4, name: "Kartika Dewi", identity_number: "20250104" },
  { id: 5, name: "Joko Susilo", identity_number: "20250105" }
]);

const payerGroups = ref([
  // ... data kelompok payer (tidak berubah)
  {
    id: 101,
    name: "Kelompok A",
    members: [
      { id: 1, name: "Budi Santoso", identity_number: "20250101" },
      { id: 2, name: "Siti Aisyah", identity_number: "20250102" }
    ]
  },
  {
    id: 102,
    name: "Kelompok B",
    members: [
      { id: 3, name: "Rahmat Hidayat", identity_number: "20250103" },
      { id: 4, name: "Kartika Dewi", identity_number: "20250104" }
    ]
  },
  {
    id: 103,
    name: "Kelompok C",
    members: [
      { id: 2, name: "Siti Aisyah", identity_number: "20250102" }, 
      { id: 5, name: "Joko Susilo", identity_number: "20250105" }
    ]
  }
]);

// Data Potongan (Disinkronkan dari respons sebelumnya)
const availableDiscounts = ref([
  // 1. Alumni
  { id: 101, name: "Potongan Alumni (Tahun Pertama)", type: "percent", value: 20, is_active: true },
  // 2. Saudara Kandung
  { id: 201, name: "Sdr Kandung - Lunas (Tahun Pertama)", type: "percent", value: 20, is_active: true },
  { id: 202, name: "Sdr Kandung - Cicil (Tahun Pertama)", type: "percent", value: 15, is_active: true },
  // 6. Siswa Berprestasi (Nominal)
  { id: 601, name: "Siswa Berprestasi Ranking I", type: "nominal", value: 600000, is_active: true },
  { id: 602, name: "Siswa Berprestasi Ranking II", type: "nominal", value: 400000, is_active: true },
  // 9. Membayar Lunas
  { id: 901, name: "Potongan Bayar Lunas 1 Tahun", type: "percent", value: 20, is_active: true },
]);


// =================== METHODS AND WATCHERS =====================

const formatRupiah = (value) => new Intl.NumberFormat("id-ID").format(value);

const openMembersModal = (group) => {
  activeGroup.value = group;
  modalVisible.value = true;
};

// Fungsi Baru: Buka Modal Potongan
const openDiscountModal = async () => {
    if (generatedSummary.value.length === 0) {
        Swal.fire("Peringatan", "Harap generate tagihan terlebih dahulu.", "warning");
        return;
    }
    activeDiscountPayer.value = generatedSummary.value[0]; // Set payer pertama sebagai default aktif
    discountModalVisible.value = true;
    await nextTick();
};

const closeDiscountModal = () => {
    activeDiscountPayer.value = null;
    discountModalVisible.value = false;
};


// Fungsi untuk menghitung dan menerapkan potongan ke satu invoice
const applyDiscountToInvoice = (invoice) => {
    const selectedDiscount = availableDiscounts.value.find(d => d.id === invoice.selected_discount_id);
    let finalAmount = invoice.initial_amount;
    let discountAmount = 0;

    if (selectedDiscount) {
        // Tipe Potongan Persentase
        if (selectedDiscount.type === 'percent') {
            // Hitung potongan dari nominal awal
            discountAmount = Math.round((invoice.initial_amount * selectedDiscount.value) / 100);
        } 
        // Tipe Potongan Nominal
        else if (selectedDiscount.type === 'nominal') {
            // Potongan nominal diterapkan langsung ke item
            discountAmount = selectedDiscount.value; 
        }

        // Terapkan batas minimum 0
        finalAmount = Math.max(0, invoice.initial_amount - discountAmount);
    }

    // Update data invoice (yang sudah reaktif)
    invoice.total = finalAmount;
    invoice.discount_amount = discountAmount;
    invoice.discount_name = selectedDiscount?.name || null;
    invoice.discount_id = selectedDiscount?.id || null;
    
    // Perlu update ringkasan Total Payer secara manual
    updateSummaryTotal(invoice.payer_id);
};

// Fungsi untuk menghapus potongan dari satu invoice
const clearDiscount = (invoice) => {
    invoice.selected_discount_id = '';
    applyDiscountToInvoice(invoice);
}

// Fungsi untuk memperbarui Total di Ringkasan Payer
const updateSummaryTotal = (payerId) => {
    const summary = generatedSummary.value.find(s => s.payer_id === payerId);
    if (summary) {
        // Hitung ulang total Payer dari semua invoice-nya
        summary.total = summary.invoices.reduce((sum, inv) => sum + inv.total, 0);
    }
};

const openSummaryDetailModal = (summaryData) => {
    activeSummary.value = summaryData;
    summaryDetailVisible.value = true;
};

const loadTemplateDetails = () => {
  templateDetails.value = dummyDetails[selectedTemplate.value] || [];
};

const resetForm = () => {
    selectedTemplate.value = templates.value.length > 0 ? templates.value[0].id : ''; 
    selectedPayers.value = [];
    selectedGroups.value = [];
    selectAll.value = false;
    
    generatedResults.value = [];
    generatedSummary.value = []; 
    loadTemplateDetails();
}

// Sinkronisasi selectAll <-> selectedPayers (tidak berubah)
watch(selectAll, (newVal) => {
  if (payerMode.value === "individual") {
    selectedPayers.value = newVal ? payers.value.map((p) => p.id) : [];
  }
});

watch(selectedPayers, (newVal) => {
  if (payerMode.value === "individual") {
    selectAll.value = newVal.length === payers.value.length && payers.value.length > 0;
  }
});


// Mengatur default template saat komponen dimuat (tidak berubah)
onMounted(() => {
  if (templates.value.length > 0) {
    selectedTemplate.value = templates.value[0].id;
    loadTemplateDetails();
  }
});

// FUNGSI COMPUTED: Mengelompokkan invoice di modal (Disesuaikan)
const groupedInvoices = computed(() => {
    if (!activeSummary.value) return [];
    
    const groups = new Map();
    
    activeSummary.value.invoices.forEach(invoice => {
        const key = invoice.template_name;
        if (!groups.has(key)) {
            groups.set(key, {
                template_name: key,
                total_tagihan_template: 0,
                items: [],
            });
        }
        
        const group = groups.get(key);
        // Hitung total template dari total akhir (setelah potongan)
        group.total_tagihan_template += invoice.total; 
        group.items.push(invoice);
    });
    
    return Array.from(groups.values()); 
});


const getTemplateName = (templateId) => {
    const template = templates.value.find(t => t.id === templateId);
    return template ? template.name : 'Template Tidak Dikenal';
};


// FUNGSI UTAMA: Generate Tagihan (Disesuaikan untuk Potongan)
const generateTagihan = () => {
    isProcessing.value = true; 

    if (!selectedTemplate.value) { 
        Swal.fire("Form belum lengkap", "Harap pilih Template", "warning");
        isProcessing.value = false;
        return;
    }
    
    const finalPayerMap = new Map(); 
    
    // 1. Kumpulkan Payer (Logika tidak berubah)
    if (payerMode.value === "individual") {
        // ... (Logika pemilihan Payer individu)
        if (selectedPayers.value.length === 0) {
            Swal.fire("Tidak ada payer", "Pilih minimal 1 payer", "warning");
            isProcessing.value = false;
            return;
        }
        payers.value
          .filter((p) => selectedPayers.value.includes(p.id))
          .forEach((p) => finalPayerMap.set(p.id, p));

    } else if (payerMode.value === "group") {
        // ... (Logika pemilihan Payer group)
        if (selectedGroups.value.length === 0) {
            Swal.fire("Tidak ada kelompok", "Pilih minimal 1 kelompok", "warning");
            isProcessing.value = false;
            return;
        }
        payerGroups.value
          .filter((g) => selectedGroups.value.includes(g.id))
          .flatMap((g) => g.members)
          .forEach((p) => finalPayerMap.set(p.id, p)); 
    }

    const finalPayers = Array.from(finalPayerMap.values());

    if (finalPayers.length === 0) {
         Swal.fire("Tidak ada Payer", "Tidak ada Payer yang valid untuk digenerate", "warning");
         isProcessing.value = false;
         return;
    }

    // 2. Generate Hasil Pratinjau (Per Invoice/Item)
    const newInvoices = [];
    let invoiceCount = 0;
    const selectedTemplateId = selectedTemplate.value;
    const templateName = getTemplateName(selectedTemplateId); 

    finalPayers.forEach(payer => {
        templateDetails.value.forEach(item => {
            
            invoiceCount++;

            newInvoices.push({
                invoice_id: `INV-${payer.id}-${item.id}-${invoiceCount}`, 
                payer_id: payer.id,
                name: payer.name,
                identity_number: payer.identity_number,
                
                billing_item_id: item.billing_item_id,
                billing_item_name: item.billing_item_name,
                
                // 💰 Inisialisasi Data Potongan
                initial_amount: item.amount, // Nominal Awal
                total: item.amount,          // Nominal Akhir (Default sama dengan awal)
                discount_amount: 0,          // Potongan awal 0
                selected_discount_id: '',    // ID potongan yang dipilih (untuk kontrol admin)
                discount_name: null,         // Nama potongan
                discount_id: null,           // ID potongan
                
                due_date: item.due_date, 
                template_id: selectedTemplateId, 
                template_name: templateName, 
            });
        });
    });

    generatedResults.value = newInvoices;

    // 3. LOGIKA PENGELOMPOKAN: Membuat Ringkasan BARU (newSummary)
    const newSummaryMap = new Map();

    newInvoices.forEach(invoice => {
        const payerId = invoice.payer_id;

        if (!newSummaryMap.has(payerId)) {
            newSummaryMap.set(payerId, {
                payer_id: payerId,
                name: invoice.name,
                identity_number: invoice.identity_number,
                total: 0,
                invoices: [] 
            });
        }

        const summary = newSummaryMap.get(payerId);
        
        // Gunakan initial_amount saat inisialisasi total (sebelum potongan diterapkan)
        summary.total += invoice.initial_amount;
        
        summary.invoices.push(invoice);
    });
    
    // 4. MERGE DATA LAMA + BARU (Logika penggabungan tetap berlaku jika Admin melakukan generate berkali-kali)
    const finalSummaryMap = new Map();
    
    // ... (Logika penggabungan tidak berubah)
    generatedSummary.value.forEach(summary => {
        finalSummaryMap.set(summary.payer_id, summary);
    });
    
    newSummaryMap.forEach((newSummary, payerId) => {
        if (finalSummaryMap.has(payerId)) {
            const existingSummary = finalSummaryMap.get(payerId);
            existingSummary.total += newSummary.total;
            existingSummary.invoices.push(...newSummary.invoices);
            existingSummary.invoices.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
        } else {
            finalSummaryMap.set(payerId, newSummary);
        }
    });


    generatedSummary.value = Array.from(finalSummaryMap.values()); 

    // 5. Feedback
    isProcessing.value = false;

    Swal.fire("Berhasil!", `Berhasil generate ${newInvoices.length} tagihan untuk ${generatedSummary.value.length} Payer. Silakan terapkan potongan manual.`, "success");
};
</script>