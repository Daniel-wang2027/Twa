/* --- GLOBAL STATE & CONFIG --- */
const STORAGE_KEY = "operation_twa_v16_data";
const USERS_KEY = "operation_twa_users";

// Runtime Variables
let userRole = 'student';
let currentUser = { name: "Guest", email: "" }; 
let streak = 0;
let currentTeacherClass = "AP Calculus"; // Default focus

// Default Settings
let settings = { 
    buffer: 0, 
    workTime: 25, 
    breakTime: 5, 
    theme: 'space',
    dyslexia: false, 
    backpack: ["Charge Laptop", "Notebook", "Pen"] 
};

// Course Configuration
let classes = ["AP Calculus", "AP Chemistry", "History", "Literature", "Physics 101", "Personal"];
let classPreferences = { 
    "AP Chemistry": "#10b981", 
    "AP Calculus": "#f43f5e", 
    "History": "#f59e0b", 
    "Literature": "#8b5cf6", 
    "Physics 101": "#3b82f6", 
    "Personal": "#94a3b8" 
};

// Data Containers
let globalTasks = [];
let teacherTasks = [];
let studentRoster = [
    { id: 's1', name: "Alice Walker", lastActive: new Date().toISOString(), grade: 92 },
    { id: 's2', name: "Marcus Johnson", lastActive: new Date().toISOString(), grade: 88 }
];
let classBulletins = {};