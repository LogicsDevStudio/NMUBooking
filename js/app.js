// ตั้งค่า Firebase
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT.firebaseio.com",
    projectId: "YOUR_PROJECT"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

let currentUserData = null; // เก็บข้อมูล Role/Stations

// --- 1. SPA Routing ---
function navigate(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
}

// --- 2. Authentication & Role Management ---
function login() {
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;
    auth.signInWithEmailAndPassword(email, pass).catch(err => alert("Login Error: " + err.message));
}

function logout() {
    auth.signOut();
}

auth.onAuthStateChanged((user) => {
    if (user) {
        db.ref('users/' + user.uid).once('value').then(snap => {
            currentUserData = snap.val();
            updateUI(currentUserData.role);
            alert(`เข้าสู่ระบบสำเร็จ สถานะ: ${currentUserData.role}`);
            navigate('page-booking');
            if(window.initBooking) initBooking(); // โหลดข้อมูลให้ Staff
        });
    } else {
        currentUserData = null;
        updateUI('guest');
        navigate('page-dashboard');
    }
});

function updateUI(role) {
    document.querySelectorAll('.auth-only, .admin-only').forEach(el => el.classList.add('hidden'));
    document.getElementById('nav-login').classList.remove('hidden');
    document.getElementById('nav-logout').classList.add('hidden');

    if (role === 'staff' || role === 'admin') {
        document.querySelectorAll('.auth-only').forEach(el => el.classList.remove('hidden'));
        document.getElementById('nav-login').classList.add('hidden');
        document.getElementById('nav-logout').classList.remove('hidden');
    }
    if (role === 'admin') {
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    }
}

// --- 3. Dashboard Realtime (ข้อ 1) ---
db.ref('sessions').on('value', (snapshot) => {
    const content = document.getElementById('dashboard-content');
    content.innerHTML = '';
    snapshot.forEach((child) => {
        const session = child.val();
        const totalSeats = session.rows * session.cols;
        const available = totalSeats - (session.booked_seats || 0);
        
        content.innerHTML += `
            <div class="card">
                <h3>รอบ: ${session.time}</h3>
                <p>ที่นั่งว่าง: <strong>${available} / ${totalSeats}</strong></p>
            </div>
        `;
    });
});
