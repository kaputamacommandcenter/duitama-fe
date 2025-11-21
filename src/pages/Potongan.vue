<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Manajemen Potongan</h1>

    <div class="card bg-base-100 shadow-xl p-6">
      
      <div class="flex justify-between items-center mb-6">
        <div class="text-xl font-medium">Daftar Potongan</div>
        <button class="btn btn-primary" @click="openModalForAdd">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
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
              <td>{{ d.name }}</td>
              <td>
                <div class="badge" :class="d.type === 'percent' ? 'badge-info' : 'badge-success'">
                  {{ d.type === 'percent' ? 'Persentase' : 'Nominal' }}
                </div>
              </td>
              <td>
                {{ d.type === 'percent' ? `${d.value}%` : `Rp ${formatRupiah(d.value)}` }}
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
          <input type="text" v-model="form.name" required placeholder="Contoh: Potongan Pendaftar Awal" 
                 class="input input-bordered w-full" />
        </div>
        
        <div>
          <label class="label">
            <span class="label-text">Tipe Potongan</span>
          </label>
          <select v-model="form.type" required class="select select-bordered w-full">
            <option value="nominal">Nominal (Rp)</option>
            <option value="percent">Persentase (%)</option>
          </select>
        </div>

        <div>
          <label class="label">
            <span class="label-text">Nilai Potongan ({{ form.type === 'percent' ? '%' : 'Rp' }})</span>
          </label>
          <input type="number" v-model.number="form.value" required min="0" 
                 :max="form.type === 'percent' ? 100 : null"
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
</template>

<script setup>
import Swal from "sweetalert2";
import { ref } from "vue"; 

// =================== STATE MANAGEMENT =====================

const isModalOpen = ref(false); 
const isEditMode = ref(false); 

const initialForm = {
  id: null,
  name: "",
  type: "nominal", // 'nominal' atau 'percent'
  value: 0,
  is_active: true,
};

const form = ref({...initialForm});

// ======================= DUMMY DATA (Simulasi Data Disesuaikan dengan Ketentuan) =========================

const discounts = ref([
  // 1. Alumni
  { id: 101, name: "Potongan Alumni (Tahun Pertama)", type: "percent", value: 20, is_active: true },
  
  // 2. Saudara Kandung
  { id: 201, name: "Sdr Kandung - Lunas (Tahun Pertama)", type: "percent", value: 20, is_active: true },
  { id: 202, name: "Sdr Kandung - Cicil (Tahun Pertama)", type: "percent", value: 15, is_active: true },
  { id: 203, name: "Sdr Kandung - Lunas (Tahun 2 sd 8)", type: "percent", value: 10, is_active: true },
  { id: 204, name: "Sdr Kandung - Cicil (Tahun 2 sd 8)", type: "percent", value: 7.5, is_active: true },
  
  // 3. Guru/Anak Guru
  { id: 301, name: "Guru/Anak Guru - Lunas (Tahun Pertama)", type: "percent", value: 20, is_active: true },
  { id: 302, name: "Guru/Anak Guru - Cicil (Tahun Pertama)", type: "percent", value: 15, is_active: true },
  { id: 303, name: "Guru/Anak Guru - Lunas (Tahun 2 sd 8)", type: "percent", value: 10, is_active: true },
  { id: 304, name: "Guru/Anak Guru - Cicil (Tahun 2 sd 8)", type: "percent", value: 7.5, is_active: true },
  
  // 4. Mahasiswa Berprestasi Non Akademik
  { id: 401, name: "Mhs Berprestasi Non Akad.", type: "percent", value: 20, is_active: true },
  
  // 5. Jalur Beasiswa
  { id: 501, name: "Beasiswa Tahfidz Al-Quran", type: "percent", value: 10, is_active: true },
  { id: 502, name: "Beasiswa Difabel", type: "percent", value: 10, is_active: true },
  { id: 503, name: "Beasiswa Yatim Piatu", type: "percent", value: 10, is_active: true },
  
  // 6. Siswa Berprestasi di Tiap Sekolah (Nominal - asumsi potongan tunggal)
  { id: 601, name: "Siswa Berprestasi Ranking I", type: "nominal", value: 600000, is_active: true },
  { id: 602, name: "Siswa Berprestasi Ranking II", type: "nominal", value: 400000, is_active: true },
  { id: 603, name: "Siswa Berprestasi Ranking III", type: "nominal", value: 300000, is_active: true },
  
  // 7. Pendaftaran Sebelum Ujian SNMPTN/SBMPTN
  { id: 701, name: "Potongan Pra-SNMPTN/SBMPTN", type: "percent", value: 15, is_active: true },

  // 8. Pendaftaran Sebelum Ujian Akhir Sekolah
  { id: 801, name: "Potongan Pra-Ujian Sekolah", type: "percent", value: 30, is_active: true },

  // 9. Membayar Lunas Biaya Kuliah 1 Tahun
  { id: 901, name: "Potongan Bayar Lunas 1 Tahun", type: "percent", value: 20, is_active: true },
]);

// =================== METHODS =====================

const formatRupiah = (value) => new Intl.NumberFormat("id-ID").format(value);

const resetForm = () => {
  form.value = {...initialForm};
};

const openModalForAdd = () => {
  resetForm();
  isEditMode.value = false;
  isModalOpen.value = true;
};

const openModalForEdit = (discountData) => {
  form.value = {...discountData};
  isEditMode.value = true;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  resetForm(); 
};

const saveDiscount = () => {
  if (form.value.value <= 0) {
    Swal.fire("Gagal", "Nilai potongan harus lebih dari 0", "warning");
    return;
  }
  
  if (isEditMode.value) {
    // Logika Edit
    const index = discounts.value.findIndex(d => d.id === form.value.id);
    if (index !== -1) {
      discounts.value[index] = {...form.value};
      Swal.fire("Berhasil", "Potongan berhasil diubah!", "success");
    }
  } else {
    // Logika Tambah Baru
    const newId = Math.max(...discounts.value.map(d => d.id), 0) + 1;
    const newDiscount = {
      ...form.value,
      id: newId,
    };
    discounts.value.push(newDiscount);
    Swal.fire("Berhasil", "Potongan baru berhasil ditambahkan!", "success");
  }

  closeModal();
};

const deleteDiscount = (id) => {
  Swal.fire({
    title: 'Anda yakin?',
    text: "Potongan ini akan dihapus permanen!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  }).then((result) => {
    if (result.isConfirmed) {
      discounts.value = discounts.value.filter(d => d.id !== id);
      Swal.fire(
        'Dihapus!',
        'Potongan telah berhasil dihapus.',
        'success'
      );
    }
  });
};

</script>