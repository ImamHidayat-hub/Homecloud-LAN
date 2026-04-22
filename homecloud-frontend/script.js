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
    e.preventDefault(); // Biar browser ga refresh (TANDA TANYA ? GA BAKAL MUNCUL LAGI)

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
                alert("Sujud Syukur Abangku! Login Sukses!");
                // Langsung terbang ke Dashboard
                window.location.href = 'dashboard.html';
            } else {
                alert("Sujud Syukur! Akun jadi. Sekarang Login ya Lerr!");
                switchMode(); // Pindah ke form login otomatis
            }
        } else {
            alert("Yah gagal: " + data.message);
        }
    } catch (error) {
        alert("Server backend mati Lerr! Pastiin node server.js udah jalan di terminal!");
        console.error(error);
    }
});