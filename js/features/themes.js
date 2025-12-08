/* ==========================================================================
   THEME MANAGER
   ==========================================================================
   PURPOSE: 
   - Defines the list of available themes (must match CSS [data-theme] selectors).
   - Handles applying the theme to the <body> tag.
   - Generates the "Theme Picker" UI grid.
   ========================================================================== */

/* --- 1. THEME DEFINITIONS --- */
const themesList = [
    // --- Standard Colors ---
    { id: 'dark',           name: 'Standard Dark',   bg: '#111827', accent: '#3b82f6' },
    { id: 'light',          name: 'Light Mode',      bg: '#f3f4f6', accent: '#2563eb' },
    { id: 'lofi',           name: 'Lo-Fi Chill',     bg: '#e0e7ff', accent: '#a78bfa' },
    { id: 'oled',           name: 'Midnight OLED',   bg: '#000000', accent: '#00ff00' },
    { id: 'latte',          name: 'Latte Shop',      bg: '#fff7ed', accent: '#d97706' },
    { id: 'vaporwave',      name: 'Vaporwave',       bg: '#2a2139', accent: '#ec4899' },
    { id: 'paperback',      name: 'Paperback',       bg: '#fdf6e3', accent: '#cb4b16' },
    { id: 'terminal',       name: 'Terminal',        bg: '#0c0c0c', accent: '#22c55e' },
    { id: 'academia',       name: 'Dark Academia',   bg: '#1c1917', accent: '#d4af37' },

    // --- Pattern / Gradient / Graphical ---
    { id: 'space',          name: 'Deep Space',      bg: '#050511', accent: '#38bdf8' },
    { id: 'sunset',         name: 'Sunset',          bg: 'linear-gradient(to bottom, #991b1b, #facc15)', accent: '#fbbf24' },
    { id: 'graph',          name: 'Graph Paper',     bg: '#ffffff', accent: '#db2777' },
    { id: 'frutiger',       name: 'Frutiger Aero',   bg: '#87CEEB', accent: '#0284c7' },
    { id: 'blueprint',      name: 'Blueprint',       bg: '#1e3a8a', accent: '#ffffff' },
    { id: 'light-academia', name: 'Light Academia',  bg: '#f5f5dc', accent: '#a0522d' },

    // --- Image Based (New & Updated) ---
    { id: 'cyberpunk',      name: 'Cyberpunk',       bg: '#050505', accent: '#00ff9f' },
    { id: 'midnight',       name: 'Midnight Galaxy', bg: '#1e1b4b', accent: '#c084fc' },
    { id: 'evergreen',      name: 'Evergreen',       bg: '#064e3b', accent: '#10b981' },
    { id: 'ocean',          name: 'Ocean Depth',     bg: '#0f172a', accent: '#06b6d4' },
    { id: 'vista',          name: 'Vista (Glass)',   bg: '#38bdf8', accent: '#f472b6' }
];

/* --- 2. APPLY THEME --- */

/**
 * Switches the active theme.
 * @param {string} theme - The ID string (e.g., 'cyberpunk')
 */
function setTheme(theme) {
    // 1. Apply to DOM immediately
    document.documentElement.setAttribute('data-theme', theme);

    // 2. Update Runtime State
    if (typeof settings !== 'undefined') {
        settings.theme = theme;
    }

    // 3. Save to LocalStorage (Device specific preference)
    // This allows the login screen to remember the theme before the user logs in.
    localStorage.setItem('twa_device_theme', theme);

    // 4. Save to User Account (Synced preference)
    // This ensures the theme persists across devices if the user is logged in.
    if (typeof currentUser !== 'undefined' && currentUser && typeof saveData === 'function') {
        saveData();
    }
}

/* --- 3. RENDER UI --- */

/**
 * Generates the grid of theme preview buttons.
 * @param {string} containerId - The ID of the HTML element to fill.
 */
function renderThemeButtons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    themesList.forEach(t => {
        // We create a "Mini Window" look using absolute positioning.
        // t.bg is applied to the background to preview the color/gradient.
        container.innerHTML += `
        <button type="button" onclick="setTheme('${t.id}')" 
            class="group relative overflow-hidden rounded-xl border border-border hover:border-primary transition-all text-left h-24 shadow-sm hover:scale-105">

            <!-- Background Preview -->
            <div class="absolute inset-0" style="background:${t.bg}"></div>

            <!-- Glass Header Effect -->
            <div class="absolute inset-x-4 top-4 h-8 rounded bg-white/20 backdrop-blur-sm border border-white/10"></div>

            <!-- Accent Color Dot -->
            <div class="absolute inset-x-4 top-4 h-8 flex items-center px-2">
                <div class="w-2 h-2 rounded-full" style="background:${t.accent}"></div>
            </div>

            <!-- Label (Bottom) -->
            <div class="absolute inset-x-0 bottom-0 p-2 bg-black/40 backdrop-blur-md">
                <span class="text-[10px] font-bold text-white uppercase tracking-wider">${t.name}</span>
            </div>
        </button>`;
    });
}