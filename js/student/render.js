/* =========================================
   STUDENT UI RENDERER (Fixed Procrastination Buffer)
   ========================================= */

function initStudentUI() {
    document.getElementById('student-layout').classList.remove('hidden');

    // Profile Sidebar Data
    if(currentUser) {
        document.getElementById('s-profileInitials').innerText = currentUser.name.slice(0,2).toUpperCase();
        document.getElementById('s-profileName').innerText = currentUser.name;
    }
    document.getElementById('streak-count').innerText = `${streak} Day Streak`;
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString();

    // Renders
    renderMatrix();
    renderWelcomeBanner();
    renderStudentBulletins();

    if(typeof renderBackpackList === 'function') renderBackpackList();
    if(typeof renderThemeButtons === 'function') renderThemeButtons('theme-selector');
}

function switchStudentView(view) {
    playSound('click');

    ['dashboard', 'completed', 'profile', 'settings', 'class-detail'].forEach(v => {
        const el = document.getElementById(`s-view-${v}`);
        const btn = document.getElementById(`nav-s-${v}`);

        if(el) el.classList.add('hidden');
        if(btn) btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base";
    });

    const targetEl = document.getElementById(`s-view-${view}`);
    const targetBtn = document.getElementById(`nav-s-${view}`);

    if(targetEl) targetEl.classList.remove('hidden');
    if(targetBtn) targetBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-base text-primary border border-border";

    if(view === 'dashboard') {
        renderMatrix();
        renderWelcomeBanner();
        renderStudentBulletins();
    }
    if(view === 'completed') renderCompleted();
    if(view === 'profile') renderProfile();
}

/* --- WELCOME BANNER --- */
function renderWelcomeBanner() {
    const nameEl = document.getElementById('banner-student-name');
    const msgEl = document.getElementById('banner-message');

    if(!nameEl || !msgEl) return;

    nameEl.innerText = currentUser.name.split(' ')[0]; 

    const today = new Date();
    const count = globalTasks.filter(t => {
        if (t.completed) return false;
        const d = new Date(t.due);
        return d.getDate() === today.getDate() && 
               d.getMonth() === today.getMonth() && 
               d.getFullYear() === today.getFullYear();
    }).length;

    if (count === 0) {
        msgEl.innerHTML = `You have <span class="font-bold text-green-500">0 assignments</span> due today. Clear skies! ☀️`;
    } else {
        msgEl.innerHTML = `You have <span class="font-bold text-primary text-xl">${count} assignment${count > 1 ? 's' : ''}</span> due today!!!`;
    }
}

/* --- MATRIX (UPDATED WITH BUFFER MATH) --- */
function renderMatrix() {
    const body = document.getElementById('matrix-body');
    const headerRow = document.getElementById('matrix-header-row');
    if(!body || !headerRow) return;

    headerRow.innerHTML = `<th class="p-4 text-left text-muted font-bold w-32 bg-surface border-b border-border sticky left-0 z-10 shadow-lg">Date</th>`;
    classes.forEach(c => { 
        headerRow.innerHTML += `<th class="p-4 text-left font-bold border-b border-border min-w-[180px]" style="color:${classPreferences[c] || '#888'}">${c}</th>`; 
    });

    body.innerHTML = '';
    const today = new Date();

    for (let i = 0; i < 7; i++) {
        const rowDate = new Date(today);
        rowDate.setDate(today.getDate() + i);

        const dayName = rowDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = rowDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
        const isToday = i === 0;

        let rowHTML = `
        <tr class="${isToday ? "bg-primary/5" : "hover:bg-surface/30"} border-b border-border transition-colors">
            <td class="p-4 bg-surface border-r border-border sticky left-0 z-10 ${isToday ? "text-primary font-extrabold" : "font-bold text-muted"}">
                ${isToday ? "Today" : dayName} <span class="text-xs opacity-70 block font-normal">${dateStr}</span>
            </td>`;

        classes.forEach(cls => {
            const tasks = globalTasks.filter(t => {
                if(t.completed || t.course !== cls) return false;
                const d = new Date(t.due);
                return d.getDate() === rowDate.getDate() && d.getMonth() === rowDate.getMonth();
            });

            rowHTML += `<td class="p-2 align-top matrix-cell">`;
            tasks.forEach(t => rowHTML += createMatrixCard(t));
            rowHTML += `</td>`;
        });

        rowHTML += `</tr>`;
        body.innerHTML += rowHTML;
    }
}

