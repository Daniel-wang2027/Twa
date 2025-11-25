       /* =========================================
          TEACHER LOGIC
          ========================================= */

       function initTeacher() {
           // 1. Show Layout
           const layout = document.getElementById('teacher-layout');
           if (layout) layout.classList.remove('hidden');

           // 2. Set Profile Info
           if (typeof currentUser !== 'undefined') {
               const nameEl = document.getElementById('t-profileName');
               const initEl = document.getElementById('t-profileInitials');
               if (nameEl) nameEl.innerText = currentUser.name;
               if (initEl) initEl.innerText = currentUser.name.slice(0,2).toUpperCase();
           }

           // 3. Render UI
           renderTeacherNav(); 
           renderTeacherTasks();
           teacherSwitchClass("AP Calculus");
       }

       /* --- NAVIGATION --- */

       function renderTeacherNav() {
           const list = document.getElementById('teacher-class-list');
           if (!list) return;
           list.innerHTML = '';

           classes.filter(c => c !== 'Personal').forEach(c => { 
               const color = classPreferences[c] || '#888';
               list.innerHTML += `
               <button onclick="teacherSwitchClass('${c}')" id="nav-t-${c.replace(/\s/g,'')}" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-muted hover:bg-surface hover:text-text transition-colors text-left">
                   <span class="w-2 h-2 rounded-full" style="background:${color}"></span> ${c}
               </button>`; 
           });
       }

       function teacherSwitchClass(cls) {
           currentTeacherClass = cls;

           // Toggle Views
           const viewClass = document.getElementById('t-view-class');
           const viewSettings = document.getElementById('t-view-settings');
           if (viewClass) viewClass.classList.remove('hidden');
           if (viewSettings) viewSettings.classList.add('hidden');

           // Header Title
           const titleEl = document.getElementById('t-active-class-title');
           if (titleEl) titleEl.innerText = cls;

           // Bulletin Check
           const bulletin = classBulletins[cls];
           const bDiv = document.getElementById('t-bulletin-container');
           if (bDiv) {
               if (bulletin && bulletin.active) {
                   bDiv.classList.remove('hidden');
                   document.getElementById('t-bulletin-text').innerText = bulletin.msg;
               } else {
                   bDiv.classList.add('hidden');
               }
           }

           renderTeacherFeed();
           renderRoster(); 
       }

       function switchTeacherView(view) {
           if (view === 'settings') {
               document.getElementById('t-view-class').classList.add('hidden');
               document.getElementById('t-view-settings').classList.remove('hidden');
               if (typeof renderThemeButtons === 'function') renderThemeButtons('t-theme-selector');
           }
       }

       /* --- POSTING ASSIGNMENTS --- */

       function teacherPostAssignment() {
           const title = document.getElementById('t-title').value; 
           const due = document.getElementById('t-due-date').value;
           const type = document.getElementById('t-type').value;
           const tag = document.getElementById('t-tag').value;

           if (!title || !due) return alert("Missing Title or Due Date");

           globalTasks.push({ 
               id: Date.now(), title: title, course: currentTeacherClass, 
               due: new Date(due).toISOString(), type: type, est: 30, 
               completed: false, checklist: [], tag: tag
           });

           if (typeof saveData === 'function') saveData();
           document.getElementById('t-title').value = ''; 
           renderTeacherFeed(); 
           if(typeof showToast === 'function') showToast("Posted!", "success");
       }

       function renderTeacherFeed() {
           const feed = document.getElementById('teacher-feed');
           if (!feed) return;
           feed.innerHTML = '';

           const tasks = globalTasks.filter(t => t.course === currentTeacherClass && !t.completed);

           if (tasks.length === 0) {
               feed.innerHTML = '<div class="p-4 text-center text-muted text-sm border border-dashed border-border rounded-xl">No active assignments.</div>';
               return;
           }

           tasks.forEach(t => {
               feed.innerHTML += `
               <div class="bg-surface p-3 rounded-xl border border-border flex justify-between items-center mb-2">
                   <div>
                       <div class="text-[10px] font-bold text-primary uppercase">${t.type}</div>
                       <div class="font-bold text-sm">${t.title}</div>
                       <div class="text-xs text-muted">${new Date(t.due).toLocaleDateString()}</div>
                   </div>
                   <button onclick="deleteTaskFromFeed(${t.id})" class="text-red-500 hover:bg-base p-2 rounded"><i class="fa-solid fa-trash"></i></button>
               </div>`;
           });
       }

       function deleteTaskFromFeed(id) {
           if (confirm("Delete?")) {
               const idx = globalTasks.findIndex(t => t.id === id);
               if (idx > -1) {
                   globalTasks.splice(idx, 1);
                   if (typeof saveData === 'function') saveData();
                   renderTeacherFeed();
               }
           }
       }

       /* --- ADVANCED FEATURES (Observer, Roster, Etc) --- */

       function renderRoster() {
           const list = document.getElementById('student-roster-list');
           if (!list) return;
           list.innerHTML = '';

           if (typeof studentRoster === 'undefined') return;

           studentRoster.forEach(s => {
               // Logic for color dots
               const lastActive = new Date(s.lastActive);
               const simNow = new Date("2023-10-27T12:00:00");
               const diffHours = (simNow - lastActive) / 36e5;
               let status = 'bg-green-500';
               if (diffHours > 24) status = 'bg-yellow-500';
               if (diffHours > 72) status = 'bg-red-500';

               list.innerHTML += `
               <div class="flex items-center justify-between bg-base p-3 rounded-xl border border-border">
                   <div class="flex items-center gap-3">
                       <div class="relative">
                           <div class="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-xs font-bold">
                               ${s.name.substring(0,2).toUpperCase()}
                           </div>
                           <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ${status} border border-base"></span>
                       </div>
                       <div>
                           <div class="font-bold text-sm">${s.name}</div>
                           <div class="text-[10px] text-muted">Grade: ${s.grade}%</div>
                       </div>
                   </div>
                   <button onclick="enterObserverMode('${s.name}')" class="text-[10px] font-bold border border-border px-2 py-1 rounded hover:bg-surface hover:text-primary">VIEW AS</button>
               </div>`;
           });
       }

