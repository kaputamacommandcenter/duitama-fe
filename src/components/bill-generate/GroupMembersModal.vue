<template>
  <input type="checkbox" id="modalMembers" class="modal-toggle" :checked="isVisible" />
  <div class="modal" :class="{'modal-open': isVisible}">
    <div class="modal-box w-11/12 max-w-2xl">
      <h3 class="font-bold text-lg mb-3">Anggota {{ activeGroup?.name }}</h3>

      <div class="max-h-96 overflow-y-auto">
        <table class="table w-full table-zebra table-compact">
          <thead>
            <tr>
              <th>ID Payer</th>
              <th>Nama</th>
              <th>Nomor Identitas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in activeGroup?.members" :key="m.id">
              <td>{{ m.id }}</td>
              <td>{{ m.name }}</td>
              <td>{{ m.identity_number }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="activeGroup?.members?.length === 0" class="text-center py-4 text-gray-500">
            Tidak ada anggota dalam kelompok ini.
        </p>
      </div>

      <div class="modal-action">
        <button class="btn" @click="$emit('close')">Tutup</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  isVisible: { type: Boolean, required: true },
  activeGroup: { type: Object, default: () => null },
});

const emit = defineEmits(['close']);
</script>