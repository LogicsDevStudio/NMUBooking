let currentParticipant = null;
let selectedSeat = null;
let currentSessionData = null;
let html5QrcodeScanner = null;

// --- ข้อ 3: ระบบจอง และ Google Sheets API ---
function initBooking() {
    const select = document.getElementById('select-station');
    select.innerHTML = '<option value="">-- เลือกฐาน --</option>';
    
    // ตรวจสอบสิทธิ์ว่าจองฐานไหนได้บ้าง
    const allowed = currentUserData.allowed_stations || [];
    
    db.ref('stations').once('value', (snap) => {
        snap.forEach(child => {
            if (allowed.includes('all') || allowed.includes(child.key)) {
                select.innerHTML += `<option value="${child.key}">${child.val().name}</option>`;
            }
        });
    });
}

function loadSessions(stationId) {
    const select = document.getElementById('select-session');
    select.innerHTML = '<option value="">-- เลือกรอบเวลา --</option>';
    document.getElementById('participant-section').classList.remove('hidden');

    db.ref('sessions').orderByChild('station_id').equalTo(stationId).once('value', (snap) => {
        snap.forEach(child => {
            select.innerHTML += `<option value="${child.key}">${child.val().time}</option>`;
        });
    });
}

// ดึงข้อมูล Google Sheets
async function fetchGoogleSheet() {
    const idCard = document.getElementById('id-card').value;
    const gasUrl = `https://script.google.com/macros/s/AKfycbxXdJR6r3kB_TkJjBa0-O6lVy4vjxe3wSnudwSRbIEIGX9g7SCKgOWnsYy15heEjYhw/exec?id=${idCard}`;
    
    document.getElementById('participant-info').innerText = "กำลังค้นหา...";
    const res = await fetch(gasUrl);
    const data = await res.json();
    
    if (data.status === 'success') {
        currentParticipant = data;
        document.getElementById('participant-info').innerText = `พบข้อมูล: ${data.name} (${data.phone})`;
    } else {
        document.getElementById('participant-info').innerText = "ไม่พบข้อมูล กรุณาตรวจสอบเลขบัตร";
        currentParticipant = null;
    }
}

// สร้างผังที่นั่ง
function renderSeatLayout(sessionId) {
    if(!sessionId) return;
    const grid = document.getElementById('seat-layout');
    grid.innerHTML = '';
    grid.classList.remove('hidden');
    selectedSeat = null;
    document.getElementById('selected-seat').innerText = "-";

    db.ref('sessions/' + sessionId).once('value', (snap) => {
        currentSessionData = snap.val();
        grid.style.gridTemplateColumns = `repeat(${currentSessionData.cols}, 40px)`;
        
        // ดึงที่นั่งที่ถูกจองแล้ว
        db.ref('reservations').orderByChild('session_id').equalTo(sessionId).once('value', (resSnap) => {
            const bookedSeats = [];
            resSnap.forEach(r => bookedSeats.push(r.val().seat_number));

            const rows = ['A','B','C','D','E','F','G','H','I','J'];
            for (let r = 0; r < currentSessionData.rows; r++) {
                for (let c = 1; c <= currentSessionData.cols; c++) {
                    const seatId = `${rows[r]}${c}`;
                    const btn = document.createElement('button');
                    btn.innerText = seatId;
                    btn.className = 'seat';
                    
                    if (bookedSeats.includes(seatId)) {
                        btn.classList.add('booked');
                        btn.disabled = true;
                    } else {
                        btn.onclick = () => selectSeat(btn, seatId);
                    }
                    grid.appendChild(btn);
                }
            }
        });
    });
}

function selectSeat(btn, seatId) {
    document.querySelectorAll('.seat').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSeat = seatId;
    document.getElementById('selected-seat').innerText = seatId;
    document.getElementById('btn-confirm-booking').classList.remove('hidden');
}

function confirmBooking() {
    if (!currentParticipant || !selectedSeat) return alert("ข้อมูลไม่ครบถ้วน");

    const sessionId = document.getElementById('select-session').value;
    const resRef = db.ref('reservations').push();
    
    const bookingData = {
        session_id: sessionId,
        national_id: document.getElementById('id-card').value,
        name: currentParticipant.name,
        seat_number: selectedSeat,
        status: "booked",
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    resRef.set(bookingData).then(() => {
        // อัปเดตจำนวนที่นั่ง
        db.ref('sessions/' + sessionId + '/booked_seats').set((currentSessionData.booked_seats || 0) + 1);
        
        // สร้าง QR Code
        document.getElementById('qrcode-container').innerHTML = '';
        new QRCode(document.getElementById("qrcode-container"), resRef.key);
        alert("จองสำเร็จ! กรุณาแคปหน้าจอ QR Code ไว้");
        
        // Reset
        document.getElementById('seat-layout').classList.add('hidden');
        document.getElementById('btn-confirm-booking').classList.add('hidden');
    });
}

// --- ข้อ 4: ระบบ Check-in (QR Scanner) ---
function startScanner() {
    html5QrcodeScanner = new Html5Qrcode("qr-reader");
    html5QrcodeScanner.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (qrText) => {
        html5QrcodeScanner.stop();
        document.getElementById('scan-result').innerText = "กำลังตรวจสอบ: " + qrText;
        
        db.ref('reservations/' + qrText).once('value', snap => {
            if (snap.exists()) {
                db.ref('reservations/' + qrText + '/status').set('checked-in');
                alert("Check-in สำเร็จ!");
                document.getElementById('scan-result').innerText = "สถานะ: เช็คอินเรียบร้อย";
            } else {
                alert("ไม่พบรหัสการจองนี้ในระบบ");
            }
        });
    });
}

function stopScanner() {
    if(html5QrcodeScanner) html5QrcodeScanner.stop();
}