/* --- OBSERVER MODE LOGIC --- */

function enterObserverMode(studentName) {
    const banner = document.getElementById('observer-banner');

    if (banner) {
        // 1. Show the Warning Banner
        banner.classList.remove('hidden');
        document.getElementById('observer-name').innerText = studentName;

        // 2. HIDE Teacher Layout
        document.getElementById('teacher-layout').classList.add('hidden');

        // 3. SHOW Student Layout
        document.getElementById('student-layout').classList.remove('hidden');

        // 4. Initialize Student View (Simulated)
        // We pass 'true' to indicate this is a simulation (optional, for advanced logic)
        if(typeof initStudent === 'function') {
            // Temporarily change profile name to student's name for the visual
            const realName = currentUser.name; 
            document.getElementById('s-profileName').innerText = studentName;
            document.getElementById('s-profileInitials').innerText = studentName.substring(0,2).toUpperCase();

            initStudent();

            // Show a toast to confirm
            if(typeof showToast === 'function') showToast(`Now viewing as ${studentName}`, "info");
        }
    }
}

function exitObserverMode() {
    const banner = document.getElementById('observer-banner');
    if (banner) banner.classList.add('hidden');

    // 1. HIDE Student Layout
    document.getElementById('student-layout').classList.add('hidden');

    // 2. SHOW Teacher Layout
    document.getElementById('teacher-layout').classList.remove('hidden');

    // 3. Restore Teacher Name (Visual fix)
    document.getElementById('t-profileName').innerText = currentUser.name;

    if(typeof showToast === 'function') showToast("Returned to Faculty Hub", "success");
}

       /* --- ADMIN TASKS --- */

       function renderTeacherTasks() {
           const list = document.getElementById('teacher-personal-list');
           if (!list) return;
           list.innerHTML = '';

           if (typeof teacherTasks === 'undefined' || teacherTasks.length === 0) {
               list.innerHTML = '<div class="text-xs text-muted italic">No tasks.</div>';
               return;
           }

           teacherTasks.forEach((t, index) => {
               list.innerHTML += `
               <div class="flex items-center gap-2 text-sm mb-1 group">
                   <button onclick="toggleTeacherTask(${index})" class="text-${t.done ? 'green-500' : 'muted'}"><i class="fa-${t.done ? 'solid fa-circle-check' : 'regular fa-circle'}"></i></button>
                   <span class="${t.done ? 'line-through text-muted' : 'text-text'} flex-1 truncate">${t.text}</span>
                   <button onclick="deleteTeacherTask(${index})" class="text-red-500 opacity-0 group-hover:opacity-100"><i class="fa-solid fa-xmark"></i></button>
               </div>`;
           });
       }

       function addTeacherTask() {
           const text = prompt("Task:");
           if (text) {
               teacherTasks.push({ id: Date.now(), text: text, done: false });
               if (typeof saveData === 'function') saveData();
               renderTeacherTasks();
           }
       }

       function toggleTeacherTask(i) { teacherTasks[i].done = !teacherTasks[i].done; if(typeof saveData === 'function') saveData(); renderTeacherTasks(); }
       function deleteTeacherTask(i) { teacherTasks.splice(i, 1); if(typeof saveData === 'function') saveData(); renderTeacherTasks(); }

       function setBulletin() {
           const msg = prompt("Bulletin Message:");
           if(msg) {
               classBulletins[currentTeacherClass] = { msg: msg, active: true };
               teacherSwitchClass(currentTeacherClass);
           }
       }

       function clearBulletin() {
           if(classBulletins[currentTeacherClass]) classBulletins[currentTeacherClass].active = false;
           teacherSwitchClass(currentTeacherClass);
       }

       function bulkShiftDates() {
           const days = prompt("Shift days by:", "1");
           if(days) alert("Shifted (Simulation)");
       }