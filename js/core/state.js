/* ==========================================================================
   GLOBAL STATE & CONFIGURATION
   ==========================================================================
   PURPOSE: 
   1. Sets up the default settings (Theme, Accessibility, Backpack).
   2. Defines storage keys for LocalStorage.
   3. holds "Runtime State" (variables that change as the user clicks things).
   ========================================================================== */

// --- 1. STORAGE KEYS ---
// If you change the data structure significantly, update 'v17' to 'v18' 
// to force a fresh start for users (prevents crashes from old data).
const STORAGE_KEY = "operation_twa_v17_data"; 
const USERS_KEY = "operation_twa_users";

// --- 2. SCHOOL CYCLE CONFIGURATION ---
// IMPORTANT: This date MUST be a known "Day 1" in the past.
// The app calculates the current Cycle Day based on the difference between today and this date.
const CYCLE_START_DATE = new Date("2024-11-28T00:00:00");

/* =========================================
   RUNTIME STATE (Variables that change)
   ========================================= */

let userRole = 'student';                 // 'student', 'teacher', 'admin'
let currentUser = { name: "Guest", email: "" }; 
let streak = 0;                           // Current login streak

// UI Navigation States
let dashboardViewMode = 'matrix';         // 'matrix' or 'list'
let calendarOffset = 0;                   // Weeks away from current week
let studentPlannerOffset = 0;             // Days away from current day
let currentPlannerOffset = 0;             // (Legacy variable, ensures compatibility)

// Teacher Specific State
let currentTeacherClass = "AP Calculus"; 

/* =========================================
   DATA CONTAINERS (Empty storage)
   ========================================= */

let globalTasks = [];     // All student tasks
let teacherTasks = [];    // Assignments created by teacher
let classBulletins = {};  // Announcements per class
let classTopics = {};     // Discussion topics per class

// Default Class List
// Note: "Personal" is hardcoded as the default category.
// Real classes are injected here during login (see main.js).
let classes = [
    "Personal"
];

// Color mapping for classes (ClassName -> Hex Code)
let classPreferences = { 
    "Personal": "#94a3b8" // Slate Grey
};

/* =========================================
   SETTINGS & DEFAULTS
   ========================================= */

let settings = { 
    // --- Productivity ---
    buffer: 0,        // Minutes between tasks
    workTime: 25,     // Pomodoro work duration
    breakTime: 5,     // Pomodoro break duration

    // --- Visuals ---
    theme: 'space',   // Default theme
    density: 'cozy',  // 'cozy' (normal) or 'roomy' (large buttons)

    // --- Accessibility ---
    dyslexia: false,      // Toggles OpenDyslexic font
    reducedMotion: false, // Disables animations
    colorBlindMode: 'none', // 'protanopia', 'deuteranopia', 'tritanopia'
    readingGuide: false,    // Toggles cursor reading line
    soundMode: 'sound',     // 'sound', 'haptic', 'silent'
    plainLanguage: false,   // Simplified text (e.g., "Work" instead of "Assignments")

    // --- Localization ---
    dateFormat: 'US',       // 'US' (MM/DD) or 'INTL' (DD/MM)
    timeFormat24: false,    // false = 12h (AM/PM), true = 24h
    startMonday: false,     // false = Sunday start, true = Monday start

    // --- Digital Backpack ---
    // Items that appear in the dashboard checklist based on the day.
    // Types: 
    //  - 'always': Shows every day
    //  - 'weekday': value 1=Mon, 2=Tue...
    //  - 'cycle': value 1=Day 1, 3=Day 3... (Based on school cycle)
    backpack: [
        { text: "💻 Ipad & Charger", type: "always", value: null },
        { text: "📚 Homework Folder", type: "always", value: null },
        { text: "👟 Gym Clothes", type: "weekday", value: 1 }, // Mondays
        { text: "🎻 Violin", type: "cycle", value: 3 }         // Cycle Day 3
    ] 
};

/* =========================================
   MOCK DATA (For Demo/Testing)
   ========================================= */

// Helper to generate timestamps relative to "Now"
// Usage: getRecent(1) = 1 hour ago
const getRecent = (h) => new Date(Date.now() - (h * 3600000)).toISOString();

let studentRoster = [
    { id: 's1', name: "Alice Walker",    lastActive: getRecent(1) },   // Active 1h ago
    { id: 's2', name: "Marcus Johnson",  lastActive: getRecent(26) },  // Active yesterday
    { id: 's3', name: "Elena Rodriguez", lastActive: getRecent(75) },  // Offline 3 days
    { id: 's4', name: "David Kim",       lastActive: getRecent(0.2) }, // Active 12 mins ago
    { id: 's5', name: "Sarah Jenkins",   lastActive: getRecent(5) }    // Active 5h ago
];