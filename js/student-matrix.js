/* =========================================
   STUDENT MATRIX (The Grid View)
   ========================================= */

function renderMatrix() {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    const headerRow = document.getElementById('matrix-header-row');
    const body = document.getElementById('matrix-body');

    if(!headerRow || !body) return;

    // Render Header
    headerRow.innerHTML = `<th class="p-4 text-left text-muted font-bold w-32 bg-surface border-b border-border sticky left-0 z-10 shadow-lg">Day</th>`;
    classes.forEach(c => { 
        const color = classPreferences[c] || '#888'; 
        headerRow.innerHTML += `<th class="p-4 text-left font-bold border-b border-border min-w-[180px]" style="color:${color}">${c}</th>`; 
    });

    // Render Body
    body.innerHTML = '';
    days.forEach((day, dayIndex) => {
        let rowHTML = `<tr class="border-b border-border hover:bg-surface/30 transition-colors">
            <td class="p-4 bg-surface border-r border-border font-bold sticky left-0 z-10">${day}</td>`;

        classes.forEach(cls => {
            // Filter tasks for this specific Cell (Class + Day)
            const cellTasks = globalTasks.filter(t => 
                !t.completed && 
                t.course === cls && 
                (new Date(t.due).getDay() === dayIndex + 1)
            ); 

            rowHTML += `<td class="p-2 align-top matrix-cell">`;
            cellTasks.forEach(t => rowHTML += createMatrixCard(t));
            rowHTML += `</td>`;
        });

        rowHTML += `</tr>`;
        body.innerHTML += rowHTML;
    });
}

function createMatrixCard(t) {
    const color = classPreferences[t.course] || '#888';

    // Adjust time based on procrastination buffer
    const displayDate = new Date(new Date(t.due).getTime() - (settings.buffer * 60000));
    const timeStr = displayDate.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    const icon = t.type === 'TEST' ? 'fa-triangle-exclamation' : 'fa-book';

    // Progress bar logic
    let progressHtml = '';
    if(t.checklist && t.checklist.length > 0) {
        const done = t.checklist.filter(i=>i.done).length;
        const total = t.checklist.length;
        progressHtml = `<div class="mt-2 h-1 w-full bg-base rounded-full overflow-hidden"><div class="h-full bg-primary" style="width:${(done/total)*100}%"></div></div>`;
    }

    // Note: event.stopPropagation() is crucial on the button so clicking the checkmark doesn't open the edit modal
    return `
    <div onclick="openTaskDetails(${t.id})" class="bg-surface border border-border rounded-lg mb-2 shadow-sm overflow-hidden hover:shadow-md hover:scale-[1.02] transition-all group cursor-pointer relative">
        <div class="h-1 w-full" style="background:${color}"></div>
        <div class="p-3">
            <div class="flex justify-between items-start mb-1">
                <i class="fa-solid ${icon} text-muted text-xs"></i>
                <button onclick="event.stopPropagation(); toggleComplete(${t.id})" class="text-muted hover:text-accent w-6 h-6 flex items-center justify-center rounded hover:bg-base transition-colors">
                    <i class="fa-regular fa-square"></i>
                </button>
            </div>
            <div class="font-bold text-sm leading-tight mb-1">${t.title}</div>
            <div class="flex justify-between items-center text-xs text-muted">
                <span><i class="fa-regular fa-clock"></i> ${timeStr}</span>
                <span class="group-hover:text-primary"><i class="fa-solid fa-stopwatch"></i> ${t.est}m</span>
            </div>
            ${progressHtml}
        </div>
    </div>`;
}