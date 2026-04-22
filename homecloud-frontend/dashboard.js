const API_URL = 'http://10.18.124.23:3000';
const token = localStorage.getItem('token');

// Kalo ga ada tiket, tendang ke login!
if (!token) {
    window.location.href = 'index.html';
}

const fileContainer = document.getElementById('fileContainer');
const btnUpload = document.getElementById('btnUpload');
const fileInput = document.getElementById('fileInput');

// ==========================================
// 1. NAMPILIN DAFTAR FILE (GET /files)
// ==========================================
async function loadFiles() {
    try {
        const response = await fetch(`${API_URL}/files`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();

        // Kalo database kosong
        if (data.data.length === 0) {
            fileContainer.innerHTML = `
                <div class="text-center p-10 bg-white rounded-xl border">
                    <span class="material-symbols-outlined text-6xl text-gray-300">folder_open</span>
                    <h3 class="text-xl font-bold mt-2 text-gray-700">Gudang Kosong Lerr!</h3>
                    <p class="text-gray-500">Mulai upload file lu sekarang.</p>
                </div>`;
            return;
        }

        // Kalo ada isinya, kita cetak HTML-nya!
        let htmlContent = '';
        data.data.forEach(file => {
            htmlContent += `
                <div class="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-[#eff4ff] text-[#3525cd] rounded-lg flex items-center justify-center">
                            <span class="material-symbols-outlined">description</span>
                        </div>
                        <div>
                            <p class="font-bold text-gray-800">${file.filename}</p>
                            <p class="text-xs text-gray-500">Diupload: ${new Date(file.uploaded_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="downloadFile(${file.id}, '${file.filename}')" class="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg font-bold transition-colors">Download</button>
                        <button onclick="deleteFile(${file.id})" class="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg font-bold transition-colors">Hapus</button>
                    </div>
                </div>
            `;
        });
        fileContainer.innerHTML = htmlContent;

    } catch (error) {
        console.error("Gagal narik data:", error);
    }
}

// ==========================================
// 2. UPLOAD FILE (POST /upload)
// ==========================================
// Pas tombol biru diklik, pura-pura ngeklik input file yang di-hidden
btnUpload.addEventListener('click', () => fileInput.click());

// Pas user udah milih file dari laptopnya
fileInput.addEventListener('change', async function() {
    if (this.files.length === 0) return; // Kalo gajadi milih
    
    const fileYangDipilih = this.files[0];
    const formData = new FormData();
    formData.append('fileKu', fileYangDipilih); // 'fileKu' ini HARUS SAMA kayak yang di Multer backend!

    try {
        Swal.fire({ title: 'Lagi Ngirim...', text: 'Sabar Lerr', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

        const response = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // Ga pake Content-Type json, karena ini FormData fisik!
            body: formData
        });

        const data = await response.json();
        if (response.ok) {
            Swal.fire('Sujud Syukur!', 'File berhasil mendarat!', 'success');
            loadFiles(); // Langsung refresh tabelnya
        } else {
            Swal.fire('Gagal!', data.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Server ngereog', 'error');
    }
});

// ==========================================
// 3. DOWNLOAD FILE
// ==========================================
async function downloadFile(id, namaFile) {
    try {
        Swal.fire({ title: 'Narik File...', didOpen: () => Swal.showLoading() });
        
        const response = await fetch(`${API_URL}/download/${id}`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            // Ubah file fisik jadi BLOB (Gumpalan Data Biner)
            const blob = await response.blob(); 
            const url = window.URL.createObjectURL(blob);
            
            // Bikin tag <a> gaib buat maksa browser nge-download
            const a = document.createElement('a');
            a.href = url;
            a.download = namaFile;
            document.body.appendChild(a);
            a.click(); // Klik paksa
            a.remove(); // Hapus tag gaibnya
            
            Swal.close();
        } else {
            Swal.fire('Gagal', 'File ga ketemu', 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Gagal narik file', 'error');
    }
}

// ==========================================
// 4. HAPUS FILE (DELETE /delete/:id)
// ==========================================
async function deleteFile(id) {
    // Tanya dulu, takutnya kepencet
    const konfirmasi = await Swal.fire({
        title: 'Yakin lu Lerr?',
        text: "File bakal ilang permanen lho!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Iya, Bakar!'
    });

    if (konfirmasi.isConfirmed) {
        try {
            const response = await fetch(`${API_URL}/delete/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                Swal.fire('Tewas!', 'File berhasil dihapus.', 'success');
                loadFiles(); // Refresh tabel biar filenya ilang dari layar
            }
        } catch (error) {
            Swal.fire('Error', 'Gagal ngapus', 'error');
        }
    }
}

// Fungsi buat Logout (Hapus tiket)
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
}

// ==========================================
// RITUAL PERTAMA: PANGGIL DAFTAR FILE PAS WEB DIBUKA
// ==========================================
loadFiles();