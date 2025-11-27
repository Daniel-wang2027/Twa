/* =========================================
   ADMIN MANAGER (User & Class Database)
   ========================================= */

let editingUserEmail = null;

function initAdminUI() {
    renderUserList();
}

/* --- USER LIST --- */
function renderUserList() {
    const tbody = document.getElementById('admin-user-list');
    if(!tbody) return;

    // Load Users
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    tbody.innerHTML = '';

    users.forEach(u => {
        // Count classes
        const classCount = u.classes ? u.classes.length : 0;

        // Badge Color
        let roleBadge = 'bg-gray-500/10 text-gray-500';
        if(u.role === 'student') roleBadge = 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        if(u.role === 'teacher') roleBadge = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        if(u.role === 'admin') roleBadge = 'bg-purple-500/10 text-purple-500 border-purple-500/20';

        tbody.innerHTML += `
        <tr class="border-b border-border hover:bg-base/50 transition-colors">
            <td class="p-4 font-bold">${u.name}</td>
            <td class="p-4"><span class="px-2 py-1 rounded text-xs font-bold border ${roleBadge} uppercase">${u.role}</span></td>
            <td class="p-4 text-sm text-muted">${u.email}</td>
            <td class="p-4 text-sm font-mono">${classCount} Courses</td>
            <td class="p-4 text-right">
                <button onclick="openEnrollmentModal('${u.email}')" class="bg-surface border border-border hover:bg-base hover:text-primary px-3 py-1 rounded-lg text-xs font-bold transition-colors">
                    Manage Classes
                </button>
            </td>
        </tr>`;
    });
}

/* --- ENROLLMENT MODAL --- */
function openEnrollmentModal(email) {
    editingUserEmail = email;
    const modal = document.getElementById('enrollmentModal');

    // Find User
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users.find(u => u.email === email);

    document.getElementById('em-username').innerText = user.name;

    renderCatalogList();
    renderAssignedList(user);

    modal.classList.remove('hidden');
}

function closeEnrollmentModal() {
    document.getElementById('enrollmentModal').classList.add('hidden');
    editingUserEmail = null;
    renderUserList(); // Refresh main table
}

/* --- RENDER LISTS --- */
function renderCatalogList() {
    const list = document.getElementById('em-catalog-list');
    const filter = document.getElementById('em-search').value.toLowerCase();

    list.innerHTML = '';

    // Filter Master Catalog
    const matches = MASTER_COURSE_CATALOG.filter(c => 
        c.id.includes(filter) || c.name.toLowerCase().includes(filter) || c.dept.toLowerCase().includes(filter)
    );

    matches.slice(0, 50).forEach(c => { // Limit to 50 for performance
        list.innerHTML += `
        <div class="flex justify-between items-center p-2 hover:bg-surface rounded border border-transparent hover:border-border group">
            <div>
                <div class="text-xs font-bold text-primary">${c.id}</div>
                <div class="text-xs truncate w-48" title="${c.name}">${c.name}</div>
            </div>
            <button onclick="addClassToUser('${c.id}')" class="text-green-500 opacity-0 group-hover:opacity-100 hover:bg-green-500/10 p-1 rounded">
                <i class="fa-solid fa-plus"></i>
            </button>
        </div>`;
    });
}

function filterCourseCatalog() {
    renderCatalogList();
}

function renderAssignedList(user) {
    const list = document.getElementById('em-assigned-list');
    list.innerHTML = '';

    if(!user.classes || user.classes.length === 0) {
        list.innerHTML = '<div class="text-center text-muted text-xs italic p-4">No classes assigned</div>';
        return;
    }

    user.classes.forEach(classId => {
        const details = getCourseDetails(classId);
        list.innerHTML += `
        <div class="flex justify-between items-center p-2 bg-surface rounded border border-border mb-1">
            <div>
                <div class="text-xs font-bold text-primary">${details.id}</div>
                <div class="text-xs truncate w-48">${details.name}</div>
            </div>
            <button onclick="removeClassFromUser('${classId}')" class="text-red-500 hover:bg-red-500/10 p-1 rounded">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>`;
    });
}

/* --- ADD/REMOVE LOGIC --- */
function addClassToUser(courseId) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const userIndex = users.findIndex(u => u.email === editingUserEmail);

    if(userIndex > -1) {
        if(!users[userIndex].classes) users[userIndex].classes = [];

        // Prevent Duplicates
        if(!users[userIndex].classes.includes(courseId)) {
            users[userIndex].classes.push(courseId);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            renderAssignedList(users[userIndex]);
        }
    }
}

function removeClassFromUser(courseId) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const userIndex = users.findIndex(u => u.email === editingUserEmail);

    if(userIndex > -1 && users[userIndex].classes) {
        users[userIndex].classes = users[userIndex].classes.filter(id => id !== courseId);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        renderAssignedList(users[userIndex]);
    }
}

/* --- CREATE USER ACTIONS --- */

function openCreateUserModal() {
    document.getElementById('nu-name').value = '';
    document.getElementById('nu-email').value = '';
    document.getElementById('nu-pass').value = '123456'; // Default
    document.getElementById('createUserModal').classList.remove('hidden');
}

function closeCreateUserModal() {
    document.getElementById('createUserModal').classList.add('hidden');
}

function saveNewUser() {
    const name = document.getElementById('nu-name').value.trim();
    const email = document.getElementById('nu-email').value.trim().toLowerCase();
    const pass = document.getElementById('nu-pass').value;
    const role = document.getElementById('nu-role').value;

    if(!name || !email || !pass) return alert("All fields required");

    // Get DB
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users = usersRaw ? JSON.parse(usersRaw) : [];

    // Check duplicate
    if(users.find(u => u.email === email)) {
        return alert("User with this email already exists.");
    }

    // Save
    users.push({
        name: name,
        email: email,
        password: pass,
        role: role,
        classes: []
    });

    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    closeCreateUserModal();
    renderUserList(); // Refresh table

    // Optional: Toast if available
    alert("User Created Successfully");
}