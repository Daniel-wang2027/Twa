/* =========================================
   STUDENT: BACKPACK PROTOCOL (Weekly Generator)
   ========================================= */

let bpSelectedCycles = [];   
let bpSelectedWeekdays = []; 

/* --- UI TOGGLES --- */
function toggleBpInputs() {
    const type = document.getElementById('bp-new-type').value;
    document.getElementById('bp-select-weekday').classList.add('hidden');
    document.getElementById('bp-select-cycle').classList.add('hidden');

    if (type === 'weekday') document.getElementById('bp-select-weekday').classList.remove('hidden');
    if (type === 'cycle') document.getElementById('bp-select-cycle').classList.remove('hidden');

    bpSelectedCycles = [];
    bpSelectedWeekdays = [];

    const resetBtnClass = "h-8 flex-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-primary transition-colors";
    document.querySelectorAll('#bp-select-cycle button').forEach(b => b.className = resetBtnClass);
    document.querySelectorAll('#bp-select-weekday button').forEach(b => b.className = resetBtnClass);
}

function toggleBpCycleDay(day, btn) {
    if (bpSelectedCycles.includes(day)) {
        bpSelectedCycles = bpSelectedCycles.filter(d => d !== day);
        btn.className = "h-8 flex-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-primary transition-colors";
    } else {
        bpSelectedCycles.push(day);
        btn.className = "h-8 flex-1 rounded bg-primary text-white text-xs font-bold shadow-sm transition-colors";
    }
}

function toggleBpWeekday(dayIndex, btn) {
    if (bpSelectedWeekdays.includes(dayIndex)) {
        bpSelectedWeekdays = bpSelectedWeekdays.filter(d => d !== dayIndex);
        btn.className = "h-8 flex-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-primary transition-colors";
    } else {
        bpSelectedWeekdays.push(dayIndex);
        btn.className = "h-8 flex-1 rounded bg-primary text-white text-xs font-bold shadow-sm transition-colors";
    }
}

/* --- ADD / REMOVE ITEMS --- */
function addBackpackItem() {
    const nameInput = document.getElementById('bp-new-name');
    const typeInput = document.getElementById('bp-new-type');
    const text = nameInput.value.trim();
    if (!text) return;

    let newItem = { text: text, type: typeInput.value, value: null };

    if (typeInput.value === 'weekday') {
        if (bpSelectedWeekdays.length === 0) return alert("Select a day.");
        newItem.value = bpSelectedWeekdays.sort((a,b) => a - b);
    } 
    else if (typeInput.value === 'cycle') {
        if (bpSelectedCycles.length === 0) return alert("Select a Cycle Day.");
        newItem.value = bpSelectedCycles.sort((a,b) => a - b);
    }

    if (!settings.backpack) settings.backpack = [];
    settings.backpack.push(newItem);

    nameInput.value = '';
    typeInput.value = 'always';
    toggleBpInputs();

    saveData();
    if(typeof renderBackpackList === 'function') renderBackpackList();
}

function deleteBackpackItem(index) {
    if(settings.backpack && settings.backpack[index]) {
        settings.backpack.splice(index, 1);
        saveData();
        if(typeof renderBackpackList === 'function') renderBackpackList();
    }
}

/* --- WEEKLY GENERATOR LOGIC --- */
function generateWeeklyBackpackTasks() {
    if (!settings.backpack || settings.backpack.length === 0) return;

    console.log("Generating Backpack tasks for the next 7 days...");
    const today = new Date();
    let madeChanges = false;

    // Loop through next 7 days
    for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);

        // 1. Determine Context
        const currentWeekday = targetDate.getDay(); 
        let currentCycle = null;
        if(typeof getCycleDay === 'function') currentCycle = getCycleDay(targetDate);

        // 2. Find Needed Items
        const itemsNeeded = settings.backpack.filter(item => {
            if (typeof item === 'string') return true; // Legacy support
            if (item.type === 'always') return true;

            if (item.type === 'weekday') {
                const vals = Array.isArray(item.value) ? item.value : [item.value];
                return vals.includes(currentWeekday);
            }

            if (item.type === 'cycle' && currentCycle !== null) {
                const vals = Array.isArray(item.value) ? item.value : [item.value];
                return vals.includes(currentCycle);
            }
            return false;
        });

        if (itemsNeeded.length === 0) continue;

        // 3. Check for Existing Task on this specific date
        const existingTask = globalTasks.find(t => {
            if (t.title !== "🎒 Backpack Check") return false;
            const d = new Date(t.due);
            return d.getDate() === targetDate.getDate() && 
                   d.getMonth() === targetDate.getMonth() && 
                   d.getFullYear() === targetDate.getFullYear();
        });

        const checklistData = itemsNeeded.map(item => ({ 
            text: item.text || item, 
            done: false 
        }));

        if (existingTask) {
            // Update Checklist (Merge logic: keep checked items checked)
            let updatedList = [];
            checklistData.forEach(newItem => {
                const oldItem = existingTask.checklist.find(k => k.text === newItem.text);
                if (oldItem) updatedList.push(oldItem); // Keep state
                else updatedList.push(newItem); // Add new
            });
            existingTask.checklist = updatedList;
            madeChanges = true;
        } else {
            // Create New Task
            const dueDate = new Date(targetDate);
            dueDate.setHours(23, 59, 0, 0);

            globalTasks.push({
                id: Date.now() + i, // Unique ID offset
                title: "🎒 Backpack Check", 
                course: "Personal", 
                due: dueDate.toISOString(),
                type: "TASK", 
                est: 5, 
                completed: false, 
                checklist: checklistData
            });
            madeChanges = true;
        }
    }

    if (madeChanges) {
        saveData();
        if(typeof renderMatrix === 'function') renderMatrix();
        if(typeof showToast === 'function') showToast("Weekly Backpack Plan Updated", "success");
    }
}