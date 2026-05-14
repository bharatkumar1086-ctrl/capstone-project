/**
 * TITAN ENGINE v7
 * Restored Sidebar Categories & Sample Data
 */

let state = {
    users: JSON.parse(localStorage.getItem('ep_v7_users')) || [
        { user: 'Bharat', pass: 'Bharat@2026', role: 'student', name: 'Bharat', roll: '2026-BH-01', phone: '9988776655', course: 'Computer Science' },
        { user: 'BharatAdmin', pass: 'Bharat', role: 'admin', name: 'Bharat (Admin)', jobid: 'ADM-2026', phone: '0011223344', pos: 'System Administrator' }
    ],
    events: JSON.parse(localStorage.getItem('ep_v7_events')) || [
        // Sample Announcements
        { id: 101, title: 'End semester Date', date: '2026-05-10', category: 'Notice', desc: 'The finals begin next Monday. Ensure you have your hall tickets.' },
        { id: 102, title: 'New Library Timing', date: '2026-05-05', category: 'Notice', desc: 'The library will now be open 24/7 during exam weeks.' },
        // Sample Hackathons
        { id: 201, title: 'Cloud-Hacks 2026', date: '2026-06-15', category: 'Hackathon', desc: 'Build the next generation of cloud storage solutions.' },
        { id: 202, title: 'AI for Earth', date: '2026-07-01', category: 'Hackathon', desc: 'Solve climate change issues using Machine Learning.' },
        // Sample Fests
        { id: 301, title: 'Udaan Cultural Fest', date: '2026-08-20', category: 'Fest', desc: 'Celebration of music, arts, and diversity on campus.' },
        { id: 302, title: 'Techno-Pulse 2026', date: '2026-09-05', category: 'Fest', desc: 'The largest technical fest with laser shows and workshops.' }
    ],
    registrations: JSON.parse(localStorage.getItem('ep_v7_regs')) || [],
    currentUser: null,
    selectedPortal: null,
    studentFilter: 'Notice'
};

// --- AUTH ---
function handlePortalSelect(role) {
    state.selectedPortal = role;
    document.getElementById('gate-title').innerText = role === 'student' ? 'Student Portal' : 'Admin Console';
    document.getElementById('sig-student-fields').hidden = (role !== 'student');
    document.getElementById('sig-admin-fields').hidden = (role !== 'admin');
    switchView('gate');
}

function toggleGateForm(type) {
    document.getElementById('form-login').hidden = (type !== 'login');
    document.getElementById('form-signup').hidden = (type !== 'signup');
}

document.getElementById('form-login').onsubmit = (e) => {
    e.preventDefault();
    const u = document.getElementById('login-user').value;
    const p = document.getElementById('login-pass').value;
    const user = state.users.find(x => x.user === u && x.pass === p && x.role === state.selectedPortal);
    if(user) { state.currentUser = user; switchView('app'); } 
    else { alert("Login failed."); }
};

document.getElementById('form-signup').onsubmit = (e) => {
    e.preventDefault();
    const newUser = {
        role: state.selectedPortal,
        name: document.getElementById('sig-name').value,
        user: document.getElementById('sig-user').value,
        pass: document.getElementById('sig-pass').value,
        phone: document.getElementById('sig-phone').value
    };
    if(state.selectedPortal === 'student') {
        newUser.roll = document.getElementById('sig-roll').value;
        newUser.course = document.getElementById('sig-course').value;
    } else {
        newUser.pos = document.getElementById('sig-role').value;
        newUser.jobid = document.getElementById('sig-jobid').value;
    }
    state.users.push(newUser);
    localStorage.setItem('ep_v7_users', JSON.stringify(state.users));
    alert("Signed up!"); toggleGateForm('login');
};

function logout() { state.currentUser = null; switchView('portal'); }

// --- NAVIGATION ---
function switchView(view) {
    document.querySelectorAll('section').forEach(s => s.hidden = true);
    document.getElementById(`view-${view}`).hidden = false;
    if(view === 'app') {
        const isAdmin = state.currentUser.role === 'admin';
        document.getElementById('nav-admin').hidden = !isAdmin;
        document.getElementById('nav-student').hidden = isAdmin;
        document.getElementById('user-display-name').innerText = state.currentUser.name;
        isAdmin ? showSection('admin-stats') : filterStudentFeed('Notice');
        render();
    }
}

function showSection(id) {
    document.querySelectorAll('.subview').forEach(s => s.hidden = true);
    document.getElementById(id).hidden = false;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
    if(id === 'profile-view') renderProfile();
}

