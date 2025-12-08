/* ==========================================================================
   STUDENT CORE: INITIALIZATION & NAVIGATION
   ==========================================================================
   PURPOSE: 
   1. Initializes the Student Interface.
   2. Handles switching between main views (Dashboard, Calendar, History, etc).
   3. Handles plain language translation for accessibility.
   ========================================================================== */

/* =========================================
   1. INITIALIZATION
   ========================================= */

function initStudentUI() {
    console.log("🚀 Initializing Student UI...");

    // Show the main layout container
    document.getElementById('student-layout').classList.remove('hidden');

    // 1. Setup Profile Header
    if (typeof currentUser !== 'undefined' && currentUser) {
        const initials = document.getElementById('s-profileInitials');
        const name = document.getElementById('s-profileName');

        if (initials) initials.innerText = currentUser.name.slice(0,2).toUpperCase();
        if (name) name.innerText = currentUser.name;
    }

    // 2. Setup Stats & Config Inputs
    const streakEl = document.getElementById('streak-count');
    const dateEl = document.getElementById('currentDate');
    const densitySlider = document.getElementById('setting-density');

    // Sync slider with saved settings
    if (densitySlider && settings.density) {
        densitySlider.value = settings.density === "roomy" ? "1" : "0";
    }

    if (streakEl) streakEl.innerText = `${streak || 0} Day Streak`;
    if (dateEl) dateEl.innerText = new Date().toLocaleDateString();

    // 3. Initial Render (Safe Mode)
    // We check if functions exist before calling them to prevent crashes.
    if (typeof renderMatrix === 'function') renderMatrix();
    if (typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
    if (typeof renderStudentBulletins === 'function') renderStudentBulletins();
    if (typeof renderBackpackList === 'function') renderBackpackList();
    if (typeof renderThemeButtons === 'function') renderThemeButtons('theme-selector');

    // 4. Set Default View
    if (typeof dashboardViewMode === 'undefined') dashboardViewMode = 'matrix';
    switchStudentView('dashboard');
    updateInterfaceText(); // Apply plain language if needed

    // 5. Backpack Automation
    try {
        if (typeof generateWeeklyBackpackTasks === 'function') {
            generateWeeklyBackpackTasks();
        }
    } catch (e) {
        console.warn("Backpack generation skipped:", e);
    }
}

/* =========================================
   2. VIEW NAVIGATION CONTROLLER
   ========================================= */

/**
 * Switches the main content area.
 * @param {string} view - 'dashboard', 'calendar', 'completed', 'profile', 'settings'
 */
function switchStudentView(view) {
    if (typeof playSound === 'function') playSound('click');

    // 1. Hide ALL Views & Reset Nav Buttons
    const views = ['dashboard', 'completed', 'profile', 'settings', 'class-detail', 'calendar'];

    views.forEach(v => {
        const el = document.getElementById(`s-view-${v}`);
        const btn = document.getElementById(`nav-s-${v}`);

        if (el) el.classList.add('hidden');
        if (btn) {
            btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base border border-transparent";
        }
    });

    // 2. Show TARGET View
    const targetEl = document.getElementById(`s-view-${view}`);
    const targetBtn = document.getElementById(`nav-s-${view}`);

    if (targetEl) {
        targetEl.classList.remove('hidden');

        // Force scroll to top (UX Fix)
        const scroller = document.querySelector('.custom-scrollbar');
        if (scroller) scroller.scrollTop = 0;
    } else {
        console.error(`Error: View container 's-view-${view}' not found in HTML.`);
        return;
    }

    // Highlight Active Button
    if (targetBtn) {
        targetBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-base text-primary border border-border shadow-sm";
    }

    // 3. Trigger Specific Logic per View
    if (view === 'dashboard') {
        handleDashboardSubViews();
    }

    if (view === 'calendar') {
        if (typeof renderCalendar === 'function') {
            renderCalendar();
            // Scroll to 8:00 AM automatically
            setTimeout(() => {
                const scrollArea = document.getElementById('cal-scroll-area');
                if (scrollArea) scrollArea.scrollTop = 400; 
            }, 50);
        }
    }

    if (view === 'completed' && typeof renderCompleted === 'function') renderCompleted();
    if (view === 'profile' && typeof renderProfile === 'function') renderProfile();
}

/**
 * Helper to handle the sub-tabs inside the Dashboard (Matrix vs. List vs. Stream).
 */
function handleDashboardSubViews() {
    if (typeof dashboardViewMode === 'undefined') return;

    const mode = dashboardViewMode;

    // Toggle Visibility
    ['matrix', 'planner', 'stream', 'kanban'].forEach(m => {
        const subView = document.getElementById(`view-mode-${m}`);
        const subBtn = document.getElementById(`btn-view-${m}`);

        if (subView) {
            if (m === mode) subView.classList.remove('hidden');
            else subView.classList.add('hidden');
        }

        if (subBtn) {
            if (m === mode) subBtn.className = "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 bg-primary text-white shadow-sm";
            else subBtn.className = "px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 text-muted hover:text-text hover:bg-surface";
        }
    });

    // Render Data
    if (mode === 'matrix' && typeof renderMatrix === 'function') renderMatrix();
    if (mode === 'planner' && typeof renderStudentPlanner === 'function') renderStudentPlanner();
    if (mode === 'stream' && typeof renderStream === 'function') renderStream();
    if (mode === 'kanban' && typeof renderKanban === 'function') renderKanban();

    // Always update header widgets
    if (typeof renderWelcomeBanner === 'function') renderWelcomeBanner();
    if (typeof renderStudentBulletins === 'function') renderStudentBulletins();
}

/* =========================================
   3. DASHBOARD WIDGETS
   ========================================= */

function renderWelcomeBanner() {
    const nameEl = document.getElementById('banner-student-name');
    const msgEl = document.getElementById('banner-message');

    if (!nameEl || !msgEl) return;

    nameEl.innerText = currentUser.name.split(' ')[0]; // First name only

    const today = new Date();

    // Count tasks due TODAY that are NOT completed
    const count = globalTasks.filter(t => {
        if (t.completed) return false;

        const d = new Date(t.due);
        return d.getDate() === today.getDate() && 
               d.getMonth() === today.getMonth() && 
               d.getFullYear() === today.getFullYear();
    }).length;

    if (count === 0) {
        msgEl.innerHTML = `You have <span class="font-bold text-green-500">0 assignments</span> due today. Clear skies! ☀️`;
    } else {
        msgEl.innerHTML = `You have <span class="font-bold text-primary text-xl">${count} assignment${count > 1 ? 's' : ''}</span> due today!!!`;
    }
}

function renderStudentBulletins() {
    const container = document.getElementById('student-bulletin-area');
    if (!container) return;

    container.innerHTML = '';
    let hasBulletins = false;

    // Check if any enrolled classes have active bulletins
    if (typeof classBulletins !== 'undefined') {
        classes.forEach(cls => {
            const b = classBulletins[cls];
            if (b && b.active) {
                hasBulletins = true;
                const color = classPreferences[cls] || '#888';

                container.innerHTML += `
                <div class="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-4 shadow-sm mb-2 animate-pulse">
                    <div class="w-1 h-10 rounded-full" style="background:${color}"></div>
                    <div class="flex-1">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-2">
                            <i class="fa-solid fa-thumbtack text-yellow-600"></i> ${cls} • Instructor Message
                        </div>
                        <div class="font-bold text-yellow-700 dark:text-yellow-400 text-sm leading-relaxed">"${b.msg}"</div>
                    </div>
                </div>`;
            }
        });
    }

    // Toggle visibility based on content
    if (hasBulletins) container.classList.remove('hidden'); 
    else container.classList.add('hidden');
}

/* =========================================
   4. ACCESSIBILITY: PLAIN LANGUAGE
   ========================================= */

/**
 * Translates academic jargon into simple English.
 * Only active if settings.plainLanguage is true.
 */
function txt(original) {
    if (!settings || !settings.plainLanguage) return original;

    // Dictionary
    const map = {
        'Matrix': 'Grid',
        'Calendar': 'Time',
        'History': 'Finished',
        'Classes': 'Classes',
        'Settings': 'Tools',
        'Assignment': 'Work',
        'Assignments': 'Work',
        'Assessment': 'Test',
        'Project': 'Big Task',
        'Quiz': 'Check-in',
        'HOMEWORK': 'Work',
        'TEST': 'Test',
        'QUIZ': 'Check-in',
        'PROJECT': 'Big Task',
        'LAB': 'Hands-on',
        'ESSAY': 'Writing',
        'PRESENTATION': 'Talk',
        'READING': 'Read',
        'Task Archive': 'Finished Work',
        'Student HUD': 'My Board'
    };

    // Return translation or original if not found
    return map[original] || map[original.toUpperCase()] || original;
}

function updateInterfaceText() {
    // 1. Sidebar Buttons
    const updates = [
        { id: 'nav-s-dashboard', text: 'Matrix' },
        { id: 'nav-s-calendar',  text: 'Calendar' },
        { id: 'nav-s-completed', text: 'History' },
        { id: 'nav-s-profile',   text: 'Classes' },
        { id: 'nav-s-settings',  text: 'Settings' }
    ];

    updates.forEach(u => {
        const btn = document.getElementById(u.id);
        if (btn) {
            // Keep the icon, update the text label
            const icon = btn.querySelector('i').outerHTML; 
            btn.innerHTML = `${icon} ${txt(u.text)}`;
        }
    });

    // 2. Section Titles
    const histTitle = document.querySelector('#s-view-completed h2');
    if (histTitle) histTitle.innerText = txt('Task Archive');

    const hudTitle = document.querySelector('.tracking-tight');
    if (hudTitle && hudTitle.innerText === 'Student HUD') hudTitle.innerText = txt('Student HUD');
}