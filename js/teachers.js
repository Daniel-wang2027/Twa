/* =========================================
   TEACHER LOGIC
   ========================================= */

function initTeacher() {
    document.getElementById('teacher-layout').classList.remove('hidden');

    const profileName = document.getElementById('t-profileName');
    const profileInitials = document.getElementById('t-profileInitials');

    if(profileName) profileName.innerText = currentUser.name;
    if(profileInitials) profileInitials.innerText = currentUser.name.slice(0,2).toUpperCase();

    renderTeacherNav(); 
    teacherSwitchClass("AP Calculus");
}

function renderTeacherNav() {
    const list = document.getElementById('teacher-class-list');
    if(!list) return;
    list.innerHTML = '';
    classes.filter(c => c !== 'Personal').forEach(c => { 
        const color = classPreferences[c] || '#888';
        list.innerHTML += `<button onclick="teacherSwitchClass('${c}')" id="nav-t-${c.replace(/\s/g,'')}" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted hover:bg-surface hover:text-text transition-colors text-left"><span class="w-2 h-2 rounded-full" style="background:${color}"></span> ${c}</button>`; 
    });
}

function teacherSwitchClass(cls) {
    currentTeacherClass = cls;
    const viewClass = document.getElementById('t-view-class');
    const viewSettings = document.getElementById('t-view-settings');
    if(viewClass) viewClass.classList.remove('hidden');
    if(viewSettings) viewSettings.classList.add('hidden');

    const title = document.getElementById('t-active-class-title');
    if(title) title.innerText = cls;

    const formName = document.getElementById('t-form-class-name');
    if(formName) formName.innerText = cls;

    renderTeacherFeed();
}

function switchTeacherView(view) {
    if(view === 'settings') {
        document.getElementById('t-view-class').classList.add('hidden');
        document.getElementById('t-view-settings').classList.remove('hidden');
    }
}

function teacherPostAssignment() {
    const title = document.getElementById('t-title').value; 
    const due = document.getElementById('t-due-date').value;
    if(!title || !due) return alert("Missing Info");

    globalTasks.push({ 
        id: Date.now(), title, course: currentTeacherClass, 
        due: new Date(due).toISOString(), type: document.getElementById('t-type').value, 
        est: document.getElementById('t-est-time').value || 30, 
        completed: false, checklist: [] 
    });

    if(typeof saveData === 'function') saveData();
    document.getElementById('t-title').value = ''; 
    renderTeacherFeed(); 
    alert("Assignment Posted!");
}

function renderTeacherFeed() {
    const feed = document.getElementById('teacher-feed'); 
    if(!feed) return;
    feed.innerHTML = '';

    const tasks = globalTasks.filter(t => t.course === currentTeacherClass && !t.completed);
    if(tasks.length === 0) feed.innerHTML = '<p class="text-muted italic">No active assignments.</p>';

    tasks.forEach(t => { 
        feed.innerHTML += `<div class="bg-surface p-4 rounded-xl border border-border flex justify-between items-center"><div><div class="text-[10px] font-bold text-primary uppercase">${t.type}</div><div class="font-bold">${t.title}</div><div class="text-xs text-muted">${new Date(t.due).toLocaleDateString()}</div></div></div>`; 
    });
}