/* =========================================
   ADMIN MANAGER (Final)
   ========================================= */

let editingUserEmail = null;
let currentSort = { field: 'grade', dir: 'asc' };

function initAdminUI() {
    switchAdminTab('students');
}

function switchAdminTab(tab) {
    ['students', 'teachers', 'catalog'].forEach(t => {
        document.getElementById(`view-${t}`).classList.add('hidden');
        document.getElementById(`tab-${t}`).className = "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-muted hover:text-text hover:bg-base transition-all";
    });

    document.getElementById(`view-${tab}`).classList.remove('hidden');
    document.getElementById(`tab-${tab}`).className = "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium bg-primary/10 text-primary border border-primary/20 transition-all";

    // Toggle Header Buttons
    const btnUser = document.getElementById('btn-create-user');
    const btnCourse = document.getElementById('btn-create-course');

    if(tab === 'catalog') {
        btnUser.classList.add('hidden');
        btnCourse.classList.remove('hidden');
        document.getElementById('admin-header-title').innerText = "Course Catalog";
        renderCatalogView();
    } else {
        btnUser.classList.remove('hidden');
        btnCourse.classList.add('hidden');
        document.getElementById('admin-header-title').innerText = tab === 'students' ? "Student Directory" : "Faculty Directory";
        if(tab === 'students') renderStudentList();
        if(tab === 'teachers') renderTeacherList();
    }
}

/* --- STUDENT LIST --- */
function renderStudentList(sortBy = null) {
    const tbody = document.getElementById('admin-student-list');
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    let students = users.filter(u => u.role === 'student');

    if (sortBy) {
        if(currentSort.field === sortBy) currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        else { currentSort.field = sortBy; currentSort.dir = 'asc'; }
    }

    students.sort((a, b) => {
        let valA = a[currentSort.field] || (currentSort.field === 'grade' ? 0 : '');
        let valB = b[currentSort.field] || (currentSort.field === 'grade' ? 0 : '');
        if(currentSort.field === 'grade') return currentSort.dir === 'asc' ? valA - valB : valB - valA;
        return currentSort.dir === 'asc' ? valA.toString().localeCompare(valB) : valB.toString().localeCompare(valA);
    });

    tbody.innerHTML = '';
    students.forEach(s => {
        const count = s.classes ? s.classes.length : 0;
        tbody.innerHTML += `
        <tr class="border-b border-border hover:bg-base/50 transition-colors">
            <td class="p-4 font-bold text-sm">${s.name}</td>
            <td class="p-4 text-sm">${s.grade || '-'}</td>
            <td class="p-4 text-sm">${s.homeroom || '-'}</td>
            <td class="p-4 text-sm font-mono text-muted">${count} Classes</td>
            <td class="p-4 text-right flex justify-end gap-2">
                <button onclick="openEditUserModal('${s.email}')" class="bg-surface border border-border hover:text-primary px-2 py-1 rounded text-xs"><i class="fa-solid fa-pen"></i></button>
                <button onclick="openEnrollmentModal('${s.email}')" class="bg-primary text-white px-3 py-1 rounded text-xs font-bold">Schedule</button>
            </td>
        </tr>`;
    });
}

/* --- TEACHER LIST --- */
function renderTeacherList() {
    const tbody = document.getElementById('admin-teacher-list');
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    const teachers = users.filter(u => u.role === 'teacher');

    tbody.innerHTML = '';
    teachers.forEach(t => {
        const count = t.classes ? t.classes.length : 0;
        tbody.innerHTML += `
        <tr class="border-b border-border hover:bg-base/50">
            <td class="p-4 font-bold text-sm">${t.name}</td>
            <td class="p-4 text-sm text-muted">${t.email}</td>
            <td class="p-4 text-sm font-mono">${count} Sections</td>
            <td class="p-4 text-right flex justify-end gap-2">
                <button onclick="openEditUserModal('${t.email}')" class="bg-surface border border-border hover:text-primary px-2 py-1 rounded text-xs"><i class="fa-solid fa-pen"></i></button>
                <button onclick="openEnrollmentModal('${t.email}')" class="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold">Assign</button>
            </td>
        </tr>`;
    });
}

