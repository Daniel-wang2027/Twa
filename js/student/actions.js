/* =========================================
   STUDENT ACTIONS (Fixed Settings & Backpack)
   ========================================= */

let activeTaskId = null;
let viewClassTarget = null; 

/* --- SETTINGS: TIMER (Specific) --- */
function saveTimerSettings() {
    const workEl = document.getElementById('setting-work');
    const breakEl = document.getElementById('setting-break');

    if(workEl) settings.workTime = parseInt(workEl.value) || 25;
    if(breakEl) settings.breakTime = parseInt(breakEl.value) || 5;

    saveData(); // Save to storage

    // Force the timer util to update immediately
    if(typeof resetTimer === 'function') {
        resetTimer(); 
    }

    playSound('success');
    if(typeof showToast === 'function') showToast("Timer Updated", "success");
}

/* --- SETTINGS: BUFFER (Specific) --- */
function saveBufferSettings() {
    const bufferEl = document.getElementById('setting-buffer');
    if(bufferEl) settings.buffer = parseInt(bufferEl.value) || 0;

    saveData();

    // Re-render Matrix to show shifted times
    if(typeof renderMatrix === 'function') renderMatrix();

    playSound('click');
    if(typeof showToast === 'function') showToast("Matrix Buffer Updated", "success");
}

/* --- SETTINGS: GENERAL (Dyslexia) --- */
function saveGeneralSettings() {
    const dysEl = document.getElementById('setting-dyslexia');
    if(dysEl) {
        settings.dyslexia = dysEl.checked;
        document.body.classList.toggle('dyslexia-mode', settings.dyslexia);
        saveData();
    }
}

/* --- BACKPACK PROTOCOL --- */
function addBackpackItem() {
    const input = document.getElementById('new-backpack-item');
    if(!input) return;

    const val = input.value.trim();
    if (val) {
        if(!settings.backpack) settings.backpack = [];
        settings.backpack.push(val);

        input.value = ''; // Clear input
        saveData();

        // Re-render list immediately
        if(typeof renderBackpackList === 'function') renderBackpackList();
    }
}

function deleteBackpackItem(index) {
    if(settings.backpack && settings.backpack[index]) {
        settings.backpack.splice(index, 1);
        saveData();
        if(typeof renderBackpackList === 'function') renderBackpackList();
    }
}

function pushBackpackTasks() {
    if (!settings.backpack || settings.backpack.length === 0) {
        alert("Your backpack checklist is empty!");
        return;
    }

    // Create Checklist Data
    const checkItems = settings.backpack.map(item => ({ text: item, done: false }));

    // Set Due Date to End of Today
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 0, 0);

    globalTasks.push({
        id: Date.now(), 
        title: "🎒 Backpack Check", 
        course: "Personal", 
        due: todayEnd.toISOString(),
        type: "TASK", 
        est: 5, 
        completed: false, 
        checklist: checkItems
    });

    saveData();

    if(typeof renderMatrix === 'function') renderMatrix();
    if(typeof showToast === 'function') showToast("Checklist added to Matrix", "success");

    // Switch back to dashboard so they can see it
    switchStudentView('dashboard');
}

/* --- NAVIGATION & TASKS (Standard Logic) --- */

function openClassDetail(className) {
    viewClassTarget = className;
    const titleEl = document.getElementById('detail-class-name');
    const dotEl = document.getElementById('detail-class-dot');
    if(titleEl) titleEl.innerText = className;
    if(dotEl) {
        const color = classPreferences[className] || '#888';
        dotEl.style.backgroundColor = color;
        dotEl.style.boxShadow = `0 0 10px ${color}`;
    }
    switchStudentView('class-detail');
    if(typeof renderClassDetailList === 'function') renderClassDetailList(className);
}

function closeClassDetail() {
    viewClassTarget = null;
    switchStudentView('profile');
}

