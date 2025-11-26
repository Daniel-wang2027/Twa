// THEME LIST
const themesList = [
    { id: 'dark', name: 'Standard Dark', bg: '#111827', accent: '#3b82f6' },
    { id: 'light', name: 'Light Mode', bg: '#f3f4f6', accent: '#2563eb' },

    // --- NEW & UPDATED THEMES ---

    // Cyberpunk (Blurred City BG)
    { id: 'cyberpunk', name: 'Cyberpunk', bg: '#050505', accent: '#00ff9f' },

    // Midnight (Galaxy BG)
    { id: 'midnight', name: 'Midnight Galaxy', bg: '#1e1b4b', accent: '#c084fc' },

    // Evergreen (Cartoon Forest BG)
    { id: 'evergreen', name: 'Evergreen', bg: '#064e3b', accent: '#10b981' },

    // Ocean (Deep Sea BG)
    { id: 'ocean', name: 'Ocean Depth', bg: '#0f172a', accent: '#06b6d4' },

    // Light Academia (Paper/Tweed)
    { id: 'light-academia', name: 'Light Academia', bg: '#f5f5dc', accent: '#a0522d' },

    // Vista (Frosted Glass)
    { id: 'vista', name: 'Vista (Glass)', bg: '#38bdf8', accent: '#f472b6' },

    // ----------------------------

    { id: 'sunset', name: 'Sunset', bg: 'linear-gradient(to bottom, #991b1b, #facc15)', accent: '#fbbf24' },
    { id: 'space', name: 'Deep Space', bg: '#050511', accent: '#38bdf8' },
    { id: 'academia', name: 'Dark Academia', bg: '#1c1917', accent: '#d4af37' },
    { id: 'lofi', name: 'Lo-Fi Chill', bg: '#e0e7ff', accent: '#a78bfa' },
    { id: 'oled', name: 'Midnight OLED', bg: '#000000', accent: '#00ff00' },
    { id: 'graph', name: 'Graph Paper', bg: '#ffffff', accent: '#db2777' },
    { id: 'frutiger', name: 'Frutiger Aero', bg: '#87CEEB', accent: '#0284c7' },
    { id: 'terminal', name: 'Terminal', bg: '#0c0c0c', accent: '#22c55e' },
    { id: 'blueprint', name: 'Blueprint', bg: '#1e3a8a', accent: '#ffffff' },
    { id: 'latte', name: 'Latte Shop', bg: '#fff7ed', accent: '#d97706' },
    { id: 'vaporwave', name: 'Vaporwave', bg: '#2a2139', accent: '#ec4899' },
    { id: 'paperback', name: 'Paperback', bg: '#fdf6e3', accent: '#cb4b16' },
];

// THEME APPLICATION
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    settings.theme = theme;

    // 1. Save to Global Browser Storage (For Login Screen)
    localStorage.setItem('twa_device_theme', theme);

    // 2. Save to User Account (For Sync)
    if(currentUser && typeof saveData === 'function') saveData();
}


function renderThemeButtons(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    themesList.forEach(t => {
        container.innerHTML += `
        <button type="button" onclick="setTheme('${t.id}')" class="group relative overflow-hidden rounded-xl border border-border hover:border-primary transition-all text-left h-24 shadow-sm hover:scale-105">
            <div class="absolute inset-0" style="background:${t.bg}"></div>
            <div class="absolute inset-x-4 top-4 h-8 rounded bg-white/20 backdrop-blur-sm border border-white/10"></div>
            <div class="absolute inset-x-4 top-4 h-8 flex items-center px-2"><div class="w-2 h-2 rounded-full" style="background:${t.accent}"></div></div>
            <div class="absolute inset-x-0 bottom-0 p-2 bg-black/40 backdrop-blur-md"><span class="text-[10px] font-bold text-white uppercase tracking-wider">${t.name}</span></div>
        </button>`;
    });
}