<template>
  <input type="checkbox" id="detail_modal" class="modal-toggle" :checked="isVisible" />
  <div class="modal" :class="{'modal-open': isVisible}">
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
            Total Tagihan: Rp {{ formatRupiah(totalTagihan) }}
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
        <button class="btn btn-primary" @click="$emit('close')">Tutup</button>
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
  calculateTotal: Function,
  formatRupiah: Function,
  formatDiscountValue: Function,
});

const emit = defineEmits(['close']);

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
        activePayerDetails.value = response.data.data || [];
    } catch (error) {
        console.error(`Gagal memuat Payment Plan untuk Payer ID ${payerId}:`, error);
        Swal.fire("Error", "Gagal memuat rincian Payment Plan. Silakan coba lagi.", "error");
        activePayerDetails.value = [];
    } finally {
        modalLoading.value = false;
    }
};

watch(() => props.isVisible, (newVal) => {
    if (newVal && props.payerId) {
        fetchPaymentPlanDetails(props.payerId);
    }
});
</script>