function filterStudentFeed(cat) {
    state.studentFilter = cat;
    showSection('student-feed-container');
    document.getElementById('current-cat-name').innerText = (cat === 'Notice' ? 'Announcements' : cat + 's');
    document.querySelectorAll('#nav-student .nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`student-nav-${cat}`).classList.add('active');
    render();
}

// --- ENGINE ---
function save() {
    localStorage.setItem('ep_v7_events', JSON.stringify(state.events));
    localStorage.setItem('ep_v7_regs', JSON.stringify(state.registrations));
    render();
}

document.getElementById('event-form').onsubmit = (e) => {
    e.preventDefault();
    state.events.unshift({
        id: Date.now(),
        title: document.getElementById('ev-title').value,
        date: document.getElementById('ev-date').value,
        category: document.getElementById('ev-cat').value,
        desc: document.getElementById('ev-desc').value
    });
    save(); showSection('admin-stats'); e.target.reset();
};

function deleteEvent(id) {
    if(confirm("Confirm deletion?")) { state.events = state.events.filter(e => e.id !== id); save(); }
}

function openModal(id, title) {
    document.getElementById('modal-id').value = id;
    document.getElementById('modal-title').innerText = title;
    document.getElementById('reg-name').value = state.currentUser.name;
    document.getElementById('reg-roll').value = state.currentUser.roll || '';
    document.getElementById('reg-phone').value = state.currentUser.phone;
    document.getElementById('reg-modal').hidden = false;
}
function closeModal() { document.getElementById('reg-modal').hidden = true; }

document.getElementById('registration-form').onsubmit = (e) => {
    e.preventDefault();
    state.registrations.push({
        id: document.getElementById('modal-id').value,
        event: document.getElementById('modal-title').innerText,
        name: document.getElementById('reg-name').value,
        roll: document.getElementById('reg-roll').value,
        phone: document.getElementById('reg-phone').value
    });
    save(); closeModal(); alert("Registered!");
};

// --- RENDER ---
function renderProfile() {
    const u = state.currentUser;
    document.getElementById('profile-card-data').innerHTML = `
        <div style="text-align:center;"><div style="width:80px; height:80px; background:var(--primary); border-radius:50%; display:inline-grid; place-items:center; font-size:2rem; font-weight:800;">${u.name[0]}</div><h2>${u.name}</h2><p>${u.role.toUpperCase()}</p></div>
        <div style="margin-top:20px;">
            <p><b>Username:</b> @${u.user}</p><p><b>Phone:</b> ${u.phone}</p>
            ${u.role === 'student' ? `<p><b>Roll:</b> ${u.roll}</p><p><b>Course:</b> ${u.course}</p>` : `<p><b>ID:</b> ${u.jobid}</p><p><b>Role:</b> ${u.pos}</p>`}
        </div>
    `;
}

function render() {
    document.getElementById('count-e').innerText = state.events.length;
    document.getElementById('count-r').innerText = state.registrations.length;

    const adminEvents = document.getElementById('admin-event-list');
    if(adminEvents) adminEvents.innerHTML = state.events.filter(e => e.category !== 'Notice').map(e => `
        <div class="glass-card"><span class="tag">${e.category}</span><h4>${e.title}</h4><p>${e.date}</p><button class="btn-delete" onclick="deleteEvent(${e.id})">Delete</button></div>`).join('');

    const adminNotices = document.getElementById('admin-notice-list');
    if(adminNotices) adminNotices.innerHTML = state.events.filter(e => e.category === 'Notice').map(n => `
        <div class="glass-card"><h4>${n.title}</h4><p>${n.date}</p><button class="btn-delete" onclick="deleteEvent(${n.id})">Delete</button></div>`).join('');

    document.getElementById('reg-list').innerHTML = state.registrations.map(r => `
        <tr style="border-bottom: 1px solid var(--glass-border);"><td style="padding:18px;"><b>${r.name}</b><br>${r.roll}</td><td>${r.event}</td><td>${r.phone}</td></tr>`).join('');

    const feed = document.getElementById('student-feed');
    if(feed) {
        const items = state.events.filter(e => e.category === state.studentFilter);
        feed.innerHTML = items.map(e => `
            <div class="glass-card">
                <span class="tag">${e.category}</span><h3>${e.title}</h3><p>📅 ${e.date}</p><p style="margin:16px 0; opacity:0.8;">${e.desc}</p>
                ${e.category !== 'Notice' ? `<button class="btn-primary" onclick="openModal(${e.id}, '${e.title}')">Register Now</button>` : `<div style="background:rgba(255,255,255,0.03); padding:12px; border-radius:12px; text-align:center; color:var(--primary); font-weight:800; font-size:0.7rem;">ANNOUNCEMENT</div>`}
            </div>
        `).join('') || `<p style="color:var(--text-dim)">Nothing here yet.</p>`;
    }
}

render();