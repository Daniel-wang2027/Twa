/* ==========================================================================
   DATA PERSISTENCE (Save/Load)
   ==========================================================================
   PURPOSE: 
   - Saves user-specific data to the browser's LocalStorage.
   - Separate data is kept for each user based on their email address.

   STORAGE KEY FORMAT: 
   "operation_twa_v17_data_user@email.com"
   ========================================================================== */

/**
 * Serializes current global state and saves it to LocalStorage.
 * Call this function whenever a significant change happens (e.g., adding a task).
 */
function saveData() {
    // 1. Safety Check: Don't save if we don't know who the user is.
    if (!currentUser || !currentUser.email) return; 

    // 2. Generate User-Specific Key
    const userKey = `${STORAGE_KEY}_${currentUser.email}`;

    // 3. Bundle Data
    const data = {
        tasks: globalTasks,
        settings: settings,
        streak: streak,
        classes: classes,               // Saves custom class list
        preferences: classPreferences,  // Saves color choices
        teacherTasks: teacherTasks,
        bulletins: classBulletins
    };

    // 4. Write to Storage
    localStorage.setItem(userKey, JSON.stringify(data));
    console.log(`System Saved for: ${currentUser.email}`);
}

/**
 * Retrieves data from LocalStorage and updates the application state.
 * Also applies visual settings (Theme/Fonts) immediately.
 */
function loadData() {
    if (!currentUser || !currentUser.email) return;

    const userKey = `${STORAGE_KEY}_${currentUser.email}`;
    const raw = localStorage.getItem(userKey);

    if (raw) {
        try {
            const data = JSON.parse(raw);

            // Restore Data (Only if it exists in the save file)
            if (data.tasks)        globalTasks = data.tasks;
            if (data.settings)     settings = data.settings;
            if (data.streak)       streak = data.streak;
            if (data.classes)      classes = data.classes;
            if (data.preferences)  classPreferences = data.preferences;
            if (data.teacherTasks) teacherTasks = data.teacherTasks;
            if (data.bulletins)    classBulletins = data.bulletins;

            // --- Apply Visual Settings Immediately ---
            // This prevents the screen from "flashing" the default theme on load.

            // 1. Theme (Colors)
            if (settings.theme) {
                document.documentElement.setAttribute('data-theme', settings.theme);
            }

            // 2. Accessibility (Dyslexia Font)
            document.body.classList.toggle('dyslexia-mode', settings.dyslexia);

            // 3. Reset Timer Defaults
            // (Ensures the Pomodoro timer uses the user's preferred lengths)
            if (typeof resetTimer === 'function') resetTimer();

        } catch (error) {
            console.error("Critical Error loading save data:", error);
            console.warn("The save file might be corrupted. Using default settings.");
        }
    }
}