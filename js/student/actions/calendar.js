/* ==========================================================================
   STUDENT: CALENDAR ACTIONS (Drag & Drop Logic)
   ==========================================================================
   PURPOSE: 
   1. Handles Week Navigation.
   2. Manages the complex logic of dropping a task onto a specific time slot.
   3. Handles unscheduling tasks (dragging back to sidebar).
   ========================================================================== */

/* =========================================
   1. NAVIGATION
   ========================================= */

function changeCalendarWeek(amount) {
    if (amount === 0) calendarOffset = 0; // Reset to Today
    else calendarOffset += amount;

    if (typeof renderCalendar === 'function') renderCalendar();
}

function changeStudentPlannerWeek(amount) {
    if (amount === 0) studentPlannerOffset = 0;
    else studentPlannerOffset += amount;

    if (typeof renderStudentPlanner === 'function') renderStudentPlanner();
}

/* =========================================
   2. DRAG & DROP HANDLERS
   ========================================= */

/**
 * Required to allow dropping. Prevents default browser behavior (opening files).
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Triggered when dragging starts.
 * Packs the Task ID and Duration into the drag payload.
 */
function handleDragStart(ev, taskId, duration) {
    // FIX: Convert ID to string.
    // Some IDs are numbers (timestamps), some are strings (Backpack tasks).
    // Converting to string ensures consistency when parsing later.
    const idStr = String(taskId);

    const payload = JSON.stringify({ id: idStr, est: duration });

    ev.dataTransfer.setData("text/plain", payload);
    ev.dataTransfer.effectAllowed = "move";
}

/**
 * Triggered when dropping a task onto a calendar column.
 * Calculates exact time based on mouse Y position.
 */
function handleCalendarDrop(ev, columnTimestamp) {
    ev.preventDefault();

    const rawData = ev.dataTransfer.getData("text/plain");
    if (!rawData) return;

    const data = JSON.parse(rawData);

    // TYPE SAFETY: Use loose comparison (==) to find the task.
    // This handles cases where data.id is "123" (string) but task.id is 123 (number).
    const task = globalTasks.find(t => t.id == data.id);

    if (!task) {
        console.error("Task not found for ID:", data.id);
        return;
    }

    // --- 1. CALCULATE DROP POSITION ---
    // Get the bounding box of the column we dropped into
    const rect = ev.currentTarget.getBoundingClientRect();

    // Calculate mouse Y relative to the top of that column
    const offsetY = ev.clientY - rect.top;

    // Constants from renderer (Must match!)
    const PIXELS_PER_HOUR = 100;
    const START_HOUR = 6;

    // Math: Convert pixel offset to hours
    const hoursFromStart = offsetY / PIXELS_PER_HOUR;
    const dropHour = START_HOUR + hoursFromStart;

    // --- 2. SNAP TO GRID ---
    // Round to nearest 15 minutes (0.25 hours)
    const snappedHour = Math.round(dropHour * 4) / 4;

    // --- 3. CREATE DATE OBJECT ---
    // Use the column's timestamp (midnight) as the base
    const proposedDate = new Date(columnTimestamp);

    // Extract Hours and Minutes from the decimal hour (e.g. 9.75 -> 9:45)
    const h = Math.floor(snappedHour);
    const m = (snappedHour - h) * 60;

    proposedDate.setHours(h, m, 0, 0);

    // --- 4. VALIDATE (Buffer Check) ---
    // Ensure task doesn't end AFTER the due date
    const bufferMins = (settings.buffer || 0);
    const effectiveDue = new Date(new Date(task.due).getTime() - (bufferMins * 60000));
    const durationMins = task.est || 30;

    const proposedEnd = new Date(proposedDate.getTime() + (durationMins * 60000));

    if (proposedEnd > effectiveDue) {
        alert(`Too late! \nDeadline: ${effectiveDue.toLocaleTimeString()} (with buffer)`);
        return; // Cancel drop
    }

    // --- 5. SAVE & UPDATE ---
    task.plannedDate = proposedDate.toISOString();
    saveData();

    if (typeof renderCalendar === 'function') renderCalendar();
    playSound('click');
}

/**
 * Handles dropping a task back into the "Unscheduled" sidebar.
 * Removes the time assignment.
 */
function handleUnscheduleDrop(ev) {
    ev.preventDefault();
    const rawData = ev.dataTransfer.getData("text/plain");
    if (!rawData) return;

    const data = JSON.parse(rawData);

    // Loose comparison again for safety
    const task = globalTasks.find(t => t.id == data.id);

    if (task) {
        task.plannedDate = null; // Clear schedule
        saveData();
        if (typeof renderCalendar === 'function') renderCalendar();
    }
}