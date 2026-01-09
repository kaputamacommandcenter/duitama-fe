<template>
  <input type="checkbox" id="discount_modal" class="modal-toggle" :checked="isVisible" />
  <div class="modal" :class="{'modal-open': isVisible}">
    <div class="modal-box w-11/12 max-w-4xl border-t-4 border-primary">
      <div class="flex justify-between items-center mb-6">
        <h3 class="font-bold text-xl">Kelola Potongan Tagihan</h3>
        <button class="btn btn-sm btn-circle btn-ghost" @click="$emit('close')">✕</button>
      </div>

      <div v-if="modalLoading" class="text-center py-10">
        <span class="loading loading-spinner loading-lg text-primary"></span>
        <p class="mt-3 text-sm font-medium">Sinkronisasi data...</p>
      </div>
      
      <div v-else-if="!activePayerDetails || activePayerDetails.length === 0">
        <div class="alert alert-warning shadow-sm">
          <span>Tidak ada rincian tagihan yang tersedia.</span>
        </div>
      </div>

      <div v-else>
        <div class="bg-base-200 p-6 rounded-xl mb-6 flex flex-wrap justify-between items-center gap-4">
          <div>
            <p class="text-[10px] uppercase tracking-widest font-bold opacity-50">Target Payer</p>
            <p class="font-bold text-lg text-primary leading-tight">{{ activePayerDetails[0].payer.payer_name }}</p>
            <p class="text-sm opacity-70">Total Tagihan: <span class="font-bold text-base-content">Rp {{ formatRupiah(totalTagihan) }}</span></p>
          </div>

          <div class="flex flex-col gap-2 min-w-[320px]">
            <div class="flex justify-between items-end">
                <span class="text-[11px] font-bold text-primary">{{ selectedIds.length }} Item Terpilih</span>
                <button v-if="selectedIds.length > 0" @click="resetAllToOriginal" class="text-[10px] link link-hover text-error font-semibold uppercase">Batal Pilih & Reset</button>
            </div>
            
            <select 
              class="select select-bordered select-sm w-full focus:outline-none border-gray-300 shadow-sm"
              @change="handleBulkAction($event)"
              :disabled="selectedIds.length === 0"
            >
              <option value="" selected disabled>-- Pilih Tindakan Massal --</option>
              <optgroup label="Terapkan / Ubah Potongan">
                  <option v-for="d in availableDiscounts" :key="d.id" :value="JSON.stringify({type: 'apply', data: d})">
                      {{ d.name }} ({{ formatDiscountValue(d.value, d.type) }})
                  </option>
              </optgroup>
              <optgroup label="Pembersihan">
                  <option :value="JSON.stringify({type: 'clear'})">❌ Kosongkan Potongan Terpilih</option>
              </optgroup>
            </select>
            <p class="text-[10px] italic opacity-60 text-right">* Unchecklist item untuk mengembalikan ke data awal</p>
          </div>
        </div>

        <div class="overflow-hidden border rounded-xl shadow-sm bg-base-100">
          <table class="table table-zebra w-full">
            <thead class="bg-base-200/50">
              <tr>
                <th class="w-12 text-center">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary checkbox-sm" 
                    :checked="isAllSelected" 
                    @change="toggleSelectAll"
                  />
                </th>
                <th class="text-sm font-bold opacity-70">Item Tagihan</th>
                <th class="text-right text-sm font-bold opacity-70">Awal</th>
                <th class="text-center text-sm font-bold opacity-70">Potongan Saat Ini</th>
                <th class="text-right text-sm font-bold opacity-70">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="(plan) in activePayerDetails" 
                :key="plan.id"
                class="hover transition-colors"
                :class="{'bg-primary/5': selectedIds.includes(plan.id)}"
              >
                <td class="text-center">
                  <input 
                    type="checkbox" 
                    class="checkbox checkbox-primary checkbox-sm" 
                    v-model="selectedIds" 
                    :value="plan.id" 
                  />
                </td>
                <td class="font-semibold text-sm">{{ plan.item.name }}</td>
                <td class="text-right text-sm opacity-60">Rp {{ formatRupiah(plan.item.amount) }}</td>
                <td class="text-center">
                  <div v-if="plan.discount" class="flex flex-col items-center gap-0.5">
                    <span class="text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                      {{ plan.discount.name || plan.discount.description || 'Potongan' }}
                    </span>
                    <div class="badge badge-warning badge-outline h-5 text-[10px] font-bold px-2">
                      -{{ formatDiscountValue(plan.discount.value, plan.discount.type) }}
                    </div>
                  </div>
                  <span v-else class="text-[10px] opacity-20 italic">-</span>
                </td>
                <td class="text-right font-bold text-sm" :class="plan.discount ? 'text-success' : 'text-base-content'">
                  Rp {{ formatRupiah(calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type)) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost btn-sm" @click="$emit('close')">Batal</button>
        <button 
          class="btn btn-success btn-sm px-8" 
          :disabled="modalLoading || !activePayerDetails" 
          @click="saveDiscountChanges"
        >
          <span v-if="modalLoading" class="loading loading-spinner loading-xs"></span>
          <span v-else>Simpan Perubahan</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import Swal from 'sweetalert2';
import { api } from '../../api/config';

const props = defineProps({
  isVisible: Boolean,
  payerId: [Number, null],
  availableDiscounts: Array,
  calculateTotal: Function,
  formatRupiah: Function,
  formatDiscountValue: Function,
});

const emit = defineEmits(['close', 'changesSaved']);

const modalLoading = ref(false);
const activePayerDetails = ref(null);
const originalDetails = ref([]); // Menyimpan backup data asli dari API
const selectedIds = ref([]);

// --- Computed ---
const totalTagihan = computed(() => {
    if (!activePayerDetails.value) return 0;
    return activePayerDetails.value.reduce(
        (sum, plan) => sum + props.calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type), 
        0
    );
});

