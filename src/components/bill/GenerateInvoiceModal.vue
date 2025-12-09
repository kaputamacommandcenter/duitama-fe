<template>
  <input type="checkbox" id="invoice_modal" class="modal-toggle" :checked="isVisible" />
  <div class="modal" :class="{'modal-open': isVisible}">
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
        <div class="mb-4 p-3 bg-base-200 rounded-lg">
          <p class="text-sm">Payer: <span class="font-semibold">{{ activePayerDetails[0].payer.payer_name }}</span></p>
          <p class="text-sm">Tagihan Total: <span class="font-bold">Rp {{ formatRupiah(totalSelectedAmount) }}</span></p>
        </div>

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
  calculateTotal: Function,
  formatRupiah: Function,
  formatDiscountValue: Function,
});

const emit = defineEmits(['close']);

const modalLoading = ref(false);
const activePayerDetails = ref(null);
const selectedPlansForPayment = ref([]);

const totalSelectedAmount = computed(() => {
    if (!activePayerDetails.value) return 0;
    
    return activePayerDetails.value
        .filter(plan => selectedPlansForPayment.value.includes(plan.id))
        .reduce((sum, plan) => sum + props.calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type), 0);
});

const fetchPaymentPlanDetails = async (payerId) => {
    if (!payerId) return;

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

    // 1. Ambil detail item yang dipilih
    const selectedPlans = activePayerDetails.value
        .filter(plan => selectedPlansForPayment.value.includes(plan.id));

    // 2. Buat konten HTML untuk Invoice
    const invoiceHTML = generateSampleInvoice(selectedPlans);
    
    // 3. Tampilkan Invoice menggunakan Swal
    Swal.fire({
        title: 'Contoh Invoice Pembayaran',
        html: invoiceHTML,
        icon: 'info',
        width: '800px',
        confirmButtonText: 'Tutup & Lanjutkan Proses (Simulasi)',
        showCancelButton: true,
        cancelButtonText: 'Batal Pembayaran',
        customClass: {
            title: 'text-2xl font-bold',
            htmlContainer: 'text-left overflow-auto max-h-[60vh] p-4',
        }
    }).then((result) => {
        // Logika setelah user menekan tombol (simulasi)
        if (result.isConfirmed) {
             Swal.fire('Proses Lanjutan (Simulasi)', 'Invoice berhasil di-generate. Lanjutkan ke API Pembayaran...', 'success');
             emit('close');
             selectedPlansForPayment.value = [];
        }
    });
};

const generateSampleInvoice = (plans) => {
    if (plans.length === 0) return 'Tidak ada item yang dipilih untuk Invoice.';

    const payer = plans[0].payer;
    const invoiceNumber = `INV-${new Date().getTime()}`;
    const invoiceDate = new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    let subtotal = 0;
    let totalDiscount = 0;

    let itemsHTML = plans.map((plan, index) => {
        const finalAmount = props.calculateTotal(plan.item.amount, plan.discount?.value, plan.discount?.type);
        const originalAmount = plan.item.amount;
        
        let discountApplied = 0;
        if (plan.discount) {
            discountApplied = originalAmount - finalAmount;
            totalDiscount += discountApplied;
        }

        subtotal += originalAmount;
        
        return `
            <tr>
                <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
                <td style="padding: 8px; border: 1px solid #ddd;">
                    ${plan.item.name}
                    ${plan.discount ? `<div style="font-size: 0.75rem; color: #f97316;">(Potongan: ${props.formatDiscountValue(plan.discount.value, plan.discount.type)})</div>` : ''}
                </td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rp ${props.formatRupiah(originalAmount)}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rp ${props.formatRupiah(discountApplied)}</td>
                <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">Rp ${props.formatRupiah(finalAmount)}</td>
            </tr>
        `;
    }).join('');

    const totalFinal = subtotal - totalDiscount;

    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ccc; border-radius: 8px; background-color: #fff;">
            <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #3b82f6;">FAKTUR PEMBAYARAN</h2>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem;">(Contoh / Simulasi Pembayaran)</p>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 0.9rem;">
                <div>
                    <p style="margin: 0;"><strong>Kepada:</strong></p>
                    <p style="margin: 0;">${payer.payer_name}</p>
                    <p style="margin: 0;">ID/NPM: ${payer.identity_number || payer.npm || 'N/A'}</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0;"><strong>No. Invoice:</strong> ${invoiceNumber}</p>
                    <p style="margin: 0;"><strong>Tanggal:</strong> ${invoiceDate}</p>
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 0.9rem;">
                <thead>
                    <tr style="background-color: #e0f2fe;">
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: center;">No</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Deskripsi Tagihan</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Nominal Awal</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Potongan</th>
                        <th style="padding: 10px; border: 1px solid #ddd; text-align: right;">Total Bayar</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div style="display: flex; justify-content: flex-end; font-size: 1rem;">
                <div style="width: 300px;">
                    <div style="display: flex; justify-content: space-between; padding: 5px 0;">
                        <span>Subtotal:</span>
                        <span style="font-weight: bold;">Rp ${props.formatRupiah(subtotal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 5px 0; color: #f97316;">
                        <span>Total Potongan:</span>
                        <span style="font-weight: bold;">- Rp ${props.formatRupiah(totalDiscount)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #3b82f6; font-size: 1.1rem; background-color: #f0f9ff;">
                        <span style="font-weight: bold;">TOTAL TAGIHAN:</span>
                        <span style="font-weight: bold; color: #3b82f6;">Rp ${props.formatRupiah(totalFinal)}</span>
                    </div>
                </div>
            </div>
            
            <p style="margin-top: 20px; text-align: center; font-size: 0.8rem; color: #6b7280;">Terima kasih telah melakukan pembayaran.</p>
        </div>
    `;
};


watch(() => props.isVisible, (newVal) => {
    if (newVal && props.payerId) {
        fetchPaymentPlanDetails(props.payerId);
    }
});
</script>