/* =========================================
   STUDENT: TASK MANAGEMENT
   ========================================= */

let activeTaskId = null;
let completingTaskId = null;

/* --- ADD NEW --- */
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
    refreshAllViews();
    playSound('success');
}

/* --- COMPLETION (Mission Debrief) --- */
function toggleComplete(id) {
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;

    if(t.completed) {
        t.completed = false;
        t.difficulty = null;
        t.actualTime = null;
        saveData();
        refreshAllViews();
        return;
    }

    completingTaskId = id;
    document.getElementById('cm-difficulty').value = 0;
    document.getElementById('cm-time').value = t.est || ""; 

    document.querySelectorAll('.diff-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white', 'border-primary', 'scale-110');
        b.style.backgroundColor = ''; b.style.color = '';
    });

    document.getElementById('completionModal').classList.remove('hidden');
}

function setDifficulty(val) {
    document.getElementById('cm-difficulty').value = val;
    document.querySelectorAll('.diff-btn').forEach(b => {
        b.className = "diff-btn w-10 h-10 rounded-lg border border-border transition-all font-bold text-muted";
        const v = parseInt(b.getAttribute('data-val'));
        if(v === 1) b.classList.add('hover:bg-green-500', 'hover:text-white');
        if(v === 2) b.classList.add('hover:bg-yellow-500', 'hover:text-white');
        if(v === 3) b.classList.add('hover:bg-orange-500', 'hover:text-white');
        if(v === 4) b.classList.add('hover:bg-red-500', 'hover:text-white');
        if(v === 5) b.classList.add('hover:bg-purple-600', 'hover:text-white');
    });

    const selectedBtn = document.querySelector(`.diff-btn[data-val="${val}"]`);
    if(selectedBtn) {
        selectedBtn.classList.remove('text-muted', 'border-border');
        if(val === 1) selectedBtn.classList.add('bg-green-500', 'text-white', 'border-green-500', 'scale-110', 'shadow-lg');
        if(val === 2) selectedBtn.classList.add('bg-yellow-500', 'text-white', 'border-yellow-500', 'scale-110', 'shadow-lg');
        if(val === 3) selectedBtn.classList.add('bg-orange-500', 'text-white', 'border-orange-500', 'scale-110', 'shadow-lg');
        if(val === 4) selectedBtn.classList.add('bg-red-500', 'text-white', 'border-red-500', 'scale-110', 'shadow-lg');
        if(val === 5) selectedBtn.classList.add('bg-purple-600', 'text-white', 'border-purple-600', 'scale-110', 'shadow-lg');
    }
}

function confirmCompletion() {
    const t = globalTasks.find(x => x.id === completingTaskId);
    if(t) {
        const diff = parseInt(document.getElementById('cm-difficulty').value);
        const time = parseInt(document.getElementById('cm-time').value);
        t.completed = true;
        t.difficulty = diff || 0; 
        t.actualTime = time || t.est; 
        streak++;
        playSound('complete');
        saveData();
        refreshAllViews();
        document.getElementById('completionModal').classList.add('hidden');
        if(typeof showToast === 'function') showToast("Mission Accomplished! 🚀", "success");
    }
}

/* --- EDIT & DELETE --- */
function openTaskDetails(id) {
    activeTaskId = id;
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;

    document.getElementById('d-title').value = t.title;
    document.getElementById('d-desc').value = t.desc || "";
    const localDate = new Date(t.due);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    document.getElementById('d-due').value = localDate.toISOString().slice(0,16);

    renderChecklist(t);
    document.getElementById('detailModal').classList.remove('hidden');
}

function saveTaskDetails() {
    const t = globalTasks.find(x => x.id === activeTaskId);
    if(t) {
        t.title = document.getElementById('d-title').value;
        t.desc = document.getElementById('d-desc').value;
        t.due = new Date(document.getElementById('d-due').value).toISOString();
        saveData();
        refreshAllViews();
        closeDetailModal();
        playSound('success');
    }
}

function deleteTask() {
    if(confirm("Delete task?")) {
        globalTasks = globalTasks.filter(t => t.id !== activeTaskId);
        saveData();
        refreshAllViews();
        closeDetailModal();
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
    activeTaskId = null;
}

/* --- CHECKLISTS --- */
function renderChecklist(task) {
    const container = document.getElementById('d-checklist-container');
    const progress = document.getElementById('d-checklist-progress');
    if(!container) return;
    container.innerHTML = '';
    if(!task.checklist) task.checklist = [];

    if(progress) {
        const done = task.checklist.filter(i => i.done).length;
        progress.innerText = `${done}/${task.checklist.length}`;
    }

    task.checklist.forEach((item, index) => {
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

/* --- HELPER --- */
function refreshAllViews() {
    if(typeof renderMatrix === 'function') renderMatrix();
    if(typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
    if(typeof renderCalendar === 'function') renderCalendar();
    if(typeof renderStudentPlanner === 'function') renderStudentPlanner();
    if(typeof renderStream === 'function') renderStream();
    if(typeof renderKanban === 'function') renderKanban();
    if(typeof viewClassTarget !== 'undefined' && viewClassTarget && typeof renderClassDetailList === 'function') {
        renderClassDetailList(viewClassTarget);
    }
}