// Ganti IP ini pake IP PC Ubuntu lu (misal: http://10.18.124.23:3000) 
// Kalo lu ngetes di PC yang sama, pake localhost gapapa.
const API_URL = 'http://localhost:3000'; 

let isLoginMode = true; // Mode default = Login

// Tangkep semua elemen HTML
const formTitle = document.getElementById('formTitle');
const formSubtitle = document.getElementById('formSubtitle');
const submitBtn = document.getElementById('submitBtn');
const toggleText = document.getElementById('toggleText');
const authForm = document.getElementById('authForm');

// FUNGSI TOGGLE YANG BENER (Anti-Crash)
function switchMode(e) {
    if (e) e.preventDefault(); // Cegah browser refresh
    isLoginMode = !isLoginMode; // Balik mode

    if (isLoginMode) {
        formTitle.innerText = "Welcome to HomeCloud";
        formSubtitle.innerText = "Login buat masuk ke gudang lu.";
        submitBtn.innerText = "Login Sekarang";
        toggleText.innerHTML = `Belom punya akun? <button id="toggleBtn" type="button" class="font-bold text-[#3525cd] hover:underline ml-1">Register di mari</button>`;
    } else {
        formTitle.innerText = "Bikin Akun Baru";
        formSubtitle.innerText = "Daftar dulu Lerr biar bisa upload.";
        submitBtn.innerText = "Register Sekarang";
        toggleText.innerHTML = `Udah punya akun? <button id="toggleBtn" type="button" class="font-bold text-[#3525cd] hover:underline ml-1">Login aja lerr</button>`;
    }

    // Pasang ulang saklarnya ke tombol yang baru
    document.getElementById('toggleBtn').addEventListener('click', switchMode);
}

// Pasang saklar pertama kali pas web dibuka
document.getElementById('toggleBtn').addEventListener('click', switchMode);

// Aksi pas tombol Login/Register dipencet
authForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Biar browser ga refresh

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const endpoint = isLoginMode ? '/login' : '/register';
    
    try {
        const response = await fetch(API_URL + endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            if (isLoginMode) {
                // Simpen tiket ke brankas browser
                localStorage.setItem('token', data.token);
                
                // POP-UP LOGIN SUKSES (Pake Animasi Centang)
                Swal.fire({
                    icon: 'success',
                    title: 'Sujud Syukur Abangku!',
                    text: 'Login Sukses!',
                    showConfirmButton: false,
                    timer: 1500 // Nunggu 1.5 detik baru pindah
                }).then(() => {
                    window.location.href = 'dashboard.html';
                });
                
            } else {
                // POP-UP REGISTER SUKSES
                Swal.fire({
                    icon: 'success',
                    title: 'Mantap Lerr!',
                    text: 'Akun berhasil dibuat. Sekarang silakan Login!',
                    confirmButtonColor: '#4f46e5'
                }).then(() => {
                    switchMode(); // Pindah ke form login otomatis abis diklik OK
                });
            }
        } else {
            // POP-UP GAGAL (Password Salah / Akun Udah Ada)
            Swal.fire({
                icon: 'error',
                title: 'Yah gagal Lerr...',
                text: data.message,
                confirmButtonColor: '#4f46e5'
            });
        }
    } catch (error) {
        // POP-UP SERVER MATI
        Swal.fire({
            icon: 'warning',
            title: 'Waduh!',
            text: 'Server backend mati Lerr! Pastiin node server.js udah jalan.',
            confirmButtonColor: '#4f46e5'
        });
        console.error(error);
    }
});