/* --- CATALOG MANAGEMENT --- */
function renderCatalogView(filter = "") {
    const container = document.getElementById('admin-catalog-container');
    container.innerHTML = '';

    const catalog = getCatalog(); // From catalog.js

    let grouped = {};
    catalog.forEach(c => {
        if(!grouped[c.dept]) grouped[c.dept] = [];
        if(filter === "" || c.name.toLowerCase().includes(filter.toLowerCase()) || c.id.includes(filter)) {
            grouped[c.dept].push(c);
        }
    });

    Object.keys(grouped).sort().forEach(dept => {
        if(grouped[dept].length === 0) return;

        let html = `<div class="mb-6"><h3 class="text-xs font-bold text-muted uppercase tracking-wider mb-2 border-b border-border pb-1">${dept}</h3><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">`;

        grouped[dept].forEach(c => {
            html += `<div class="bg-surface border border-border p-3 rounded-lg text-sm flex justify-between items-center group hover:border-primary/50">
                <div class="overflow-hidden">
                    <div class="truncate pr-2 font-medium" title="${c.name}">${c.name}</div>
                    <div class="font-mono text-xs text-primary">${c.id}</div>
                </div>
                <button onclick="deleteCourse('${c.id}')" class="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 p-1.5 rounded transition-all"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        });
        html += `</div></div>`;
        container.innerHTML += html;
    });
}

function openCreateCourseModal() {
    document.getElementById('nc-name').value = '';
    document.getElementById('nc-id').value = '';
    document.getElementById('createCourseModal').classList.remove('hidden');
}

function saveNewCourse() {
    const name = document.getElementById('nc-name').value;
    const id = document.getElementById('nc-id').value;
    const dept = document.getElementById('nc-dept').value;

    if(!name || !id) return alert("Required");

    const success = addNewCourseToCatalog(id, name, dept); // in catalog.js
    if(success) {
        document.getElementById('createCourseModal').classList.add('hidden');
        renderCatalogView();
    } else {
        alert("ID already exists");
    }
}

function deleteCourse(id) {
    if(confirm("Delete this course? It will not remove assignments from students.")) {
        removeCourseFromCatalog(id); // in catalog.js
        renderCatalogView();
    }
}

/* --- USER CRUD --- */
function openCreateUserModal() {
    document.getElementById('nu-name').value = '';
    document.getElementById('nu-email').value = '';
    document.getElementById('createUserModal').classList.remove('hidden');
}

function saveNewUser() {
    const name = document.getElementById('nu-name').value;
    const email = document.getElementById('nu-email').value.toLowerCase();
    const role = document.getElementById('nu-role').value;
    const pass = document.getElementById('nu-pass').value;

    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];
    if(users.find(u => u.email === email)) return alert("Email exists");

    users.push({ name, email, password: pass, role, classes: [] });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    document.getElementById('createUserModal').classList.add('hidden');
    if(role === 'student') renderStudentList(); else renderTeacherList();
}

function openEditUserModal(email) {
    editingUserEmail = email;
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users.find(u => u.email === email);

    document.getElementById('eu-name').value = user.name;
    document.getElementById('eu-grade').value = user.grade || "";
    document.getElementById('eu-room').value = user.homeroom || "";

    document.getElementById('editUserModal').classList.remove('hidden');
}

function saveUserChanges() {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const idx = users.findIndex(u => u.email === editingUserEmail);

    if (idx > -1) {
        users[idx].name = document.getElementById('eu-name').value;
        users[idx].grade = document.getElementById('eu-grade').value;
        users[idx].homeroom = document.getElementById('eu-room').value;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        document.getElementById('editUserModal').classList.add('hidden');

        if(users[idx].role === 'student') renderStudentList(); else renderTeacherList();
    }
}

/* --- ENROLLMENT (ADD CLASSES) --- */
function openEnrollmentModal(email) {
    editingUserEmail = email;
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const user = users.find(u => u.email === email);

    document.getElementById('em-username').innerText = user.name;
    renderEnrollmentCatalog();
    renderUserClasses(user);
    document.getElementById('enrollmentModal').classList.remove('hidden');
}

function closeEnrollmentModal() {
    document.getElementById('enrollmentModal').classList.add('hidden');
    if(document.getElementById('view-students').classList.contains('hidden')) renderTeacherList();
    else renderStudentList();
}

function renderEnrollmentCatalog() {
    const list = document.getElementById('em-catalog-list');
    const filter = document.getElementById('em-search').value.toLowerCase();
    list.innerHTML = '';

    const catalog = getCatalog();
    const matches = catalog.filter(c => c.name.toLowerCase().includes(filter) || c.id.includes(filter)).slice(0, 30);

    matches.forEach(c => {
        list.innerHTML += `
        <div class="flex justify-between items-center p-2 hover:bg-surface rounded border border-transparent hover:border-border group">
            <div class="overflow-hidden">
                <div class="text-xs font-bold text-primary">${c.id}</div>
                <div class="text-xs truncate w-40" title="${c.name}">${c.name}</div>
            </div>
            <button onclick="promptForInstance('${c.id}')" class="bg-surface border border-border hover:bg-primary hover:text-white w-6 h-6 rounded flex items-center justify-center transition-colors">
                <i class="fa-solid fa-plus text-[10px]"></i>
            </button>
        </div>`;
    });
}

function filterEnrollmentCatalog() { renderEnrollmentCatalog(); }

function promptForInstance(courseId) {
    // Add -1, -2, -Honors, etc.
    const instance = prompt("Section/Instance ID (e.g. 1, 2, H):", "1");
    if(instance) {
        assignClass(courseId + '-' + instance);
    }
}

function assignClass(fullId) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const idx = users.findIndex(u => u.email === editingUserEmail);

    if(idx > -1) {
        if(!users[idx].classes) users[idx].classes = [];
        if(!users[idx].classes.includes(fullId)) {
            users[idx].classes.push(fullId);
            localStorage.setItem(USERS_KEY, JSON.stringify(users));
            renderUserClasses(users[idx]);
        }
    }
}

function removeClass(fullId) {
    const users = JSON.parse(localStorage.getItem(USERS_KEY));
    const idx = users.findIndex(u => u.email === editingUserEmail);

    if(idx > -1) {
        users[idx].classes = users[idx].classes.filter(c => c !== fullId);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        renderUserClasses(users[idx]);
    }
}

function renderUserClasses(user) {
    const list = document.getElementById('em-assigned-list');
    list.innerHTML = '';

    if(!user.classes || user.classes.length === 0) {
        list.innerHTML = '<div class="text-center text-muted text-xs italic p-4">No classes assigned</div>';
        return;
    }

    user.classes.forEach(fullId => {
        const parts = fullId.split('-');
        const baseId = parts[0];
        const section = parts[1] || '?';
        const course = getCourseDetails(baseId); // From catalog.js

        list.innerHTML += `
        <div class="flex justify-between items-center p-2 bg-surface rounded border border-border mb-1">
            <div>
                <div class="text-xs font-bold text-primary">${baseId} <span class="text-muted font-normal">Sec ${section}</span></div>
                <div class="text-xs truncate w-48">${course ? course.name : 'Unknown'}</div>
            </div>
            <button onclick="removeClass('${fullId}')" class="text-red-500 hover:bg-red-500/10 p-1 rounded">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>`;
    });
}