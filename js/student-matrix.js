/* =========================================
              STUDENT MATRIX 
   ========================================= */

function renderMatrix() {
    const headerRow = document.getElementById('matrix-header-row');
    const body = document.getElementById('matrix-body');

    if(!headerRow || !body) return;

    // --- 1. RENDER HEADER ---
    // The "Day" column
    headerRow.innerHTML = `<th class="p-4 text-left text-muted font-bold w-32 bg-surface border-b border-border sticky left-0 z-10 shadow-lg">Date</th>`;

    // The Class columns
    classes.forEach(c => { 
        const color = classPreferences[c] || '#888'; 
        headerRow.innerHTML += `<th class="p-4 text-left font-bold border-b border-border min-w-[180px]" style="color:${color}">${c}</th>`; 
    });

    // --- 2. RENDER ROWS (Rolling 7 Days) ---
    body.innerHTML = '';

    const today = new Date();

    // Loop for the next 7 days (0 to 6)
    for (let i = 0; i < 7; i++) {

        const currentRowDate = new Date(today);
        currentRowDate.setDate(today.getDate() + i);

        const dayName = currentRowDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = currentRowDate.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });

        const isToday = i === 0;
        const rowClass = isToday ? "bg-primary/5 border-b border-border" : "border-b border-border hover:bg-surface/30 transition-colors";
        const textClass = isToday ? "text-primary font-extrabold" : "font-bold text-muted";
        const label = isToday ? `Today <span class="text-xs opacity-70 block font-normal">${dateStr}</span>` : `${dayName} <span class="text-xs opacity-70 block font-normal">${dateStr}</span>`;

        let rowHTML = `<tr class="${rowClass}">
            <td class="p-4 bg-surface border-r border-border ${textClass} sticky left-0 z-10 align-middle">
                ${label}
            </td>`;

        classes.forEach(cls => {

            const cellTasks = globalTasks.filter(t => {
                if(t.completed || t.course !== cls) return false;

                const taskDue = new Date(t.due);

                return taskDue.getDate() === currentRowDate.getDate() &&
                       taskDue.getMonth() === currentRowDate.getMonth() &&
                       taskDue.getFullYear() === currentRowDate.getFullYear();
            }); 

            rowHTML += `<td class="p-2 align-top matrix-cell">`;
            cellTasks.forEach(t => rowHTML += createMatrixCard(t));
            rowHTML += `</td>`;
        });

        rowHTML += `</tr>`;
        body.innerHTML += rowHTML;
    }
}

function createMatrixCard(t) {
    const color = classPreferences[t.course] || '#888';

    // Safety check for settings buffer
    const buffer = typeof settings !== 'undefined' ? (settings.buffer || 0) : 0;

    // Calculate display time (accounting for buffer if needed)
    const displayDate = new Date(new Date(t.due).getTime() - (buffer * 60000));
    const timeStr = displayDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    // Icon Selection
    let icon = 'fa-book';
    if (t.type === 'TEST') icon = 'fa-triangle-exclamation';
    if (t.type === 'PROJECT') icon = 'fa-shapes';
    if (t.type === 'HOMEWORK') icon = 'fa-pencil';

    // Checklist Progress Bar
    let progressHtml = '';
    if(t.checklist && t.checklist.length > 0) {
        const done = t.checklist.filter(i=>i.done).length;
        const total = t.checklist.length;
        const pct = (done/total)*100;

        // Color changes based on completion
        let barColor = 'bg-primary';
        if(pct === 100) barColor = 'bg-green-500';

        progressHtml = `
        <div class="mt-2 h-1.5 w-full bg-base rounded-full overflow-hidden border border-border/50">
            <div class="h-full ${barColor} transition-all duration-300" style="width:${pct}%"></div>
        </div>`;
    }

    // High Priority / Pinned Visuals
    const pinClass = t.pinned ? 'border-l-4 border-l-yellow-400' : '';

    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border rounded-lg mb-2 shadow-sm overflow-hidden hover:shadow-md hover:scale-[1.02] hover:border-primary transition-all group cursor-pointer relative ${pinClass}">
        <!-- Color Strip -->
        <div class="h-1 w-full" style="background:${color}"></div>

        <div class="p-3">
            <div class="flex justify-between items-start mb-1">
                <div class="flex items-center gap-1.5">
                    <i class="fa-solid ${icon} text-muted text-[10px]"></i>
                    ${t.pinned ? '<i class="fa-solid fa-thumbtack text-yellow-500 text-[10px]"></i>' : ''}
                </div>

                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <!-- Bump Button (Move to Next Day) -->
                    <button onclick="event.stopPropagation(); bumpTask(${t.id})" class="text-muted hover:text-primary w-6 h-6 flex items-center justify-center rounded hover:bg-base transition-colors" title="Move to tomorrow">
                        <i class="fa-solid fa-calendar-plus text-[10px]"></i>
                    </button>
                    <!-- Complete Button -->
                    <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-green-500 w-6 h-6 flex items-center justify-center rounded hover:bg-base transition-colors" title="Complete">
                        <i class="fa-regular fa-square"></i>
                    </button>
                </div>
            </div>

            <div class="font-bold text-sm leading-tight mb-1 text-text">${t.title}</div>

            <div class="flex justify-between items-center text-xs text-muted">
                <span><i class="fa-regular fa-clock text-[10px] mr-1"></i>${timeStr}</span>
                <span class="group-hover:text-primary transition-colors"><i class="fa-solid fa-hourglass-half text-[10px] mr-1"></i>${t.est}m</span>
            </div>
            ${progressHtml}
        </div>
    </div>`;
}