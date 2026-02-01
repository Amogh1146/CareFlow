/**
 * CareFlow v3.1 Multi-User Ready - Shared Logic
 */

// STATE MANAGEMENT v3
const AppState = {
    currentUser: JSON.parse(localStorage.getItem('careflow_current_user')) || null,
    profiles: JSON.parse(localStorage.getItem('careflow-profiles-v3')) || {
        'Dad': { id: 'p1', name: 'Dad', role: 'patient', avatar: 'assets/profiles/dad.png', phone: '9876543210' },
        'Asha': { id: 'p2', name: 'Asha', role: 'caregiver', avatar: 'assets/profiles/asha.png', phone: '9876543211' },
        'Raj': { id: 'p3', name: 'Raj', role: 'pharmacist', avatar: 'assets/profiles/raj.png', phone: '9876543212' },
        'DrSharma': { id: 'p4', name: 'Dr. Sharma', role: 'doctor', avatar: 'assets/profiles/sharma.png', phone: '' },
        'Maya': { id: 'p5', name: 'Nurse Maya', role: 'caregiver', avatar: 'assets/profiles/maya.png', phone: '9876543213' }
    },
    medSchedule: JSON.parse(localStorage.getItem('careflow_schedule')) || [
        {
            id: 1, time: '09:00', label: 'Morning', meds: [
                { name: 'Dolo 650', dose: '650mg', taken: false },
                { name: 'Pan-D', dose: '1 Capsule', taken: false }
            ]
        },
        {
            id: 2, time: '13:00', label: 'Afternoon', meds: [
                { name: 'Amoxyclav', dose: '625mg', taken: false }
            ]
        },
        {
            id: 3, time: '21:00', label: 'Night', meds: [
                { name: 'Aten-5', dose: '5mg', taken: false }
            ]
        }
    ],
    settings: JSON.parse(localStorage.getItem('careflow_settings')) || { theme: 'light', fontScale: 'normal' },
    sosContacts: [
        { name: 'Asha (Daughter)', number: '+919876543210', relation: 'Family' },
        { name: 'Ambulance', number: '108', relation: 'Emergency' },
        { name: 'Dr. Sharma', number: '+919999999999', relation: 'Doctor' }
    ]
};

// DATABASE METHODS
function syncProfiles() {
    localStorage.setItem('careflow-profiles-v3', JSON.stringify(AppState.profiles));
    updateAllProfileDisplays();
}

function updateProfile(id, newData) {
    if (AppState.profiles[id]) {
        AppState.profiles[id] = { ...AppState.profiles[id], ...newData };
        syncProfiles();
        showToast('Profile updated successfully');
    }
}

function addMedToSchedule(medName, dose, timeSlotLabel) {
    let slot = AppState.medSchedule.find(s => s.label === timeSlotLabel) || AppState.medSchedule[0];
    slot.meds.push({ name: medName, dose: dose, taken: false });
    localStorage.setItem('careflow_schedule', JSON.stringify(AppState.medSchedule));
    showToast(`Added ${medName} to ${slot.label} routine`);
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    initSettings();
    checkAuth();
    injectSOS();
    setupNav();
    syncProfiles();
    if (window.feather) feather.replace();
});

