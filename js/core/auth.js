/* ==========================================================================
   AUTHENTICATION MANAGER
   ==========================================================================
   PURPOSE: Handles Login, Sign Up, and Role Selection.

   DEPENDENCIES:
   - Uses 'operation_twa_users' in localStorage to store all accounts.
   - Redirects to 'dashboard.html' upon success.
   ========================================================================== */

const USERS_KEY = "operation_twa_users";

// State Variables
let isRegistering = false;   // true = Sign Up, false = Log In
let selectedRole = 'student'; // Defaults to student

/* =========================================
   1. ROLE SELECTION UI
   ========================================= */

/**
 * Updates the visual state of the Role buttons (Student/Teacher/Admin).
 * Note: This sets the 'selectedRole' variable used during registration.
 */
function setRole(role) { 
    selectedRole = role;

    // CSS Classes for button states (Tailwind)
    const activeClass = "bg-primary text-white border-primary shadow-lg transform scale-105";
    const inactiveClass = "text-muted hover:text-text hover:bg-surface border-transparent";

    // 1. Reset all buttons to inactive
    ['student', 'teacher', 'admin'].forEach(r => {
        const btn = document.getElementById(`btn-role-${r}`);
        if (btn) {
            btn.className = `flex-1 py-3 text-xs font-bold rounded-lg transition-all border ${inactiveClass}`;
        }
    });

    // 2. Highlight the selected button
    const activeBtn = document.getElementById(`btn-role-${role}`);
    if (activeBtn) {
        activeBtn.className = `flex-1 py-3 text-xs font-bold rounded-lg transition-all border ${activeClass}`;
    }
}

/* =========================================
   2. UI TOGGLES (LOGIN vs SIGNUP)
   ========================================= */

function toggleAuthMode() {
    isRegistering = !isRegistering;

    const nameField = document.getElementById('field-name-container');
    const submitBtn = document.getElementById('btn-auth-submit');
    const toggleText = document.getElementById('auth-toggle-text');
    const errorMsg = document.getElementById('login-error');

    // Hide error messages when switching modes
    if (errorMsg) errorMsg.classList.add('hidden');

    // Clear password field for security
    document.getElementById('loginPassword').value = ''; 

    if (isRegistering) {
        // Switch to "Create Account" mode
        nameField.classList.remove('hidden');
        submitBtn.innerText = "Create Account";
        toggleText.innerText = "Already have an account? Log In";
    } else {
        // Switch to "Log In" mode
        nameField.classList.add('hidden');
        submitBtn.innerText = "Log In";
        toggleText.innerText = "Need an account? Sign Up";
    }
}

/* =========================================
   3. AUTHENTICATION LOGIC
   ========================================= */

function handleAuth(e) {
    if (e) e.preventDefault(); // Stop form from reloading the page

    // Get and normalize inputs
    const email = document.getElementById('loginEmail').value.toLowerCase().trim();
    const password = document.getElementById('loginPassword').value;

    // Fetch existing users from storage
    const usersRaw = localStorage.getItem(USERS_KEY);
    let users = usersRaw ? JSON.parse(usersRaw) : [];

    if (isRegistering) {
        // --- REGISTRATION LOGIC ---
        const name = document.getElementById('loginName').value.trim();

        if (!name) return showError("Name is required.");

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return showError("This email is already registered.");
        }

        // Create new user object
        const newUser = { 
            email, 
            password, 
            name, 
            role: selectedRole, 
            classes: [] 
        };

        // Save to LocalStorage
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));

        completeLogin(newUser);

    } else {
        // --- LOGIN LOGIC ---
        const user = users.find(u => u.email === email);

        if (!user) return showError("User not found.");
        if (user.password !== password) return showError("Incorrect password.");

        // Role Mismatch Check:
        // If the user tries to log in as "Teacher" but their account is "Student",
        // we log them in anyway but use their ACTUAL role from the database.
        if (user.role !== selectedRole) {
            console.warn(`User selected ${selectedRole}, but account is ${user.role}. Using account role.`);
        }

        completeLogin(user);
    }
}

/**
 * Saves the current user to session and redirects to the dashboard.
 */
function completeLogin(user) {
    localStorage.setItem("twa_current_user", JSON.stringify(user));
    window.location.href = "dashboard.html";
}

function showError(msg) {
    const el = document.getElementById('login-error');
    if (el) {
        el.innerText = msg;
        el.classList.remove('hidden');
    }
}

/* =========================================
   4. DEVELOPER TOOLS
   ========================================= */

/**
 * BYPASS LOGIN
 * Creates a temporary session without checking credentials.
 * USAGE: Call this from the console or a hidden button to speed up testing.
 */
function bypassLogin() {
    completeLogin({
        name: "Dev User",
        email: "dev@twa.edu", 
        password: "dev",
        role: selectedRole, // Uses whatever button is currently highlighted
        classes: [] 
    });
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    setRole('student');
});