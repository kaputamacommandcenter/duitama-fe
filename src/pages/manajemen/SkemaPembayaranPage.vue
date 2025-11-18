<template>
  <div>
    <div class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6">
      
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Skema Pembayaran</p>

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
            placeholder="Cari skema..."
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
              <th @click="sortBy('namaKelompok')" class="cursor-pointer">
                Kelompok
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'namaKelompok'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              <th @click="sortBy('kategori')" class="cursor-pointer">
                Kategori
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'kategori'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              <th @click="sortBy('namaPotongan')" class="cursor-pointer">
                Jenis Potongan
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'namaPotongan'
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
              v-for="(skema, index) in paginatedData"
              :key="skema.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td>{{ skema.namaKelompok }}</td>
              <td>{{ skema.kategori }}</td>
              <td>{{ skema.namaPotongan }}</td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="openEditForm(skema)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusSkema(skema.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredAndSortedSkema.length === 0">
              <td colspan="5" class="text-center text-gray-500 py-4">
                Tidak ada data skema pembayaran ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Menampilkan {{ paginatedData.length }} dari {{ filteredAndSortedSkema.length }} data
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
        <h3 class="font-bold text-lg mb-4">Tambah Skema Pembayaran</h3>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Pilih Kelompok</span></label>
          <select v-model="formBaru.namaKelompok" class="select select-bordered w-full">
            <option disabled value="">Pilih Kelompok</option>
            <option v-for="k in kelompokOptions" :key="k" :value="k">{{ k }}</option>
          </select>
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Pilih Kategori Pembayaran</span></label>
          <select v-model="formBaru.kategori" class="select select-bordered w-full">
            <option disabled value="">Pilih Kategori</option>
            <option v-for="k in kategoriOptions" :key="k" :value="k">{{ k }}</option>
          </select>
        </div>

        <div class="form-control mb-4">
          <label class="label"><span class="label-text">Pilih Jenis Potongan</span></label>
          <select v-model="formBaru.namaPotongan" class="select select-bordered w-full">
            <option disabled value="">Pilih Potongan (atau '-')</option>
            <option v-for="p in potonganOptions" :key="p" :value="p">{{ p }}</option>
            <option value="-">- (Tanpa Potongan)</option>
          </select>
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300 text-black" @click="closeFormTambah">
            Batal
          </button>

          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white"
            @click="simpanSkema"
          >
            Simpan
          </button>
        </div>
      </div>
    </dialog>

    <dialog class="modal" :open="openEdit">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit Skema Pembayaran</h3>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Kelompok</span></label>
          <select v-model="formEdit.namaKelompok" class="select select-bordered w-full">
            <option v-for="k in kelompokOptions" :key="k" :value="k">{{ k }}</option>
          </select>
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Kategori Pembayaran</span></label>
          <select v-model="formEdit.kategori" class="select select-bordered w-full">
            <option v-for="k in kategoriOptions" :key="k" :value="k">{{ k }}</option>
          </select>
        </div>

        <div class="form-control mb-4">
          <label class="label"><span class="label-text">Jenis Potongan</span></label>
          <select v-model="formEdit.namaPotongan" class="select select-bordered w-full">
            <option v-for="p in potonganOptions" :key="p" :value="p">{{ p }}</option>
            <option value="-">- (Tanpa Potongan)</option>
          </select>
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300" @click="closeFormEdit">
            Batal
          </button>

          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white"
            @click="updateSkema"
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

/* ===== STATE DATA AWAL ===== */
const skemaPembayaranList = ref([
  {id: 1, namaKelompok: "SI&TI 2025 Pagi", kategori: "UKT S1 SI&TI Pagi", namaPotongan: "-"},
  {id: 2, namaKelompok: "SI&TI 2025 Pagi", kategori: "Biaya Pengembangan S1 (Pagi/Sore)", namaPotongan: "Alumni STMIK"},
  {id: 3, namaKelompok: "SI&TI 2025 Pagi", kategori: "Biaya MOMB", namaPotongan: "-"},
  {id: 4, namaKelompok: "SI&TI 2025 Sore", kategori: "UKT S1 SI&TI Sore", namaPotongan: "Beasiswa Tahfiz Al-Quran"},
  {id: 5, namaKelompok: "BD 2025 Pagi", kategori: "UKT S1 BD", namaPotongan: "-"},
  {id: 6, namaKelompok: "MI 2025", kategori: "UKT D3 MI Pagi", namaPotongan: "Siswa Berprestasi Ranking I"},
])

/* Dummy Options untuk Dropdown */
const kelompokOptions = ref([
    "SI&TI 2025 Pagi", 
    "SI&TI 2025 Sore", 
    "BD 2025 Pagi", 
    "MI 2025", 
    "KA 2025"
]);

const kategoriOptions = ref([
    "UKT S1 SI&TI Pagi", 
    "UKT S1 SI&TI Sore", 
    "UKT S1 BD", 
    "UKT D3 MI Pagi",
    "Biaya Pengembangan S1 (Pagi/Sore)",
    "Biaya MOMB",
    "Biaya Seragam (2 buah)"
]);

