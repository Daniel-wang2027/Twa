/* ==========================================================================
   STUDENT: CALENDAR INTERACTIONS
   ==========================================================================
   PURPOSE: 
   1. Handles navigation (Next/Prev Week).
   2. Manages Drag & Drop logic for scheduling tasks into time slots.
   ========================================================================== */

/* =========================================
   1. NAVIGATION CONTROLS
   ========================================= */

function changeCalendarWeek(amount) {
    // If amount is 0, reset to 'Today'
    if (amount === 0) {
        calendarOffset = 0;
    } else {
        calendarOffset += amount;
    }

    if (typeof renderCalendar === 'function') renderCalendar();
}

function changeStudentPlannerWeek(amount) {
    if (amount === 0) {
        studentPlannerOffset = 0;
    } else {
        studentPlannerOffset += amount;
    }

    if (typeof renderStudentPlanner === 'function') renderStudentPlanner();
}

/* =========================================
   2. DRAG & DROP SCHEDULING LOGIC
   ========================================= */

/**
 * Standard HTML5 Dragover handler.
 * Required to allow an element to receive a drop.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Called when the user picks up a task.
 * Packs the Task ID and Duration into the drag event.
 */
function handleDragStart(ev, taskId, duration) {
    const payload = JSON.stringify({ id: taskId, est: duration });
    ev.dataTransfer.setData("text/plain", payload);
    ev.dataTransfer.effectAllowed = "move";
}

/**
 * Called when a task is dropped onto a specific Day Column.
 * Calculates the exact time based on the Y-position of the mouse.
 */
function handleCalendarDrop(ev, columnTimestamp) {
    ev.preventDefault();

    // 1. Retrieve Task Data
    const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    if (!globalTasks) return;

    const task = globalTasks.find(t => t.id === data.id);
    if (!task) return;

    // 2. Calculate Drop Position
    // We assume the calendar starts at 6:00 AM and each hour is 100px tall.
    const PIXELS_PER_HOUR = 100;
    const START_HOUR = 6;

    // Get mouse position relative to the top of the column
    const rect = ev.currentTarget.getBoundingClientRect();
    const offsetY = ev.clientY - rect.top;

    // Convert pixels to hours
    const hoursFromStart = offsetY / PIXELS_PER_HOUR;
    const dropHour = START_HOUR + hoursFromStart;

    // 3. Snap to Grid (15 Minute Intervals)
    // Multiplying by 4, rounding, then dividing by 4 snaps to nearest .25
    const snappedHour = Math.round(dropHour * 4) / 4;

    // 4. Construct the New Date
    // Use the timestamp of the column (midnight) + calculated hours/minutes
    const proposedDate = new Date(columnTimestamp);
    const h = Math.floor(snappedHour);
    const m = (snappedHour - h) * 60; // Convert decimal remainder to minutes

    proposedDate.setHours(h, m, 0, 0);

    // 5. Validation: Is it past the Due Date?
    // We consider the user's "Buffer" setting here.
    const bufferMins = (settings.buffer || 0);
    const effectiveDue = new Date(new Date(task.due).getTime() - (bufferMins * 60000));

    // Calculate when the task would finish
    const durationMins = task.est || 30;
    const proposedEnd = new Date(proposedDate.getTime() + (durationMins * 60000));

    if (proposedEnd > effectiveDue) {
        // Prevent drop if it violates the deadline
        alert(`You cannot schedule this task here.\nIt would finish after your deadline: ${effectiveDue.toLocaleTimeString()}`);
        return;
    }

    // 6. Save Changes
    task.plannedDate = proposedDate.toISOString();
    saveData();

    // Refresh View
    if (typeof renderCalendar === 'function') renderCalendar();
    playSound('click');
}

/**
 * Called when dropping a task back into the "Unscheduled" sidebar.
 * Removes the planned date.
 */
function handleUnscheduleDrop(ev) {
    ev.preventDefault();

    const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    const task = globalTasks.find(t => t.id === data.id);

    if (task) {
        task.plannedDate = null;
        saveData();
        if (typeof renderCalendar === 'function') renderCalendar();
    }
}