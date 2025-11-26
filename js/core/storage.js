/* --- DATA PERSISTENCE --- */

function saveData() {
    if (!currentUser || !currentUser.email) return; 
    const userKey = `${STORAGE_KEY}_${currentUser.email}`;

    const data = {
        tasks: globalTasks,
        settings: settings,
        streak: streak,
        classes: classes,
        preferences: classPreferences,
        teacherTasks: teacherTasks,
        bulletins: classBulletins
    };

    localStorage.setItem(userKey, JSON.stringify(data));
    console.log("System Saved.");
}

function loadData() {
    if (!currentUser || !currentUser.email) return;
    const userKey = `${STORAGE_KEY}_${currentUser.email}`;
    const raw = localStorage.getItem(userKey);

    if (raw) {
        const data = JSON.parse(raw);
        if(data.tasks) globalTasks = data.tasks;
        if(data.settings) settings = data.settings;
        if(data.streak) streak = data.streak;
        if(data.classes) classes = data.classes;
        if(data.preferences) classPreferences = data.preferences;
        if(data.teacherTasks) teacherTasks = data.teacherTasks;
        if(data.bulletins) classBulletins = data.bulletins;

        // Apply System Settings Immediately
        if(settings.theme) document.documentElement.setAttribute('data-theme', settings.theme);
        document.body.classList.toggle('dyslexia-mode', settings.dyslexia);

        // Reset Timer to stored preference
        if(typeof resetTimer === 'function') resetTimer();
    }
}