const potonganOptions = ref([
    "Alumni STMIK",
    "Saudara Kandung",
    "Guru / Anak Guru",
    "Beasiswa Tahfiz Al-Quran",
    "Siswa Berprestasi Ranking I",
    // Tambahkan potongan lain di sini
]);


/* ===== STATE UNTUK PENGATURAN TABEL ===== */
const search = ref("")
const currentPage = ref(1)
const perPage = ref(10) // Nilai default per halaman
const sortKey = ref(null)
const sortDirection = ref(1) // 1 = asc, -1 = desc

/* ===== STATE MODAL & FORM ===== */
const openTambah = ref(false)
const openEdit = ref(false)

const defaultForm = { id: null, namaKelompok: "", kategori: "", namaPotongan: "" };
const formBaru = ref({ ...defaultForm })
const formEdit = ref({ ...defaultForm })

/* ===== FILTERING, SORTING, PAGINATION ===== */

// 1. Filtering
const filteredSkema = computed(() => {
  if (!search.value) return skemaPembayaranList.value

  const term = search.value.toLowerCase()
  return skemaPembayaranList.value.filter((skema) =>
    skema.namaKelompok.toLowerCase().includes(term) ||
    skema.kategori.toLowerCase().includes(term) ||
    skema.namaPotongan.toLowerCase().includes(term)
  )
})

// 2. Sorting
const filteredAndSortedSkema = computed(() => {
  let data = [...filteredSkema.value]
  if (sortKey.value) {
    data.sort((a, b) => {
      let aVal = a[sortKey.value] || ''
      let bVal = b[sortKey.value] || '' // Handle null/undefined values
      
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
    sortKey.value = key
    sortDirection.value = 1
  }
  currentPage.value = 1
}


// 3. Pagination
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAndSortedSkema.value.length / perPage.value))
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredAndSortedSkema.value.slice(start, start + perPage.value)
})

// Watcher untuk reset halaman saat filter/perPage berubah
watch([search, perPage], () => {
  currentPage.value = 1
})

/* ===========================
    TAMBAH SKEMA
    =========================== */

const isFormValid = (form) => {
    return form.namaKelompok.trim() && 
           form.kategori.trim() && 
           form.namaPotongan.trim();
}

const simpanSkema = async () => {
  if (!isFormValid(formBaru.value)) {
    return Swal.fire({
      icon: "warning",
      title: "Validasi Gagal",
      text: "Pastikan semua kolom Kelompok, Kategori, dan Potongan telah dipilih/diisi.",
    })
  }

  // Cek duplikasi (optional, disarankan di backend)
  const isDuplicate = skemaPembayaranList.value.some(s => 
      s.namaKelompok === formBaru.value.namaKelompok &&
      s.kategori === formBaru.value.kategori &&
      s.namaPotongan === formBaru.value.namaPotongan
  );

  if (isDuplicate) {
    return Swal.fire({
      icon: "error",
      title: "Duplikasi Data",
      text: "Skema pembayaran dengan kombinasi ini sudah ada.",
    })
  }

  skemaPembayaranList.value.push({
    id: Date.now(),
    ...formBaru.value
  })

  closeFormTambah()

  Swal.fire({
    icon: "success",
    title: "Skema berhasil ditambahkan!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormTambah = () => {
  openTambah.value = false
  formBaru.value = { ...defaultForm }
}

/* ===========================
    EDIT SKEMA
    =========================== */
const openEditForm = (skema) => {
  // Salin data skema ke formEdit
  formEdit.value = { ...skema }
  openEdit.value = true
}

const updateSkema = async () => {
  if (!isFormValid(formEdit.value)) {
    return Swal.fire({
      icon: "warning",
      title: "Validasi Gagal",
      text: "Pastikan semua kolom telah dipilih/diisi.",
    })
  }

  // Cek duplikasi (optional, disarankan di backend, cek selain ID saat ini)
  const isDuplicate = skemaPembayaranList.value.some(s => 
      s.id !== formEdit.value.id &&
      s.namaKelompok === formEdit.value.namaKelompok &&
      s.kategori === formEdit.value.kategori &&
      s.namaPotongan === formEdit.value.namaPotongan
  );
  
  if (isDuplicate) {
    return Swal.fire({
      icon: "error",
      title: "Duplikasi Data",
      text: "Skema pembayaran dengan kombinasi ini sudah ada pada entri lain.",
    })
  }

  skemaPembayaranList.value = skemaPembayaranList.value.map((i) =>
    i.id === formEdit.value.id ? { ...formEdit.value } : i
  )

  closeFormEdit()

  Swal.fire({
    icon: "success",
    title: "Skema berhasil diperbarui!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormEdit = () => {
  openEdit.value = false
  formEdit.value = { ...defaultForm }
}

/* ===========================
    HAPUS SKEMA
    =========================== */
const hapusSkema = async (id) => {
  const result = await Swal.fire({
    title: "Hapus Skema Pembayaran?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  })

  if (result.isConfirmed) {
    skemaPembayaranList.value = skemaPembayaranList.value.filter((i) => i.id !== id)

    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }

    Swal.fire({
      icon: "success",
      title: "Skema berhasil dihapus!",
      timer: 1500,
      showConfirmButton: false,
    })
  }
}
</script>