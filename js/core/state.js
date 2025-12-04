/* =========================================
   GLOBAL STATE & CONFIGURATION
   ========================================= */

// 1. STORAGE KEYS
const STORAGE_KEY = "operation_twa_v17_data"; // Bumped version to ensure clean slate if needed
const USERS_KEY = "operation_twa_users";

// 2. RUNTIME VARIABLES
let userRole = 'student';
let currentUser = { name: "Guest", email: "" }; 
let streak = 0;
let currentTeacherClass = "AP Calculus"; // Default selection for teacher view

// 3. SETTINGS & PREFERENCES
let settings = { 
    buffer: 0,             // Procrastination buffer (minutes)
    workTime: 25,          // Focus timer duration
    breakTime: 5,          // Break timer duration
    theme: 'space',        // Visual theme
    dyslexia: false,       // Accessibility font toggle
    backpack: [            // Default backpack checklist
        "💻 Laptop & Charger", 
        "📚 Homework Folder", 
        "✏️ Pencil Case",
        "📓 Planner"
    ] 
};

// 4. CLASS CONFIGURATION
let classes = [
    "Personal"
];

let classPreferences = { 
    "Personal": "#94a3b8"      // Slate
};

// DATA CONTAINERS
let globalTasks = [];   
let teacherTasks = []; 
let classBulletins = {}; 
let classTopics = {};

// MOCK ROSTER DATA
const getRecent = (h) => new Date(Date.now() - (h * 3600000)).toISOString();

let studentRoster = [
    { id: 's1', name: "Alice Walker", lastActive: getRecent(1) },   // Green (Active 1h ago)
    { id: 's2', name: "Marcus Johnson", lastActive: getRecent(26) }, // Yellow (Active yesterday)
    { id: 's3', name: "Elena Rodriguez", lastActive: getRecent(75) }, // Red (Offline 3 days)
    { id: 's4', name: "David Kim", lastActive: getRecent(0.2) },
    { id: 's5', name: "Sarah Jenkins", lastActive: getRecent(5) }
];
let currentPlannerOffset = 0; 


const CYCLE_START_DATE = new Date("2024-11-28T00:00:00");