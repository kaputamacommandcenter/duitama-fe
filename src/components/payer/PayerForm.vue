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
              <select v-model="form.payer_group_id" class="select select-bordered w-full">
                <option :value="null">-- Tidak Ada Kelompok --</option>
                <option v-for="g in payerGroups" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
            </label>
          </div>

          <div class="modal-action">
            <button type="button" class="btn btn-outline" @click="$emit('close')" :disabled="loading">
              Batal
            </button>
            <button type="submit" class="btn btn-success" :disabled="loading">
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
import { reactive, ref, watch } from "vue";
import Swal from "sweetalert2";
import { api } from "../../api/config";

const props = defineProps({
  visible: Boolean,
  mode: String,
  data: Object,
  payerGroups: Array,
  studyPrograms: Array
});

const emit = defineEmits(["close", "saved"]);

const loading = ref(false);

const form = reactive({
  payer_name: "",
  identity_number: "",
  payer_type: "etc", // ✅ default awal
  email: "",
  phone_number: "",
  payer_group_id: null,
});

// Sync data → form
watch(
  () => props.data,
  (val) => {
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
      // ✅ Mode edit → isi data sesuai database
      Object.assign(form, val);
    }
  },
  { immediate: true }
);

async function submitForm() {
  loading.value = true;

  try {
    let response;

    if (props.mode === "add") {
      response = await api.post("payers", { ...form });
    } else {
        console.log(form);
      response = await api.put(`payers/${form.id}`, { ...form });
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
