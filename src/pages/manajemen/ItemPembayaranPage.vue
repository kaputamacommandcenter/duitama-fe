<template>
  <div>
    <div
      class="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-md p-6"
    >
      <div class="flex flex-col md:flex-row justify-between md:items-center gap-3 mb-4">
        <p class="text-gray-700 font-medium">Kelola Data Item Pembayaran</p>

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
            placeholder="Cari item/kategori..."
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
              <th @click="sortBy('kategori')" class="cursor-pointer">
                Kategori <i class="fa-solid fa-sort ml-1"></i>
              </th>
              <th @click="sortBy('nama')" class="cursor-pointer">
                Nama Item <i class="fa-solid fa-sort ml-1"></i>
              </th>
              <th @click="sortBy('nominal')" class="cursor-pointer">
                Nominal <i class="fa-solid fa-sort ml-1"></i>
              </th>
              <th @click="sortBy('taMasuk')" class="cursor-pointer">
                TA. Masuk <i class="fa-solid fa-sort ml-1"></i>
              </th>
              <th class="text-center w-32">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in paginatedData"
              :key="item.id"
              class="hover:bg-blue-50/60 transition"
            >
              <td class="text-center">{{ (currentPage - 1) * perPage + index + 1 }}</td>
              <td>{{ item.kategori }}</td>
              <td>{{ item.nama }}</td>
              <td>Rp {{ formatNominal(item.nominal) }}</td>
              <td>{{ item.taMasuk }}</td>
              <td class="text-center space-x-2">
                <button
                  class="btn btn-xs bg-yellow-500 hover:bg-yellow-600 text-white"
                  @click="openEditForm(item)"
                >
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button
                  class="btn btn-xs bg-red-600 hover:bg-red-700 text-white"
                  @click="hapusItem(item.id)"
                >
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>

            <tr v-if="filteredAndSortedItem.length === 0">
              <td colspan="6" class="text-center text-gray-500 py-4">
                Tidak ada item pembayaran ditemukan
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-600">
          Menampilkan {{ paginatedData.length }} dari {{ filteredAndSortedItem.length }} data
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
        <h3 class="font-bold text-lg mb-4">Tambah Item Pembayaran</h3>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Kategori</span></label>
          <select v-model="formBaru.kategori" class="select select-bordered w-full">
            <option disabled value="">Pilih Kategori</option>
            <option v-for="k in kategoriOptions" :key="k" :value="k">{{ k }}</option>
          </select>
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Nama Item</span></label>
          <input
            v-model="formBaru.nama"
            type="text"
            placeholder="Contoh: Cicilan 1, Biaya MOMB"
            class="input input-bordered w-full"
          />
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Nominal (Rp)</span></label>
          <input
            v-model.number="formBaru.nominal"
            type="number"
            placeholder="Contoh: 1000000"
            class="input input-bordered w-full"
          />
        </div>

        <div class="form-control mb-4">
          <label class="label"><span class="label-text">TA. Masuk</span></label>
          <input
            v-model="formBaru.taMasuk"
            type="text"
            placeholder="Contoh: 2025/2026"
            class="input input-bordered w-full"
          />
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300 text-black" @click="closeFormTambah">
            Batal
          </button>

          <button
            class="btn bg-blue-600 hover:bg-blue-700 text-white"
            @click="simpanItem"
          >
            Simpan
          </button>
        </div>
      </div>
    </dialog>

    <dialog class="modal" :open="openEdit">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit Item Pembayaran</h3>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Kategori</span></label>
          <select v-model="formEdit.kategori" class="select select-bordered w-full">
            <option v-for="k in kategoriOptions" :key="k" :value="k">{{ k }}</option>
          </select>
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Nama Item</span></label>
          <input
            v-model="formEdit.nama"
            type="text"
            class="input input-bordered w-full"
          />
        </div>

        <div class="form-control mb-3">
          <label class="label"><span class="label-text">Nominal (Rp)</span></label>
          <input
            v-model.number="formEdit.nominal"
            type="number"
            class="input input-bordered w-full"
          />
        </div>

        <div class="form-control mb-4">
          <label class="label"><span class="label-text">TA. Masuk</span></label>
          <input
            v-model="formEdit.taMasuk"
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
            @click="updateItem"
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
const itemList = ref([
  {id:1,kategori:"UKT S1 SI&TI Pagi",nama:"Cicilan 1",nominal:800000,taMasuk:"2025/2026"},
  {id:2,kategori:"UKT S1 SI&TI Pagi",nama:"Cicilan 2",nominal:1000000,taMasuk:"2025/2026"},
  {id:3,kategori:"UKT S1 SI&TI Pagi",nama:"Cicilan 3",nominal:1000000,taMasuk:"2025/2026"},
  {id:4,kategori:"UKT S1 SI&TI Pagi",nama:"Cicilan 4",nominal:900000,taMasuk:"2025/2026"},
  {id:5,kategori:"UKT S1 SI&TI Pagi",nama:"Cicilan 5",nominal:1000000,taMasuk:"2025/2026"},
  {id:6,kategori:"UKT S1 SI&TI Pagi",nama:"Cicilan 6",nominal:1000000,taMasuk:"2025/2026"},
  {id:7,kategori:"UKT S1 SI&TI Sore",nama:"Cicilan 1",nominal:1000000,taMasuk:"2025/2026"},
  {id:8,kategori:"UKT S1 SI&TI Sore",nama:"Cicilan 2",nominal:1000000,taMasuk:"2025/2026"},
  {id:9,kategori:"UKT S1 SI&TI Sore",nama:"Cicilan 3",nominal:1100000,taMasuk:"2025/2026"},
  {id:10,kategori:"UKT S1 SI&TI Sore",nama:"Cicilan 4",nominal:1000000,taMasuk:"2025/2026"},
  {id:11,kategori:"UKT S1 SI&TI Sore",nama:"Cicilan 5",nominal:1100000,taMasuk:"2025/2026"},
  {id:12,kategori:"UKT S1 SI&TI Sore",nama:"Cicilan 6",nominal:1000000,taMasuk:"2025/2026"},
  {id:13,kategori:"Biaya Pengembangan S1 (Pagi/Sore)",nama:"Pengembangan Cicilan 1",nominal:200000,taMasuk:"2025/2026"},
  {id:14,kategori:"Biaya Pengembangan S1 (Pagi/Sore)",nama:"Pengembangan Cicilan 2",nominal:150000,taMasuk:"2025/2026"},
  {id:15,kategori:"Biaya Pengembangan S1 (Pagi/Sore)",nama:"Pengembangan Cicilan 3",nominal:150000,taMasuk:"2025/2026"},
  {id:16,kategori:"Biaya Pengembangan S1 (Pagi/Sore)",nama:"Pengembangan Cicilan 4",nominal:150000,taMasuk:"2025/2026"},
  {id:17,kategori:"Biaya Pengembangan S1 (Pagi/Sore)",nama:"Pengembangan Cicilan 5",nominal:150000,taMasuk:"2025/2026"},
  {id:18,kategori:"Biaya Pengembangan S1 (Pagi/Sore)",nama:"Pengembangan Cicilan 6",nominal:200000,taMasuk:"2025/2026"},
  {id:19,kategori:"UKT S1 SI&TI Karyawan",nama:"Cicilan 1",nominal:1400000,taMasuk:"2025/2026"},
  {id:20,kategori:"UKT S1 SI&TI Karyawan",nama:"Cicilan 2",nominal:1300000,taMasuk:"2025/2026"},
  {id:21,kategori:"UKT S1 SI&TI Karyawan",nama:"Cicilan 3",nominal:1300000,taMasuk:"2025/2026"},
  {id:22,kategori:"UKT S1 SI&TI Karyawan",nama:"Cicilan 4",nominal:1400000,taMasuk:"2025/2026"},
  {id:23,kategori:"UKT S1 SI&TI Karyawan",nama:"Cicilan 5",nominal:1300000,taMasuk:"2025/2026"},
  {id:24,kategori:"UKT S1 SI&TI Karyawan",nama:"Cicilan 6",nominal:1300000,taMasuk:"2025/2026"},
  {id:25,kategori:"UKT D3 MI Pagi",nama:"Cicilan 1",nominal:280000,taMasuk:"2025/2026"},
  {id:26,kategori:"UKT D3 MI Pagi",nama:"Cicilan 2",nominal:380000,taMasuk:"2025/2026"},
  {id:27,kategori:"UKT D3 MI Pagi",nama:"Cicilan 3",nominal:380000,taMasuk:"2025/2026"},
  {id:28,kategori:"UKT D3 MI Pagi",nama:"Cicilan 4",nominal:280000,taMasuk:"2025/2026"},
  {id:29,kategori:"UKT D3 MI Pagi",nama:"Cicilan 5",nominal:900000,taMasuk:"2025/2026"},
  {id:30,kategori:"UKT D3 MI Pagi",nama:"Cicilan 6",nominal:900000,taMasuk:"2025/2026"},
  {id:31,kategori:"UKT D3 KA Pagi",nama:"Cicilan 1",nominal:280000,taMasuk:"2025/2026"},
  {id:32,kategori:"UKT D3 KA Pagi",nama:"Cicilan 2",nominal:380000,taMasuk:"2025/2026"},
  {id:33,kategori:"UKT D3 KA Pagi",nama:"Cicilan 3",nominal:380000,taMasuk:"2025/2026"},
  {id:34,kategori:"UKT D3 KA Pagi",nama:"Cicilan 4",nominal:280000,taMasuk:"2025/2026"},
  {id:35,kategori:"UKT D3 KA Pagi",nama:"Cicilan 5",nominal:380000,taMasuk:"2025/2026"},
  {id:36,kategori:"UKT D3 KA Pagi",nama:"Cicilan 6",nominal:900000,taMasuk:"2025/2026"},
  {id:37,kategori:"Biaya Pengembangan D3",nama:"Cicilan 1",nominal:200000,taMasuk:"2025/2026"},
  {id:38,kategori:"Biaya Pengembangan D3",nama:"Cicilan 2",nominal:100000,taMasuk:"2025/2026"},
  {id:39,kategori:"Biaya Pengembangan D3",nama:"Cicilan 3",nominal:100000,taMasuk:"2025/2026"},
  {id:40,kategori:"Biaya Pengembangan D3",nama:"Cicilan 4",nominal:100000,taMasuk:"2025/2026"},
  {id:41,kategori:"Biaya Pengembangan D3",nama:"Cicilan 5",nominal:100000,taMasuk:"2025/2026"},
  {id:42,kategori:"Biaya Pengembangan D3",nama:"Cicilan 6",nominal:200000,taMasuk:"2025/2026"},
  {id:43,kategori:"Biaya MOMB",nama:"Biaya MOMB",nominal:300000,taMasuk:"2025/2026"},
  {id:44,kategori:"Biaya Seragam (2 buah)",nama:"Biaya Seragam (2 buah)",nominal:350000,taMasuk:"2025/2026"},
  {id:45,kategori:"UKT S1 BD",nama:"Cicilan 1",nominal:840000,taMasuk:"2025/2026"},
  {id:46,kategori:"UKT S1 BD",nama:"Cicilan 2",nominal:840000,taMasuk:"2025/2026"},
  {id:47,kategori:"UKT S1 BD",nama:"Cicilan 3",nominal:840000,taMasuk:"2025/2026"},
  {id:48,kategori:"UKT S1 BD",nama:"Cicilan 4",nominal:840000,taMasuk:"2025/2026"},
  {id:49,kategori:"UKT S1 BD",nama:"Cicilan 5",nominal:840000,taMasuk:"2025/2026"},
  {id:50,kategori:"UKT S1 BD",nama:"Cicilan 6",nominal:840000,taMasuk:"2025/2026"},
]);

