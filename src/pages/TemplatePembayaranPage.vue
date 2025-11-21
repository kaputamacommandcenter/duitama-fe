<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Kelola Template Pembayaran</h1>

    <div class="card bg-base-100 shadow-xl p-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-medium">Daftar Template</h2>
        <button class="btn btn-primary btn-sm" @click="openForm('add')">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          Tambah Template
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Nama Template</th>
              <th>Deskripsi</th>
              <th>Jumlah Item</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in templates" :key="t.id">
              <td>{{ t.name }}</td>
              <td>{{ t.description }}</td>
              <td>{{ templateDetails[t.id]?.length || 0 }}</td>
              <td>
                <button class="btn btn-xs btn-warning btn-outline mr-2" @click="openForm('edit', t)">Edit</button>
                <button class="btn btn-xs btn-error btn-outline" @click="confirmDelete(t.id)">Hapus</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <input type="checkbox" id="modalTemplateForm" class="modal-toggle" :checked="modalVisible" />
    
    <div class="modal" :class="{'modal-open': modalVisible}">
      <div class="modal-box w-11/12 max-w-4xl">
        <h3 class="font-bold text-lg mb-4">
          {{ formMode === 'add' ? 'Tambah Template Baru' : 'Edit Template: ' + currentTemplate.name }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nama Template</span></div>
              <input type="text" v-model="currentTemplate.name" class="input input-bordered w-full" required />
            </label>
          </div>
          <div>
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Deskripsi</span></div>
              <input type="text" v-model="currentTemplate.description" class="input input-bordered w-full" />
            </label>
          </div>
        </div>
        
        <hr class="my-6" />

        <h4 class="font-semibold text-md mb-3">Item Tagihan dalam Template:</h4>

        <div class="space-y-4 max-h-96 overflow-y-auto pr-2">
          <div v-for="(item, index) in currentTemplateDetails" :key="index"
               class="p-3 border rounded-lg flex flex-col md:flex-row gap-3 items-end">
            
            <label class="form-control w-full md:w-5/12">
              <span class="label-text text-xs">Nama Item</span>
              <input type="text" v-model="item.billing_item_name" class="input input-bordered input-sm" required />
            </label>
            
            <label class="form-control w-full md:w-3/12">
              <span class="label-text text-xs">Nominal (Rp)</span>
              <input type="number" v-model.number="item.amount" class="input input-bordered input-sm" required min="0"/>
            </label>
            
            <label class="form-control w-full md:w-3/12">
              <span class="label-text text-xs">Tanggal Jatuh Tempo</span>
              <input type="date" v-model="item.due_date" class="input input-bordered input-sm" required/>
            </label>
            
            <div class="md:w-auto w-full">
              <button class="btn btn-error btn-sm btn-outline w-full md:w-auto" @click="removeItem(index)">Hapus</button>
            </div>
          </div>
        </div>

        <button class="btn btn-sm btn-ghost mt-4" @click="addItem">
          + Tambah Item
        </button>

        <div class="modal-action">
          <button class="btn btn-outline" @click="closeModal">Batal</button>
          <button class="btn btn-success" @click="saveTemplate" :disabled="!isFormValid">
            Simpan Template
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import Swal from "sweetalert2";
import { ref, computed } from "vue";

// =================== STATE DUMMY DATA =====================
const templates = ref([
  { id: 1, name: "S1 Pagi - TA. 2025/2026", description: "Cicilan I + MOMB + Seragam" }, 
  { id: 2, name: "S1 Pagi - TA. 2025/2026", description: "Biaya Kuliah + Pengembangan Lengkap" }
]);

const templateDetails = ref({
  // TEMPLATE 1: DAFTAR ULANG (S1 PAGI) 
  1: [
    { id: 1, billing_item_id: 1, billing_item_name: "Biaya Kuliah - Cicilan I", amount: 800000, due_date: "2025-09-20" }, 
    { id: 2, billing_item_id: 2, billing_item_name: "Biaya Pengembangan - Cicilan I", amount: 200000, due_date: "2025-09-20" }, 
    { id: 3, billing_item_id: 3, billing_item_name: "Biaya MOMB", amount: 300000, due_date: "2025-09-20" }, 
    { id: 4, billing_item_id: 4, billing_item_name: "Biaya Seragam (2 Buah)", amount: 350000, due_date: "2025-09-20" }, 
  ],
  
  // TEMPLATE 2: CICILAN LENGKAP 5 Cicilan (S1 PAGI)
  2: [
    
    // Cicilan II
    { id: 12, billing_item_id: 12, billing_item_name: "Biaya Kuliah - Cicilan II", amount: 1000000, due_date: "2025-11-15" },
    { id: 13, billing_item_id: 13, billing_item_name: "Biaya Pengembangan - Cicilan II", amount: 150000, due_date: "2025-11-15" },
    
    // Cicilan III
    { id: 14, billing_item_id: 14, billing_item_name: "Biaya Kuliah - Cicilan III", amount: 1000000, due_date: "2025-12-15" },
    { id: 15, billing_item_id: 15, billing_item_name: "Biaya Pengembangan - Cicilan III", amount: 150000, due_date: "2025-12-15" },

    // Cicilan IV
    { id: 16, billing_item_id: 16, billing_item_name: "Biaya Kuliah - Cicilan IV", amount: 900000, due_date: "2026-01-15" },
    { id: 17, billing_item_id: 17, billing_item_name: "Biaya Pengembangan - Cicilan IV", amount: 150000, due_date: "2026-01-15" },

    // Cicilan V
    { id: 18, billing_item_id: 18, billing_item_name: "Biaya Kuliah - Cicilan V", amount: 1000000, due_date: "2026-02-15" },
    { id: 19, billing_item_id: 19, billing_item_name: "Biaya Pengembangan - Cicilan V", amount: 150000, due_date: "2026-02-15" },

    // Cicilan VI
    { id: 20, billing_item_id: 20, billing_item_name: "Biaya Kuliah - Cicilan VI", amount: 1000000, due_date: "2026-03-15" },
    { id: 21, billing_item_id: 21, billing_item_name: "Biaya Pengembangan - Cicilan VI", amount: 200000, due_date: "2026-03-15" },
  ]
});

// Helper untuk format Rupiah
const formatRupiah = (value) => new Intl.NumberFormat("id-ID").format(value);

// =================== STATE MANAGEMENT FORM =====================
const modalVisible = ref(false);
const formMode = ref('add'); // 'add' atau 'edit'

const currentTemplate = ref({ id: null, name: '', description: '' });
const currentTemplateDetails = ref([]);

let tempIdCounter = -1;

// =================== LOGIKA FORM =====================

const openForm = (mode, template = null) => {
  formMode.value = mode;

  if (mode === 'add') {
    currentTemplate.value = { id: null, name: '', description: '' };
    currentTemplateDetails.value = [];
    addItem(); 
  } else {
    currentTemplate.value = { ...template };
    currentTemplateDetails.value = templateDetails.value[template.id] ? 
      JSON.parse(JSON.stringify(templateDetails.value[template.id])) : [];
  }
  
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

const addItem = () => {
  currentTemplateDetails.value.push({
    id: tempIdCounter--, 
    billing_item_id: tempIdCounter, 
    billing_item_name: '',
    amount: 0,
    due_date: "", 
  });
};

const removeItem = (index) => {
  currentTemplateDetails.value.splice(index, 1);
};

// Validasi Form
const isFormValid = computed(() => {
  if (!currentTemplate.value.name || currentTemplate.value.name.trim() === '') {
    return false;
  }
  if (currentTemplateDetails.value.length === 0) {
    return false;
  }
  // Pastikan semua detail item terisi valid
  return currentTemplateDetails.value.every(item => 
    item.billing_item_name && item.billing_item_name.trim() !== '' &&
    item.amount > 0 && 
    item.due_date && item.due_date.trim() !== ''
  );
});

const saveTemplate = () => {
  if (!isFormValid.value) {
    Swal.fire('Validasi Gagal', 'Harap lengkapi Nama Template, Nominal, dan semua Tanggal Jatuh Tempo dengan benar.', 'warning');
    return;
  }
  
  // 1. Logika Simpan Template (Header)
  if (formMode.value === 'add') {
    const newId = templates.value.length ? Math.max(...templates.value.map(t => t.id)) + 1 : 1;
    currentTemplate.value.id = newId;
    templates.value.push({ ...currentTemplate.value });
  } else {
    const index = templates.value.findIndex(t => t.id === currentTemplate.value.id);
    if (index !== -1) {
      templates.value[index] = { ...currentTemplate.value };
    }
  }

  // 2. Logika Simpan Detail Template
  const templateId = currentTemplate.value.id;
  
  const finalDetails = currentTemplateDetails.value.map(item => {
    if (item.id < 0) {
      return { 
        ...item, 
        id: null, 
        billing_item_id: null 
      };
    }
    return item;
  });
  
  templateDetails.value[templateId] = finalDetails;

  Swal.fire('Berhasil!', `Template ${currentTemplate.value.name} berhasil disimpan.`, 'success');
  closeModal();
};

const confirmDelete = (id) => {
  Swal.fire({
    title: 'Apakah Anda Yakin?',
    text: "Anda tidak akan bisa mengembalikan template ini!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteTemplate(id);
      Swal.fire(
        'Terhapus!',
        'Template berhasil dihapus.',
        'success'
      );
    }
  });
};

const deleteTemplate = (id) => {
  const index = templates.value.findIndex(t => t.id === id);
  if (index !== -1) {
    templates.value.splice(index, 1);
  }
  delete templateDetails.value[id];
};

</script>