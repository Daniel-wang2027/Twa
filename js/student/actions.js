/* =========================================
   STUDENT ACTIONS (Consolidated)
   ========================================= */

let activeTaskId = null;
let viewClassTarget = null; 

/* --- NAVIGATION & DETAILS --- */

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

/* --- SETTINGS: TIMER & BUFFER --- */

function saveTimerSettings() {
    const workEl = document.getElementById('setting-work');
    const breakEl = document.getElementById('setting-break');

    if(workEl) settings.workTime = parseInt(workEl.value) || 25;
    if(breakEl) settings.breakTime = parseInt(breakEl.value) || 5;

    saveData(); 
    if(typeof resetTimer === 'function') resetTimer();

    playSound('success');
    if(typeof showToast === 'function') showToast("Timer Updated", "success");
}

function saveBufferSettings() {
    const bufferEl = document.getElementById('setting-buffer');
    if(bufferEl) settings.buffer = parseInt(bufferEl.value) || 0;

    saveData();
    if(typeof renderMatrix === 'function') renderMatrix();

    playSound('click');
    if(typeof showToast === 'function') showToast("Matrix Buffer Updated", "success");
}

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
        input.value = ''; 
        saveData();
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

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 0, 0);

    const checkItems = settings.backpack.map(item => ({ text: item, done: false }));

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
    switchStudentView('dashboard');
}

/* --- MODAL: CLASS SETTINGS --- */

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

/* --- MODAL: ADD TASK --- */

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
    if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
    playSound('success');
}

/* --- MODAL: EDIT TASK / CHECKLISTS --- */

function openTaskDetails(id) {
    activeTaskId = id;
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;

    document.getElementById('d-title').value = t.title;
    document.getElementById('d-desc').value = t.desc || "";

    // Fix Date Format for Input
    const localDate = new Date(t.due);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    document.getElementById('d-due').value = localDate.toISOString().slice(0,16);

    // Initial Checklist Render
    renderChecklist(t);

    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
    activeTaskId = null;
}

function saveTaskDetails() {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t) {
        t.title = document.getElementById('d-title').value;
        t.desc = document.getElementById('d-desc').value;
        t.due = new Date(document.getElementById('d-due').value).toISOString();

        saveData();

        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
        if(viewClassTarget && typeof renderClassDetailList === 'function') renderClassDetailList(viewClassTarget);

        closeDetailModal();
        playSound('success');
    }
}

function deleteTask() {
    if(confirm("Delete task?")) {
        globalTasks = globalTasks.filter(t => t.id !== activeTaskId);
        saveData();
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
        if(viewClassTarget && typeof renderClassDetailList === 'function') renderClassDetailList(viewClassTarget);
        closeDetailModal();
    }
}

/* --- CHECKLIST SUB-FUNCTIONS --- */

function renderChecklist(task) {
    const container = document.getElementById('d-checklist-container');
    const progress = document.getElementById('d-checklist-progress');

    if(!container) return;

    container.innerHTML = '';

    if(!task.checklist) task.checklist = [];

    // Update Progress Text
    const done = task.checklist.filter(i => i.done).length;
    if(progress) progress.innerText = `${done}/${task.checklist.length}`;

    // Render Items
    task.checklist.forEach((item, index) => {
        // Safe onclick handlers using global functions
        container.innerHTML += `
        <div class="flex items-center gap-3 bg-base p-3 rounded-lg border border-border group transition-colors hover:border-primary/50">
            <button onclick="toggleSubtask(${index})" class="text-xl ${item.done ? 'text-primary' : 'text-muted'} hover:text-primary transition-colors">
                <i class="fa-${item.done ? 'solid fa-square-check' : 'regular fa-square'}"></i>
            </button>
            <span class="${item.done ? 'line-through text-muted' : 'text-text'} text-sm flex-1 break-words">${item.text}</span>
            <button onclick="deleteSubtask(${index})" class="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-surface w-8 h-8 rounded flex items-center justify-center transition-all">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`;
    });
}

function addSubtask() {
    const input = document.getElementById('d-new-subtask');
    if(!input || !activeTaskId) return;

    const text = input.value.trim();
    if(!text) return;

    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t) {
        if(!t.checklist) t.checklist = [];
        t.checklist.push({ text: text, done: false });
        input.value = '';
        saveData();
        renderChecklist(t);
    }
}

function toggleSubtask(index) {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t && t.checklist[index]) {
        t.checklist[index].done = !t.checklist[index].done;
        saveData();
        renderChecklist(t);
    }
}

function deleteSubtask(index) {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t && t.checklist[index]) {
        t.checklist.splice(index, 1);
        saveData();
        renderChecklist(t);
    }
}

/* --- MAIN TASK COMPLETION --- */

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
        if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
        if(viewClassTarget && typeof renderClassDetailList === 'function') renderClassDetailList(viewClassTarget);
    }
}