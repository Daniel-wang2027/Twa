/* --- UTILITIES & TIMER --- */

const sounds = {
    complete: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3'),
    success: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3')
};

function playSound(type) {
    if(sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].volume = 0.4;
        sounds[type].play().catch(() => {});
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    let icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* --- TIMER LOGIC --- */
let timer = { interval: null, timeLeft: 25*60, isRunning: false };

function toggleTimer() {
    playSound('click');
    const icon = document.getElementById('timerIcon');
    if(timer.isRunning) { 
        clearInterval(timer.interval); 
        timer.isRunning = false; 
        if(icon) icon.className = "fa-solid fa-play"; 
    } else { 
        timer.isRunning = true; 
        if(icon) icon.className = "fa-solid fa-pause"; 
        timer.interval = setInterval(() => { 
            if(timer.timeLeft > 0) { 
                timer.timeLeft--; 
                updateTimerUI(); 
            } else { 
                playSound('success');
                showToast("Focus Session Complete!", "success");
                resetTimer(); 
            } 
        }, 1000); 
    }
}

function resetTimer() { 
    clearInterval(timer.interval); 
    timer.isRunning = false; 

    // READ FROM SETTINGS HERE
    const workMinutes = (typeof settings !== 'undefined' && settings.workTime) ? settings.workTime : 25;

    timer.timeLeft = workMinutes * 60; 

    const icon = document.getElementById('timerIcon');
    if(icon) icon.className = "fa-solid fa-play"; 
    updateTimerUI(); 
}

function updateTimerUI() { 
    const m = Math.floor(timer.timeLeft / 60).toString().padStart(2,'0'); 
    const s = (timer.timeLeft % 60).toString().padStart(2,'0'); 
    const display = document.getElementById('timerDisplay');
    if(display) display.innerText = `${m}:${s}`; 
}