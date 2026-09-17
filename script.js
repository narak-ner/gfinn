const STORAGE_KEY = 'customerFormAutoSave';
let isClearing = false; // ตัวแปรล็อกป้องกันการทำงานซ้ำซ้อนขณะล้างข้อมูล

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() || '-' : '-';
}

function getRadioVal(name) {
    const selected = document.querySelector(`input[name="${name}"]:checked`);
    return selected ? selected.value : '-';
}

function generateSummary() {
    const text = `รายละเอียดที่ต้องแจ้ง
1.ชื่อลูกค้า : ${getVal('customerName')}
2.ทำอาชีพ : ${getVal('occupation')}
3.สนใจโทรศัพท์รุ่น : ${getVal('phoneModel')}
4.มือ 1/2 : ${getRadioVal('phoneHand')}
5.เลขอีมี่ : ${getVal('imei')}
6.เบอร์ลูกค้า : ${getVal('customerPhone')}
7.อายุ : ${getVal('age')}
8.แบตเปลี่ยนมาหรือไม่ ? : ${getRadioVal('batChange')}
9.แบตแท้หรือไม่ ? : ${getRadioVal('batOriginal')}
10.ลูกค้าทราบเรื่องแบตแล้วใช่หรือไม่ ? : ${getRadioVal('batAware')}
11.มีกล่องหรือไม่ ? : ${getRadioVal('hasBox')}
12.มีสายชาร์จหรือไม่ ? : ${getRadioVal('hasCable')}
13.Over : ${getVal('overValue')}`;

    document.getElementById('summaryOutput').value = text;
}

function saveData() {
    if (isClearing) return; // หากอยู่ในสถานะล้างข้อมูล ให้ข้ามการบันทึกทันที

    const inputs = document.querySelectorAll('#infoForm input');
    const formData = {};

    inputs.forEach(input => {
        if (input.type === 'radio') {
            if (input.checked) {
                formData[input.name] = input.value;
            }
        } else {
            formData[input.id] = input.value;
        }
    });

    localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    showSaveNotification();
}

function loadData() {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return;

    try {
        const formData = JSON.parse(savedData);
        const inputs = document.querySelectorAll('#infoForm input');

        inputs.forEach(input => {
            if (input.type === 'radio') {
                if (formData[input.name] && input.value === formData[input.name]) {
                    input.checked = true;
                }
            } else {
                if (formData[input.id] !== undefined) {
                    input.value = formData[input.id];
                }
            }
        });

        generateSummary();
    } catch (e) {
        console.error("Error loading saved data", e);
    }
}

function clearFormData() {
    isClearing = true; // เปิดโหมดล็อกป้องกันเซฟซ้ำ
    
    document.getElementById('infoForm').reset();
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('summaryOutput').value = '';

    setTimeout(() => {
        isClearing = false; // คืนค่าสถานะปกติ
    }, 150);
}

function showSaveNotification() {
    const statusEl = document.getElementById('saveStatus');
    if (statusEl) {
        statusEl.style.opacity = '1';
        setTimeout(() => {
            statusEl.style.opacity = '0';
        }, 1200);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadData();

    // ปุ่มล้างข้อมูล
    const btnClear = document.getElementById('btnClearForm');
    if (btnClear) {
        btnClear.addEventListener('click', clearFormData);
    }

    // ปุ่มสรุปข้อมูล
    const btnSummary = document.getElementById('btnSummary');
    if (btnSummary) {
        btnSummary.addEventListener('click', () => {
            generateSummary();
            saveData();
        });
    }

    // กรองเฉพาะตัวเลขสำหรับช่องเบอร์, อายุ, Over
    ['customerPhone', 'age', 'overValue'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
    });

    // บันทึกอัตโนมัติเมื่อพิมพ์หรือเลือกตัวเลือก
    const form = document.getElementById('infoForm');
    if (form) {
        form.addEventListener('input', () => {
            generateSummary();
            saveData();
        });
        form.addEventListener('change', () => {
            generateSummary();
            saveData();
        });
    }
});