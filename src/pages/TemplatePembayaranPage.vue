<template>
  <div class="p-2 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Kelola Template Pembayaran</h1>

    <div class="card bg-base-100 shadow-xl p-6">
      <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <h2 class="text-xl font-medium mb-3 md:mb-0">Daftar Template</h2> 
        <button class="btn btn-primary btn-sm w-full md:w-auto" @click="openForm('add')">
          <i class="fa fa-plus"></i>
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
import { ref, computed, onMounted } from "vue"; 
import { api } from '../api/config'; 

// =================== STATE MANAGEMENT =====================
const templates = ref([]); 
const templateDetails = ref({}); 

const formatRupiah = (value) => new Intl.NumberFormat("id-ID").format(value);

// =================== LOGIKA FETCH DATA =====================

const fetchTemplates = async () => {
  try {
    const response = await api.get('/payment-templates');
    const receivedTemplates = response.data.data; 

    const newTemplateDetails = {};
    const newTemplatesList = [];

    receivedTemplates.forEach(t => {
      newTemplateDetails[t.id] = t.details.map(detail => ({
        id: detail.id,
        billing_item_name: detail.name, 
        amount: detail.amount,
        due_date: detail.due_date || '', 
      }));

      newTemplatesList.push({
        id: t.id,
        name: t.name,
        description: t.description,
      });
    });
    
    templates.value = newTemplatesList;
    templateDetails.value = newTemplateDetails;

  } catch (error) {
    console.error("Gagal memuat template pembayaran:", error);
    Swal.fire('Error', 'Gagal memuat data template dari server.', 'error');
  }
};

onMounted(() => {
  fetchTemplates();
});


// =================== STATE MANAGEMENT FORM =====================
const modalVisible = ref(false);
const formMode = ref('add'); 

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
    billing_item_name: '',
    amount: 0,
    due_date: "", 
  });
};

const removeItem = (index) => {
  Swal.fire({
    title: 'Hapus Item Ini?',
    text: "Item tagihan akan dihapus dari template.",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus'
  }).then((result) => {
    if (result.isConfirmed) {
      currentTemplateDetails.value.splice(index, 1);

      Swal.fire(
        'Terhapus!',
        'Item tagihan berhasil dihapus.',
        'success'
      );
    }
  });
};

// Validasi Form
const isFormValid = computed(() => {
  if (!currentTemplate.value.name || currentTemplate.value.name.trim() === '') {
    return false;
  }
  if (currentTemplateDetails.value.length === 0) {
    return false;
  }
  return currentTemplateDetails.value.every(item => 
    item.billing_item_name && item.billing_item_name.trim() !== '' &&
    item.amount > 0 && 
    item.due_date && item.due_date.trim() !== ''
  );
});

// =================== LOGIKA SIMPAN & HAPUS API =====================

const saveTemplate = async () => {
  if (!isFormValid.value) {
    Swal.fire('Validasi Gagal', 'Harap lengkapi Nama Template, Nominal, dan semua Tanggal Jatuh Tempo dengan benar.', 'warning');
    return;
  }

  const templatePayload = {
    name: currentTemplate.value.name,
    description: currentTemplate.value.description,
    details: currentTemplateDetails.value.map(item => ({
      name: item.billing_item_name, 
      amount: item.amount,
      due_date: item.due_date, 
      ...(item.id > 0 && { id: item.id }) 
    }))
  };

  try {
    if (formMode.value === 'add') {
      await api.post('/payment-templates', templatePayload);
      Swal.fire('Berhasil!', `Template ${currentTemplate.value.name} berhasil ditambahkan.`, 'success');
    } else {
      await api.put(`/payment-templates/${currentTemplate.value.id}`, templatePayload);
      Swal.fire('Berhasil!', `Template ${currentTemplate.value.name} berhasil diperbarui.`, 'success');
    }

    closeModal();
    await fetchTemplates(); 

  } catch (error) {
    console.error("Gagal menyimpan template:", error);
    Swal.fire('Error', `Gagal menyimpan template. ${error.response?.data?.message || error.message}`, 'error');
  }
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
    }
  });
};

const deleteTemplate = async (id) => {
  try {
    await api.delete(`/payment-templates/${id}`);
    await fetchTemplates();
    
    Swal.fire(
      'Terhapus!',
      'Template berhasil dihapus.',
      'success'
    );
  } catch (error) {
    console.error("Gagal menghapus template:", error);
    Swal.fire('Error', `Gagal menghapus template. ${error.response?.data?.message || error.message}`, 'error');
  }
};
</script>