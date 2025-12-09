<template>
  <input type="checkbox" id="discount_modal" class="modal-toggle" :checked="isVisible" />
  <div class="modal" :class="{'modal-open': isVisible}">
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
        <div class="mb-4 p-3 bg-base-200 rounded-lg">
          <p class="text-sm">Payer: <span class="font-semibold">{{ activePayerDetails[0].payer.payer_name }}</span></p>
          <p class="text-sm">ID/NPM: <span class="font-semibold">{{ activePayerDetails[0].payer.identity_number }}</span></p>
          <p class="text-lg font-bold mt-2">
            Total Akhir: Rp {{ formatRupiah(totalTagihan) }}
          </p>
        </div>

        <div class="overflow-x-auto max-h-96 space-y-4">
          <div v-for="(plan) in activePayerDetails" :key="plan.id" class="p-3 border rounded-lg bg-base-100">
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
        <button class="btn btn-success" :disabled="modalLoading" @click="saveDiscountChanges">
          <span v-if="modalLoading" class="loading loading-spinner loading-sm"></span>
          <span v-else>Simpan Perubahan Potongan</span>
        </button>
        <button class="btn btn-neutral" @click="$emit('close')">Batal</button>
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

const totalTagihan = computed(() => {
    if (!activePayerDetails.value) return 0;
    return activePayerDetails.value.reduce(
        (sum, plan) => sum + props.calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type), 
        0
    );
});

const fetchPaymentPlanDetails = async (payerId) => {
    if (!payerId) return;
    modalLoading.value = true;
    activePayerDetails.value = null;

    try {
        const response = await api.get(`/payment-plans?payer_id=${payerId}`);
        // Kloning data agar perubahan di modal tidak langsung memengaruhi state global
        activePayerDetails.value = JSON.parse(JSON.stringify(response.data.data || [])); 
    } catch (error) {
        console.error(`Gagal memuat Payment Plan untuk Payer ID ${payerId}:`, error);
        Swal.fire("Error", "Gagal memuat rincian Payment Plan. Silakan coba lagi.", "error");
        activePayerDetails.value = [];
    } finally {
        modalLoading.value = false;
    }
};

const applyDiscount = (plan, discountId) => {
    let discount = null;
    let discountDetails = null;

    if (discountId) {
        discountDetails = props.availableDiscounts.find(d => d.id == discountId);
        if (discountDetails) {
            discount = {
                id: discountDetails.id,
                description: discountDetails.description,
                type: discountDetails.type,
                value: discountDetails.value 
            };
        }
    }
    
    // Perbarui objek plan secara reaktif
    plan.discount = discount;
};

const saveDiscountChanges = async () => {
    if (!activePayerDetails.value || activePayerDetails.value.length === 0) return;

    modalLoading.value = true;
    
    let successCount = 0;
    let failCount = 0;
    
    for (const plan of activePayerDetails.value) {
        try {
            const updatePayload = {
                discount_id: plan.discount?.id || null, 
                // Sertakan data lain yang diperlukan oleh API patch, contoh:
                payer_id: plan.payer_id,
                payment_template_detail_id: plan.payment_template_detail_id
            };

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
    emit('close'); // Tutup modal

    if (failCount === 0) {
        Swal.fire('Berhasil!', `${successCount} perubahan potongan berhasil disimpan.`, 'success');
        emit('changesSaved'); // Beri tahu komponen induk untuk memuat ulang data utama
    } else {
        Swal.fire('Peringatan!', `Gagal menyimpan ${failCount} perubahan potongan.`, 'warning');
    }
}

watch(() => props.isVisible, (newVal) => {
    if (newVal && props.payerId) {
        fetchPaymentPlanDetails(props.payerId);
    }
});
</script>