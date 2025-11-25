<template>
  <div>
    <input type="checkbox" id="modalPayerForm" class="modal-toggle" :checked="visible" />
    <div class="modal" :class="{'modal-open': visible}">
      <div class="modal-box w-11/12 max-w-lg">

        <h3 class="font-bold text-lg mb-4">
          {{ mode === 'add' ? 'Tambah Pembayar Baru' : 'Edit Pembayar: ' + (form.payer_name || '') }}
        </h3>

        <form @submit.prevent="submitForm" class="space-y-3">

          <!-- NAMA & ID -->
          <div class="grid grid-cols-2 gap-3">
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nama Lengkap</span></div>
              <input type="text" v-model="form.payer_name" class="input input-bordered w-full" required />
            </label>

            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nomor Identitas</span></div>
              <input type="text" v-model="form.identity_number" class="input input-bordered w-full" required />
            </label>
          </div>

          <!-- EMAIL -->
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Email</span></div>
            <input type="email" v-model="form.email" class="input input-bordered w-full" required />
          </label>

          <div class="grid grid-cols-2 gap-3">

            <!-- TELEPON -->
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Nomor Telepon</span></div>
              <input type="tel" v-model="form.phone_number" class="input input-bordered w-full" />
            </label>

            <!-- GROUP -->
            <label class="form-control w-full">
              <div class="label"><span class="label-text">Kelompok (Opsional)</span></div>
              <!-- Menggunakan payerGroups lokal yang dimuat dari API -->
              <select v-model="form.payer_group_id" class="select select-bordered w-full">
                <option :value="null">-- Tidak Ada Kelompok --</option>
                <!-- Menampilkan data kelompok yang dimuat -->
                <option v-for="g in localPayerGroups" :key="g.id" :value="g.id">{{ g.group_name }}</option>
              </select>
              <!-- Loading indicator untuk kelompok -->
              <div v-if="loadingGroups" class="label">
                <span class="label-text-alt loading loading-spinner loading-xs"></span>
                <span class="label-text-alt ml-2">Memuat kelompok...</span>
              </div>
            </label>
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-outline" @click="$emit('close')" :disabled="loading">
              Batal
            </button>
            <button type="submit" class="btn btn-success" :disabled="loading || loadingGroups">
              <span v-if="loading" class="loading loading-spinner"></span>
              {{ mode === 'add' ? 'Tambah Payer' : 'Simpan Perubahan' }}
            </button>
          </div>

        </form>

      </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, watch, onMounted } from "vue";
import Swal from "sweetalert2";
import { api } from "../../api/config"; // Asumsi path api/config.ts sudah benar

const props = defineProps({
  visible: Boolean,
  mode: String,
  data: Object,
  // Prop payerGroups dan studyPrograms kini bersifat opsional/tidak perlu jika dimuat di sini
  payerGroups: {
    type: Array,
    default: () => []
  },
  studyPrograms: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["close", "saved"]);

const loading = ref(false);
const loadingGroups = ref(false); // State untuk loading data kelompok
const localPayerGroups = ref([]); // State untuk menyimpan data kelompok

const form = reactive({
  id: null, // Tambahkan id di form
  payer_name: "",
  identity_number: "",
  payer_type: "etc",
  email: "",
  phone_number: "",
  payer_group_id: null,
});

// === LOAD PAYER GROUPS ===
const loadPayerGroups = async () => {
  loadingGroups.value = true;
  try {
    const res = await api.get("payer-groups");
    // Asumsi endpoint mengembalikan data di res.data.data atau res.data
    const groups = res.data.data || res.data;
    
    // Asumsi struktur data kelompok memiliki 'id' dan 'group_name'
    localPayerGroups.value = groups.map(g => ({
        id: g.id,
        group_name: g.group_name || g.name // Gunakan group_name atau name tergantung API
    }));

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Gagal Memuat Kelompok!",
      text: "Tidak dapat memuat daftar kelompok payer.",
    });
  } finally {
    loadingGroups.value = false;
  }
};

onMounted(() => {
    loadPayerGroups();
});


// Sync data → form
watch(
  () => props.data,
  (val) => {
    // Pastikan ID disetel untuk mode edit
    if (props.mode === "add") {
      form.id = null;
      form.payer_name = "";
      form.identity_number = "";
      form.payer_type = "etc";
      form.email = "";
      form.phone_number = "";
      form.payer_group_id = null;
    }

    if (props.mode === "edit" && val) {
      // Mode edit → isi data sesuai database
      // Pastikan payer_group_id disetel ke null jika null dari API, 
      // atau diubah ke string jika API mengembalikan angka/string
      Object.assign(form, {
          ...val,
          payer_group_id: val.payer_group_id || null // Pastikan null jika tidak ada
      });
    }
  },
  { immediate: true }
);

async function submitForm() {
  loading.value = true;
  
  // Pastikan payer_group_id adalah null jika user memilih opsi "Tidak Ada Kelompok"
  const payload = { ...form };
  if (payload.payer_group_id === "") {
      payload.payer_group_id = null;
  }

  try {
    let response;

    if (props.mode === "add") {
      response = await api.post("payers", payload);
    } else {
      response = await api.put(`payers/${form.id}`, payload);
    }

    Swal.fire({
      icon: "success",
      title: props.mode === "add" ? "Payer berhasil ditambahkan!" : "Perubahan berhasil disimpan!",
      timer: 1500,
      showConfirmButton: false
    });

    emit("saved", response.data.data); 
    emit("close");

  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Gagal menyimpan!",
      text: err.response?.data?.message || "Terjadi kesalahan."
    });
  }

  loading.value = false;
}
</script>