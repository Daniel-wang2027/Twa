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
let currentTeacherClass = "AP Calculus"; 
let calendarOffset = 0;
let studentPlannerOffset = 0;

// 3. SETTINGS & PREFERENCES
let settings = { 
    buffer: 0, 
    workTime: 25, 
    breakTime: 5, 
    theme: 'space',
    dyslexia: false,

    // NEW: PRIVACY
    // No specific state needed, this is an action.

    // NEW: CULTURAL & LOGICAL
    dateFormat: 'US', // 'US', 'INTL'
    timeFormat24: false, // true = 24h
    startMonday: false, // true = Monday Start

    // NEW: VISUAL ACCESSIBILITY
    colorBlindMode: 'none', // 'none', 'protanopia', 'deuteranopia', 'tritanopia'
    reducedMotion: false,

    // NEW: COGNITIVE
    plainLanguage: false, // "Assignments" -> "Work"
    density: 'cozy', // 'cozy', 'roomy'

    // NEW: SENSORY
    soundMode: 'sound', // 'sound', 'haptic', 'silent'
    readingGuide: false,
    backpack: [
        { text: "💻 Ipad & Charger", type: "always", value: null },
        { text: "📚 Homework Folder", type: "always", value: null },
        { text: "👟 Gym Clothes", type: "weekday", value: 1 }, // 1 = Monday
        { text: "🎻 Violin", type: "cycle", value: 3 } // Day 3
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
let dashboardViewMode = 'matrix';

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