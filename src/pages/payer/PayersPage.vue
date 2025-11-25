<template>
  <div class="p-8 min-h-screen">
    <h1 class="text-2xl font-semibold mb-6">Kelola Data Pembayar (Payer)</h1>

    <div class="card bg-base-100 shadow-xl p-6">

      <!-- HEADER + AKSI -->
      <div class="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h2 class="text-xl font-medium">Daftar Pembayar</h2>

        <div class="flex flex-wrap gap-2">
          <button class="btn btn-warning btn-sm flex items-center gap-2 w-full md:w-auto" @click="openImportModal">
            <i class="fa-solid fa-file-import"></i> Import Data
          </button>

          <button class="btn btn-primary btn-sm flex items-center gap-2 w-full md:w-auto" @click="openAddForm">
            <i class="fa-solid fa-plus"></i> Tambah Payer
          </button>
        </div>
      </div>

      <!-- FILTER BAR -->
      <div class="flex flex-wrap gap-3 mb-4 justify-between">
        <!-- Per Page -->
        <select v-model.number="perPage" class="select select-bordered w-full md:w-40">
          <option :value="5">5 Data</option>
          <option :value="10">10 Data</option>
          <option :value="20">20 Data</option>
          <option :value="50">50 Data</option>
        </select>
        <div class="flex flex-wrap gap-2">
        <!-- Search -->
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari nama / NPM / email / kelompok ..."
          class="input input-bordered w-full md:w-64"
        />

        <!-- Sorting -->
        <select v-model="sortOrder" class="select select-bordered w-full md:w-40">
          <option value="asc">Sortir A-Z</option>
          <option value="desc">Sortir Z-A</option>
        </select>
        </div>
      </div>

      <!-- TABEL -->
      <div class="overflow-x-auto">
        <table class="table w-full table-zebra">
          <thead>
            <tr>
              <th>ID/NPM</th>
              <th @click="toggleSort" class="cursor-pointer flex items-center gap-2">
                Nama Lengkap
                <i :class="sortOrder === 'asc' ? 'fa-solid fa-arrow-down-a-z' : 'fa-solid fa-arrow-up-a-z'"></i>
              </th>
              <th>Tipe</th>
              <th>Prodi</th>
              <th>Email</th>
              <th>No. Telp</th>
              <th>Kelompok</th>
              <th>Aksi</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="isFetchingMainData">
              <td colspan="8" class="text-center py-8">
                <span class="loading loading-spinner loading-lg text-primary"></span>
                <p class="mt-2 text-gray-500">Memuat Data Pembayar...</p>
              </td>
            </tr>

            <tr v-else-if="pagedData.length === 0">
              <td colspan="8" class="text-center py-4 text-gray-500">
                Tidak ada data ditemukan.
              </td>
            </tr>

            <tr v-for="p in pagedData" :key="p.id">
              <td>
                <span class="font-bold">{{ p.identity_number || '-' }}</span><br />
                <span class="text-xs opacity-50">{{ p.npm || '-' }}</span>
              </td>

              <td>{{ p.payer_name }}</td>

              <td>
                <div class="badge">{{ p.payer_type }}</div>
              </td>

              <td>{{ p.study_program_code || '-' }}</td>
              <td>{{ p.email }}</td>
              <td>{{ p.phone_number }}</td>

              <td>
                <span v-if="p.payer_group_id && p.payer_group">
                  {{ p.payer_group.group_name }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>

              <td class="flex gap-2">
                <button class="btn btn-xs btn-warning btn-outline" @click="openEditForm(p)">
                  Edit
                </button>
                <button class="btn btn-xs btn-error btn-outline" @click="confirmDelete(p.id)">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION -->
      <div class="flex justify-center mt-4 gap-2">
        <button class="btn btn-sm" :disabled="page === 1" @click="page--">« Prev</button>

        <button
          v-for="i in totalPages"
          :key="i"
          class="btn btn-sm"
          :class="{ 'btn-primary': page === i }"
          @click="page = i"
        >
          {{ i }}
        </button>

        <button class="btn btn-sm" :disabled="page === totalPages" @click="page++">Next »</button>
      </div>
    </div>

    <!-- FORM MODAL -->
    <PayerFormModal
      :visible="modalVisible"
      :mode="formMode"
      :data="currentPayer"
      :payerGroups="payerGroups"
      :studyPrograms="dummyStudyPrograms"
      @close="closeModal"
      @saved="afterSave"
    />

    <!-- PERBAIKAN: IMPORT MODAL (menggunakan komponen terpisah) -->
    <ImportDataSIA
      v-if="importModalVisible"
      :visible="importModalVisible"
      @close="closeImportModal"
      @imported="afterSave"
    />
  </div>
</template>

<script>
import { api } from "../../api/config";
import Swal from "sweetalert2";
import PayerFormModal from "../../components/payer/PayerForm.vue";
import ImportDataSIA from "../../components/payer/ImportDataSIA.vue";

export default {
  components: { PayerFormModal, ImportDataSIA }, // Daftarkan komponen baru

  data() {
    return {
      payers: [],
      payerGroups: [],
      isFetchingMainData: false,

      modalVisible: false,
      formMode: "add",
      currentPayer: {},
      importModalVisible: false, // Digunakan untuk ImportDataSIA

      // Pagination + Sorting + Search
      searchQuery: "",
      sortOrder: "asc",
      perPage: 10,
      page: 1,

      dummyStudyPrograms: [
        "Teknik Informatika",
        "Sistem Informasi",
        "Manajemen",
        "Akuntansi",
        "Hukum",
      ],
    };
  },

  computed: {
    filteredData() {
      let q = this.searchQuery.toLowerCase();

      return this.payers.filter((p) => {
        return (
          p.payer_name.toLowerCase().includes(q) ||
          (p.npm || "").toLowerCase().includes(q) ||
          (p.email || "").toLowerCase().includes(q) ||
          (p.phone_number || "").toLowerCase().includes(q) ||
          (p.payer_group?.group_name || "").toLowerCase().includes(q)
        );
      });
    },

    sortedData() {
      return [...this.filteredData].sort((a, b) => {
        if (this.sortOrder === "asc") {
          return a.payer_name.localeCompare(b.payer_name);
        } else {
          return b.payer_name.localeCompare(a.payer_name);
        }
      });
    },

    pagedData() {
      const start = (this.page - 1) * this.perPage;
      return this.sortedData.slice(start, start + this.perPage);
    },

    totalPages() {
      return Math.ceil(this.sortedData.length / this.perPage);
    },
  },

  watch: {
    searchQuery() {
      this.page = 1;
    },
    perPage() {
      this.page = 1;
    },
  },

  methods: {
    toggleSort() {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    },

    async fetchPayers() {
      try {
        this.isFetchingMainData = true;
        const res = await api.get("payers");
        this.payers = res.data.data || [];
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Gagal memuat data payer!", "error");
      } finally {
        this.isFetchingMainData = false;
      }
    },

    openAddForm() {
      this.formMode = "add";
      this.currentPayer = {
        payer_name: "",
        identity_number: "",
        payer_type: "etc", // Set default type
        email: "",
        phone_number: "",
        payer_group_id: null,
        study_program_code: "",
      };
      this.modalVisible = true;
    },

    openEditForm(p) {
      this.formMode = "edit";
      this.currentPayer = JSON.parse(JSON.stringify(p));
      this.modalVisible = true;
    },

    closeModal() {
      this.modalVisible = false;
    },

    openImportModal() {
      this.importModalVisible = true;
    },
    
    closeImportModal() { // Metode baru untuk menutup modal import
      this.importModalVisible = false;
    },

    async confirmDelete(id) {
      Swal.fire({
        title: "Hapus Payer?",
        text: "Data yang sudah dihapus tidak dapat dikembalikan!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, hapus!",
        cancelButtonText: "Batal",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await api.delete(`payers/${id}`);
            this.payers = this.payers.filter((p) => p.id !== id);

            Swal.fire({
              icon: "success",
              title: "Berhasil!",
              text: "Data berhasil dihapus.",
              timer: 1500,
              showConfirmButton: false,
            });
          } catch (err) {
            console.error(err);
            Swal.fire({
              icon: "error",
              title: "Gagal!",
              text: "Tidak dapat menghapus data.",
            });
          }
        }
      });
    },

    async afterSave() {
      this.modalVisible = false;
      this.importModalVisible = false; // Tutup juga modal import jika dipanggil setelah import
      await this.fetchPayers();
    },
  },

  mounted() {
    this.fetchPayers();
  },
};
</script>