/* =========================================
   AUTHENTICATION (Fixed for 3 Roles)
   ========================================= */

const USERS_KEY = "operation_twa_users";
let isRegistering = false; 
let selectedRole = 'student'; // Default

// 1. Role Selection UI
function setRole(role) { 
    selectedRole = role;

    // UI Styling
    const activeClass = "bg-primary text-white border-primary shadow-lg transform scale-105";
    const inactiveClass = "text-muted hover:text-text hover:bg-surface border-transparent";

    // Reset all
    ['student', 'teacher', 'admin'].forEach(r => {
        const btn = document.getElementById(`btn-role-${r}`);
        if(btn) {
            btn.className = `flex-1 py-3 text-xs font-bold rounded-lg transition-all border ${inactiveClass}`;
        }
    });

    // Highlight selected
    const activeBtn = document.getElementById(`btn-role-${role}`);
    if(activeBtn) {
        activeBtn.className = `flex-1 py-3 text-xs font-bold rounded-lg transition-all border ${activeClass}`;
    }
}

// 2. Toggle Login vs Signup
function toggleAuthMode() {
    isRegistering = !isRegistering;
    const nameField = document.getElementById('field-name-container');
    const submitBtn = document.getElementById('btn-auth-submit');
    const toggleText = document.getElementById('auth-toggle-text');
    const errorMsg = document.getElementById('login-error');

    if(errorMsg) errorMsg.classList.add('hidden');
    document.getElementById('loginPassword').value = ''; 

    if(isRegistering) {
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
    if(e) e.preventDefault();

    const email = document.getElementById('loginEmail').value.toLowerCase().trim();
    const password = document.getElementById('loginPassword').value;

    const usersRaw = localStorage.getItem(USERS_KEY);
    let users = usersRaw ? JSON.parse(usersRaw) : [];

    if (isRegistering) {
        // REGISTER
        const name = document.getElementById('loginName').value.trim();
        if(!name) return showError("Name required.");
        if(users.find(u => u.email === email)) return showError("Email taken.");

        const newUser = { email, password, name, role: selectedRole, classes: [] };
        users.push(newUser);
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
        completeLogin(newUser);

    } else {
        // LOGIN
        const user = users.find(u => u.email === email);
        if (!user) return showError("User not found.");
        if (user.password !== password) return showError("Wrong password.");

        // IMPORTANT: If logging in as Admin, force role check
        // If standard login, respect the DB role, unless it's a generic login
        if (user.role !== selectedRole) {
            // Optional: You can auto-update the user's role here if you want
            // or just warn them. For now, let's trust the database role.
            console.log(`User is ${user.role}, but clicked ${selectedRole}. Using DB role.`);
        }

        completeLogin(user);
    }
}

function completeLogin(user) {
    localStorage.setItem("twa_current_user", JSON.stringify(user));
    window.location.href = "dashboard.html";
}

function showError(msg) {
    const el = document.getElementById('login-error');
    if(el) {
        el.innerText = msg;
        el.classList.remove('hidden');
    }
}

// Dev Bypass
function bypassLogin() {
    // Check which button is active to decide bypass role
    completeLogin({
        name: "Dev User",
        email: "dev@twa.edu", 
        password: "dev",
        role: selectedRole,
        classes: [] 
    });
}

// Init
document.addEventListener("DOMContentLoaded", () => {
    setRole('student');
});