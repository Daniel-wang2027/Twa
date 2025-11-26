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

    // 2. Hydrate State
    if(typeof currentUser !== 'undefined') {
        currentUser = JSON.parse(storedUser);
        userRole = currentUser.role || 'student';

        // Load Data from LocalStorage
        if(typeof loadData === 'function') loadData(); 
    }

    console.log(`Loading Dashboard for: ${userRole}`);

    // 3. Load The HTML Layouts
    await loadLayout(userRole);
    await loadModals();

    // 4. Start the Logic
    if (userRole === 'student') {
        if(typeof initStudentUI === 'function') initStudentUI();
    } else {
        if(typeof initTeacherUI === 'function') initTeacherUI();
    }
});

async function loadLayout(role) {
    const container = document.getElementById('app-container');
    // Ensure these paths match your folder structure exactly
    const fileName = role === 'student' ? 'layouts/student.html' : 'layouts/teacher.html';

    try {
        const response = await fetch(fileName);
        if (!response.ok) throw new Error(`Failed to load ${fileName}`);
        const html = await response.text();
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = `<div class="p-10 text-red-500">Error loading layout: ${err.message}</div>`;
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

// --- RESTORED LOGOUT FUNCTION ---
function doLogout() {
    // Attempt to save before leaving
    if(typeof saveData === 'function') saveData();

    // Clear Session
    localStorage.removeItem("twa_current_user");

    // Redirect
    window.location.href = "index.html";
}