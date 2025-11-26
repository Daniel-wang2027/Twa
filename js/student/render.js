/* =========================================
   STUDENT UI RENDERER
   ========================================= */

function initStudentUI() {
    document.getElementById('student-layout').classList.remove('hidden');

    // Profile Header
    if(currentUser) {
        document.getElementById('s-profileInitials').innerText = currentUser.name.slice(0,2).toUpperCase();
        document.getElementById('s-profileName').innerText = currentUser.name;
    }
    document.getElementById('streak-count').innerText = `${streak} Day Streak`;
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString();

    // Initial Renders
    renderMatrix();
    renderStats();
    if(typeof renderThemeButtons === 'function') renderThemeButtons('theme-selector');

    // Check if backpack exists
    if(typeof renderBackpackList === 'function') renderBackpackList();
}

function switchStudentView(view) {
    playSound('click');

    // Hide all views including the new detail view
    ['dashboard', 'completed', 'profile', 'settings', 'class-detail'].forEach(v => {
        const el = document.getElementById(`s-view-${v}`);
        const btn = document.getElementById(`nav-s-${v}`); // Nav buttons might not exist for detail view

        if(el) el.classList.add('hidden');
        if(btn) btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base";
    });

    const targetEl = document.getElementById(`s-view-${view}`);
    const targetBtn = document.getElementById(`nav-s-${view}`);

    if(targetEl) targetEl.classList.remove('hidden');
    // Only highlight nav if it exists (class-detail doesn't have a sidebar button)
    if(targetBtn) targetBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-base text-primary border border-border";

    if(view === 'dashboard') renderMatrix();
    if(view === 'completed') renderCompleted();
    if(view === 'profile') renderProfile();
}

/* --- DASHBOARD MATRIX --- */

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
    const timeStr = new Date(t.due).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    let progress = '';
    if(t.checklist && t.checklist.length > 0) {
        const pct = (t.checklist.filter(i=>i.done).length / t.checklist.length) * 100;
        progress = `<div class="mt-2 h-1 w-full bg-base rounded-full overflow-hidden"><div class="h-full bg-primary" style="width:${pct}%"></div></div>`;
    }

    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border rounded-lg mb-2 shadow-sm p-3 hover:scale-[1.02] transition-all cursor-pointer group relative">
        <div class="absolute top-0 left-0 right-0 h-1" style="background:${color}"></div>
        <div class="flex justify-between mb-1 mt-1">
            <i class="fa-solid fa-book text-[10px] text-muted"></i>
            <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-green-500"><i class="fa-regular fa-square"></i></button>
        </div>
        <div class="font-bold text-sm leading-tight mb-1">${t.title}</div>
        <div class="text-xs text-muted flex justify-between">
            <span>${timeStr}</span>
            <span>${t.est}m</span>
        </div>
        ${progress}
    </div>`;
}

/* --- STATS & COMPLETED --- */

function renderStats() {
    const bar = document.getElementById('stats-bar');
    if(!bar) return;
    bar.innerHTML = '';
    let counts = {};
    classes.forEach(c => counts[c] = 0);
    globalTasks.filter(t => t.completed).forEach(t => counts[t.course] = (counts[t.course]||0)+1);
    classes.slice(0,4).forEach(c => { 
        bar.innerHTML += `
        <div class="bg-surface p-3 rounded-xl border border-border">
            <div class="text-xs text-muted truncate">${c}</div>
            <div class="text-xl font-bold" style="color:${classPreferences[c]}">${counts[c]} Done</div>
        </div>`; 
    });
}

function renderCompleted() {
    const list = document.getElementById('list-completed');
    if(!list) return;
    list.innerHTML = '';

    const doneTasks = globalTasks.filter(t => t.completed).sort((a,b) => new Date(b.due) - new Date(a.due));

    if(doneTasks.length === 0) {
        list.innerHTML = `<div class="text-muted italic">No completed tasks yet.</div>`;
        return;
    }

    doneTasks.forEach(t => { 
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

/* --- PROFILE GRID --- */

function renderProfile() {
    const list = document.getElementById('profile-list');
    if(!list) return;
    list.innerHTML = '';

    classes.forEach(c => { 
        const color = classPreferences[c] || '#888';

        // Stats
        const total = globalTasks.filter(t => t.course === c).length;
        const pending = globalTasks.filter(t => t.course === c && !t.completed).length;

        list.innerHTML += `
        <div onclick="openClassDetail('${c}')" class="bg-surface p-6 rounded-xl border border-border flex justify-between items-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden">
            <div class="absolute left-0 top-0 bottom-0 w-1" style="background:${color}"></div>
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style="background:${color}">
                    ${c.substring(0,1)}
                </div>
                <div>
                    <span class="font-bold text-lg block group-hover:text-primary transition-colors">${c}</span>
                    <span class="text-xs text-muted">${pending} Active • ${total} Total</span>
                </div>
            </div>

            <button onclick="event.stopPropagation(); openStudentClassSettings('${c}')" class="bg-base hover:bg-border text-text px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-border z-10">
                <i class="fa-solid fa-palette"></i>
            </button>
        </div>`; 
    });
}

/* --- CLASS DETAIL LIST --- */

function renderClassDetailList(className) {
    const container = document.getElementById('class-detail-list');
    if(!container) return;
    container.innerHTML = '';

    const tasks = globalTasks.filter(t => t.course === className).sort((a,b) => {
        if (a.completed === b.completed) return new Date(a.due) - new Date(b.due);
        return a.completed ? 1 : -1;
    });

    if(tasks.length === 0) {
        container.innerHTML = `<div class="p-8 text-center text-muted italic">No assignments found for ${className}.</div>`;
        return;
    }

    tasks.forEach(t => {
        const isLate = !t.completed && new Date(t.due) < new Date();
        const dateStr = new Date(t.due).toLocaleDateString() + ' ' + new Date(t.due).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        container.innerHTML += `
        <div onclick="openTaskDetails(${t.id})" class="flex items-center justify-between p-3 rounded-lg hover:bg-base cursor-pointer border border-transparent hover:border-border transition-colors group">
            <div class="flex items-center gap-3">
                <div class="text-${t.completed ? 'green-500' : (isLate ? 'red-500' : 'muted')}">
                    <i class="fa-${t.completed ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </div>
                <div>
                    <div class="font-bold text-sm ${t.completed ? 'line-through text-muted' : ''}">${t.title}</div>
                    <div class="text-[10px] text-muted">${dateStr}</div>
                </div>
            </div>
            <div class="text-xs font-bold ${t.completed ? 'text-green-500' : 'text-primary'}">
                ${t.completed ? 'DONE' : 'ACTIVE'}
            </div>
        </div>`;
    });
}