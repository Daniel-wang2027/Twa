/* =========================================
   ADMIN MANAGER (Instances & Grouping)
   ========================================= */

let editingUserEmail = null;
let editingCourseId = null;

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

/* --- STUDENT VIEW (GROUPED) --- */
function renderStudentList() {
    const container = document.getElementById('view-students');
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    // Group definitions
    const groups = {
        '9': { label: 'Freshman', students: [] },
        '10': { label: 'Sophomore', students: [] },
        '11': { label: 'Junior', students: [] },
        '12': { label: 'Senior', students: [] },
        'other': { label: 'Unassigned Grade', students: [] }
    };

    users.filter(u => u.role === 'student').forEach(u => {
        const g = u.grade ? u.grade.toString() : 'other';
        if(groups[g]) groups[g].students.push(u);
        else groups['other'].students.push(u);
    });

    container.innerHTML = '';

    // Render Groups
    Object.keys(groups).sort().forEach(key => {
        const group = groups[key];
        if(group.students.length === 0) return;

        // Sort by Homeroom inside the group
        group.students.sort((a,b) => (a.homeroom || '').localeCompare(b.homeroom || ''));

        let html = `
        <div class="mb-6">
            <h3 class="text-xs font-bold text-muted uppercase tracking-wider mb-2 border-b border-border pb-1 flex justify-between">
                <span>${group.label} (Grade ${key})</span>
                <span>${group.students.length} Students</span>
            </h3>
            <div class="bg-surface rounded-2xl border border-border overflow-hidden shadow-sm">
                <table class="w-full text-left border-collapse">
                    <thead class="bg-base border-b border-border text-xs uppercase text-muted">
                        <tr>
                            <th class="p-3 w-1/4">Name</th>
                            <th class="p-3 w-1/4">Homeroom</th>
                            <th class="p-3 w-1/4">Schedule</th>
                            <th class="p-3 w-1/4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;

        group.students.forEach(s => {
            html += `
            <tr class="border-b border-border hover:bg-base/50">
                <td class="p-3 font-bold text-sm">${s.name}</td>
                <td class="p-3 text-sm">${s.homeroom || '-'}</td>
                <td class="p-3 text-sm font-mono text-muted">${s.classes ? s.classes.length : 0} Classes</td>
                <td class="p-3 text-right flex justify-end gap-2">
                    <button onclick="deleteUser('${s.email}')" class="bg-surface border border-border text-red-500 hover:bg-red-500/10 px-2 py-1 rounded text-xs transition-colors"><i class="fa-solid fa-trash"></i></button>
                    <button onclick="openEditUserModal('${s.email}')" class="bg-surface border border-border hover:text-primary px-2 py-1 rounded text-xs"><i class="fa-solid fa-pen"></i></button>
                    <button onclick="openEnrollmentModal('${s.email}')" class="bg-primary text-white px-3 py-1 rounded text-xs font-bold">Edit</button>
                </td>
            </tr>`;
        });

        html += `</tbody></table></div></div>`;
        container.innerHTML += html;
    });
}

/* --- TEACHER LIST --- */
function renderTeacherList() {
    const tbody = document.getElementById('admin-teacher-list');
    const users = JSON.parse(localStorage.getItem(USERS_KEY)) || [];

    tbody.innerHTML = '';
    users.filter(u => u.role === 'teacher').forEach(t => {
        tbody.innerHTML += `
        <tr class="border-b border-border hover:bg-base/50">
            <td class="p-4 font-bold text-sm">${t.name}</td>
            <td class="p-4 text-sm text-muted">${t.email}</td>
            <td class="p-4 text-sm font-mono">${t.classes ? t.classes.length : 0} Sections</td>
            <td class="p-4 text-right flex justify-end gap-2">
                <button onclick="deleteUser('${t.email}')" class="bg-surface border border-border text-red-500 hover:bg-red-500/10 px-2 py-1 rounded text-xs"><i class="fa-solid fa-trash"></i></button>
                <button onclick="openEditUserModal('${t.email}')" class="bg-surface border border-border hover:text-primary px-2 py-1 rounded text-xs"><i class="fa-solid fa-pen"></i></button>
                <button onclick="openEnrollmentModal('${t.email}')" class="bg-purple-600 text-white px-3 py-1 rounded text-xs font-bold">Assign</button>
            </td>
        </tr>`;
    });
}

function deleteUser(email) {
    if(confirm("Permanently delete this user?")) {
        let users = JSON.parse(localStorage.getItem(USERS_KEY));
        users = users.filter(u => u.email !== email);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Refresh active tab
        if(!document.getElementById('view-students').classList.contains('hidden')) renderStudentList();
        else renderTeacherList();
    }
}

/* --- CATALOG (CLICK TO MANAGE INSTANCES) --- */
function renderCatalogView(filter = "") {
    const container = document.getElementById('admin-catalog-container');
    container.innerHTML = '';
    const catalog = getCatalog();

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
            // Count instances
            const instances = getCourseInstances(c.id); // from catalog.js
            const count = instances.length;
            const badge = count > 0 ? `<span class="bg-green-500/10 text-green-500 px-1.5 rounded text-[10px] font-bold">${count} Sec</span>` : '';

            html += `
            <div onclick="openCourseDetails('${c.id}')" class="bg-surface border border-border p-3 rounded-lg text-sm flex justify-between items-center group hover:border-primary/50 cursor-pointer transition-colors">
                <div class="overflow-hidden">
                    <div class="truncate pr-2 font-medium" title="${c.name}">${c.name}</div>
                    <div class="font-mono text-xs text-primary flex gap-2 items-center">
                        <span>${c.id}</span>
                        ${badge}
                    </div>
                </div>
                <i class="fa-solid fa-chevron-right text-muted text-xs group-hover:text-primary"></i>
            </div>`;
        });
        html += `</div></div>`;
        container.innerHTML += html;
    });
}

/* --- COURSE DETAILS MODAL (INSTANCES) --- */
function openCourseDetails(id) {
    editingCourseId = id;
    const course = getCourseDetails(id); // from catalog.js

    document.getElementById('cd-title').innerText = course.name;
    document.getElementById('cd-id').innerText = course.id;
    document.getElementById('cd-new-inst').value = '';

    renderInstanceList();
    document.getElementById('courseDetailsModal').classList.remove('hidden');
}

function renderInstanceList() {
    const list = document.getElementById('cd-instance-list');
    const instances = getCourseInstances(editingCourseId); // from catalog.js
    list.innerHTML = '';

    if(instances.length === 0) {
        list.innerHTML = `<div class="text-center text-xs text-muted italic p-2">No active sections. Add one below.</div>`;
        return;
    }

    instances.forEach(sec => {
        list.innerHTML += `
        <div class="flex justify-between items-center p-2 bg-base rounded border border-border mb-1">
            <span class="text-sm font-mono font-bold text-primary">${editingCourseId}-${sec}</span>
            <button onclick="removeInstanceAction('${sec}')" class="text-red-500 hover:bg-red-500/10 w-6 h-6 rounded flex items-center justify-center"><i class="fa-solid fa-trash text-xs"></i></button>
        </div>`;
    });
}

function addInstanceAction() {
    const sec = document.getElementById('cd-new-inst').value.trim();
    if(!sec) return;

    addInstanceToCourse(editingCourseId, sec); // in catalog.js
    document.getElementById('cd-new-inst').value = '';
    renderInstanceList();
    renderCatalogView(); // Update badge count
}

function removeInstanceAction(sec) {
    if(confirm("Remove this section?")) {
        removeInstanceFromCourse(editingCourseId, sec); // in catalog.js
        renderInstanceList();
        renderCatalogView();
    }
}

function deleteCourseAction() {
    if(confirm("Delete this entire course from the catalog?")) {
        removeCourseFromCatalog(editingCourseId); // in catalog.js
        document.getElementById('courseDetailsModal').classList.add('hidden');
        renderCatalogView();
    }
}

/* --- STANDARD MODALS (Create/Edit User) --- */
// (Keep existing openCreateUserModal, saveNewUser, openEditUserModal, saveUserChanges logic here)
// Just ensure saveUserChanges handles grades 9-12 correctly.

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

/* --- ENROLLMENT (UPDATED FOR INSTANCES) --- */
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
    renderStudentList();
}

function renderEnrollmentCatalog() {
    const list = document.getElementById('em-catalog-list');
    const filter = document.getElementById('em-search').value.toLowerCase();
    list.innerHTML = '';

    const catalog = getCatalog();
    const matches = catalog.filter(c => c.name.toLowerCase().includes(filter) || c.id.includes(filter)).slice(0, 30);

    matches.forEach(c => {
        // Find existing instances for this course
        const instances = getCourseInstances(c.id);
        let actionBtn = '';

        if(instances.length > 0) {
            // Show available instances
            actionBtn = `<div class="flex gap-1">
                ${instances.map(sec => 
                    `<button onclick="assignClass('${c.id}-${sec}')" class="bg-surface border border-border hover:bg-primary hover:text-white px-1.5 py-0.5 rounded text-[10px] transition-colors">${sec}</button>`
                ).join('')}
            </div>`;
        } else {
            // Fallback create
            actionBtn = `<button onclick="promptForInstance('${c.id}')" class="bg-surface border border-border hover:bg-primary hover:text-white w-6 h-6 rounded flex items-center justify-center transition-colors"><i class="fa-solid fa-plus text-[10px]"></i></button>`;
        }

        list.innerHTML += `
        <div class="flex justify-between items-center p-2 hover:bg-surface rounded border border-transparent hover:border-border group">
            <div class="overflow-hidden">
                <div class="text-xs font-bold text-primary">${c.id}</div>
                <div class="text-xs truncate w-32" title="${c.name}">${c.name}</div>
            </div>
            ${actionBtn}
        </div>`;
    });
}

function filterEnrollmentCatalog() { renderEnrollmentCatalog(); }

function promptForInstance(courseId) {
    const instance = prompt("No active sections found. Create one now (e.g. 1, 2):", "1");
    if(instance) {
        addInstanceToCourse(courseId, instance); // Save for future
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
    if(!user.classes || user.classes.length === 0) { list.innerHTML = '<div class="text-center text-muted text-xs italic p-4">Empty</div>'; return; }

    user.classes.forEach(fullId => {
        const parts = fullId.split('-');
        const baseId = parts[0];
        const section = parts[1] || '?';
        const course = getCourseDetails(baseId);

        list.innerHTML += `
        <div class="flex justify-between items-center p-2 bg-surface rounded border border-border mb-1">
            <div>
                <div class="text-xs font-bold text-primary">${baseId} <span class="text-muted font-normal">Sec ${section}</span></div>
                <div class="text-xs truncate w-48">${course ? course.name : 'Unknown'}</div>
            </div>
            <button onclick="removeClass('${fullId}')" class="text-red-500 hover:bg-red-500/10 p-1 rounded"><i class="fa-solid fa-trash"></i></button>
        </div>`;
    });
}

function saveNewCourse() {
    const name = document.getElementById('nc-name').value;
    const id = document.getElementById('nc-id').value;
    const dept = document.getElementById('nc-dept').value;
    if(!name || !id) return alert("Required");
    if(addNewCourseToCatalog(id, name, dept)) {
        document.getElementById('createCourseModal').classList.add('hidden');
        renderCatalogView();
    } else alert("ID exists");
}

function openCreateCourseModal() {
    document.getElementById('nc-name').value = '';
    document.getElementById('nc-id').value = '';
    document.getElementById('createCourseModal').classList.remove('hidden');
}