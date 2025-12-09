<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Generate Tagihan Mutlak</h1>
    <div class="card bg-base-100 shadow-xl p-6">
      <div class="mb-4">
        <label class="font-medium text-sm">Template Pembayaran</label>
        <select v-model="selectedTemplate" @change="loadTemplateDetails" class="select select-bordered w-full mt-1">
          <option disabled value="">— pilih template pembayaran —</option>
          <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }}</option>
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

      <PayerSelection 
        v-model:payerMode="payerMode"
        v-model:selectedPayers="selectedPayers"
        v-model:selectedGroups="selectedGroups"
        v-model:selectAll="selectAll"
        v-model:searchQuery="searchQuery"
        :payers="payers"
        :payerGroups="payerGroups"
        @openMembersModal="openMembersModal"
      />

      <div class="flex justify-end gap-3">
        <button @click="resetForm" class="btn btn-neutral btn-outline" :disabled="isProcessing">Reset Form</button>
        <button @click="processAndSaveTagihan" class="btn btn-primary" :disabled="!selectedTemplate || isProcessing">
          <span v-if="isProcessing" class="loading loading-spinner"></span>
          {{ isProcessing ? 'Memproses...' : 'Generate Tagihan' }}
        </button>
      </div>
    </div>
  </div>

  <GroupMembersModal 
    :isVisible="modalVisible"
    :activeGroup="activeGroup"
    @close="modalVisible = false"
  />
</template>

<script setup>
import Swal from "sweetalert2";
import { api } from '../api/config';
import { ref, watch, onMounted, computed, nextTick } from "vue";

import PayerSelection from '../components/bill-generate/PayerSelection.vue';
import GroupMembersModal from '../components/bill-generate/GroupMembersModal.vue';

const modalVisible = ref(false);
const activeGroup = ref(null);

const generatedResults = ref([]);
const generatedSummary = ref([]);

const payerMode = ref("");
const selectedPayers = ref([]);
const selectedGroups = ref([]);
const selectAll = ref(false);
const searchQuery = ref('');

const selectedTemplate = ref("");
const templateDetails = ref([]);

const isProcessing = ref(false);

const templates = ref([]);
const payers = ref([]);
const payerGroups = ref([]);
const availableDiscounts = ref([]);

const fetchDiscounts = async () => {
    isProcessing.value = true;
    try {
        const response = await api.get('/discounts');
        availableDiscounts.value = (response.data.data || []).map(d => ({
            id: d.id,
            name: d.description,
            type: d.type,
            value: d.value,
            is_active: d.is_active
        })).filter(d => d.is_active);
    } catch (error) {
        console.error("Gagal mengambil data Potongan Diskon:", error);
        Swal.fire("Error", "Gagal mengambil data Potongan Diskon dari server.", "error");
    } finally {
        isProcessing.value = false;
    }
};

const fetchIndividualPayers = async () => {
    if (payers.value.length > 0) return;
    isProcessing.value = true;
    try {
        const payersResponse = await api.get('/payers');
        payers.value = (payersResponse.data.data || []).map(p => ({
            id: p.id,
            name: p.payer_name,
            identity_number: p.npm || p.identity_number || 'N/A',
            npm: p.npm || ''
        }));
    } catch (error) {
        console.error("Gagal mengambil data Payer Individu:", error);
        payers.value = [];
        Swal.fire("Error", "Gagal mengambil data Payer Individu dari server.", "error");
    } finally {
        isProcessing.value = false;
    }
};

const fetchGroupPayers = async () => {
    if (payerGroups.value.length > 0) return;
    isProcessing.value = true;
    try {
        const groupsResponse = await api.get('/payer-groups');
        payerGroups.value = (groupsResponse.data.data || []).map(g => ({
            id: g.id,
            name: g.group_name,
            members: g.members || []
        }));
    } catch (error) {
        console.error("Gagal mengambil data Kelompok Payer:", error);
        payerGroups.value = [];
        Swal.fire("Error", "Gagal mengambil data Kelompok Payer dari server.", "error");
    } finally {
        isProcessing.value = false;
    }
};

const fetchGroupMembers = async (groupId) => {
    try {
        const response = await api.get(`/payers/get-by-group-id/${groupId}`);
        const fetchedMembers = (response.data.data || []).map(m => ({
            id: m.id,
            name: m.payer_name,
            identity_number: m.identity_number,
            npm: m.npm || ''
        }));
        return fetchedMembers;
    } catch (error) {
        console.error(`Gagal mengambil anggota grup ${groupId}:`, error);
        Swal.fire("Error", `Gagal memuat anggota untuk grup ${groupId}.`, "error");
        return [];
    }
};

const fetchTemplates = async () => {
    try {
        isProcessing.value = true;
        const response = await api.get('/payment-templates');
        const fetchedTemplates = response.data.data;
        templates.value = fetchedTemplates.map(t => ({
            id: t.id,
            name: t.name,
            description: t.description,
            details: t.details.map(d => ({
                ...d,
                due_date: d.due_date || 'Tgl Mutlak Belum Ditetapkan'
            }))
        }));
    } catch (error) {
        console.error("Gagal mengambil data templates:", error);
        Swal.fire("Error", "Gagal mengambil data Template Pembayaran dari server.", "error");
    } finally {
        isProcessing.value = false;
    }
};

const formatRupiah = (value) => new Intl.NumberFormat("id-ID").format(value);

const openMembersModal = async (group) => {
    isProcessing.value = true;
    const members = await fetchGroupMembers(group.id);
    activeGroup.value = {
        ...group,
        members: members
    };
    modalVisible.value = true;
    isProcessing.value = false;
};

