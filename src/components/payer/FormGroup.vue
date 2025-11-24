<template>
  <div class="modal" :class="{ 'modal-open': visible }">
    <div class="modal-box w-11/12 max-w-md">
      <h3 class="font-bold text-lg mb-4">
        {{ mode === "add" ? "Tambah Kelompok Baru" : "Edit Kelompok: " + formData.group_name }}
      </h3>

      <div class="space-y-4">
        <div>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Nama Kelompok</span></div>
            <input type="text" v-model="formData.group_name" class="input input-bordered w-full" required />
          </label>
        </div>

        <div>
          <label class="form-control w-full">
            <div class="label"><span class="label-text">Deskripsi (Opsional)</span></div>
            <input type="text" v-model="formData.description" class="input input-bordered w-full" />
          </label>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-outline" @click="emit('close')">Batal</button>

        <button class="btn btn-success" @click="submitForm" :disabled="!formData.group_name">
          Simpan Kelompok
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch, ref } from "vue"; 

const props = defineProps({
  visible: Boolean,
  mode: String,
  data: Object,
});

const emit = defineEmits(["save", "close"]);

const formData = ref({
  id: null,
  group_name: "",
  description: "",
});

watch(
  () => props.data,
  (v) => {
    formData.value = { ...v }; 
  },
  { immediate: true }
);

const submitForm = () => {
  emit("save", { ...formData.value });
};
</script>