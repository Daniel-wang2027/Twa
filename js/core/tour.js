/* ==========================================================================
   INTERACTIVE ONBOARDING TOUR (Fixed: Runs Once)
   ========================================================================== */

let tourStep = 0;
let tourScenario = [];

// --- CONFIGURATION: EXPANDED TOURS ---
const TOURS = {
    student: [
        {
            target: null, 
            title: "Welcome to The Week Ahead",
            text: "Your Executive Functioning HUD. Let's take a tour of your new productivity system.",
            position: 'center'
        },
        {
            target: '#nav-s-dashboard',
            title: "The Matrix View",
            text: "This is your home base. Assignments are organized by Class (Columns) and Date (Rows).",
            position: 'right'
        },
        {
            target: '#btn-view-planner', 
            title: "Brain-Friendly Views",
            text: "Not a list person? Switch between Matrix, Weekly Planner, Linear Stream, or Kanban Board here.",
            position: 'bottom'
        },
        {
            target: '#nav-s-calendar',
            title: "Time Blocker",
            text: "Drag & drop tasks into time slots to plan *when* you will actually do the work.",
            position: 'right'
        },
        {
            // Use querySelector logic for buttons without IDs
            target: 'button[onclick="openStudentModal()"]', 
            title: "Quick Capture",
            text: "Click this + button anywhere to add a personal task or reminder immediately.",
            position: 'left'
        },
        {
            target: '#timer-container',
            title: "Focus Tools",
            text: "Use the built-in Pomodoro timer to stay on track. Click the time to switch between Focus and Break modes.",
            position: 'bottom'
        },
        {
            target: '#nav-s-settings',
            title: "Backpack Protocol",
            text: "Never forget your gear. Configure your packing list in Settings, and it will auto-populate on your dashboard based on the day.",
            position: 'right'
        },
        {
            target: null,
            title: "You're Ready!",
            text: "Start by checking your Matrix or setting up your Backpack Protocol.",
            position: 'center'
        }
    ],
    teacher: [
        { 
            target: null, 
            title: "Faculty Hub", 
            text: "Welcome! This dashboard streamlines lesson planning and student tracking.", 
            position: 'center' 
        },
        { 
            target: '#teacher-class-list', 
            title: "Class Navigation", 
            text: "Switch between your different sections here to update their specific schedules.", 
            position: 'right' 
        },
        { 
            target: '#teacher-planner-grid', 
            title: "The Planner", 
            text: "Your digital lesson book. Click inside the top box to set the Daily Topic.", 
            position: 'center' 
        },
        { 
            target: 'button[onclick="setBulletin()"]', 
            title: "Sticky Notes",
            text: "Post a global announcement (like 'Bring Textbooks') to the top of every student's dashboard.",
            position: 'bottom'
        },
        { 
            target: 'button[onclick="bulkShiftDates()"]', 
            title: "Snow Day Protocol",
            text: "School cancelled? Click this to instantly shift all due dates forward by 1 day.",
            position: 'bottom'
        },
        { 
            target: '#student-roster-sidebar', 
            title: "Student Roster",
            text: "See who is active, idle, or offline. Click 'View' to see exactly what that student sees.",
            position: 'right' 
        },
        { 
            target: null, 
            title: "All Set!", 
            text: "Start by selecting a class and adding your first Daily Topic.", 
            position: 'center' 
        }
    ]
};

function startOnboarding(role) {
    if (!role || !TOURS[role]) return;

    // --- FIX: CHECK IF DONE ---
    // If this key exists in LocalStorage, stop immediately.
    if (localStorage.getItem(`twa_tour_done_${role}`)) {
        return;
    }

    tourScenario = TOURS[role];
    tourStep = 0;

    const container = document.getElementById('tour-container');
    if(container) {
        container.classList.remove('hidden');
        setTimeout(renderTourStep, 100);
    }
}

function renderTourStep() {
    if (!tourScenario || !tourScenario[tourStep]) {
        endTour();
        return;
    }

    const step = tourScenario[tourStep];
    const highlight = document.getElementById('tour-highlight');
    const tooltip = document.getElementById('tour-tooltip');

    // 1. Update Text
    document.getElementById('tour-title').innerText = step.title;
    document.getElementById('tour-text').innerText = step.text;
    document.getElementById('tour-step').innerText = `${tourStep + 1} / ${tourScenario.length}`;

    // 2. Find Target
    let targetEl = null;
    if (step.target) {
        targetEl = document.querySelector(step.target);
    }

    // 3. Position Elements
    if (targetEl) {
        // Auto Scroll to element
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

        const rect = targetEl.getBoundingClientRect();

        // Move Highlight Box
        highlight.style.opacity = "1";
        highlight.style.top = `${rect.top - 10}px`;
        highlight.style.left = `${rect.left - 10}px`;
        highlight.style.width = `${rect.width + 20}px`;
        highlight.style.height = `${rect.height + 20}px`;

        positionTooltip(rect, step.position);
    } else {
        // Center Screen (Fallback or Intro)
        highlight.style.opacity = "0"; 
        centerTooltip();
    }

    // Fade In Tooltip
    tooltip.style.opacity = "0";
    setTimeout(() => tooltip.style.opacity = "1", 300);
}

function positionTooltip(targetRect, position) {
    const tooltip = document.getElementById('tour-tooltip');
    if(!tooltip) return;

    // Reset styles
    tooltip.style.top = ""; tooltip.style.left = ""; 
    tooltip.style.bottom = ""; tooltip.style.right = "";
    tooltip.style.transform = "";

    const spacing = 20;
    const tooltipWidth = 320;
    const tooltipHeight = 200; 

    const winW = window.innerWidth;
    const winH = window.innerHeight;

    let top, left;

    if (position === 'right') {
        top = targetRect.top;
        left = targetRect.right + spacing;
        if (left + tooltipWidth > winW) left = targetRect.left - tooltipWidth - spacing;
    } 
    else if (position === 'left') {
        top = targetRect.top;
        left = targetRect.left - tooltipWidth - spacing;
    }
    else if (position === 'bottom') {
        top = targetRect.bottom + spacing;
        left = targetRect.left;
        if (top + tooltipHeight > winH) top = targetRect.top - tooltipHeight - spacing;
    }
    else if (position === 'top') {
        top = targetRect.top - tooltipHeight - spacing;
        left = targetRect.left;
    }

    if (top !== undefined && left !== undefined) {
        // Clamp Horizontal
        if (left < 10) left = 10;
        if (left + tooltipWidth > winW) left = winW - tooltipWidth - 10;

        // Clamp Vertical
        if (top < 10) top = 10;
        if (top + tooltipHeight > winH) top = winH - tooltipHeight - 10;

        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
    } else {
        centerTooltip();
    }
}

function centerTooltip() {
    const tooltip = document.getElementById('tour-tooltip');
    tooltip.style.top = "50%";
    tooltip.style.left = "50%";
    tooltip.style.transform = "translate(-50%, -50%)";
}

function nextTourStep() {
    if (tourStep < tourScenario.length - 1) {
        tourStep++;
        renderTourStep();
    } else {
        endTour();
    }
}

function endTour() {
    const container = document.getElementById('tour-container');
    if(container) container.classList.add('hidden');

    // --- FIX: SAVE COMPLETION STATUS ---
    // This prevents the tour from running again
    if(typeof userRole !== 'undefined') {
        localStorage.setItem(`twa_tour_done_${userRole}`, 'true');
    }
}