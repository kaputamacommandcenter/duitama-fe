<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Kelola Kelompok Payer</h1>

    <div class="card bg-base-100 shadow-xl p-6">
      <div class="flex flex-wrap justify-between items-center md:flex-nowrap gap-3 mb-4">
        <h2 class="text-xl font-medium">Daftar Kelompok</h2>

        <button class="btn btn-primary btn-sm w-full md:w-auto" @click="openForm('add')">
          Tambah Kelompok
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr>
              <th>Nama Kelompok</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="g in payerGroups" :key="g.id">
              <td>{{ g.group_name }}</td>
              <td>{{ g.description || '-' }}</td>
              <td>
                <router-link
                  :to="{ name: 'payer-group-detail', params: { id: g.id } }"
                  class="btn btn-xs btn-info btn-outline mr-2"
                >
                  Detail Anggota
                </router-link>

                <button class="btn btn-xs btn-warning btn-outline mr-2" @click="openForm('edit', g)">
                  Edit
                </button>

                <button class="btn btn-xs btn-error btn-outline" @click="confirmDelete(g.id)">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <FormGroup
      v-if="modalVisible" 
      :visible="modalVisible"
      :mode="formMode"
      :data="currentGroup"
      @save="saveGroup"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import Swal from "sweetalert2";
import { ref, onMounted } from "vue";
import { api } from "../../api/config";
import FormGroup from "../../components/payer/FormGroup.vue";

const payerGroups = ref([]);

const modalVisible = ref(false);
const formMode = ref("add");

const currentGroup = ref({
  id: null,
  group_name: "",
  description: "",
});

// === LOAD DATA ===
const loadPayerGroups = async () => {
  try {
    const res = await api.get("payer-groups");
    payerGroups.value = res.data.data || res.data;
  } catch (err) {
    Swal.fire("Error", "Gagal memuat data kelompok payer.", "error");
  }
};

onMounted(loadPayerGroups);

// === OPEN FORM ===
const openForm = (mode, group = null) => {
  formMode.value = mode;

  currentGroup.value = group
    ? { ...group }
    : { id: null, group_name: "", description: "" };

  modalVisible.value = true;
};

// === CLOSE ===
const closeModal = () => {
  modalVisible.value = false;
};

// === SAVE GROUP ===
const saveGroup = async (data) => {
  try {
    if (formMode.value === "add") {
      await api.post("payer-groups", data);
      Swal.fire("Berhasil", "Kelompok berhasil ditambahkan", "success");
    } else {
      await api.put(`payer-groups/${data.id}`, data);
      Swal.fire("Berhasil", "Kelompok berhasil diperbarui", "success");
    }

    modalVisible.value = false;
    loadPayerGroups();
  } catch (err) {
    Swal.fire("Error", "Gagal menyimpan data", "error");
  }
};

// === DELETE ===
const confirmDelete = (id) => {
  Swal.fire({
    title: "Hapus Kelompok?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya",
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        await api.delete(`payer-groups/${id}`);
        Swal.fire("Terhapus!", "Kelompok berhasil dihapus", "success");
        loadPayerGroups();
      } catch (err) {
        Swal.fire("Error", "Gagal menghapus", "error");
      }
    }
  });
};
</script>