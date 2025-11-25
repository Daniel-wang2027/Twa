/* =========================================
   STUDENT TASKS (Add, Edit, Complete)
   ========================================= */

let activeTaskId = null; // Global variable to track what we are editing

// --- 1. CREATE & COMPLETE ---

function openStudentModal() { 
    document.getElementById('addModal').classList.remove('hidden'); 
}

function addTask() {
    const title = document.getElementById('m-title').value; 
    let due = document.getElementById('m-due').value;

    if(!title) return alert("Task title is required");

    // Fix: If no date picked, default to NOW + 1 Hour
    if(!due) {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        due = now.toISOString();
    } else {
        due = new Date(due).toISOString();
    }

    globalTasks.push({
        id: Date.now(), 
        title, 
        course: "Personal", 
        due: due, 
        type: "TASK", 
        est: 15, 
        completed: false, 
        checklist: []
    });

    saveData(); 
    document.getElementById('addModal').classList.add('hidden'); 

    // Clear inputs
    document.getElementById('m-title').value = "";
    document.getElementById('m-due').value = "";

    renderMatrix();
    playSound('success');
}

function toggleComplete(id) { 
    const t = globalTasks.find(x => x.id === id); 
    if(t) { 
        t.completed = !t.completed; 
        if(t.completed) { 
            streak++; 
            document.getElementById('streak-count').innerText = streak + " Day Streak"; 
            playSound('complete');
        }
        saveData();
        renderMatrix(); 
        // If renderStats exists (in core), run it
        if(typeof renderStats === 'function') renderStats();
    } 
}

// --- 2. EDITING & MODALS ---

function openTaskDetails(id) {
    playSound('click');
    activeTaskId = id;
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;

    // Populate UI
    document.getElementById('d-title').value = t.title;
    document.getElementById('d-course-badge').innerText = t.course;
    document.getElementById('d-course-badge').style.borderColor = classPreferences[t.course];
    document.getElementById('d-course-badge').style.color = classPreferences[t.course];

    // Fix timezone offset for datetime-local input
    const localDate = new Date(t.due);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    document.getElementById('d-due').value = localDate.toISOString().slice(0,16);

    document.getElementById('d-desc').value = t.desc || "";

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
        playSound('success');
        closeDetailModal();
        renderMatrix();
    }
}

function deleteTask() {
    if(confirm("Delete this task?")) {
        globalTasks = globalTasks.filter(t => t.id !== activeTaskId);
        saveData();
        closeDetailModal();
        renderMatrix();
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
    activeTaskId = null;
}

// --- 3. SUB-TASKS / CHECKLISTS ---

function renderChecklist(task) {
    const container = document.getElementById('d-checklist-container');
    const progress = document.getElementById('d-checklist-progress');
    container.innerHTML = '';

    if(!task.checklist) task.checklist = [];

    task.checklist.forEach((item, index) => {
        container.innerHTML += `
        <div class="flex items-center gap-3 bg-base p-2 rounded-lg border border-border group">
            <button onclick="toggleSubtask(${index})" class="text-${item.done ? 'primary' : 'muted'} hover:text-primary">
                <i class="fa-${item.done ? 'solid fa-square-check' : 'regular fa-square'}"></i>
            </button>
            <span class="${item.done ? 'line-through text-muted' : 'text-text'} text-sm flex-1">${item.text}</span>
            <button onclick="deleteSubtask(${index})" class="opacity-0 group-hover:opacity-100 text-red-500 hover:bg-surface w-6 h-6 rounded flex items-center justify-center transition-all"><i class="fa-solid fa-xmark"></i></button>
        </div>`;
    });

    const done = task.checklist.filter(i => i.done).length;
    progress.innerText = `${done}/${task.checklist.length}`;
}

function handleSubtaskEnter(e) { if(e.key === 'Enter') addSubtask(); }

function addSubtask() {
    const input = document.getElementById('d-new-subtask');
    const text = input.value.trim();
    if(!text || !activeTaskId) return;

    const t = globalTasks.find(x => x.id === activeTaskId);
    t.checklist.push({ text: text, done: false });
    input.value = '';

    playSound('click');
    renderChecklist(t);
}

function toggleSubtask(index) {
    const t = globalTasks.find(x => x.id === activeTaskId);
    t.checklist[index].done = !t.checklist[index].done;
    if(t.checklist[index].done) playSound('click');
    renderChecklist(t);
}

function deleteSubtask(index) {
    const t = globalTasks.find(x => x.id === activeTaskId);
    t.checklist.splice(index, 1);
    renderChecklist(t);
}

function bumpTask(id) {
    const t = globalTasks.find(x => x.id === id);
    if(t) {
        const currentDue = new Date(t.due);
        // Add 24 hours (1 day)
        currentDue.setDate(currentDue.getDate() + 1);
        t.due = currentDue.toISOString();

        saveData();
        renderMatrix();

        // Show feedback (requires utils.js update, or falls back to alert)
        if(typeof showToast === 'function') {
            showToast("Task moved to tomorrow", "info");
        } else {
            console.log("Task moved");
        }

        playSound('click');
    }
}