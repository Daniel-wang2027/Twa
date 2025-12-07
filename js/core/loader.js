/* =========================================
   HTML FRAGMENT LOADER & MAIN ENTRY
   ========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    // 1. Check Auth
    const storedUser = localStorage.getItem("twa_current_user");
    if (!storedUser) {
        window.location.href = "index.html";
        return;
    }

    if (typeof currentUser !== 'undefined') {
        
        if (settings) {
            if(settings.dyslexia) document.body.classList.add('dyslexia-mode');
            if(settings.reducedMotion) document.body.classList.add('motion-reduce');
            if(settings.density) document.body.classList.add(`density-${settings.density}`);
            if(settings.colorBlindMode && settings.colorBlindMode !== 'none') document.body.classList.add(`cb-${settings.colorBlindMode}`);
        }
    }
    
    // In initStudentUI or loadData
    const time24El = document.getElementById('setting-time24');
    if (time24El && settings) {
        time24El.checked = settings.timeFormat24 || false;
    }
    // 2. Hydrate State & Load Dynamic Classes
    if (typeof currentUser !== 'undefined') {
        currentUser = JSON.parse(storedUser);
        userRole = currentUser.role || 'student';

        // --- DYNAMIC CLASS LOADING ---
        // If the user has assigned classes (from Admin), load them.
        if (currentUser.classes && currentUser.classes.length > 0) {
            classes = []; // Clear hardcoded defaults

            currentUser.classes.forEach(id => {
                // Look up details in catalog.js
                if (typeof getCourseDetails === 'function') {
                    const course = getCourseDetails(id);
                    if (course) {
                        classes.push(course.name);

                        // Assign a color if one doesn't exist
                        if (!classPreferences[course.name]) {
                            const colors = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#f43f5e"];
                            classPreferences[course.name] = colors[Math.floor(Math.random() * colors.length)];
                        }
                    }
                } else {
                    // Fallback if catalog isn't loaded
                    classes.push(id); 
                }
            });

            // Ensure "Personal" is always available
            if (!classes.includes("Personal")) classes.push("Personal");
        } 
        // -----------------------------

        // Load Task Data
        if (typeof loadData === 'function') loadData();
    }

    console.log(`Loading Dashboard for: ${userRole}`);

    // 3. Load The HTML Layouts
    await loadLayout(userRole);
    await loadModals();

    // 4. Start the Logic based on Role
    try {
        if (userRole === 'student') {
            if(typeof initStudentUI === 'function') initStudentUI();
        } else if (userRole === 'teacher') {
            if(typeof initTeacherUI === 'function') initTeacherUI();
        } else if (userRole === 'admin') {
            if(typeof initAdminUI === 'function') initAdminUI();
        }
    } catch (e) {
        console.error("Initialization Error:", e);
    }
});

async function loadLayout(role) {
    const container = document.getElementById('app-container');

    // Select File based on Role
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
        container.innerHTML = `<div class="p-10 text-red-500 font-bold">Error loading interface: ${err.message}</div>`;
    }
}

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

function doLogout() {
    if (typeof saveData === 'function') saveData();
    localStorage.removeItem("twa_current_user");
    window.location.href = "index.html";
}