// Opsi Kategori untuk dropdown (diambil dari data unik yang sudah ada)
const kategoriOptions = computed(() => {
    const categories = new Set(itemList.value.map(item => item.kategori));
    return [...categories].sort();
});

/* ===== STATE UNTUK PENGATURAN TABEL ===== */
const search = ref("")
const currentPage = ref(1)
const perPage = ref(10) // Nilai default per halaman
const sortKey = ref(null)
const sortDirection = ref(1) // 1 = asc, -1 = desc

/* ===== STATE MODAL & FORM ===== */
const openTambah = ref(false)
const openEdit = ref(false)

const defaultForm = { id: null, kategori: "", nama: "", nominal: 0, taMasuk: "" };
const formBaru = ref({ ...defaultForm })
const formEdit = ref({ ...defaultForm })

/* ===== FUNGSIONALITAS UMUM ===== */
const formatNominal = (value) => {
  return value ? value.toLocaleString("id-ID") : "0";
}

/* ===== FILTERING, SORTING, PAGINATION ===== */

// 1. Filtering (Pencarian berdasarkan kategori, nama, nominal, atau TA. Masuk)
const filteredItem = computed(() => {
  if (!search.value) return itemList.value

  const term = search.value.toLowerCase()
  return itemList.value.filter((item) =>
    item.kategori.toLowerCase().includes(term) ||
    item.nama.toLowerCase().includes(term) ||
    String(item.nominal).includes(term) ||
    item.taMasuk.toLowerCase().includes(term)
  )
})

