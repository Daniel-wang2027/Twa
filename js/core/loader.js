/* ==========================================================================
   MAIN APPLICATION ENTRY (Fragment Loader)
   ==========================================================================
   PURPOSE: 
   1. Checks if the user is logged in.
   2. Loads their specific settings (Theme, Accessibility).
   3. Fetches their class list from the Catalog.
   4. Dynamically injects the correct HTML (Student vs Teacher view).

   DEPENDENCIES:
   - catalog.js (for getCourseDetails)
   - styles.css (for accessibility classes)
   ========================================================================== */

document.addEventListener("DOMContentLoaded", async () => {

    // 1. AUTHENTICATION CHECK
    const storedUser = localStorage.getItem("twa_current_user");

    if (!storedUser) {
        // Redirect to login if no session found
        window.location.href = "index.html";
        return;
    }

    // Initialize Global User Object
    currentUser = JSON.parse(storedUser);
    userRole = currentUser.role || 'student';

    console.log(`Initializing Dashboard for: ${currentUser.name} (${userRole})`);

    // 2. APPLY USER SETTINGS (Visual Overrides)
    // We do this immediately so the UI doesn't "flicker" after loading
    if (typeof settings !== 'undefined' && settings) {
        const body = document.body;

        if (settings.dyslexia) body.classList.add('dyslexia-mode');
        if (settings.reducedMotion) body.classList.add('motion-reduce');
        if (settings.density) body.classList.add(`density-${settings.density}`);

        if (settings.colorBlindMode && settings.colorBlindMode !== 'none') {
            body.classList.add(`cb-${settings.colorBlindMode}`);
        }

        // Set 24h Time Toggle in UI if element exists
        const time24El = document.getElementById('setting-time24');
        if (time24El) time24El.checked = settings.timeFormat24 || false;
    }

    // 3. HYDRATE CLASS DATA
    // Converts Class IDs (e.g. "1103") into Names (e.g. "English") and assigns colors.
    if (currentUser.classes && currentUser.classes.length > 0) {
        classes = []; // Reset global classes array

        // Define fallback colors for new classes
        const palette = [
            "#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", 
            "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e"
        ];

        currentUser.classes.forEach(id => {
            // Check if catalog.js is loaded
            if (typeof getCourseDetails === 'function') {
                const course = getCourseDetails(id);

                if (course) {
                    classes.push(course.name);

                    // If this class doesn't have a color yet, pick a random one
                    if (!classPreferences[course.name]) {
                        classPreferences[course.name] = palette[Math.floor(Math.random() * palette.length)];
                    }
                }
            } else {
                // Fallback if catalog missing
                classes.push(id); 
            }
        });

        // Ensure "Personal" category always exists
        if (!classes.includes("Personal")) classes.push("Personal");
    }

    // Load User Data (Tasks, Events) if function exists
    if (typeof loadData === 'function') loadData();

    // 4. LOAD HTML LAYOUTS (Single Page Application logic)
    // We fetch the HTML file for the specific role and inject it into the page.
    await loadLayout(userRole);
    await loadModals();

    // 5. INITIALIZE ROLE-SPECIFIC LOGIC
    try {
        if (userRole === 'student' && typeof initStudentUI === 'function') {
            initStudentUI();
        } 
        else if (userRole === 'teacher' && typeof initTeacherUI === 'function') {
            initTeacherUI();
        } 
        else if (userRole === 'admin' && typeof initAdminUI === 'function') {
            initAdminUI();
        }
    } catch (e) {
        console.error("Initialization Error during UI startup:", e);
    }
});

/* =========================================
   HTML FETCHING LOGIC
   ========================================= */

/**
 * Fetches the main dashboard HTML based on user role.
 * e.g., loads 'layouts/student.html' into the main container.
 */
async function loadLayout(role) {
    const container = document.getElementById('app-container');

    // Determine file path
    let fileName = 'layouts/student.html';
    if (role === 'teacher') fileName = 'layouts/teacher.html';
    if (role === 'admin') fileName = 'layouts/admin.html';

    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`Failed to load ${fileName}`);

        const html = await response.text();
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `
            <div class="p-10 text-red-500 font-bold">
                Error loading interface. Please ensure '${fileName}' exists. <br>
                ${err.message}
            </div>`;
    }
}

/**
 * Loads shared popups (Edit Task, Settings, etc.)
 */
async function loadModals() {
    const container = document.getElementById('modal-container');
    try {
        const response = await fetch('layouts/modals.html');
        if (!response.ok) throw new Error("Failed to load modals");

        const html = await response.text();
        container.innerHTML = html;
    } catch (err) {
        console.error("Modal load error", err);
    }
}

/**
 * Logs the user out and returns to login screen.
 */
function doLogout() {
    // Save data before leaving (if function exists)
    if (typeof saveData === 'function') saveData();

    localStorage.removeItem("twa_current_user");
    window.location.href = "index.html";
}