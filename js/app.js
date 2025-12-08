/* ==========================================================================
   MAIN ENTRY POINT (Application Start)
   ==========================================================================
   PURPOSE:
   1. The first script to run when the page loads.
   2. Security Check: Kicks the user out if they aren't logged in.
   3. Data Loading: Pulls user data from memory.
   4. UI Routing: Decides whether to show the Student or Teacher view.
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Application Starting...");

    // 1. AUTHENTICATION CHECK (Guard Clause)
    // We check LocalStorage immediately. If no user is found, redirect to login.
    const storedUser = localStorage.getItem("twa_current_user");

    if (!storedUser) {
        console.warn("No active session found. Redirecting to login.");
        window.location.href = "index.html";
        return; // Stop execution here so the app doesn't try to load data
    }

    // 2. HYDRATE STATE (Load Data)
    // Convert the stored text string back into a JavaScript Object
    currentUser = JSON.parse(storedUser);

    // Default to 'student' if the role is missing for some reason
    userRole = currentUser.role || 'student'; 

    // Load tasks, settings, and preferences (Function from storage.js)
    if (typeof loadData === 'function') {
        loadData();
    }

    // 3. INITIALIZE ROLE-SPECIFIC UI
    // Based on the role, we trigger the specific startup logic.
    if (userRole === 'student') {
        if (typeof initStudentUI === 'function') {
            initStudentUI();
        } else {
            console.error("Critical Error: initStudentUI function is missing!");
        }
    } else {
        // Assumes 'teacher' or 'admin' role
        if (typeof initTeacherUI === 'function') {
            initTeacherUI();
        } else {
            console.error("Critical Error: initTeacherUI function is missing!");
        }
    }
});

/* =========================================
   GLOBAL LOGOUT
   ========================================= */

function doLogout() {
    // 1. Save one last time to ensure no data is lost
    if (typeof saveData === 'function') {
        saveData();
    }

    // 2. Destroy the session (Remove the key)
    localStorage.removeItem("twa_current_user");

    // 3. Redirect back to the login screen
    window.location.href = "index.html";
}