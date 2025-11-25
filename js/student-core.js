/* =========================================
   STUDENT CORE (Init, Navigation, Stats)
   ========================================= */

function initStudent() {
    document.getElementById('student-layout').classList.remove('hidden');

    // Profile Info
    if(currentUser) {
        const initials = currentUser.name.slice(0,2).toUpperCase();
        document.getElementById('s-profileInitials').innerText = initials;
        document.getElementById('s-profileName').innerText = currentUser.name;
    }

    document.getElementById('streak-count').innerText = streak + " Day Streak";
    document.getElementById('currentDate').innerText = new Date().toLocaleDateString();

    // Load Modules
    if(typeof renderThemeButtons === 'function') renderThemeButtons('theme-selector');
    if(typeof renderStudentBulletins === 'function') renderStudentBulletins();
    if(typeof loadStudentPreferences === 'function') loadStudentPreferences();
    if(typeof renderBackpackList === 'function') renderBackpackList();

    // Render Views
    if(typeof renderMatrix === 'function') renderMatrix(); 
    renderStats();
}

function switchStudentView(view) {
    playSound('click');

    ['dashboard', 'completed', 'profile', 'settings'].forEach(v => {
        document.getElementById(`s-view-${v}`).classList.add('hidden');
        document.getElementById(`nav-s-${v}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-muted hover:text-text hover:bg-base";
    });

    document.getElementById(`s-view-${view}`).classList.remove('hidden');
    document.getElementById(`nav-s-${view}`).className = "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-base text-primary border border-border";

    if(view === 'dashboard' && typeof renderMatrix === 'function') renderMatrix();
    if(view === 'completed') renderCompleted();
    if(view === 'profile') renderProfile();
}

// --- STATS & PROFILE ---

function renderStats() {
    const bar = document.getElementById('stats-bar');
    if(!bar) return;
    bar.innerHTML = '';

    let counts = {};
    classes.forEach(c => counts[c] = 0);

    globalTasks.filter(t => t.completed).forEach(t => {
        counts[t.course] = (counts[t.course] || 0) + 1;
    });

    classes.slice(0, 4).forEach(c => { 
        bar.innerHTML += `
        <div class="bg-surface p-3 rounded-xl border border-border">
            <div class="text-xs text-muted truncate">${c}</div>
            <div class="text-xl font-bold" style="color:${classPreferences[c]}">
                ${counts[c]} Done
            </div>
        </div>`; 
    });
}

function renderCompleted() {
    const list = document.getElementById('list-completed');
    list.innerHTML = '';

    const completedTasks = globalTasks.filter(t => t.completed).sort((a,b) => new Date(b.due) - new Date(a.due));

    if (completedTasks.length === 0) {
        list.innerHTML = '<div class="text-center text-muted p-8">No history yet. Go do some work!</div>';
        return;
    }

    completedTasks.forEach(t => { 
        list.innerHTML += `
        <div class="flex items-center gap-4 bg-surface p-4 rounded-xl border border-border opacity-60">
            <i class="fa-solid fa-check-circle text-accent text-xl"></i>
            <div>
                <div class="font-bold line-through">${t.title}</div>
                <div class="text-xs text-muted">${t.course}</div>
            </div>
        </div>`; 
    });
}

function renderProfile() {
    const list = document.getElementById('profile-list');
    if(!list) return;
    list.innerHTML = '';

    classes.forEach(c => { 
        list.innerHTML += `
        <div class="bg-surface p-6 rounded-xl border border-border flex justify-between items-center shadow-md">
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg" style="background:${classPreferences[c]}">
                    ${c.substring(0,1)}
                </div>
                <div>
                    <span class="font-bold text-lg block">${c}</span>
                    <span class="text-xs text-muted">Student Enrolled</span>
                </div>
            </div>
            <!-- BUTTON FIX: Ensure onclick is correct -->
            <button onclick="openStudentClassSettings('${c}')" class="bg-base hover:bg-border text-text px-4 py-2 rounded-lg text-sm font-medium transition-colors">Customize</button>
        </div>`; 
    });
}

// --- CLASS SETTINGS MODAL (Fixed) ---

function openStudentClassSettings(className) {
    const modal = document.getElementById('classSettingsModal');
    const renameInput = document.getElementById('class-rename');
    const colorInput = document.getElementById('class-color-picker');
    const nameSpan = document.getElementById('modal-class-name');

    if(modal && renameInput && colorInput) {
        nameSpan.innerText = className;
        renameInput.value = className;
        // Default to black if no color set
        colorInput.value = classPreferences[className] || '#000000';

        // We hide rename for prototype simplicity to prevent sync issues, 
        // or you can leave it enabled if you prefer.
        document.getElementById('rename-container').classList.remove('hidden'); 

        currentTeacherClass = className; // Track which class we are editing
        modal.classList.remove('hidden');
    } else {
        console.error("Modal elements not found");
    }
}

// --- BULLETIN LOGIC ---
function renderStudentBulletins() {
    const container = document.getElementById('student-bulletin-area');
    if (!container) return;

    container.innerHTML = '';
    let hasBulletins = false;

    // classBulletins comes from data.js
    if(typeof classBulletins !== 'undefined') {
        classes.forEach(cls => {
            if (classBulletins[cls] && classBulletins[cls].active) {
                hasBulletins = true;
                const color = classPreferences[cls] || '#888';

                container.innerHTML += `
                <div class="bg-yellow-500/10 border border-yellow-500/50 p-3 rounded-xl flex items-center gap-3 shadow-sm animate-pulse">
                    <div class="w-1 h-8 rounded-full" style="background:${color}"></div>
                    <div class="flex-1">
                        <div class="text-[10px] font-bold uppercase tracking-wider text-muted">${cls} • Instructor Message</div>
                        <div class="font-bold text-yellow-600 dark:text-yellow-400 text-sm">
                            <i class="fa-solid fa-thumbtack mr-2"></i> ${classBulletins[cls].msg}
                        </div>
                    </div>
                </div>`;
            }
        });
    }

    if (hasBulletins) container.classList.remove('hidden');
    else container.classList.add('hidden');
}

// --- SETTINGS LOGIC ---
function toggleDyslexia(isEnabled) {
    if (isEnabled) {
        document.body.classList.add('dyslexic-mode');
        localStorage.setItem('twa_dyslexia', 'true');
    } else {
        document.body.classList.remove('dyslexic-mode');
        localStorage.setItem('twa_dyslexia', 'false');
    }
}

function runBackpackCheck() {
    const items = settings.backpack || ["Laptop", "Charger", "Folder"];
    let msg = "🎒 BACKPACK CHECK:\n\n";
    items.forEach(item => msg += `[ ] ${item}\n`);
    alert(msg + "\nMake sure you have everything!");
}

function loadStudentPreferences() {
    const isDyslexic = localStorage.getItem('twa_dyslexia') === 'true';
    const toggle = document.getElementById('setting-dyslexia');
    if (toggle) toggle.checked = isDyslexic;
    toggleDyslexia(isDyslexic);
}

// BACKPACK LIST RENDER
function renderBackpackList() {
    const container = document.getElementById('backpack-list');
    if (!container) return;
    if (!settings.backpack) settings.backpack = ["💻 Laptop & Charger", "📚 Homework Folder"];

    container.innerHTML = '';
    settings.backpack.forEach((item, index) => {
        container.innerHTML += `
        <div class="flex items-center justify-between bg-base p-2 rounded-lg border border-border group">
            <span class="text-sm ml-2">${item}</span>
            <button onclick="deleteBackpackItem(${index})" class="text-red-500 opacity-0 group-hover:opacity-100 hover:bg-surface w-6 h-6 rounded flex items-center justify-center transition-all">
                <i class="fa-solid fa-xmark"></i>
            </button>
        </div>`;
    });
}

function addBackpackItem() {
    const input = document.getElementById('new-backpack-item');
    const val = input.value.trim();
    if (val) {
        settings.backpack.push(val);
        input.value = '';
        saveData();
        renderBackpackList();
    }
}

function deleteBackpackItem(index) {
    settings.backpack.splice(index, 1);
    saveData();
    renderBackpackList();
}

function pushBackpackTasks() {
    if (!settings.backpack || settings.backpack.length === 0) return alert("Add items to checklist first!");
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 0, 0);
    const checkItems = settings.backpack.map(item => ({ text: item, done: false }));

    globalTasks.push({
        id: Date.now(), title: "🎒 Pack Bags", course: "Personal", due: todayEnd.toISOString(),
        type: "TASK", est: 5, completed: false, checklist: checkItems
    });

    saveData();
    renderMatrix();
    if(typeof showToast === 'function') showToast("Added to Matrix!", "success");
    switchStudentView('dashboard');
}