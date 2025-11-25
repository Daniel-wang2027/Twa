/* =========================================
   TEACHER LOGIC (Safe Version)
   ========================================= */

function initTeacher() {
    document.getElementById('teacher-layout').classList.remove('hidden');

    const profileName = document.getElementById('t-profileName');
    const profileInitials = document.getElementById('t-profileInitials');

    if(currentUser) {
        if(profileName) profileName.innerText = currentUser.name;
        if(profileInitials) profileInitials.innerText = currentUser.name.slice(0,2).toUpperCase();
    }

    renderTeacherNav(); 
    // Default to first class in the list
    if(classes.length > 0) teacherSwitchClass(classes[0]);
}

function renderTeacherNav() {
    const list = document.getElementById('teacher-class-list');
    if(!list) return;
    list.innerHTML = '';

    // Don't show "Personal" in teacher view
    classes.filter(c => c !== 'Personal').forEach(c => { 
        const color = classPreferences[c] || '#888';
        list.innerHTML += `
        <button onclick="teacherSwitchClass('${c}')" id="nav-t-${c.replace(/\s/g,'')}" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted hover:bg-surface hover:text-text transition-colors text-left">
            <span class="w-2 h-2 rounded-full" style="background:${color}"></span> ${c}
        </button>`; 
    });
}

function teacherSwitchClass(cls) {
    currentTeacherClass = cls;

    // Toggle Views
    const viewClass = document.getElementById('t-view-class');
    const viewSettings = document.getElementById('t-view-settings');
    if(viewClass) viewClass.classList.remove('hidden');
    if(viewSettings) viewSettings.classList.add('hidden');

    // Update UI Text
    const title = document.getElementById('t-active-class-title');
    if(title) title.innerText = cls;

    const formName = document.getElementById('t-form-class-name');
    if(formName) {
        formName.innerText = cls;
        formName.style.color = classPreferences[cls] || '#888';
    }

    // Highlight active button
    document.querySelectorAll('[id^="nav-t-"]').forEach(btn => {
        btn.classList.remove('bg-base', 'text-primary', 'font-bold', 'shadow-sm', 'border', 'border-border');
        btn.classList.add('text-muted', 'hover:bg-surface');
    });
    const activeBtn = document.getElementById(`nav-t-${cls.replace(/\s/g,'')}`);
    if(activeBtn) {
        activeBtn.classList.remove('text-muted', 'hover:bg-surface');
        activeBtn.classList.add('bg-base', 'text-primary', 'font-bold', 'shadow-sm', 'border', 'border-border');
    }

    renderTeacherFeed();
}

function switchTeacherView(view) {
    if(view === 'settings') {
        document.getElementById('t-view-class').classList.add('hidden');
        document.getElementById('t-view-settings').classList.remove('hidden');
    }
}

function teacherPostAssignment() {
    const titleInput = document.getElementById('t-title');
    const dateInput = document.getElementById('t-due-date');
    const estInput = document.getElementById('t-est-time');
    const typeInput = document.getElementById('t-type');

    const title = titleInput.value.trim();
    let due = dateInput.value;

    // 1. VALIDATION
    if(!title) {
        alert("Please enter an assignment title.");
        return;
    }

    // 2. DEFAULT DATE FIX (If empty, set to tomorrow)
    if(!due) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(9, 0, 0, 0); // 9:00 AM
        due = tomorrow.toISOString(); // Use ISO format
    } else {
        // Ensure the date string is valid
        try {
            due = new Date(due).toISOString();
        } catch(e) {
            alert("Invalid Date Selected");
            return;
        }
    }

    // 3. ADD TO DATA
    const newTask = { 
        id: Date.now(), 
        title: title, 
        course: currentTeacherClass, 
        due: due, 
        type: typeInput.value, 
        est: parseInt(estInput.value) || 30, 
        completed: false, 
        checklist: [] 
    };

    globalTasks.push(newTask);

    // 4. SAVE & RESET
    if(typeof saveData === 'function') saveData();

    // Clear Form
    titleInput.value = '';
    dateInput.value = '';
    estInput.value = '';

    renderTeacherFeed(); 

    // Feedback
    if(typeof playSound === 'function') playSound('success');
    if(typeof showToast === 'function') {
        showToast("Assignment Posted!", "success");
    } else {
        alert("Assignment Posted!");
    }
}

function renderTeacherFeed() {
    const feed = document.getElementById('teacher-feed'); 
    if(!feed) return;
    feed.innerHTML = '';

    // Show newest first
    const tasks = globalTasks
        .filter(t => t.course === currentTeacherClass && !t.completed)
        .sort((a,b) => new Date(b.id) - new Date(a.id));

    if(tasks.length === 0) {
        feed.innerHTML = '<div class="p-8 text-center text-muted border border-dashed border-border rounded-xl">No active assignments for this class.</div>';
        return;
    }

    tasks.forEach(t => { 
        const dateStr = new Date(t.due).toLocaleDateString() + " " + new Date(t.due).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        feed.innerHTML += `
        <div class="bg-surface p-4 rounded-xl border border-border flex justify-between items-center mb-2">
            <div>
                <div class="flex items-center gap-2 mb-1">
                    <span class="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded">${t.type}</span>
                    <span class="text-[10px] text-muted"><i class="fa-regular fa-clock"></i> ${t.est}m</span>
                </div>
                <div class="font-bold text-sm">${t.title}</div>
                <div class="text-xs text-muted">Due: ${dateStr}</div>
            </div>
            <button onclick="deleteTeacherTask(${t.id})" class="text-muted hover:text-red-500 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-base transition-colors">
                <i class="fa-solid fa-trash"></i>
            </button>
        </div>`; 
    });
}

// NEW: Allow teachers to delete assignments they made
function deleteTeacherTask(id) {
    if(confirm("Remove this assignment?")) {
        globalTasks = globalTasks.filter(t => t.id !== id);
        if(typeof saveData === 'function') saveData();
        renderTeacherFeed();
    }
}