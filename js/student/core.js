/* =========================================
   STUDENT CORE: Init & Navigation
   ========================================= */

function initStudentUI() {
    document.getElementById('student-layout').classList.remove('hidden');

    // Profile Sidebar Data
    if(currentUser) {
        document.getElementById('s-profileInitials').innerText = currentUser.name.slice(0,2).toUpperCase();
        document.getElementById('s-profileName').innerText = currentUser.name;
    }
    document.getElementById('streak-count').innerText = `${streak} Day Streak`;
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString();

    // Initial Renders
    if(typeof renderMatrix === 'function') renderMatrix();
    renderWelcomeBanner();
    renderStudentBulletins();

    // Settings Renders
    if(typeof renderBackpackList === 'function') renderBackpackList();
    if(typeof renderThemeButtons === 'function') renderThemeButtons('theme-selector');

    // Load Preference
    if (typeof dashboardViewMode === 'undefined') dashboardViewMode = 'matrix';
    setDashboardView(dashboardViewMode);
}

function switchStudentView(view) {
    if(typeof playSound === 'function') playSound('click');

    // 1. Hide ALL views
    ['dashboard', 'completed', 'profile', 'settings', 'class-detail', 'calendar'].forEach(v => {
        const el = document.getElementById(`s-view-${v}`);
        const btn = document.getElementById(`nav-s-${v}`);

        if (el) el.classList.add('hidden');
        if (btn) btn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base border border-transparent";
    });

    // 2. Show TARGET view
    const targetEl = document.getElementById(`s-view-${view}`);
    const targetBtn = document.getElementById(`nav-s-${view}`);

    if (targetEl) {
        targetEl.classList.remove('hidden');
        // Force scroll to top
        const scroller = document.querySelector('.custom-scrollbar');
        if(scroller) scroller.scrollTop = 0;
    }

    if (targetBtn) {
        targetBtn.className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-base text-primary border border-border shadow-sm";
    }

    // 3. Render Data based on View
    if (view === 'dashboard') {
        // Dashboard has its own internal switcher (Matrix/Stream/etc), so we just ensure data is fresh
        if(dashboardViewMode === 'matrix' && typeof renderMatrix === 'function') renderMatrix();
        if(dashboardViewMode === 'planner' && typeof renderStudentPlanner === 'function') renderStudentPlanner();
        if(dashboardViewMode === 'stream' && typeof renderStream === 'function') renderStream();
        if(dashboardViewMode === 'kanban' && typeof renderKanban === 'function') renderKanban();

        renderWelcomeBanner();
        renderStudentBulletins();
    }
    if (view === 'calendar') {
        if(typeof renderCalendar === 'function') renderCalendar();
        setTimeout(() => {
            const scrollArea = document.getElementById('cal-scroll-area');
            if(scrollArea) scrollArea.scrollTop = 200; // Scroll to ~8am
        }, 10);
    }
    if (view === 'completed') {
        if(typeof renderCompleted === 'function') renderCompleted();
    }
    if (view === 'profile') {
        if(typeof renderProfile === 'function') renderProfile();
    }
}

function renderWelcomeBanner() {
    const nameEl = document.getElementById('banner-student-name');
    const msgEl = document.getElementById('banner-message');

    if(!nameEl || !msgEl) return;

    nameEl.innerText = currentUser.name.split(' ')[0]; 

    const today = new Date();
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
    if(typeof classBulletins !== 'undefined') {
        classes.forEach(cls => {
            const b = classBulletins[cls];
            if (b && b.active) {
                hasBulletins = true;
                const color = classPreferences[cls] || '#888';
                container.innerHTML += `
                <div class="bg-yellow-500/10 border border-yellow-500/50 p-4 rounded-xl flex items-start gap-4 shadow-sm mb-2 animate-pulse">
                    <div class="w-1 h-10 rounded-full" style="background:${color}"></div>
                    <div class="flex-1">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-2"><i class="fa-solid fa-thumbtack text-yellow-600"></i> ${cls} • Instructor Message</div>
                        <div class="font-bold text-yellow-700 dark:text-yellow-400 text-sm leading-relaxed">"${b.msg}"</div>
                    </div>
                </div>`;
            }
        });
    }
    if (hasBulletins) container.classList.remove('hidden'); else container.classList.add('hidden');
}