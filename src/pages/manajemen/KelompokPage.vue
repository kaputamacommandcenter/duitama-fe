<template>
  <div>
    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6"
    >
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Kelompok</p>

        <div class="flex flex-wrap items-center gap-3">
          <select v-model="perPage" class="select select-bordered select-sm w-20">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
          </select>

          <input
            v-model="search"
            type="text"
            class="input input-bordered input-sm w-56"
            placeholder="Cari kelompok..."
          />

          <button
            class="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            @click="openTambah = true"
          >
            <i class="fa-solid fa-plus mr-1"></i> Tambah
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="table w-full">
          <thead>
            <tr class="bg-blue-50 text-blue-900">
              <th class="w-12 text-center">No</th>
              <th @click="sortBy('nama')" class="cursor-pointer">
                Nama Kelompok
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'nama'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(kelompok, index) in paginatedData"
              :key="kelompok.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td>
                <RouterLink :to="`kelompok/detail/${kelompok.id}`" class="text-blue-600 hover:underline">
                  {{ kelompok.nama }}
                </RouterLink>
              </td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="openEditForm(kelompok)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusKelompok(kelompok.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredAndSortedKelompok.length === 0">
              <td colspan="3" class="text-center text-gray-500 py-4">
                Tidak ada data kelompok ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Menampilkan {{ paginatedData.length }} dari {{ filteredAndSortedKelompok.length }} data
        </div>

        <div class="flex items-center gap-2">
          <button
            class="btn btn-xs"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            « Prev
          </button>

          <span class="text-sm">
            Halaman {{ currentPage }} / {{ totalPages }}
          </span>

          <button
            class="btn btn-xs"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            Next »
          </button>
        </div>
      </div>
    </div>

    <dialog class="modal" :open="openTambah">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Tambah Kelompok Baru</h3>

        <div class="form-control mb-4">
          <label class="label"><span class="label-text">Nama Kelompok</span></label>
          <input
            v-model="formBaru.nama"
            type="text"
            placeholder="Contoh: SI&TI 2026 Pagi"
            class="input input-bordered w-full"
          />
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300 text-black" @click="closeFormTambah">
            Batal
          </button>

          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white"
            @click="simpanKelompok"
          >
            Simpan
          </button>
        </div>
      </div>
    </dialog>

    <dialog class="modal" :open="openEdit">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit Kelompok</h3>

        <div class="form-control mb-4">
          <label class="label"><span class="label-text">Nama Kelompok</span></label>
          <input
            v-model="formEdit.nama"
            type="text"
            class="input input-bordered w-full"
          />
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300" @click="closeFormEdit">
            Batal
          </button>

          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white"
            @click="updateKelompok"
          >
            Update
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>
<script setup>
import { ref, computed, watch } from "vue"
import Swal from "sweetalert2"
import { RouterLink } from 'vue-router'; // Wajib diimpor jika menggunakan <RouterLink>

/* ===== STATE DATA AWAL ===== */
const kelompokList = ref([
  { id: 1, nama: "SI&TI 2025 Pagi" },
  { id: 2, nama: "SI&TI 2025 Sore" },
  { id: 301, nama: "SI&TI 2025 Karyawan" }, // Diubah ID-nya agar unik
  { id: 302, nama: "BD 2025 Pagi" }, // Diubah ID-nya agar unik
  { id: 303, nama: "BD 2025 Sore" }, // Diubah ID-nya agar unik
  { id: 4, nama: "MI 2025" },
  { id: 6, nama: "KA 2025" },
])

/* ===== STATE UNTUK PENGATURAN TABEL ===== */
const search = ref("")
const currentPage = ref(1)
const perPage = ref(10) // Nilai default per halaman
const sortKey = ref(null)
const sortDirection = ref(1) // 1 = asc, -1 = desc

/* ===== STATE MODAL & FORM ===== */
const openTambah = ref(false)
const openEdit = ref(false)

const defaultForm = { id: null, nama: "" };
const formBaru = ref({ ...defaultForm })
const formEdit = ref({ ...defaultForm })

/* ===== FILTERING, SORTING, PAGINATION ===== */

// 1. Filtering
const filteredKelompok = computed(() => {
  if (!search.value) return kelompokList.value

  const term = search.value.toLowerCase()
  return kelompokList.value.filter((kelompok) =>
    kelompok.nama.toLowerCase().includes(term)
  )
})

// 2. Sorting
const filteredAndSortedKelompok = computed(() => {
  let data = [...filteredKelompok.value]
  if (sortKey.value) {
    data.sort((a, b) => {
      let aVal = a[sortKey.value]
      let bVal = b[sortKey.value]
      
      // Sorting string case-insensitive
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();

      if (aVal < bVal) return -1 * sortDirection.value
      if (aVal > bVal) return 1 * sortDirection.value
      return 0
    })
  }
  return data
})

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value * -1
  } else {
    // Default sorting untuk kolom 'nama' adalah ascending (1)
    sortKey.value = key
    sortDirection.value = 1 
  }
  currentPage.value = 1
}


// 3. Pagination
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAndSortedKelompok.value.length / perPage.value))
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredAndSortedKelompok.value.slice(start, start + perPage.value)
})

// Watcher untuk reset halaman saat filter/perPage berubah
watch([search, perPage], () => {
  currentPage.value = 1
})

/* ===========================
    TAMBAH KELOMPOK
    =========================== */
const simpanKelompok = async () => {
  if (!formBaru.value.nama.trim()) {
    return Swal.fire({
      icon: "warning",
      title: "Nama Kelompok wajib diisi!",
    })
  }

  kelompokList.value.push({
    id: Date.now(),
    nama: formBaru.value.nama,
  })

  closeFormTambah()

  Swal.fire({
    icon: "success",
    title: "Kelompok berhasil ditambahkan!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormTambah = () => {
  openTambah.value = false
  formBaru.value = { ...defaultForm }
}

/* ===========================
    EDIT KELOMPOK
    =========================== */
const openEditForm = (kelompok) => {
  formEdit.value = { ...kelompok }
  openEdit.value = true
}

const updateKelompok = async () => {
  if (!formEdit.value.nama.trim()) {
    return Swal.fire({
      icon: "warning",
      title: "Nama Kelompok tidak boleh kosong!",
    })
  }

  kelompokList.value = kelompokList.value.map((i) =>
    i.id === formEdit.value.id ? { ...formEdit.value } : i
  )

  closeFormEdit()

  Swal.fire({
    icon: "success",
    title: "Kelompok berhasil diperbarui!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormEdit = () => {
  openEdit.value = false
  formEdit.value = { ...defaultForm }
}

/* ===========================
    HAPUS KELOMPOK
    =========================== */
const hapusKelompok = async (id) => {
  const result = await Swal.fire({
    title: "Hapus Kelompok?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  })

  if (result.isConfirmed) {
    kelompokList.value = kelompokList.value.filter((i) => i.id !== id)

    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }

    Swal.fire({
      icon: "success",
      title: "Kelompok berhasil dihapus!",
      timer: 1500,
      showConfirmButton: false,
    })
  }
}
</script>