/* =========================================
   STUDENT: CALENDAR ACTIONS
   ========================================= */

function changeCalendarWeek(amount) {
    if (amount === 0) calendarOffset = 0;
    else calendarOffset += amount;

    if(typeof renderCalendar === 'function') renderCalendar();
}

function changeStudentPlannerWeek(amount) {
    if (amount === 0) studentPlannerOffset = 0;
    else studentPlannerOffset += amount;

    if(typeof renderStudentPlanner === 'function') renderStudentPlanner();
}

function allowDrop(ev) {
    ev.preventDefault();
}

function handleDragStart(ev, taskId, duration) {
    ev.dataTransfer.setData("text/plain", JSON.stringify({ id: taskId, est: duration }));
    ev.dataTransfer.effectAllowed = "move";
}

function handleCalendarDrop(ev, dateStr) {
    ev.preventDefault();

    const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    const task = globalTasks.find(t => t.id === data.id);
    if (!task) return;

    const rect = ev.currentTarget.getBoundingClientRect();
    const offsetY = ev.clientY - rect.top;

    // Constant MUST match render.js
    const PIXELS_PER_HOUR = 100;
    const START_HOUR = 6;

    const hoursFromStart = offsetY / PIXELS_PER_HOUR;
    const dropHour = START_HOUR + hoursFromStart;
    const snappedHour = Math.round(dropHour * 4) / 4;

    const proposedDate = new Date(dateStr);
    const h = Math.floor(snappedHour);
    const m = (snappedHour - h) * 60;
    proposedDate.setHours(h, m, 0, 0);

    // Validate Buffer
    const bufferMins = (settings.buffer || 0);
    const effectiveDue = new Date(new Date(task.due).getTime() - (bufferMins * 60000));

    const durationMins = task.est || 30;
    const proposedEnd = new Date(proposedDate.getTime() + (durationMins * 60000));

    if (proposedEnd > effectiveDue) {
        alert(`Cannot schedule!\nThis time is after your due date (minus buffer).`);
        return;
    }

    task.plannedDate = proposedDate.toISOString();
    saveData();
    if(typeof renderCalendar === 'function') renderCalendar();
    playSound('click');
}

function handleUnscheduleDrop(ev) {
    ev.preventDefault();
    const data = JSON.parse(ev.dataTransfer.getData("text/plain"));
    const task = globalTasks.find(t => t.id === data.id);

    if (task) {
        task.plannedDate = null;
        saveData();
        if(typeof renderCalendar === 'function') renderCalendar();
    }
}