/* --- MAIN ENTRY POINT --- */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Check Auth
    const storedUser = localStorage.getItem("twa_current_user");
    if (!storedUser) {
        window.location.href = "index.html";
        return;
    }

    // 2. Hydrate State
    currentUser = JSON.parse(storedUser);
    userRole = currentUser.role || 'student';
    loadData(); // From storage.js

    // 3. Initialize Role View
    if (userRole === 'student') {
        if(typeof initStudentUI === 'function') initStudentUI();
    } else {
        // Init Teacher (if using teacher.js)
        if(typeof initTeacherUI === 'function') initTeacherUI();
    }
});

function doLogout() {
    saveData();
    localStorage.removeItem("twa_current_user");
    window.location.href = "index.html";
}