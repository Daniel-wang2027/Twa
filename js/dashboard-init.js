/* =========================================
   DASHBOARD INIT (Debug Version)
   ========================================= */

document.addEventListener("DOMContentLoaded", () => {
    try {
        console.log("Dashboard initializing...");

        // 1. Check if User is Logged In
        const storedUser = localStorage.getItem("twa_current_user");

        if (!storedUser) {
            console.log("No user found. Redirecting...");
            window.location.href = "index.html";
            return;
        }

        // 2. Load User & Data
        if (typeof currentUser !== 'undefined') {
            currentUser = JSON.parse(storedUser);
            userRole = currentUser.role || 'student';
        } else {
            throw new Error("data.js is not loaded (currentUser missing)");
        }

        // 3. Load Persistence
        if (typeof loadData === 'function') {
            loadData();
        } else {
            throw new Error("utils.js is not loaded (loadData missing)");
        }

        // 4. Start the UI
        if (userRole === 'student') {
            if (typeof initStudent === 'function') {
                initStudent(); // This un-hides the layout
            } else {
                throw new Error("student-core.js is missing or broken");
            }
        } else {
            if (typeof initTeacher === 'function') {
                initTeacher();
            } else {
                throw new Error("teachers.js is missing");
            }
        }

    } catch (err) {
        // EMERGENCY: Show error on screen so you can see it
        alert("CRITICAL ERROR:\n" + err.message);
        console.error(err);

        // Attempt to force show layout so you aren't stuck on blank screen
        const layout = document.getElementById('student-layout');
        if(layout) layout.classList.remove('hidden');
    }
});

function doLogout() {
    if(typeof saveData === 'function') saveData();
    localStorage.removeItem("twa_current_user");
    window.location.href = "index.html";
}