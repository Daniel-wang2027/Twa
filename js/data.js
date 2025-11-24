/* =========================================
   GLOBAL DATA & STATE
   ========================================= */

// 1. Storage Keys
const STORAGE_KEY = "operation_twa_v15_data";
const USERS_KEY = "operation_twa_users";

// 2. Global Variables (Must be declared here!)
let userRole = 'student';
let currentUser = { name: "Guest", email: "" }; 
let settings = { buffer: 0, workTime: 25, breakTime: 5, theme: 'space' }; 
let streak = 0;

// 3. Class Data
let classes = [
    "AP Calculus", 
    "AP Chemistry", 
    "History", 
    "Literature", 
    "Physics 101", 
    "Personal"
];

let classPreferences = { 
    "AP Chemistry": "#10b981", 
    "AP Calculus": "#f43f5e", 
    "History": "#f59e0b", 
    "Literature": "#8b5cf6", 
    "Physics 101": "#3b82f6", 
    "Personal": "#94a3b8" 
};

let currentTeacherClass = "AP Calculus";

// 4. Audio Assets
const sounds = {
    complete: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
};

// 5. Default Tasks
const now = new Date();
const addH = h => new Date(now.getTime() + h*3600000).toISOString();

let globalTasks = [
    { 
        id: 1, 
        title: "Welcome to TWA", 
        course: "Personal", 
        due: addH(24), 
        type: "TASK", 
        est: 5, 
        pinned: true, 
        completed: false, 
        desc: "Explore settings and themes!", 
        checklist: [] 
    }
];