function createMatrixCard(t) {
    const color = classPreferences[t.course] || '#888';

    // --- PROCRASTINATION BUFFER LOGIC ---
    // 1. Get Buffer (Default to 0 if undefined)
    const buffer = (typeof settings !== 'undefined' && settings.buffer) ? parseInt(settings.buffer) : 0;

    // 2. Calculate the "Fake" Display Time
    // Subtract buffer minutes from the real due date
    const realDate = new Date(t.due);
    const displayDate = new Date(realDate.getTime() - (buffer * 60000)); // 60000ms = 1 minute

    const timeStr = displayDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    // --- PROGRESS BAR ---
    let progressHtml = '';
    if(t.checklist && t.checklist.length > 0) {
        const done = t.checklist.filter(i=>i.done).length;
        const total = t.checklist.length;
        const pct = (done / total) * 100;

        progressHtml = `
        <div class="mt-3">
            <div class="flex justify-between items-end mb-1">
                <span class="text-[9px] font-bold text-muted uppercase tracking-wider">Progress</span>
                <span class="text-[9px] font-bold text-primary">${done}/${total}</span>
            </div>
            <div class="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div class="h-full bg-primary transition-all duration-500 ease-out" style="width:${pct}%"></div>
            </div>
        </div>`;
    }

    // Visual cue if buffer is active (Optional: makes time italic)
    const timeClass = buffer > 0 ? "text-orange-500 font-bold" : "text-muted";
    const bufferIcon = buffer > 0 ? `<i class="fa-solid fa-clock-rotate-left mr-1" title="Buffer Active (-${buffer}m)"></i>` : `<i class="fa-regular fa-clock mr-1"></i>`;

    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border rounded-lg mb-2 shadow-sm p-3 hover:scale-[1.02] transition-all cursor-pointer group relative hover:border-primary/50">
        <div class="absolute top-0 left-0 right-0 h-1" style="background:${color}"></div>
        <div class="flex justify-between mb-1 mt-1">
            <i class="fa-solid fa-book text-[10px] text-muted"></i>
            <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-green-500"><i class="fa-regular fa-square"></i></button>
        </div>
        <div class="font-bold text-sm leading-tight mb-1 text-text">${t.title}</div>
        <div class="text-xs ${timeClass} flex justify-between">
            <span class="flex items-center">${bufferIcon} ${timeStr}</span>
            <span class="text-muted">${t.est}m</span>
        </div>
        ${progressHtml}
    </div>`;
}

/* --- OTHER RENDERERS --- */
function renderCompleted() {
    const list = document.getElementById('list-completed');
    if(!list) return;
    list.innerHTML = '';

    const doneTasks = globalTasks.filter(t => t.completed).sort((a,b) => new Date(b.due) - new Date(a.due));
    if(doneTasks.length === 0) { list.innerHTML = `<div class="text-muted italic">No completed tasks yet.</div>`; return; }

    doneTasks.forEach(t => { 
        list.innerHTML += `
        <div class="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border opacity-60">
            <i class="fa-solid fa-check-circle text-accent text-xl"></i>
            <div><div class="font-bold line-through">${t.title}</div><div class="text-xs text-muted">${t.course}</div></div>
        </div>`; 
    });
}

function renderProfile() {
    const list = document.getElementById('profile-list');
    if(!list) return;
    list.innerHTML = '';

    classes.forEach(c => { 
        const color = classPreferences[c] || '#888';
        const total = globalTasks.filter(t => t.course === c).length;
        const pending = globalTasks.filter(t => t.course === c && !t.completed).length;

        list.innerHTML += `
        <div onclick="openClassDetail('${c}')" class="bg-surface p-6 rounded-xl border border-border flex justify-between items-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1" style="background:${color}"></div>
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style="background:${color}">${c.substring(0,1)}</div>
                <div><span class="font-bold text-lg block group-hover:text-primary transition-colors">${c}</span><span class="text-xs text-muted">${pending} Active • ${total} Total</span></div>
            </div>
            <button onclick="event.stopPropagation(); openStudentClassSettings('${c}')" class="bg-base hover:bg-border text-text px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-border z-10"><i class="fa-solid fa-palette"></i></button>
        </div>`; 
    });
}

function renderClassDetailList(className) {
    const container = document.getElementById('class-detail-list');
    if(!container) return;
    container.innerHTML = '';

    const tasks = globalTasks.filter(t => t.course === className).sort((a,b) => {
        if (a.completed === b.completed) return new Date(a.due) - new Date(b.due);
        return a.completed ? 1 : -1;
    });

    if(tasks.length === 0) { container.innerHTML = `<div class="p-8 text-center text-muted italic">No assignments found for ${className}.</div>`; return; }

    tasks.forEach(t => {
        const isLate = !t.completed && new Date(t.due) < new Date();
        const dateStr = new Date(t.due).toLocaleDateString() + ' ' + new Date(t.due).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        container.innerHTML += `
        <div onclick="openTaskDetails(${t.id})" class="flex items-center justify-between p-3 rounded-lg hover:bg-base cursor-pointer border border-transparent hover:border-border transition-colors group">
            <div class="flex items-center gap-3">
                <div class="text-${t.completed ? 'green-500' : (isLate ? 'red-500' : 'muted')}"><i class="fa-${t.completed ? 'solid fa-circle-check' : 'regular fa-circle'}"></i></div>
                <div><div class="font-bold text-sm ${t.completed ? 'line-through text-muted' : ''}">${t.title}</div><div class="text-[10px] text-muted">${dateStr}</div></div>
            </div>
            <div class="text-xs font-bold ${t.completed ? 'text-green-500' : 'text-primary'}">${t.completed ? 'DONE' : 'ACTIVE'}</div>
        </div>`;
    });
}

function renderStudentBulletins() {
    const container = document.getElementById('student-bulletin-area');
    if (!container) return;
    container.innerHTML = '';
    let hasBulletins = false;
    if(typeof classBulletins !== 'undefined') {
        classes.forEach(cls => {
            const b = classBulletins[cls];
            if (b && b.active) {
                hasBulletins = true;
                const color = classPreferences[cls] || '#888';
                container.innerHTML += `
                <div class="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-4 shadow-sm mb-2 animate-pulse">
                    <div class="w-1 h-10 rounded-full" style="background:${color}"></div>
                    <div class="flex-1">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-2"><i class="fa-solid fa-thumbtack text-yellow-600"></i> ${cls} • Instructor Message</div>
                        <div class="font-bold text-yellow-700 dark:text-yellow-400 text-sm leading-relaxed">"${b.msg}"</div>
                    </div>
                </div>`;
            }
        });
    }
    if (hasBulletins) container.classList.remove('hidden'); else container.classList.add('hidden');
}

function renderBackpackList() {
    const container = document.getElementById('backpack-list');
    if (!container) return;
    if (!settings.backpack || settings.backpack.length === 0) settings.backpack = ["💻 Laptop & Charger", "📚 Homework Folder", "✏️ Pencil Case"];
    container.innerHTML = '';
    settings.backpack.forEach((item, index) => {
        container.innerHTML += `
        <div class="flex items-center justify-between bg-base p-2 rounded-lg border border-border group">
            <span class="text-sm ml-2">${item}</span>
            <button onclick="deleteBackpackItem(${index})" class="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-surface w-6 h-6 rounded flex items-center justify-center transition-all"><i class="fa-solid fa-xmark"></i></button>
        </div>`;
    });
}