// SETTINGS MANAGEMENT
function initSettings() {
    const html = document.documentElement;
    const settings = AppState.settings;

    // Apply Theme
    if (settings.theme === 'dark') {
        html.classList.add('dark');
    } else {
        html.classList.remove('dark');
    }

    // Apply Font Scale
    if (settings.fontScale === 'large') {
        html.classList.add('font-large');
    } else {
        html.classList.remove('font-large');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.classList.toggle('dark');
    AppState.settings.theme = isDark ? 'dark' : 'light';
    localStorage.setItem('careflow_settings', JSON.stringify(AppState.settings));
}

function toggleFontScale() {
    const html = document.documentElement;
    const isLarge = html.classList.toggle('font-large');
    AppState.settings.fontScale = isLarge ? 'large' : 'normal';
    localStorage.setItem('careflow_settings', JSON.stringify(AppState.settings));
}

// AUTH & NAVIGATION
function checkAuth() {
    const validPages = ['login.html', 'profiles-select.html', 'index.html'];
    const path = window.location.pathname.split('/').pop() || 'index.html';
    const isPublic = validPages.includes(path);

    if (path === 'index.html') return;

    if (!AppState.currentUser && !isPublic) {
        window.location.href = 'profiles-select.html';
    }
}

function login(role, name) {
    let profile = Object.values(AppState.profiles).find(p => p.name === name);

    if (!profile) {
        // Fallback mapping if not in AppState
        let fallbackAvatar = 'assets/profiles/asha.png';
        if (role === 'patient') fallbackAvatar = 'assets/profiles/dad.png';
        if (role === 'doctor') fallbackAvatar = 'assets/profiles/sharma.png';
        if (role === 'pharmacist') fallbackAvatar = 'assets/profiles/raj.png';
        if (name.includes('Maya')) fallbackAvatar = 'assets/profiles/maya.png';

        profile = { name: name, role: role, avatar: fallbackAvatar };
    }

    AppState.currentUser = profile;
    localStorage.setItem('careflow_current_user', JSON.stringify(profile));

    let target = `dashboard-${role}.html`;
    if (role === 'nurse') target = 'dashboard-doctor.html';
    window.location.href = target;
}

function logout() {
    localStorage.removeItem('careflow_current_user');
    window.location.href = 'profiles-select.html';
}

// UI SYNC
function updateAllProfileDisplays() {
    document.querySelectorAll('[data-profile]').forEach(el => {
        const id = el.dataset.profile;
        const profile = AppState.profiles[id];
        if (profile) {
            const img = el.querySelector('img');
            const txt = el.querySelector('.name');
            if (img) img.src = profile.avatar;
            if (txt) txt.textContent = profile.name;
        }
    });
}

// SOS SYSTEM
function injectSOS() {
    const role = AppState.currentUser?.role;
    const allowedRoles = ['patient', 'caregiver', 'family'];
    if (!role || !allowedRoles.includes(role)) return;

    const sosHTML = `
    <div class="sos-container fixed top-4 right-4 z-[100] flex flex-col items-end space-y-2 group">
        <div id="speed-dial-menu" class="flex flex-col space-y-2 opacity-0 transform translate-x-12 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 group-hover:pointer-events-auto transition-all duration-300 mr-1">
            <button onclick="triggerGlobalSOS()" class="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 whitespace-nowrap hover:bg-red-700 animate-bounce">
                <i data-feather="bell" class="w-4 h-4"></i>
                <span class="text-xs font-bold uppercase tracking-tight">Global SOS</span>
            </button>
            ${AppState.sosContacts.map(contact => `
            <a href="tel:${contact.number}" class="bg-white dark:bg-slate-800 text-slate-800 dark:text-white px-4 py-2 rounded-full shadow-lg border border-red-100 flex items-center space-x-2 whitespace-nowrap hover:bg-red-50">
                <i data-feather="phone" class="w-4 h-4 text-red-500"></i>
                <span class="text-xs font-bold">${contact.name}</span>
            </a>
            `).join('')}
        </div>
        <button id="sos-btn" onclick="toggleSOSMenu()" class="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-red-200 animate-pulse hover:animate-none group-active:scale-95 transition-transform">
            <i data-feather="alert-triangle" class="w-7 h-7 text-white"></i>
        </button>
    </div>`;

    if (!document.querySelector('.sos-container')) {
        if (document.body) {
            document.body.insertAdjacentHTML('beforeend', sosHTML);
            if (window.feather) feather.replace();
        }
    }
}

function toggleSOSMenu() {
    const menu = document.getElementById('speed-dial-menu');
    if (!menu) return;
    menu.classList.toggle('opacity-0');
    menu.classList.toggle('pointer-events-none');
    menu.classList.toggle('translate-x-12');
}

function triggerGlobalSOS() {
    showToast('🚨 GLOBAL EMERGENCY ALERT DISPATCHED!');
    if (window.navigator.vibrate) window.navigator.vibrate([200, 100, 200, 100, 500]);
    toggleSOSMenu();
}

function setupNav() {
    const path = window.location.pathname.split('/').pop();
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.getAttribute('href') === path) {
            btn.classList.add('active');
        }
    });
}

function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg z-[200] transition-opacity duration-300 pointer-events-none';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}
