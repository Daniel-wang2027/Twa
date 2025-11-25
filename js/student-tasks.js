/* =========================================
   STUDENT TASKS (Add, Edit, Complete)
   ========================================= */

let activeTaskId = null; 

// --- 1. CREATE TASKS ---

function openStudentModal() { 
    const modal = document.getElementById('addModal');
    const select = document.getElementById('m-course');

    // Populate the dropdown with the student's actual classes
    if(select) {
        select.innerHTML = '';
        classes.forEach(c => {
            // Check if this class is "Personal" to select it by default, or just first one
            const isSelected = c === 'Personal' ? 'selected' : '';
            select.innerHTML += `<option value="${c}" ${isSelected}>${c}</option>`;
        });
    }

    // Reset inputs
    document.getElementById('m-title').value = '';
    document.getElementById('m-est').value = '';
    document.getElementById('m-due').value = '';

    modal.classList.remove('hidden'); 
}

function addTask() {
    const course = document.getElementById('m-course').value; // Get selected class
    const title = document.getElementById('m-title').value; 
    const due = document.getElementById('m-due').value;
    const est = document.getElementById('m-est').value || 15;

    if(!title || !due) return alert("Title and Due Date are required.");

    // Create the task linked to the specific course
    globalTasks.push({
        id: Date.now(), 
        title: title, 
        course: course, // Uses the dropdown value
        due: new Date(due).toISOString(), 
        type: "TASK", // Student created tasks are generic "TASK" type
        est: parseInt(est), 
        completed: false, 
        checklist: []
    });

    saveData(); 
    document.getElementById('addModal').classList.add('hidden'); 

    // Refresh views
    if(typeof renderMatrix === 'function') renderMatrix();
    playSound('success');
}

// --- 2. TOGGLE COMPLETE ---

function toggleComplete(id) { 
    const t = globalTasks.find(x => x.id === id); 
    if(t) { 
        t.completed = !t.completed; 
        if(t.completed) { 
            streak++; 
            if(document.getElementById('streak-count')) {
                document.getElementById('streak-count').innerText = streak + " Day Streak"; 
            }
            playSound('complete');

            // Game Logic Hook (if game exists)
            if(typeof credits !== 'undefined') {
                credits += 100;
                saveData();
            }
        }
        saveData();
        if(typeof renderMatrix === 'function') renderMatrix(); 
        if(typeof renderStats === 'function') renderStats();
    } 
}

// --- 3. EDITING & MODALS ---

function openTaskDetails(id) {
    playSound('click');
    activeTaskId = id;
    const t = globalTasks.find(x => x.id === id);
    if(!t) return;

    // Populate UI
    document.getElementById('d-title').value = t.title;

    // Badge Styling
    const badge = document.getElementById('d-course-badge');
    badge.innerText = t.course;
    const color = classPreferences[t.course] || '#888';
    badge.style.borderColor = color;
    badge.style.color = color;

    // Date Fix
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
        if(typeof renderMatrix === 'function') renderMatrix();
    }
}

function deleteTask() {
    if(confirm("Delete this task?")) {
        globalTasks = globalTasks.filter(t => t.id !== activeTaskId);
        saveData();
        closeDetailModal();
        if(typeof renderMatrix === 'function') renderMatrix();
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
    activeTaskId = null;
}

// --- 4. SUB-TASKS / CHECKLISTS ---

function renderChecklist(task) {
    const container = document.getElementById('d-checklist-container');
    const progress = document.getElementById('d-checklist-progress');
    if(!container) return;

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

// BUMP TASK (Move to tomorrow)
function bumpTask(id) {
    const t = globalTasks.find(x => x.id === id);
    if(t) {
        const currentDue = new Date(t.due);
        currentDue.setDate(currentDue.getDate() + 1);
        t.due = currentDue.toISOString();

        saveData();
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof showToast === 'function') showToast("Task moved to tomorrow", "info");
    }
}