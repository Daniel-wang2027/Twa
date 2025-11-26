/* =========================================
   AUTHENTICATION (Login/Signup Logic)
   ========================================= */
console.log("Auth script loaded.");

const USERS_KEY = "operation_twa_users";
let isRegistering = false;
let selectedRole = 'student';

// 1. Role Selection UI
function setRole(role) {
    console.log("Switching role to:", role);
    selectedRole = role;

    const activeClass = "border-primary bg-primary/10 text-primary shadow-sm";
    const inactiveClass = "border-transparent text-muted hover:text-text hover:bg-surface";

    const btnStudent = document.getElementById('btn-role-student');
    const btnTeacher = document.getElementById('btn-role-teacher');

    if (btnStudent && btnTeacher) {
        if (role === 'student') {
            btnStudent.className = `flex-1 py-3 text-sm font-bold rounded-lg transition-all border ${activeClass}`;
            btnTeacher.className = `flex-1 py-3 text-sm font-bold rounded-lg transition-all border ${inactiveClass}`;
        } else {
            btnStudent.className = `flex-1 py-3 text-sm font-bold rounded-lg transition-all border ${inactiveClass}`;
            btnTeacher.className = `flex-1 py-3 text-sm font-bold rounded-lg transition-all border ${activeClass}`;
        }
    }
}

// 2. Toggle Login vs Signup
function toggleAuthMode() {
    console.log("Toggling auth mode");
    isRegistering = !isRegistering;

    const nameField = document.getElementById('field-name-container');
    const submitBtn = document.getElementById('btn-auth-submit');
    const toggleText = document.getElementById('auth-toggle-text');
    const errorMsg = document.getElementById('login-error');

    if (errorMsg) errorMsg.classList.add('hidden');
    document.getElementById('loginPassword').value = '';

    if (isRegistering) {
        nameField.classList.remove('hidden');
        submitBtn.innerText = "Create Account";
        toggleText.innerText = "Already have an account? Log In";
    } else {
        nameField.classList.add('hidden');
        submitBtn.innerText = "Log In";
        toggleText.innerText = "Need an account? Sign Up";
    }
}

// 3. Handle Form Submit
function handleAuth(e) {
    if (e) e.preventDefault();
    console.log("Submitting form...");

    const emailInput = document.getElementById('loginEmail');
    const passInput = document.getElementById('loginPassword');

    if (!emailInput || !passInput) return;

    const email = emailInput.value.toLowerCase().trim();
    const password = passInput.value;

    const usersRaw = localStorage.getItem(USERS_KEY);
    let users = usersRaw ? JSON.parse(usersRaw) : [];

    if (isRegistering) {
        // REGISTER
        const name = document.getElementById('loginName').value.trim();
        if (!name) return showError("Please enter your full name.");

        if (users.find(u => u.email === email)) {
            return showError("Email already registered.");
        }

        const newUser = { email, password, name, role: selectedRole };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        completeLogin(newUser);

    } else {
        // LOGIN
        const user = users.find(u => u.email === email);
        if (!user) return showError("Account not found.");
        if (user.password !== password) return showError("Incorrect password.");

        // Update role preference
        user.role = selectedRole;
        completeLogin(user);
    }
}

function completeLogin(user) {
    console.log("Login successful:", user.name);
    localStorage.setItem("twa_current_user", JSON.stringify(user));
    window.location.href = "dashboard.html";
}

function showError(msg) {
    const el = document.getElementById('login-error');
    if (el) {
        el.innerText = msg;
        el.classList.remove('hidden');
        el.classList.add('animate-pulse');
        setTimeout(() => el.classList.remove('animate-pulse'), 500);
    }
}

function bypassLogin() {
    console.log("Bypassing...");
    completeLogin({
        name: "Dev User",
        email: "dev@twa.edu",
        password: "dev",
        role: selectedRole
    });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    // Force a default theme if none exists so buttons are visible
    if (!document.documentElement.hasAttribute('data-theme')) {
        document.documentElement.setAttribute('data-theme', 'space');
    }
    setRole('student');
});