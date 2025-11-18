<template>
  <div class="p-4 md:p-8 min-h-screen bg-gray-50">
    <h1 class="text-2xl font-bold text-gray-800 mb-8">Profil Pengguna</h1>
    
    <div class="max-w-4xl mx-auto space-y-8">
      
      <div
        class="bg-white/90 backdrop-blur-md border border-gray-100 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center justify-between"
      >
        <div class="flex items-center gap-6">
          <div class="avatar">
            <div class="w-24 rounded-full border-2 border-indigo-400 shadow-md">
              <img src="/avatar_kasir.jpg" alt="Foto Profil" />
            </div>
          </div>

          <div>
            <h2 class="text-3xl font-extrabold text-gray-900 drop-shadow-sm">
              {{ userProfile.nama_lengkap }}
            </h2>
            <div class="flex items-center gap-2 mt-1">
              <span class="badge badge-outline badge-success font-semibold text-sm">
                {{ userProfile.status }}
              </span>
              <span class="text-sm text-gray-500">
                | Akses: {{ userProfile.hak_akses }}
              </span>
            </div>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <button 
            class="btn btn-sm bg-yellow-500 hover:bg-yellow-600 text-white shadow-md"
            @click="openEdit = true"
          >
            <i class="fa-solid fa-pen"></i> Edit Profil
          </button>
          <button 
            class="btn btn-sm btn-outline btn-error"
            @click="openPassword = true"
          >
            <i class="fa-solid fa-lock"></i> Ubah Password
          </button>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="bg-white/90 border border-gray-100 rounded-xl shadow-lg p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-700 flex items-center gap-2 border-b pb-2 mb-3">
            <i class="fa-solid fa-address-book text-indigo-500"></i> Detail Kontak
          </h3>
          
          <div class="flex items-center gap-4">
            <i class="fa-solid fa-envelope text-indigo-500 w-4 h-4"></i>
            <div>
              <p class="text-sm text-gray-500">Email</p>
              <p class="font-medium text-gray-800">{{ userProfile.email }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <i class="fa-solid fa-phone text-indigo-500 w-4 h-4"></i>
            <div>
              <p class="text-sm text-gray-500">No. Telepon</p>
              <p class="font-medium text-gray-800">{{ userProfile.telepon }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white/90 border border-gray-100 rounded-xl shadow-lg p-6 space-y-4">
          <h3 class="text-lg font-bold text-gray-700 flex items-center gap-2 border-b pb-2 mb-3">
            <i class="fa-solid fa-user text-indigo-500"></i> Info Dasar
          </h3>
          
          <div class="flex items-center gap-4">
            <i class="fa-solid fa-id-card text-indigo-500 w-4 h-4"></i>
            <div>
              <p class="text-sm text-gray-500">Jenis Kelamin</p>
              <p class="font-medium text-gray-800">{{ userProfile.jenis_kelamin }}</p>
            </div>
          </div>

          <div class="flex items-center gap-4">
            <i class="fa-solid fa-map-marker-alt text-indigo-500 w-4 h-4"></i>
            <div>
              <p class="text-sm text-gray-500">Alamat</p>
              <p class="font-medium text-gray-800">{{ userProfile.alamat }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <dialog class="modal" :open="openEdit">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit Informasi Profil</h3>
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="openEdit = false">✕</button>

        <div class="space-y-3">
            <div class="form-control">
                <label class="label"><span class="label-text">Nama Lengkap</span></label>
                <input v-model="formEdit.nama_lengkap" type="text" placeholder="Nama Lengkap" class="input input-bordered w-full" />
            </div>

            <div class="form-control">
                <label class="label"><span class="label-text">Email</span></label>
                <input v-model="formEdit.email" type="email" placeholder="Email Aktif" class="input input-bordered w-full" />
            </div>
            
            <div class="grid grid-cols-2 gap-3">
                <div class="form-control">
                    <label class="label"><span class="label-text">No. Telepon</span></label>
                    <input v-model="formEdit.telepon" type="text" placeholder="08xx-xxxx-xxxx" class="input input-bordered w-full" />
                </div>
                <div class="form-control">
                    <label class="label"><span class="label-text">Jenis Kelamin</span></label>
                    <select v-model="formEdit.jenis_kelamin" class="select select-bordered w-full">
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </select>
                </div>
            </div>

            <div class="form-control">
                <label class="label"><span class="label-text">Alamat</span></label>
                <textarea v-model="formEdit.alamat" class="textarea textarea-bordered h-24 w-full" placeholder="Alamat lengkap"></textarea>
            </div>
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300 text-black" @click="closeFormEdit">
            Batal
          </button>
          <button
            class="btn bg-indigo-600 hover:bg-indigo-700 text-white"
            @click="simpanEditProfil"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </dialog>

    <dialog class="modal" :open="openPassword">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Ubah Password</h3>
        <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" @click="openPassword = false">✕</button>

        <div class="space-y-3">
            <div class="form-control">
                <label class="label"><span class="label-text">Password Lama</span></label>
                <input v-model="formPassword.old_password" type="password" placeholder="Masukkan password lama" class="input input-bordered w-full" />
            </div>
            <div class="form-control">
                <label class="label"><span class="label-text">Password Baru</span></label>
                <input v-model="formPassword.new_password" type="password" placeholder="Masukkan password baru" class="input input-bordered w-full" />
            </div>
            <div class="form-control">
                <label class="label"><span class="label-text">Konfirmasi Password Baru</span></label>
                <input v-model="formPassword.confirm_password" type="password" placeholder="Ulangi password baru" class="input input-bordered w-full" />
            </div>
        </div>

        <div class="modal-action">
          <button class="btn bg-gray-300 text-black" @click="openPassword = false">
            Batal
          </button>
          <button
            class="btn bg-indigo-600 hover:bg-indigo-700 text-white"
            @click="simpanPassword"
          >
            Ubah Password
          </button>
        </div>
      </div>
    </dialog>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import Swal from "sweetalert2"; // Import SweetAlert2

// Dummy data profil pengguna
const initialProfile = {
  nama_lengkap: 'Elli Budi Hartini, S.Kom',
  status: 'Aktif',
  email: 'ellibudihartini@gmail.com',
  jenis_kelamin: 'Perempuan',
  telepon: '0812-3456-7890',
  alamat: 'Jl. Merdeka No. 10, Binjai, Sumatera Utara',
  hak_akses: 'Kasir',
};

const userProfile = ref({ ...initialProfile });

/* ===== STATE MODAL & FORM ===== */
const openEdit = ref(false);
const openPassword = ref(false);

const formEdit = ref({ ...initialProfile });

const formPassword = ref({
    old_password: '',
    new_password: '',
    confirm_password: '',
});

/* ===== FUNGSI EDIT PROFIL ===== */
function closeFormEdit() {
    openEdit.value = false;
    // Reset form ke data profil saat ini
    formEdit.value = { ...userProfile.value };
}

function simpanEditProfil() {
    // 1. Validasi Sederhana
    if (!formEdit.value.nama_lengkap.trim() || !formEdit.value.email.trim()) {
        return Swal.fire({
            icon: "error",
            title: "Input Kosong",
            text: "Nama dan Email wajib diisi.",
        });
    }

    Swal.fire({
        title: "Simpan Perubahan?",
        text: "Anda yakin ingin menyimpan perubahan profil ini?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Simpan",
        cancelButtonText: "Batal",
    }).then((result) => {
        if (result.isConfirmed) {
            // Logika Update ke API di sini
            // await api.put('/profile', formEdit.value); 
            
            // Simulasikan update data lokal
            userProfile.value = { ...formEdit.value };
            closeFormEdit();

            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Profil Anda telah berhasil diperbarui.",
                timer: 1500,
                showConfirmButton: false,
            });
        }
    });
}

/* ===== FUNGSI UBAH PASSWORD ===== */
function simpanPassword() {
    const form = formPassword.value;
    
    // 1. Validasi Sederhana
    if (!form.old_password || !form.new_password || !form.confirm_password) {
        return Swal.fire({
            icon: "error",
            title: "Input Kosong",
            text: "Semua kolom password wajib diisi.",
        });
    }

    // 2. Cek Konfirmasi
    if (form.new_password !== form.confirm_password) {
        return Swal.fire({
            icon: "error",
            title: "Gagal",
            text: "Password baru dan konfirmasi password tidak cocok.",
        });
    }

    // 3. Validasi Kekuatan Password (Opsional)
    if (form.new_password.length < 6) {
         return Swal.fire({
            icon: "warning",
            title: "Password Lemah",
            text: "Password minimal harus 6 karakter.",
        });
    }


    Swal.fire({
        title: "Ubah Password?",
        text: "Password Anda akan segera diubah.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, Ubah",
        cancelButtonText: "Batal",
    }).then((result) => {
        if (result.isConfirmed) {
            // Logika Update Password ke API di sini
            // await api.post('/change-password', { old: form.old_password, new: form.new_password });

            // Reset Form dan Tutup Modal
            formPassword.value = { old_password: '', new_password: '', confirm_password: '' };
            openPassword.value = false;

            Swal.fire({
                icon: "success",
                title: "Berhasil!",
                text: "Password Anda telah berhasil diubah. Silahkan login kembali dengan password baru.",
                showConfirmButton: true,
            });
        }
    });
}

</script>