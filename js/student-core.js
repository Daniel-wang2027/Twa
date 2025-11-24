/* =========================================
   STUDENT CORE (Init, Navigation, Stats)
   ========================================= */

function initStudent() {
    // Note: User data is already loaded by dashboard-init.js
    document.getElementById('student-layout').classList.remove('hidden');

    // Set Header Info
    document.getElementById('s-profileInitials').innerText = currentUser.name.slice(0,2).toUpperCase();
    document.getElementById('s-profileName').innerText = currentUser.name;
    document.getElementById('streak-count').innerText = streak + " Day Streak";
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString();

    renderThemeButtons('theme-selector');

    // Trigger other modules
    if(typeof renderMatrix === 'function') renderMatrix(); 
    renderStats();
}

function switchStudentView(view) {
    playSound('click');

    // Hide all views
    ['dashboard', 'completed', 'profile', 'settings'].forEach(v => {
        document.getElementById(`s-view-${v}`).classList.add('hidden');
        document.getElementById(`nav-s-${v}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base";
    });

    // Show selected view
    document.getElementById(`s-view-${view}`).classList.remove('hidden');
    document.getElementById(`nav-s-${view}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-primary bg-base border border-border";

    // Refresh specific data
    if(view === 'dashboard') renderMatrix();
    if(view === 'completed') renderCompleted();
    if(view === 'profile') renderProfile();
}

function renderStats() {
    const bar = document.getElementById('stats-bar');
    if(!bar) return;
    bar.innerHTML = '';

    let counts = {};
    classes.forEach(c => counts[c] = 0);

    // Count completed tasks per course
    globalTasks.filter(t => t.completed).forEach(t => {
        counts[t.course] = (counts[t.course] || 0) + 1;
    });

    classes.slice(0, 4).forEach(c => { 
        bar.innerHTML += `
        <div class="bg-surface p-3 rounded-xl border border-border">
            <div class="text-xs text-muted truncate">${c}</div>
            <div class="text-xl font-bold" style="color:${classPreferences[c]}">
                ${counts[c]} Done
            </div>
        </div>`; 
    });
}

function renderCompleted() {
    const list = document.getElementById('list-completed');
    list.innerHTML = '';

    const completedTasks = globalTasks.filter(t => t.completed).sort((a,b) => new Date(b.due) - new Date(a.due));

    if (completedTasks.length === 0) {
        list.innerHTML = '<div class="text-center text-muted p-8">No history yet. Go do some work!</div>';
        return;
    }

    completedTasks.forEach(t => { 
        list.innerHTML += `
        <div class="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border opacity-60">
            <i class="fa-solid fa-check-circle text-accent text-xl"></i>
            <div>
                <div class="font-bold line-through">${t.title}</div>
                <div class="text-xs text-muted">${t.course}</div>
            </div>
        </div>`; 
    });
}

function renderProfile() {
    const list = document.getElementById('profile-list');
    list.innerHTML = '';
    classes.forEach(c => { 
        list.innerHTML += `
        <div class="bg-surface p-6 rounded-xl border border-border flex justify-between items-center shadow-md">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style="background:${classPreferences[c]}">
                    ${c.substring(0,1)}
                </div>
                <div>
                    <span class="font-bold text-lg block">${c}</span>
                    <span class="text-xs text-muted">Student Enrolled</span>
                </div>
            </div>
            <button onclick="openStudentClassSettings('${c}')" class="bg-base hover:bg-border text-text px-4 py-2 rounded-lg text-sm font-medium transition-colors">Customize</button>
        </div>`; 
    });
}

function openStudentClassSettings(className) {
    document.getElementById('classSettingsModal').classList.remove('hidden');
    document.getElementById('modal-class-name').innerText = className;
    document.getElementById('class-color-picker').value = classPreferences[className] || '#000000';
    document.getElementById('rename-container').classList.add('hidden');
    currentTeacherClass = className; // Used for saving context
}