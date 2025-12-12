/* ==========================================================================
   STUDENT: TASK MANAGEMENT
   ==========================================================================
   PURPOSE: 
   1. Handles Creating, Editing, and Deleting tasks.
   2. Manages the "Mission Debrief" (Completion) modal.
   3. Handles Checklists (Subtasks).
   ========================================================================== */

// Global state for currently open modals
let activeTaskId = null;
let completingTaskId = null;

/* =========================================
   1. CREATE TASK
   ========================================= */

function openStudentModal() {
    const modal = document.getElementById('addModal');
    const select = document.getElementById('m-course');

    // Populate Course Dropdown
    if (select) {
        select.innerHTML = '';
        classes.forEach(c => select.innerHTML += `<option value="${c}">${c}</option>`);
    }

    // Reset Fields
    document.getElementById('m-title').value = '';
    document.getElementById('m-due').value = '';

    modal.classList.remove('hidden');
}

function addTask() {
    const title = document.getElementById('m-title').value;
    const due = document.getElementById('m-due').value;
    const course = document.getElementById('m-course').value;
    const est = document.getElementById('m-est').value || 15;

    if (!title || !due) return alert("Please enter a Title and Due Date.");

    // Create Task Object
    const newTask = {
        id: Date.now(), // Number
        title, 
        course, 
        due: new Date(due).toISOString(),
        type: "TASK", 
        est: parseInt(est),
        completed: false, 
        checklist: []
    };

    globalTasks.push(newTask);

    saveData();
    document.getElementById('addModal').classList.add('hidden');
    refreshAllViews();
    playSound('success');
}

/* =========================================
   2. COMPLETE TASK (Mission Debrief)
   ========================================= */

function toggleComplete(id) {
    // FIX: Use loose comparison (==) for String vs Number IDs
    const t = globalTasks.find(x => x.id == id);
    if (!t) return;

    // Toggle OFF (Un-complete)
    if (t.completed) {
        t.completed = false;
        t.difficulty = null;
        t.actualTime = null;
        saveData();
        refreshAllViews();
        return;
    }

    // Toggle ON (Open Completion Modal)
    completingTaskId = t.id; 
    document.getElementById('cm-difficulty').value = 0;
    document.getElementById('cm-time').value = t.est || ""; 

    // Reset Difficulty Buttons UI
    document.querySelectorAll('.diff-btn').forEach(b => {
        b.className = "diff-btn w-10 h-10 rounded-lg border border-border transition-all font-bold text-muted";
    });

    document.getElementById('completionModal').classList.remove('hidden');
}

function setDifficulty(val) {
    document.getElementById('cm-difficulty').value = val;

    // Reset all buttons
    document.querySelectorAll('.diff-btn').forEach(b => {
        b.className = "diff-btn w-10 h-10 rounded-lg border border-border transition-all font-bold text-muted";

        // Add hover effects back
        const v = parseInt(b.getAttribute('data-val'));
        if(v === 1) b.classList.add('hover:bg-green-500', 'hover:text-white');
        if(v === 2) b.classList.add('hover:bg-yellow-500', 'hover:text-white');
        if(v === 3) b.classList.add('hover:bg-orange-500', 'hover:text-white');
        if(v === 4) b.classList.add('hover:bg-red-500', 'hover:text-white');
        if(v === 5) b.classList.add('hover:bg-purple-600', 'hover:text-white');
    });

    // Highlight Selected Button
    const selectedBtn = document.querySelector(`.diff-btn[data-val="${val}"]`);
    if (selectedBtn) {
        const colors = { 1: 'green-500', 2: 'yellow-500', 3: 'orange-500', 4: 'red-500', 5: 'purple-600' };
        const c = colors[val];
        selectedBtn.classList.remove('text-muted', 'border-border');
        selectedBtn.classList.add(`bg-${c}`, 'text-white', `border-${c}`, 'scale-110', 'shadow-lg');
    }
}

function confirmCompletion() {
    // FIX: Use loose comparison
    const t = globalTasks.find(x => x.id == completingTaskId);
    if (t) {
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

        if (typeof showToast === 'function') showToast("Mission Accomplished! 🚀", "success");
    }
}

/* =========================================
   3. EDIT & DELETE TASKS (DETAILS MODAL)
   ========================================= */

function openTaskDetails(id) {
    activeTaskId = id;

    // FIX: Use loose comparison (==) so clicks work for all ID types
    const t = globalTasks.find(x => x.id == id);

    if (!t) {
        console.error("Task not found with ID:", id);
        return;
    }

    document.getElementById('d-title').value = t.title;
    document.getElementById('d-desc').value = t.desc || "";

    // Date Fix: Convert UTC to Local Time string for the input
    if (t.due) {
        const localDate = new Date(t.due);
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
        document.getElementById('d-due').value = localDate.toISOString().slice(0,16);
    } else {
        document.getElementById('d-due').value = "";
    }

    renderChecklist(t);
    document.getElementById('detailModal').classList.remove('hidden');
}

function saveTaskDetails() {
    // FIX: Use loose comparison
    const t = globalTasks.find(x => x.id == activeTaskId);
    if (t) {
        t.title = document.getElementById('d-title').value;
        t.desc = document.getElementById('d-desc').value;

        const dateVal = document.getElementById('d-due').value;
        if(dateVal) t.due = new Date(dateVal).toISOString();

        saveData();
        refreshAllViews();
        closeDetailModal();
        playSound('success');
    }
}

function deleteTask() {
    if (confirm("Are you sure you want to delete this task?")) {
        // FIX: Use loose comparison (filter out the matching ID)
        globalTasks = globalTasks.filter(t => t.id != activeTaskId);
        saveData();
        refreshAllViews();
        closeDetailModal();
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
    activeTaskId = null;
}

/* =========================================
   4. CHECKLIST (SUBTASKS) LOGIC
   ========================================= */

function renderChecklist(task) {
    const container = document.getElementById('d-checklist-container');
    const progress = document.getElementById('d-checklist-progress');

    if (!container) return;
    container.innerHTML = '';

    if (!task.checklist) task.checklist = [];

    if (progress) {
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
    if (!input || !activeTaskId) return;

    const text = input.value.trim();
    if (!text) return;

    // FIX: Use loose comparison
    const t = globalTasks.find(x => x.id == activeTaskId);
    if (t) {
        if (!t.checklist) t.checklist = [];
        t.checklist.push({ text: text, done: false });
        input.value = '';

        saveData();
        renderChecklist(t);
    }
}

function toggleSubtask(index) {
    // FIX: Use loose comparison
    const t = globalTasks.find(x => x.id == activeTaskId);
    if (t && t.checklist[index]) {
        t.checklist[index].done = !t.checklist[index].done;
        saveData();
        renderChecklist(t);
    }
}

function deleteSubtask(index) {
    // FIX: Use loose comparison
    const t = globalTasks.find(x => x.id == activeTaskId);
    if (t && t.checklist[index]) {
        t.checklist.splice(index, 1);
        saveData();
        renderChecklist(t);
    }
}

/* =========================================
   5. VIEW REFRESHER
   ========================================= */

function refreshAllViews() {
    if (typeof renderMatrix === 'function') renderMatrix();
    if (typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
    if (typeof renderCalendar === 'function') renderCalendar();
    if (typeof renderStudentPlanner === 'function') renderStudentPlanner();
    if (typeof renderStream === 'function') renderStream();
    if (typeof renderKanban === 'function') renderKanban();

    if (typeof viewClassTarget !== 'undefined' && viewClassTarget && typeof renderClassDetailList === 'function') {
        renderClassDetailList(viewClassTarget);
    }
}