const isAllSelected = computed(() => {
    return activePayerDetails.value?.length > 0 && selectedIds.value.length === activePayerDetails.value.length;
});

// --- Logic ---
const fetchPaymentPlanDetails = async (payerId) => {
    if (!payerId) return;
    modalLoading.value = true;
    selectedIds.value = [];
    try {
        const response = await api.get(`/payment-plans?payer_id=${payerId}`);
        const data = response.data.data || [];
        // Clone data untuk diedit dan backup
        activePayerDetails.value = JSON.parse(JSON.stringify(data)); 
        originalDetails.value = JSON.parse(JSON.stringify(data)); 
    } catch (error) {
        Swal.fire("Error", "Gagal memuat rincian tagihan.", "error");
    } finally {
        modalLoading.value = false;
    }
};

const toggleSelectAll = (e) => {
    selectedIds.value = e.target.checked ? activePayerDetails.value.map(p => p.id) : [];
};

const resetAllToOriginal = () => {
    activePayerDetails.value = JSON.parse(JSON.stringify(originalDetails.value));
    selectedIds.value = [];
};

const handleBulkAction = (event) => {
    try {
        const action = JSON.parse(event.target.value);
        if (!action || selectedIds.value.length === 0) return;

        activePayerDetails.value.forEach(plan => {
            if (selectedIds.value.includes(plan.id)) {
                if (action.type === 'apply') {
                    plan.discount = { 
                        id: action.data.id, 
                        name: action.data.name,
                        description: action.data.description,
                        type: action.data.type, 
                        value: action.data.value 
                    };
                } else if (action.type === 'clear') {
                    plan.discount = null;
                }
            }
        });
    } finally {
        event.target.selectedIndex = 0;
    }
};

const saveDiscountChanges = async () => {
    modalLoading.value = true;
    let successCount = 0;
    let failCount = 0;
    
    for (const plan of activePayerDetails.value) {
        try {
            await api.patch(`/payment-plans/${plan.id}`, {
                discount_id: plan.discount?.id || null, 
                payer_id: plan.payer_id,
                payment_template_detail_id: plan.payment_template_detail_id
            });
            successCount++;
        } catch (error) {
            failCount++;
        }
    }
    
    modalLoading.value = false;
    emit('close');
    Swal.fire(failCount === 0 ? 'Berhasil!' : 'Selesai', `Perubahan disimpan.`, failCount === 0 ? 'success' : 'warning');
    emit('changesSaved');
};

// --- Watcher untuk mendeteksi UNCHECKLIST ---
watch(selectedIds, (newVal, oldVal) => {
    // Cari ID yang ada di oldVal tapi tidak ada di newVal (artinya di-unchecklist)
    const unselectedId = oldVal.find(id => !newVal.includes(id));
    
    if (unselectedId) {
        // Cari item di activePayerDetails
        const plan = activePayerDetails.value.find(p => p.id === unselectedId);
        // Cari data aslinya di originalDetails
        const original = originalDetails.value.find(o => o.id === unselectedId);
        
        if (plan && original) {
            // Restore data diskon ke kondisi awal
            plan.discount = original.discount ? JSON.parse(JSON.stringify(original.discount)) : null;
        }
    }
}, { deep: true });

watch(() => props.isVisible, (newVal) => {
    if (newVal && props.payerId) fetchPaymentPlanDetails(props.payerId);
});
</script>