const handleGenerateButtonClick = () => {
    processAndSaveTagihan();
};

const loadTemplateDetails = () => {
    if (!selectedTemplate.value) {
        templateDetails.value = [];
        return;
    }
    const template = templates.value.find(t => t.id === selectedTemplate.value);
    if (template && template.details) {
        templateDetails.value = template.details.map(detail => ({
            id: detail.id,
            billing_item_id: detail.id,
            billing_item_name: detail.name,
            amount: detail.amount,
            due_date: detail.due_date,
        }));
    } else {
        templateDetails.value = [];
    }
};

const resetForm = () => {
    selectedTemplate.value = "";
    payerMode.value = "";
    selectedPayers.value = [];
    selectedGroups.value = [];
    selectAll.value = false;
    searchQuery.value = '';
    generatedResults.value = [];
    generatedSummary.value = [];
    loadTemplateDetails();
};

const createBulkPayload = () => {
    if (!selectedTemplate.value) {
        return { success: false, message: "Harap pilih Template", payload: null };
    }
    if (!payerMode.value) {
        return { success: false, message: "Harap pilih Mode Payer", payload: null };
    }

    const finalPayerMap = new Map();

    if (payerMode.value === "individual") {
        if (selectedPayers.value.length === 0) {
            return { success: false, message: "Pilih minimal 1 Payer Individu", payload: null };
        }
        payers.value
            .filter(p => selectedPayers.value.includes(p.id))
            .forEach(p => finalPayerMap.set(p.id, p));
    } else if (payerMode.value === "group") {
        if (selectedGroups.value.length === 0) {
            return { success: false, message: "Pilih minimal 1 Kelompok Payer", payload: null };
        }
        payerGroups.value
            .filter(g => selectedGroups.value.includes(g.id))
            .flatMap(g => g.members)
            .forEach(p => finalPayerMap.set(p.id, p));
    }

    const finalPayers = Array.from(finalPayerMap.values());

    if (finalPayers.length === 0) {
        return { success: false, message: "Tidak ada Payer yang valid untuk digenerate", payload: null };
    }

    const bulkPayloadArray = [];

    finalPayers.forEach(payer => {
        templateDetails.value.forEach(item => {
            bulkPayloadArray.push({
                payer_id: payer.id,
                payment_template_detail_id: item.id,
                discount_id: null,
            });
        });
    });

    const finalBulkPayload = {
        plans: bulkPayloadArray
    };

    return { success: true, message: "Payload siap", payload: finalBulkPayload };
};

const processAndSaveTagihan = async () => {
    isProcessing.value = true;

    const { success, message, payload } = createBulkPayload();

    if (!success) {
        Swal.fire("Gagal", message, "warning");
        isProcessing.value = false;
        return;
    }

    const bulkPayloadArray = payload.plans;

    const confirmation = await Swal.fire({
        title: 'Konfirmasi Generate Tagihan',
        text: `Anda akan menyimpan ${bulkPayloadArray.length} tagihan ke sistem. Lanjutkan?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Simpan Tagihan',
        cancelButtonText: 'Batal',
    });

    if (!confirmation.isConfirmed) {
        isProcessing.value = false;
        return;
    }

    try {
        const response = await api.post('/bulk-insert-payment-plans', payload);

        isProcessing.value = false;

        if (response.data.success) {
            Swal.fire(
                "Berhasil!",
                `${bulkPayloadArray.length} Payment Plan berhasil disimpan ke sistem.`,
                "success"
            );
            resetForm();
        } else {
            Swal.fire({
                title: 'Gagal Menyimpan',
                text: response.data.message || 'Terjadi kesalahan saat menyimpan data secara bulk.',
                icon: 'error',
            });
        }
    } catch (error) {
        isProcessing.value = false;
        console.error("API Error saving BULK Payment Plans:", error);
        Swal.fire({
            title: 'Error Koneksi / Server',
            text: error.response?.data?.message || 'Gagal terhubung ke server saat bulk insert.',
            icon: 'error',
        });
    }
};

const getTemplateName = (templateId) => {
    const template = templates.value.find(t => t.id === templateId);
    return template ? template.name : 'Template Tidak Dikenal';
};

const loadMembersForSelectedGroups = async (groupIDs) => {
    if (payerMode.value !== 'group') return;

    isProcessing.value = true;
    try {
        const fetchPromises = groupIDs.map(async (groupId) => {
            const existingGroup = payerGroups.value.find(g => g.id === groupId);
            if (existingGroup && existingGroup.members && existingGroup.members.length > 0) {
                return null;
            }
            const members = await fetchGroupMembers(groupId);
            return { groupId, members };
        });

        const results = await Promise.all(fetchPromises);
        results.filter(r => r !== null).forEach(({ groupId, members }) => {
            payerGroups.value = payerGroups.value.map(g => {
                if (g.id === groupId) {
                    return { ...g, members: members };
                }
                return g;
            });
        });

    } catch (error) {
        console.error("Gagal memuat anggota untuk grup yang dipilih:", error);
    } finally {
        isProcessing.value = false;
    }
};

onMounted(async () => {
    await fetchDiscounts();
    await fetchTemplates();
    loadTemplateDetails();
});

watch(selectedGroups, (newGroupIDs) => {
    if (payerMode.value === 'group' && newGroupIDs.length > 0) {
        loadMembersForSelectedGroups(newGroupIDs);
    }
}, { deep: true });

watch(payerMode, (newMode) => {
    if (newMode === 'individual') {
        fetchIndividualPayers();
    } else if (newMode === 'group') {
        fetchGroupPayers();
    }
});
</script>
