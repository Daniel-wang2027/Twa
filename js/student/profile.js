/* =========================================
   STUDENT PROFILE & LISTS
   ========================================= */

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

function renderBackpackList() {
    const container = document.getElementById('backpack-list');
    if (!container) return;
    if (!settings.backpack) settings.backpack = [];

    container.innerHTML = '';

    settings.backpack.forEach((item, index) => {
        let displayText = item.text || item;
        let badge = "";

        if (typeof item === 'string' || item.type === 'always') {
            badge = `<span class="text-[9px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-bold uppercase">Daily</span>`;
        } 
        else if (item.type === 'weekday') {
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const vals = Array.isArray(item.value) ? item.value : [item.value];
            // Convert numbers to short names
            const dayNames = vals.map(d => days[d]).join(", ");
            badge = `<span class="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase truncate max-w-[120px]">${dayNames}</span>`;
        } 
        else if (item.type === 'cycle') {
            const vals = Array.isArray(item.value) ? item.value.join(", ") : item.value;
            badge = `<span class="text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded font-bold uppercase">Day ${vals}</span>`;
        }

        container.innerHTML += `
        <div class="flex items-center justify-between bg-base p-2.5 rounded-lg border border-border group hover:border-primary/30 transition-colors">
            <div class="flex items-center gap-2 overflow-hidden flex-1">
                <span class="text-sm truncate">${displayText}</span>
                ${badge}
            </div>
            <button onclick="deleteBackpackItem(${index})" class="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-surface w-6 h-6 rounded flex items-center justify-center transition-all shrink-0">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`;
    });
}