function openCurrentClassSettings() {
    if(viewClassTarget) openStudentClassSettings(viewClassTarget);
}

function openStudentClassSettings(className) {
    const modal = document.getElementById('classSettingsModal');
    if(!modal) return;
    document.getElementById('modal-class-name').innerText = className;
    const picker = document.getElementById('class-color-picker');
    if(picker) picker.value = classPreferences[className] || '#000000';
    modal.dataset.targetClass = className;
    modal.classList.remove('hidden');
}

function saveClassSettings() {
    const modal = document.getElementById('classSettingsModal');
    const className = modal.dataset.targetClass;
    const picker = document.getElementById('class-color-picker');

    if (className && picker) {
        classPreferences[className] = picker.value;
        saveData();
        modal.classList.add('hidden');
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderStats === 'function') renderStats();
        if(typeof renderProfile === 'function') renderProfile();
        if(viewClassTarget === className) openClassDetail(className);
        playSound('success');
    }
}

function openStudentModal() {
    const modal = document.getElementById('addModal');
    const select = document.getElementById('m-course');
    if(select) {
        select.innerHTML = '';
        classes.forEach(c => select.innerHTML += `<option value="${c}">${c}</option>`);
    }
    document.getElementById('m-title').value = '';
    document.getElementById('m-due').value = '';
    modal.classList.remove('hidden');
}

function addTask() {
    const title = document.getElementById('m-title').value;
    const due = document.getElementById('m-due').value;
    const course = document.getElementById('m-course').value;
    const est = document.getElementById('m-est').value || 15;

    if(!title || !due) return alert("Title and Date required");

    globalTasks.push({
        id: Date.now(), title, course, 
        due: new Date(due).toISOString(),
        type: "TASK", est: parseInt(est),
        completed: false, checklist: []
    });

    saveData();
    document.getElementById('addModal').classList.add('hidden');
    if(typeof renderMatrix === 'function') renderMatrix();
    playSound('success');
}

function openTaskDetails(id) {
    activeTaskId = id;
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;
    document.getElementById('d-title').value = t.title;
    document.getElementById('d-desc').value = t.desc || "";
    const localDate = new Date(t.due);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    document.getElementById('d-due').value = localDate.toISOString().slice(0,16);
    const container = document.getElementById('d-checklist-container');
    if(container) {
        container.innerHTML = '';
        if(t.checklist) t.checklist.forEach(i => container.innerHTML += `<div class="p-2 border border-border rounded mb-1 text-sm bg-base">${i.text}</div>`);
    }
    document.getElementById('detailModal').classList.remove('hidden');
}

function saveTaskDetails() {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t) {
        t.title = document.getElementById('d-title').value;
        t.desc = document.getElementById('d-desc').value;
        t.due = new Date(document.getElementById('d-due').value).toISOString();
        saveData();
        if(typeof renderMatrix === 'function') renderMatrix();
        if(viewClassTarget && typeof renderClassDetailList === 'function') renderClassDetailList(viewClassTarget);
        document.getElementById('detailModal').classList.add('hidden');
        playSound('success');
    }
}

function deleteTask() {
    if(confirm("Delete task?")) {
        globalTasks = globalTasks.filter(t => t.id !== activeTaskId);
        saveData();
        if(typeof renderMatrix === 'function') renderMatrix();
        if(viewClassTarget && typeof renderClassDetailList === 'function') renderClassDetailList(viewClassTarget);
        document.getElementById('detailModal').classList.add('hidden');
    }
}

function toggleComplete(id) {
    const t = globalTasks.find(x => x.id === id);
    if(t) {
        t.completed = !t.completed;
        if(t.completed) {
            streak++;
            playSound('complete');
            if(typeof showToast === 'function') showToast("Completed!", "success");
        }
        saveData();
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderStats === 'function') renderStats();
        if(viewClassTarget && typeof renderClassDetailList === 'function') renderClassDetailList(viewClassTarget);
    }
}