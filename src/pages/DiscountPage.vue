<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Manajemen Potongan</h1>

    <div class="card bg-base-100 shadow-xl p-6">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div class="text-xl font-medium">Daftar Potongan</div>
        <button class="btn btn-primary w-full sm:w-auto" @click="openModalForAdd">
          <i class="fa fa-plus"></i>
          Tambah Potongan Baru
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table w-full table-zebra">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama Potongan</th>
              <th>Tipe</th>
              <th>Nilai</th>
              <th>Status Aktif</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in discounts" :key="d.id">
              <th>{{ d.id }}</th>
              <td>{{ d.description }}</td>
              <td>
                <div class="badge" :class="d.type === 'percentage' ? 'badge-info' : 'badge-success'">
                  {{ d.type === 'percentage' ? 'Persentase' : 'Nominal' }}
                </div>
              </td>
              <td>
                {{ d.type === 'percentage' ? `${d.value}%` : `Rp ${formatRupiah(d.value)}` }}
              </td>
              <td>
                <div class="badge" :class="d.is_active ? 'badge-primary' : 'badge-ghost'">
                  {{ d.is_active ? 'Aktif' : 'Nonaktif' }}
                </div>
              </td>
              <td class="flex gap-2">
                <button class="btn btn-sm btn-outline btn-info" @click="openModalForEdit(d)">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline btn-error" @click="deleteDiscount(d.id)">
                  Hapus
                </button>
              </td>
            </tr>
            <tr v-if="discounts.length === 0">
              <td colspan="6" class="text-center py-4 text-gray-500">
                Belum ada data Potongan.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <input type="checkbox" id="modalDiscount" class="modal-toggle" :checked="isModalOpen" />
    <div class="modal" :class="{'modal-open': isModalOpen}">
      <div class="modal-box">
        <h3 class="font-bold text-lg">{{ isEditMode ? 'Edit Potongan' : 'Tambah Potongan Baru' }}</h3>
        
        <form @submit.prevent="saveDiscount" class="py-4 space-y-4">

          <div>
            <label class="label">
              <span class="label-text">Nama Potongan</span>
            </label>
            <input type="text" v-model="form.description" required placeholder="Contoh: Potongan Awal Tahun" 
                   class="input input-bordered w-full" />
          </div>
          
          <div>
            <label class="label">
              <span class="label-text">Tipe Potongan</span>
            </label>
            <select v-model="form.type" required class="select select-bordered w-full">
              <option value="nominal">Nominal (Rp)</option>
              <option value="percentage">Persentase (%)</option>
            </select>
          </div>

          <div>
            <label class="label">
              <span class="label-text">Nilai Potongan ({{ form.type === 'percentage' ? '%' : 'Rp' }})</span>
            </label>
            <input type="number" v-model.number="form.value" required min="0" 
                   :max="form.type === 'percentage' ? 100 : null"
                   placeholder="Masukkan nilai potongan" class="input input-bordered w-full" />
          </div>
          
          <div class="form-control">
            <label class="label cursor-pointer justify-start gap-4">
              <span class="label-text">Aktifkan Potongan</span> 
              <input type="checkbox" v-model="form.is_active" class="toggle toggle-primary" />
            </label>
          </div>

          <div class="modal-action mt-6">
            <button type="button" class="btn btn-ghost" @click="closeModal">Batal</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Potongan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import Swal from "sweetalert2";
import { ref, onMounted } from "vue"; 
import { api } from "../api/config";

// =================== STATE =====================
const discounts = ref([]);
const isModalOpen = ref(false); 
const isEditMode = ref(false); 

const initialForm = {
  id: null,
  description: "", // sesuai response backend
  type: "nominal",
  value: 0,
  is_active: true,
};

const form = ref({...initialForm});

// =================== FORMATTER =====================
const formatRupiah = (value) => new Intl.NumberFormat("id-ID").format(value);

// =================== API CALLS =====================

// Load semua potongan
const loadDiscounts = async () => {
  try {
    const res = await api.get("/discounts");
    discounts.value = res.data.data;
  } catch (error) {
    console.error(error);
    Swal.fire("Error", "Gagal memuat data potongan", "error");
  }
};

// Tambah potongan (POST /discounts)
const createDiscount = async () => {
  try {
    await api.post("/discounts", form.value);
    Swal.fire("Berhasil", "Potongan berhasil ditambahkan!", "success");
    await loadDiscounts();
  } catch (error) {
    console.error(error);
    Swal.fire("Gagal", "Tidak dapat menambahkan potongan", "error");
  }
};

// Edit potongan (PUT /discounts/:id)
const updateDiscount = async () => {
  try {
    await api.put(`/discounts/${form.value.id}`, form.value);
    Swal.fire("Berhasil", "Potongan berhasil diperbarui!", "success");
    await loadDiscounts();
  } catch (error) {
    console.error(error);
    Swal.fire("Gagal", "Tidak dapat memperbarui potongan", "error");
  }
};

// Hapus potongan (DELETE /discounts/:id)
const deleteDiscount = (id) => {
  Swal.fire({
    title: "Yakin hapus?",
    text: "Data potongan akan terhapus permanen.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`/discounts/${id}`);
        Swal.fire("Dihapus!", "Potongan berhasil dihapus.", "success");
        await loadDiscounts();
      } catch (error) {
        console.error(error);
        Swal.fire("Gagal", "Tidak dapat menghapus potongan", "error");
      }
    }
  });
};

// =================== MODAL CONTROL =====================
const resetForm = () => {
  form.value = { ...initialForm };
};

const openModalForAdd = () => {
  resetForm();
  isEditMode.value = false;
  isModalOpen.value = true;
};

const openModalForEdit = (data) => {
  form.value = { ...data };
  isEditMode.value = true;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm();
};

// =================== SAVE HANDLER =====================
const saveDiscount = async () => {
  // Validasi tambahan
  if (form.value.value <= 0) {
    Swal.fire("Gagal", "Nilai potongan harus lebih dari 0", "warning");
    return;
  }
  // Tidak perlu validasi form.description karena sudah ada `required` di HTML

  if (isEditMode.value) {
    await updateDiscount();
  } else {
    // Dipanggil untuk proses Tambah Potongan Baru
    await createDiscount();
  }

  closeModal();
};

// =================== ON MOUNT =====================
onMounted(() => {
  loadDiscounts();
});
</script>