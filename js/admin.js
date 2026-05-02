// --- ข้อ 5: จัดการเจ้าหน้าที่ ---
function saveStaff() {
    const uid = document.getElementById('staff-uid').value;
    const role = document.getElementById('staff-role').value;
    const stations = document.getElementById('staff-stations').value.split(','); // st1,st2
    
    db.ref('users/' + uid).set({
        role: role,
        allowed_stations: stations
    }).then(() => alert("บันทึกสิทธิ์เจ้าหน้าที่สำเร็จ"));
}

// --- ข้อ 7: จัดการฐานกิจกรรม และ รอบ ---
function saveStation() {
    const id = document.getElementById('st-id').value;
    const name = document.getElementById('st-name').value;
    db.ref('stations/' + id).set({ name: name }).then(() => alert("บันทึกฐานสำเร็จ"));
}

function saveSession() {
    const id = document.getElementById('sess-id').value;
    const data = {
        station_id: document.getElementById('sess-st-id').value,
        time: document.getElementById('sess-time').value,
        rows: parseInt(document.getElementById('sess-rows').value),
        cols: parseInt(document.getElementById('sess-cols').value),
        booked_seats: 0
    };
    db.ref('sessions/' + id).set(data).then(() => alert("บันทึกรอบเวลาสำเร็จ"));
}

// --- ข้อ 6: จัดการรายการจอง (เรียกข้อมูลมาแสดง) ---
// ฟังก์ชันนี้จะถูกเรียกเมื่อ Admin เปิดหน้า 'page-manage-bookings'
function loadAllBookings() {
    db.ref('reservations').on('value', (snap) => {
        let html = '<table border="1" width="100%"><tr><th>ชื่อ</th><th>ที่นั่ง</th><th>สถานะ</th><th>ลบ</th></tr>';
        snap.forEach(child => {
            const res = child.val();
            html += `
                <tr>
                    <td>${res.name}</td>
                    <td>${res.seat_number}</td>
                    <td>${res.status}</td>
                    <td><button onclick="deleteBooking('${child.key}', '${res.session_id}')">ลบ</button></td>
                </tr>
            `;
        });
        html += '</table>';
        document.getElementById('admin-booking-list').innerHTML = html;
    });
}

function deleteBooking(resId, sessionId) {
    if(confirm("แน่ใจหรือไม่ที่จะลบการจองนี้?")) {
        db.ref('reservations/' + resId).remove().then(() => {
            // ลดจำนวนที่นั่งที่จองใน session นั้น
            db.ref('sessions/' + sessionId + '/booked_seats').transaction(current => (current || 1) - 1);
            alert("ลบข้อมูลสำเร็จ");
        });
    }
}

// แทรกโค้ดเรียก loadAllBookings เมื่อคลิกเมนู Admin
document.querySelector('[onclick="navigate(\'page-manage-bookings\')"]').addEventListener('click', loadAllBookings);