// 2. Sorting
const filteredAndSortedItem = computed(() => {
  let data = [...filteredItem.value]
  if (sortKey.value) {
    data.sort((a, b) => {
      let aVal = a[sortKey.value]
      let bVal = b[sortKey.value]
      
      // Khusus untuk string (kategori, nama, taMasuk)
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
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
    // Balik arah sorting jika tombol yang sama diklik
    sortDirection.value = sortDirection.value * -1
  } else {
    // Terapkan sorting baru dan reset arah ke asc
    sortKey.value = key
    sortDirection.value = 1
  }
  currentPage.value = 1 // Reset ke halaman 1 setelah sorting
}


// 3. Pagination
const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredAndSortedItem.value.length / perPage.value))
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredAndSortedItem.value.slice(start, start + perPage.value)
})

// Watcher untuk reset halaman saat filter/perPage berubah
watch([search, perPage], () => {
  currentPage.value = 1
})

/* ===========================
    TAMBAH ITEM
    =========================== */
const simpanItem = async () => {
  if (!formBaru.value.kategori || !formBaru.value.nama.trim() || !formBaru.value.nominal || !formBaru.value.taMasuk.trim()) {
    return Swal.fire({
      icon: "warning",
      title: "Semua kolom wajib diisi!",
    })
  }

  itemList.value.push({
    id: Date.now(),
    kategori: formBaru.value.kategori,
    nama: formBaru.value.nama,
    nominal: formBaru.value.nominal,
    taMasuk: formBaru.value.taMasuk,
  })

  closeFormTambah()

  Swal.fire({
    icon: "success",
    title: "Item berhasil ditambahkan!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormTambah = () => {
  openTambah.value = false
  formBaru.value = { ...defaultForm }
}

/* ===========================
    EDIT ITEM
    =========================== */
const openEditForm = (item) => {
  // Salin data item ke formEdit
  formEdit.value = { ...item }
  openEdit.value = true
}

const updateItem = async () => {
  if (!formEdit.value.kategori || !formEdit.value.nama.trim() || !formEdit.value.nominal || !formEdit.value.taMasuk.trim()) {
    return Swal.fire({
      icon: "warning",
      title: "Semua kolom wajib diisi!",
    })
  }

  itemList.value = itemList.value.map((i) =>
    i.id === formEdit.value.id ? { ...formEdit.value } : i
  )

  closeFormEdit()

  Swal.fire({
    icon: "success",
    title: "Item berhasil diperbarui!",
    timer: 1500,
    showConfirmButton: false,
  })
}

const closeFormEdit = () => {
  openEdit.value = false
  formEdit.value = { ...defaultForm }
}

/* ===========================
    HAPUS ITEM
    =========================== */
const hapusItem = async (id) => {
  const result = await Swal.fire({
    title: "Hapus Item Pembayaran?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  })

  if (result.isConfirmed) {
    itemList.value = itemList.value.filter((i) => i.id !== id)

    // Periksa apakah halaman saat ini kosong setelah penghapusan
    if (paginatedData.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }

    Swal.fire({
      icon: "success",
      title: "Item berhasil dihapus!",
      timer: 1500,
      showConfirmButton: false,
    })
  }
}
</script>