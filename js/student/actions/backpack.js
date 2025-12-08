/* ==========================================================================
   STUDENT: BACKPACK PROTOCOL (Weekly Generator)
   ==========================================================================
   PURPOSE: 
   1. Allows students to define rules (e.g. "Bring Violin on Day 3").
   2. Automatically generates a "Backpack Check" task for the next 7 days.
   3. Updates existing tasks if the rules change (without resetting checkboxes).

   DEPENDENCIES:
   - Requires 'getCycleDay()' from utilities.js
   - Requires 'settings.backpack' array.
   ========================================================================== */

// Temp storage for the "Add Item" modal
let bpSelectedCycles = [];   
let bpSelectedWeekdays = []; 

// CSS Constants for Toggle Buttons
const BTN_STYLE_RESET = "h-8 flex-1 rounded bg-base border border-border text-xs font-bold text-muted hover:text-primary transition-colors";
const BTN_STYLE_ACTIVE = "h-8 flex-1 rounded bg-primary text-white text-xs font-bold shadow-sm transition-colors";

/* =========================================
   1. UI INPUT HANDLERS (Modal Logic)
   ========================================= */

/**
 * Shows/Hides the Day selectors based on the dropdown choice.
 */
function toggleBpInputs() {
    const type = document.getElementById('bp-new-type').value;

    // Reset Visibility
    document.getElementById('bp-select-weekday').classList.add('hidden');
    document.getElementById('bp-select-cycle').classList.add('hidden');

    if (type === 'weekday') document.getElementById('bp-select-weekday').classList.remove('hidden');
    if (type === 'cycle') document.getElementById('bp-select-cycle').classList.remove('hidden');

    // Reset Data & Styles
    bpSelectedCycles = [];
    bpSelectedWeekdays = [];

    document.querySelectorAll('#bp-select-cycle button').forEach(b => b.className = BTN_STYLE_RESET);
    document.querySelectorAll('#bp-select-weekday button').forEach(b => b.className = BTN_STYLE_RESET);
}

function toggleBpCycleDay(day, btn) {
    if (bpSelectedCycles.includes(day)) {
        // Remove
        bpSelectedCycles = bpSelectedCycles.filter(d => d !== day);
        btn.className = BTN_STYLE_RESET;
    } else {
        // Add
        bpSelectedCycles.push(day);
        btn.className = BTN_STYLE_ACTIVE;
    }
}

function toggleBpWeekday(dayIndex, btn) {
    if (bpSelectedWeekdays.includes(dayIndex)) {
        // Remove
        bpSelectedWeekdays = bpSelectedWeekdays.filter(d => d !== dayIndex);
        btn.className = BTN_STYLE_RESET;
    } else {
        // Add
        bpSelectedWeekdays.push(dayIndex);
        btn.className = BTN_STYLE_ACTIVE;
    }
}

/* =========================================
   2. DATA MANAGEMENT (Add/Remove Rules)
   ========================================= */

function addBackpackItem() {
    const nameInput = document.getElementById('bp-new-name');
    const typeInput = document.getElementById('bp-new-type');
    const text = nameInput.value.trim();

    if (!text) return;

    let newItem = { 
        text: text, 
        type: typeInput.value, 
        value: null 
    };

    // Validation & sorting
    if (typeInput.value === 'weekday') {
        if (bpSelectedWeekdays.length === 0) return alert("Please select at least one weekday.");
        newItem.value = bpSelectedWeekdays.sort((a,b) => a - b);
    } 
    else if (typeInput.value === 'cycle') {
        if (bpSelectedCycles.length === 0) return alert("Please select at least one cycle day.");
        newItem.value = bpSelectedCycles.sort((a,b) => a - b);
    }

    // Initialize array if missing
    if (!settings.backpack) settings.backpack = [];
    settings.backpack.push(newItem);

    // Reset Form
    nameInput.value = '';
    typeInput.value = 'always';
    toggleBpInputs();

    saveData();
    if (typeof renderBackpackList === 'function') renderBackpackList();
}

function deleteBackpackItem(index) {
    if (settings.backpack && settings.backpack[index]) {
        settings.backpack.splice(index, 1);
        saveData();
        if (typeof renderBackpackList === 'function') renderBackpackList();
    }
}

/* =========================================
   3. TASK GENERATOR (The Core Logic)
   ========================================= */

/**
 * Scans the next 7 days.
 * Creates or Updates a "Backpack Check" task for each day based on the rules.
 */
function generateWeeklyBackpackTasks() {
    if (!settings.backpack || settings.backpack.length === 0) return;

    console.log("🎒 Generating Backpack tasks for the next 7 days...");

    const today = new Date();
    let madeChanges = false;

    // Loop through next 7 days
    for (let i = 0; i < 7; i++) {
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + i);

        // 1. Determine Schedule Context
        const currentWeekday = targetDate.getDay(); 
        let currentCycle = null;
        if (typeof getCycleDay === 'function') {
            currentCycle = getCycleDay(targetDate);
        }

        // 2. Filter Rules: What do we need today?
        const itemsNeeded = settings.backpack.filter(item => {
            // Support for older data versions (simple strings)
            if (typeof item === 'string') return true; 

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

        // Skip days with no requirements
        if (itemsNeeded.length === 0) continue;

        // 3. Check if a task already exists for this date
        const existingTask = globalTasks.find(t => {
            if (t.title !== "🎒 Backpack Check") return false;

            const d = new Date(t.due);
            return d.getDate() === targetDate.getDate() && 
                   d.getMonth() === targetDate.getMonth() && 
                   d.getFullYear() === targetDate.getFullYear();
        });

        // Convert rules into checklist items
        const newChecklistData = itemsNeeded.map(item => ({ 
            text: item.text || item, 
            done: false 
        }));

        if (existingTask) {
            // OPTION A: UPDATE EXISTING
            // Crucial: We must preserve the 'done' state of items user already checked off.
            let mergedList = [];

            newChecklistData.forEach(newItem => {
                const oldItem = existingTask.checklist.find(k => k.text === newItem.text);

                if (oldItem) {
                    mergedList.push(oldItem); // Keep old state (checked/unchecked)
                } else {
                    mergedList.push(newItem); // Add new requirement
                }
            });

            // Only save if the list actually changed length
            if (existingTask.checklist.length !== mergedList.length) {
                existingTask.checklist = mergedList;
                madeChanges = true;
            }

        } else {
            // OPTION B: CREATE NEW TASK
            const dueDate = new Date(targetDate);
            dueDate.setHours(23, 59, 0, 0);

            globalTasks.push({
                id: `${Date.now()}-${i}`, // Unique ID
                title: "🎒 Backpack Check", 
                course: "Personal", 
                due: dueDate.toISOString(),
                type: "TASK", 
                est: 5, 
                completed: false, 
                checklist: newChecklistData
            });
            madeChanges = true;
        }
    }

    // 4. Save & Refresh
    if (madeChanges) {
        saveData();
        if (typeof renderMatrix === 'function') renderMatrix();
        if (typeof showToast === 'function') showToast("Weekly Backpack Plan Updated", "success");
    }
}