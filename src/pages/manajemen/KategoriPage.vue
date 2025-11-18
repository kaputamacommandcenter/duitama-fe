<template>
  <div>
    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6"
    >
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Kategori</p>

        <div class="flex flex-wrap items-center gap-3">
          <select v-model="perPage" class="select select-bordered select-sm w-20">
            <option :value="5">5</option>
            <option :value="10">10</option>
            <option :value="20">20</option>
            <option :value="50">50</option>
          </select>
          
          <input
            v-model="search"
            type="text"
            class="input input-bordered input-sm w-56"
            placeholder="Cari kategori..."
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
                Nama Kategori
                <i 
                    class="fa-solid ml-1" 
                    :class="[
                        sortKey === 'nama' 
                            ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down') 
                            : 'fa-sort'
                    ]"
                ></i>
              </th>
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(kategori, index) in paginatedData"
              :key="kategori.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td>{{ kategori.nama }}</td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="openEditForm(kategori)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusKategori(kategori.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>

            <tr v-if="filteredAndSortedKategori.length === 0">
              <td colspan="3" class="text-center text-gray-500 py-4">
                Tidak ada kategori ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Menampilkan {{ paginatedData.length }} dari {{ filteredAndSortedKategori.length }} data
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
        <h3 class="font-bold text-lg mb-4">Tambah Kategori</h3>

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Nama Kategori</span>
          </label>
          <input
            v-model="namaBaru"
            type="text"
            placeholder="Masukkan nama kategori"
            class="input input-bordered w-full"
          />
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300 text-black" @click="closeFormTambah">
            Batal
          </button>

          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white"
            @click="simpanKategori"
          >
            Simpan
          </button>
        </div>
      </div>
    </dialog>

    <dialog class="modal" :open="openEdit">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit Kategori</h3>

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Nama Kategori</span>
          </label>
          <input
            v-model="editNama"
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
            @click="updateKategori"
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

/* ===== STATE ===== */
const search = ref("")
const currentPage = ref(1)
const perPage = ref(5) 

const openTambah = ref(false)
const openEdit = ref(false)

const namaBaru = ref("")
const editNama = ref("")
const editId = ref(null)

// State baru untuk sorting:
const sortKey = ref("nama") // Default sort berdasarkan 'nama'
const sortDirection = ref(1) // 1 = asc (A-Z), -1 = desc (Z-A)

const kategoriList = ref([
  { id: 1, nama: "UKT S1 SI&TI Pagi" },
  { id: 2, nama: "UKT S1 SI&TI Sore" },
  { id: 3, nama: "UKT S1 SI&TI Karyawan" },
  { id: 4, nama: "UKT D3 MI Pagi" },
  { id: 5, nama: "UKT D3 KA Pagi" },
  { id: 6, nama: "Biaya Pengembangan S1" },
  { id: 7, nama: "Biaya Pengembangan D3" },
  { id: 8, nama: "Biaya MOMB" },
  { id: 9, nama: "Biaya Seragam" },
  { id: 10, nama: "UKT S1 BD" },
])

/* ===== FILTERING & SORTING ===== */

// 1. Filtering (tetap sama)
const filteredKategori = computed(() =>
  kategoriList.value.filter((k) =>
    k.nama.toLowerCase().includes(search.value.toLowerCase())
  )
)

// 2. Gabungkan Filtering dan Sorting
const filteredAndSortedKategori = computed(() => {
  const data = [...filteredKategori.value] 

  if (sortKey.value) {
    data.sort((a, b) => {
      let aVal = a[sortKey.value]
      let bVal = b[sortKey.value]

      // Lakukan sorting string case-insensitive
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();

      if (aVal < bVal) return -1 * sortDirection.value
      if (aVal > bVal) return 1 * sortDirection.value
      return 0
    })
  }

  return data
})

/* ===== PAGINATION ===== */
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAndSortedKategori.value.length / perPage.value)) 
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredAndSortedKategori.value.slice(start, start + perPage.value) 
})

// Reset ke halaman 1 saat search atau perPage berubah
watch([search, perPage], () => { 
  currentPage.value = 1
})

/* ===== SORTING METHOD BARU (mirip ItemPembayaran) ===== */
const sortBy = (key) => {
  if (sortKey.value === key) {
    // Balik arah sorting jika tombol yang sama diklik
    sortDirection.value = sortDirection.value * -1
  } else {
    // Terapkan sorting baru dan reset arah ke asc
    sortKey.value = key
    sortDirection.value = 1
  }
  currentPage.value = 1 // Reset ke halaman 1 setelah sorting
}


/* ===========================
    TAMBAH KATEGORI + SWEETALERT
    =========================== */
const simpanKategori = async () => {
  if (!namaBaru.value.trim()) {
    return Swal.fire({
      icon: "warning",
      title: "Nama kategori wajib diisi!",
    })
  }

  kategoriList.value.push({
    id: Date.now(),
    nama: namaBaru.value,
  })

  closeFormTambah()

  Swal.fire({
    icon: "success",
    title: "Kategori berhasil ditambahkan!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormTambah = () => {
  openTambah.value = false
  namaBaru.value = ""
}


/* ===========================
    EDIT KATEGORI + SWEETALERT
    =========================== */
const openEditForm = (kategori) => {
  editId.value = kategori.id
  editNama.value = kategori.nama
  openEdit.value = true
}

const updateKategori = async () => {
  if (!editNama.value.trim()) {
    return Swal.fire({
      icon: "warning",
      title: "Nama kategori tidak boleh kosong!",
    })
  }

  kategoriList.value = kategoriList.value.map((k) =>
    k.id === editId.value ? { ...k, nama: editNama.value } : k
  )

  closeFormEdit()

  Swal.fire({
    icon: "success",
    title: "Kategori berhasil diperbarui!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormEdit = () => {
  openEdit.value = false
  editNama.value = ""
  editId.value = null
}

/* ===========================
    HAPUS KATEGORI + CONFIRMATION
    =========================== */
const hapusKategori = async (id) => {
  const result = await Swal.fire({
    title: "Hapus Kategori?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  })

  if (result.isConfirmed) {
    kategoriList.value = kategoriList.value.filter((k) => k.id !== id)

    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }

    Swal.fire({
      icon: "success",
      title: "Kategori berhasil dihapus!",
      timer: 1500,
      showConfirmButton: false,
    })
  }
}
</script>