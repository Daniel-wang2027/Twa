/* ==========================================================================
   STUDENT PROFILE & LIST RENDERERS
   ==========================================================================
   PURPOSE: 
   1. Renders the main Profile list (Your Classes).
   2. Renders the detail view for a specific class.
   3. Renders the "History" (Completed Tasks) view.
   4. Renders the "Backpack Configuration" list.
   ========================================================================== */

/* =========================================
   1. PROFILE (Class List)
   ========================================= */

function renderProfile() {
    const list = document.getElementById('profile-list');
    if (!list) return;

    list.innerHTML = '';

    classes.forEach(c => { 
        // Get class specific data
        const color = classPreferences[c] || '#888';
        const total = globalTasks.filter(t => t.course === c).length;
        const pending = globalTasks.filter(t => t.course === c && !t.completed).length;

        list.innerHTML += `
        <div onclick="openClassDetail('${c}')" class="bg-surface p-6 rounded-xl border border-border flex justify-between items-center shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer group relative overflow-hidden">
            <!-- Color Strip -->
            <div class="absolute left-0 top-0 bottom-0 w-1" style="background:${color}"></div>

            <div class="flex items-center gap-4">
                <!-- Class Icon/Initial -->
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style="background:${color}">
                    ${c.substring(0,1)}
                </div>

                <!-- Class Info -->
                <div>
                    <span class="font-bold text-lg block group-hover:text-primary transition-colors">${c}</span>
                    <span class="text-xs text-muted">${pending} Active • ${total} Total</span>
                </div>
            </div>

            <!-- Settings Button -->
            <button onclick="event.stopPropagation(); openStudentClassSettings('${c}')" class="bg-base hover:bg-border text-text px-3 py-2 rounded-lg text-xs font-bold transition-colors border border-transparent hover:border-border z-10">
                <i class="fa-solid fa-palette"></i>
            </button>
        </div>`; 
    });
}

/* =========================================
   2. CLASS DETAIL LIST
   ========================================= */

function renderClassDetailList(className) {
    const container = document.getElementById('class-detail-list');
    if (!container) return;

    container.innerHTML = '';

    // Filter & Sort Tasks
    // Order: Active tasks first (sorted by date), then Completed tasks.
    const tasks = globalTasks
        .filter(t => t.course === className)
        .sort((a,b) => {
            if (a.completed === b.completed) {
                // If completion status is same, sort by Date
                return new Date(a.due) - new Date(b.due);
            }
            // Put completed items at the bottom
            return a.completed ? 1 : -1;
        });

    // Empty State
    if (tasks.length === 0) { 
        container.innerHTML = `<div class="p-8 text-center text-muted italic">No assignments found for ${className}.</div>`; 
        return; 
    }

    tasks.forEach(t => {
        const isLate = !t.completed && new Date(t.due) < new Date();
        const dateStr = new Date(t.due).toLocaleDateString() + ' ' + new Date(t.due).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

        // FIX: Added quotes around '${t.id}' to prevent ID math errors
        container.innerHTML += `
        <div onclick="openTaskDetails('${t.id}')" class="flex items-center justify-between p-3 rounded-lg hover:bg-base cursor-pointer border border-transparent hover:border-border transition-colors group">
            <div class="flex items-center gap-3">
                <!-- Status Icon -->
                <div class="text-${t.completed ? 'green-500' : (isLate ? 'red-500' : 'muted')}">
                    <i class="fa-${t.completed ? 'solid fa-circle-check' : 'regular fa-circle'}"></i>
                </div>

                <!-- Title & Date -->
                <div>
                    <div class="font-bold text-sm ${t.completed ? 'line-through text-muted' : ''}">${t.title}</div>
                    <div class="text-[10px] text-muted">${dateStr}</div>
                </div>
            </div>

            <!-- Status Label -->
            <div class="text-xs font-bold ${t.completed ? 'text-green-500' : 'text-primary'}">
                ${t.completed ? 'DONE' : 'ACTIVE'}
            </div>
        </div>`;
    });
}

/* =========================================
   3. COMPLETED TASKS (History)
   ========================================= */

function renderCompleted() {
    const list = document.getElementById('list-completed');
    if (!list) return;

    list.innerHTML = '';

    // Sort by Due Date Descending (Newest first)
    const doneTasks = globalTasks
        .filter(t => t.completed)
        .sort((a,b) => new Date(b.due) - new Date(a.due));

    if (doneTasks.length === 0) { 
        list.innerHTML = `<div class="text-muted italic">No completed tasks yet.</div>`; 
        return; 
    }

    doneTasks.forEach(t => { 
        // FIX: Added onclick handler with quotes around '${t.id}' so you can click history items
        list.innerHTML += `
        <div onclick="openTaskDetails('${t.id}')" class="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border opacity-60 cursor-pointer hover:opacity-100 hover:border-primary/50 transition-all">
            <i class="fa-solid fa-check-circle text-accent text-xl"></i>
            <div>
                <div class="font-bold line-through">${t.title}</div>
                <div class="text-xs text-muted">${t.course}</div>
            </div>
        </div>`; 
    });
}

/* =========================================
   4. BACKPACK CONFIGURATION LIST
   ========================================= */

function renderBackpackList() {
    const container = document.getElementById('backpack-list');
    if (!container) return;

    // Ensure array exists
    if (!settings.backpack) settings.backpack = [];

    container.innerHTML = '';

    settings.backpack.forEach((item, index) => {
        let displayText = item.text || item; // Handle legacy string items
        let badge = "";

        // --- DETERMINE BADGE TYPE ---

        // 1. Daily Items
        if (typeof item === 'string' || item.type === 'always') {
            badge = `<span class="text-[9px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded font-bold uppercase">Daily</span>`;
        } 
        // 2. Weekday Specific (Mon, Tue...)
        else if (item.type === 'weekday') {
            const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            const vals = Array.isArray(item.value) ? item.value : [item.value];

            // Map numbers (1, 3) to names ("Mon, Wed")
            const dayNames = vals.map(d => days[d]).join(", ");

            badge = `<span class="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded font-bold uppercase truncate max-w-[120px]" title="${dayNames}">${dayNames}</span>`;
        } 
        // 3. Cycle Day Specific (Day 1, Day 4...)
        else if (item.type === 'cycle') {
            const vals = Array.isArray(item.value) ? item.value.join(", ") : item.value;
            badge = `<span class="text-[9px] bg-purple-500/10 text-purple-500 px-1.5 py-0.5 rounded font-bold uppercase">Day ${vals}</span>`;
        }

        // --- RENDER ITEM ROW ---
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