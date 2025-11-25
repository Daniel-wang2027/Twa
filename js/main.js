/* =========================================
   LOGIN PAGE LOGIC (index.html)
   ========================================= */

let isRegistering = false; // Tracks if we are on "Login" or "Sign Up" screen

function setRole(r) { 
    userRole = r; // Variable from data.js
    const active = "bg-primary text-white shadow-lg border-primary";
    const inactive = "text-muted hover:text-text hover:bg-surface border-transparent";
    document.getElementById('btn-role-student').className = `flex-1 py-3 text-sm font-bold rounded-lg transition-all border ${r==='student'?active:inactive}`;
    document.getElementById('btn-role-teacher').className = `flex-1 py-3 text-sm font-bold rounded-lg transition-all border ${r==='teacher'?active:inactive}`;
}

// Switches the form between Login mode and Sign Up mode
function toggleAuthMode() {
    isRegistering = !isRegistering;

    const nameField = document.getElementById('field-name-container');
    const submitBtn = document.getElementById('btn-auth-submit');
    const toggleText = document.getElementById('auth-toggle-text');
    const errorMsg = document.getElementById('login-error');

    // Reset error message and password
    errorMsg.classList.add('hidden');
    document.getElementById('loginPassword').value = '';

    if(isRegistering) {
        // Show Sign Up UI
        nameField.classList.remove('hidden');
        submitBtn.innerText = "Create Account";
        toggleText.innerText = "Already have an account? Log In";
    } else {
        // Show Login UI
        nameField.classList.add('hidden');
        submitBtn.innerText = "Log In";
        toggleText.innerText = "Need an account? Sign Up";
    }
}

function handleAuth(e) {
    if(e) e.preventDefault(); // Stop reload

    const email = document.getElementById('loginEmail').value.toLowerCase().trim();
    const password = document.getElementById('loginPassword').value;

    // 1. Get List of Users from Local Storage
    const usersRaw = localStorage.getItem(USERS_KEY);
    let users = usersRaw ? JSON.parse(usersRaw) : [];

    if (isRegistering) {
        // --- SIGN UP LOGIC ---
        const name = document.getElementById('loginName').value.trim();
        if(!name) return showError("Please enter your full name.");

        // Check if email already taken
        if(users.find(u => u.email === email)) {
            return showError("This email is already registered.");
        }

        // Create New User
        const newUser = { email: email, password: password, name: name, role: userRole };
        users.push(newUser);

        // Save updated user list
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        // Auto Login
        alert("Account created! Logging in...");
        completeLogin(newUser);

    } else {
        // --- LOGIN LOGIC ---
        const user = users.find(u => u.email === email);

        if (!user) return showError("Account not found.");
        if (user.password !== password) return showError("Incorrect password.");

        // Success
        completeLogin(user);
    }
}

function showError(msg) {
    const el = document.getElementById('login-error');
    el.innerText = msg;
    el.classList.remove('hidden');

    // Shake animation
    el.classList.add('animate-pulse');
    setTimeout(() => el.classList.remove('animate-pulse'), 500);
}

function completeLogin(user) {
    // 1. Save the session
    localStorage.setItem("twa_current_user", JSON.stringify(user));

    // 2. Redirect
    console.log("Redirecting to dashboard...");
    window.location.href = "dashboard.html";
}

/* =========================================
   DEVELOPER BYPASS
   ========================================= */
function bypassLogin() {
    console.log("Bypassing authentication...");

    // Create a fake user
    const dummyUser = {
        name: "Dev User",
        email: "developer@twa.edu", 
        password: "dev",
        role: userRole 
    };

    // Force login
    completeLogin(dummyUser);
}

// INITIALIZATION
document.documentElement.setAttribute('data-theme', 'space');
setRole('student');

const savedTheme = localStorage.getItem('twa_device_theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
} else {
    document.documentElement.setAttribute('data-theme', 'space'); // Default
}

// 2. Init Role
setRole('student');