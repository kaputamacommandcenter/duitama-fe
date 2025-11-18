<template>
  <div>
    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6"
    >
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Potongan</p>

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
            placeholder="Cari potongan..."
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
                Nama Potongan
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'nama'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              <th @click="sortBy('periodeMulai')" class="cursor-pointer">
                Tahun Mulai
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'periodeMulai'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              <th @click="sortBy('periodeAkhir')" class="cursor-pointer">
                Tahun Akhir
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'periodeAkhir'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              <th @click="sortBy('nilaiPotongan')" class="cursor-pointer">
                Nilai Potongan
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'nilaiPotongan'
                      ? (sortDirection === 1 ? 'fa-sort-up' : 'fa-sort-down')
                      : 'fa-sort',
                  ]"
                ></i>
              </th>
              <th @click="sortBy('jenisPotongan')" class="cursor-pointer">
                Jenis Potongan
                <i
                  class="fa-solid ml-1"
                  :class="[
                    sortKey === 'jenisPotongan'
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
              v-for="(potongan, index) in paginatedData"
              :key="potongan.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td>{{ potongan.nama }}</td>
              <td>{{ potongan.periodeMulai }}</td>
              <td>{{ potongan.periodeAkhir }}</td>
              <td>
                <span v-if="potongan.jenisPotongan === 'Persentase'">{{
                  potongan.nilaiPotongan
                }}%</span>
                <span v-else>Rp {{ formatNominal(potongan.nilaiPotongan) }}</span>
              </td>
              <td>{{ potongan.jenisPotongan }}</td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="openEditForm(potongan)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusPotongan(potongan.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="filteredAndSortedPotongan.length === 0">
              <td colspan="7" class="text-center text-gray-500 py-4">
                Tidak ada data potongan ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Menampilkan {{ paginatedData.length }} dari {{ filteredAndSortedPotongan.length }} data
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
        <h3 class="font-bold text-lg mb-4">Tambah Potongan Baru</h3>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Nama Potongan</span></label>
          <input
            v-model="formBaru.nama"
            type="text"
            placeholder="Contoh: Beasiswa Tahfiz Al-Quran"
            class="input input-bordered w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="form-control">
            <label class="label"><span class="label-text">Tahun Mulai (Semester)</span></label>
            <input
              v-model.number="formBaru.periodeMulai"
              type="number"
              placeholder="Contoh: 1"
              class="input input-bordered w-full"
              min="1"
            />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Tahun Akhir (Semester)</span></label>
            <input
              v-model.number="formBaru.periodeAkhir"
              type="number"
              placeholder="Contoh: 4"
              class="input input-bordered w-full"
              :min="formBaru.periodeMulai || 1"
            />
          </div>
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Jenis Potongan</span></label>
          <select v-model="formBaru.jenisPotongan" class="select select-bordered w-full">
            <option disabled value="">Pilih Jenis</option>
            <option value="Persentase">Persentase (%)</option>
            <option value="Nominal">Nominal (Rp)</option>
          </select>
        </div>

        <div class="form-control mb-4" v-if="formBaru.jenisPotongan">
          <label class="label"><span class="label-text">
            Nilai Potongan ({{ formBaru.jenisPotongan === 'Persentase' ? '%' : 'Rp' }})
          </span></label>
          <input
            v-model.number="formBaru.nilaiPotongan"
            type="number"
            :placeholder="formBaru.jenisPotongan === 'Persentase' ? 'Contoh: 15' : 'Contoh: 500000'"
            class="input input-bordered w-full"
            :max="formBaru.jenisPotongan === 'Persentase' ? 100 : undefined"
            min="0"
          />
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300 text-black" @click="closeFormTambah">
            Batal
          </button>

          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white"
            @click="simpanPotongan"
          >
            Simpan
          </button>
        </div>
      </div>
    </dialog>

    <dialog class="modal" :open="openEdit">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit Potongan</h3>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Nama Potongan</span></label>
          <input
            v-model="formEdit.nama"
            type="text"
            class="input input-bordered w-full"
          />
        </div>

        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="form-control">
            <label class="label"><span class="label-text">Tahun Mulai (Semester)</span></label>
            <input
              v-model.number="formEdit.periodeMulai"
              type="number"
              class="input input-bordered w-full"
              min="1"
            />
          </div>
          <div class="form-control">
            <label class="label"><span class="label-text">Tahun Akhir (Semester)</span></label>
            <input
              v-model.number="formEdit.periodeAkhir"
              type="number"
              class="input input-bordered w-full"
              :min="formEdit.periodeMulai || 1"
            />
          </div>
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Jenis Potongan</span></label>
          <select v-model="formEdit.jenisPotongan" class="select select-bordered w-full">
            <option value="Persentase">Persentase (%)</option>
            <option value="Nominal">Nominal (Rp)</option>
          </select>
        </div>

        <div class="form-control mb-4" v-if="formEdit.jenisPotongan">
          <label class="label"><span class="label-text">
            Nilai Potongan ({{ formEdit.jenisPotongan === 'Persentase' ? '%' : 'Rp' }})
          </span></label>
          <input
            v-model.number="formEdit.nilaiPotongan"
            type="number"
            class="input input-bordered w-full"
            :max="formEdit.jenisPotongan === 'Persentase' ? 100 : undefined"
            min="0"
          />
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300" @click="closeFormEdit">
            Batal
          </button>

          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white"
            @click="updatePotongan"
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
const potonganList = ref([
  { id: 1, nama: "Alumni STMIK Kaputama / P3IK Kaputama", periodeMulai: 1, periodeAkhir: 1, nilaiPotongan: 20, jenisPotongan: "Persentase" },
  { id: 2, nama: "Saudara Kandung (Khusus S1) - Tahun Pertama", periodeMulai: 2, periodeAkhir: 4, nilaiPotongan: 15, jenisPotongan: "Persentase" },
  { id: 3, nama: "Saudara Kandung (Khusus S1) - Tahun Kedua sampai semester 8", periodeMulai: 2, periodeAkhir: 4, nilaiPotongan: 7.5, jenisPotongan: "Persentase" },
  { id: 4, nama: "Guru / Anak Guru (Khusus S1) - Tahun Pertama", periodeMulai: 1, periodeAkhir: 1, nilaiPotongan: 15, jenisPotongan: "Persentase" },
  { id: 5, nama: "Guru / Anak Guru (Khusus S1) - Tahun Kedua sampai semester 8", periodeMulai: 2, periodeAkhir: 4, nilaiPotongan: 7.5, jenisPotongan: "Persentase" },
  { id: 6, nama: "Mahasiswa Berprestasi Non Akademik Jalur Beasiswa", periodeMulai: 1, periodeAkhir: 4, nilaiPotongan: 10, jenisPotongan: "Persentase" },
  { id: 7, nama: "Beasiswa Tahfiz Al-Quran", periodeMulai: 1, periodeAkhir: 4, nilaiPotongan: 10, jenisPotongan: "Persentase" },
  { id: 8, nama: "Beasiswa Yatim Piatu", periodeMulai: 1, periodeAkhir: 4, nilaiPotongan: 10, jenisPotongan: "Persentase" },
  { id: 9, nama: "Siswa Berprestasi di Tiap Sekolah Ranking I", periodeMulai: 1, periodeAkhir: 1, nilaiPotongan: 400000, jenisPotongan: "Nominal" },
  { id: 10, nama: "Siswa Berprestasi di Tiap Sekolah Ranking II", periodeMulai: 1, periodeAkhir: 1, nilaiPotongan: 400000, jenisPotongan: "Nominal" },
  { id: 11, nama: "Siswa Berprestasi di Tiap Sekolah Ranking III", periodeMulai: 1, periodeAkhir: 1, nilaiPotongan: 300000, jenisPotongan: "Nominal" },
  { id: 12, nama: "Pendaftaran Sebelum Ujian SNMPTN/SBMPN", periodeMulai: 1, periodeAkhir: 1, nilaiPotongan: 15, jenisPotongan: "Persentase" },
  { id: 13, nama: "Pendaftaran Sebelum Ujian Akhir Sekolah", periodeMulai: 1, periodeAkhir: 1, nilaiPotongan: 30, jenisPotongan: "Persentase" },
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

const defaultForm = { id: null, nama: "", periodeMulai: 1, periodeAkhir: 1, nilaiPotongan: 0, jenisPotongan: "" };
const formBaru = ref({ ...defaultForm })
const formEdit = ref({ ...defaultForm })

/* ===== FUNGSIONALITAS UMUM ===== */
const formatNominal = (value) => {
  return value ? value.toLocaleString("id-ID") : "0";
}

/* ===== FILTERING, SORTING, PAGINATION ===== */

// 1. Filtering
const filteredPotongan = computed(() => {
  if (!search.value) return potonganList.value

  const term = search.value.toLowerCase()
  return potonganList.value.filter((potongan) =>
    potongan.nama.toLowerCase().includes(term) ||
    String(potongan.nilaiPotongan).includes(term) ||
    potongan.jenisPotongan.toLowerCase().includes(term)
  )
})

// 2. Sorting
const filteredAndSortedPotongan = computed(() => {
  let data = [...filteredPotongan.value]
  if (sortKey.value) {
    data.sort((a, b) => {
      let aVal = a[sortKey.value]
      let bVal = b[sortKey.value]
      
      // Khusus untuk sorting string (nama, jenisPotongan)
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      // Khusus untuk sorting numerik (nilai, periode)
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * sortDirection.value;
      }

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
  Math.max(1, Math.ceil(filteredAndSortedPotongan.value.length / perPage.value))
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredAndSortedPotongan.value.slice(start, start + perPage.value)
})

// Watcher untuk reset halaman saat filter/perPage berubah
watch([search, perPage], () => {
  currentPage.value = 1
})

/* ===========================
    TAMBAH POTONGAN
    =========================== */

// Validasi form
const isFormValid = (form) => {
    return form.nama.trim() && 
           form.jenisPotongan && 
           form.nilaiPotongan > 0 && 
           form.periodeMulai >= 1 && 
           form.periodeAkhir >= form.periodeMulai;
}

const simpanPotongan = async () => {
  if (!isFormValid(formBaru.value)) {
    return Swal.fire({
      icon: "warning",
      title: "Validasi Gagal",
      text: "Pastikan semua kolom terisi dengan benar (termasuk nilai potongan > 0 dan periode akhir >= periode mulai).",
    })
  }

  // Khusus Persentase, batasi nilai maksimum 100
  if (formBaru.value.jenisPotongan === 'Persentase' && formBaru.value.nilaiPotongan > 100) {
      formBaru.value.nilaiPotongan = 100;
  }
  
  itemList.value.push({
    id: Date.now(),
    ...formBaru.value
  })

  closeFormTambah()

  Swal.fire({
    icon: "success",
    title: "Potongan berhasil ditambahkan!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormTambah = () => {
  openTambah.value = false
  formBaru.value = { ...defaultForm }
}

/* ===========================
    EDIT POTONGAN
    =========================== */
const openEditForm = (potongan) => {
  // Salin data potongan ke formEdit
  formEdit.value = { ...potongan }
  openEdit.value = true
}

const updatePotongan = async () => {
  if (!isFormValid(formEdit.value)) {
    return Swal.fire({
      icon: "warning",
      title: "Validasi Gagal",
      text: "Pastikan semua kolom terisi dengan benar.",
    })
  }
  
  // Khusus Persentase, batasi nilai maksimum 100
  if (formEdit.value.jenisPotongan === 'Persentase' && formEdit.value.nilaiPotongan > 100) {
      formEdit.value.nilaiPotongan = 100;
  }

  potonganList.value = potonganList.value.map((i) =>
    i.id === formEdit.value.id ? { ...formEdit.value } : i
  )

  closeFormEdit()

  Swal.fire({
    icon: "success",
    title: "Potongan berhasil diperbarui!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormEdit = () => {
  openEdit.value = false
  formEdit.value = { ...defaultForm }
}

/* ===========================
    HAPUS POTONGAN
    =========================== */
const hapusPotongan = async (id) => {
  const result = await Swal.fire({
    title: "Hapus Potongan?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  })

  if (result.isConfirmed) {
    potonganList.value = potonganList.value.filter((i) => i.id !== id)

    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }

    Swal.fire({
      icon: "success",
      title: "Potongan berhasil dihapus!",
      timer: 1500,
      showConfirmButton: false,
    })
  }
}
</script>