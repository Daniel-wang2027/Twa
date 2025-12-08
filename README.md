# Operation TWA (The Week Ahead) 

**Current Version:** 0.16  
**Created By:** [Daniel Wang]  
**Tech Stack:** HTML5, CSS3 (Tailwind), Vanilla JavaScript

## Overview
Operation TWA is an "Executive Functioning HUD" designed to help students, teachers, and administrators manage school life. Unlike standard LMS platforms, TWA focuses on visual organization, accessibility, and gamification to help neurodivergent students stay on track.

The app runs entirely in the browser using **LocalStorage** as a database. There is no backend server required.

## License & Usage

**© [2025] [Danei Wang]. All Rights Reserved.**

This software is **Proprietary**.

*   **Authorized Use:** This version is licensed exclusively for internal use and modification by **[Saint Anthony's Hight School]**.
*   **Commercial Use:** Strictly prohibited. You may not sell, redistribute, or re-brand this software.
*   **Modifications:** Designated maintainers at [Saint Anthony's Hight School] are permitted to modify the source code for internal school use only.

For commercial inquiries or licensing for other institutions, please contact [Daniel2009.wang@gmail.com].

##  Features

### For Students
*   **The Matrix:** A weekly grid view of all assignments.
*   **Backpack Protocol:** Automated weekly checklists to ensure you bring the right gear (e.g., Gym clothes on Mondays).
*   **Gamification:** Streak counters and "Mission Debriefs" for completing tasks.
*   **Accessibility:** Built-in Dyslexia font, color-blindness modes, and reduced motion settings.
*   **Themes:** 20+ visual themes (Cyberpunk, Lofi, Space, etc.).

### For Teachers
*   **Weekly Planner:** A visual grid to plan lessons and post assignments.
*   **Snow Day Protocol:** One-click shifting of all future due dates.
*   **Observer Mode:** View the dashboard exactly as a specific student sees it.
*   **Bulletin Board:** Post sticky notes to the top of student dashboards.

### For Admins
*   **User Directory:** Create/Edit/Delete Student and Teacher accounts.
*   **Course Catalog:** Manage the master list of available courses and sections.

---

## Installation & Setup

Because this project uses **Vanilla JavaScript** and **CDN-based Tailwind CSS**, you do not need to install Node.js, NPM, or Python.

1.  **Download** the source code folder.
2.  **Open** the folder in VS Code (or any text editor).
3.  **Launch** `index.html` in your browser (Chrome/Edge/Safari).
    *   *Tip:* Use the "Live Server" extension in VS Code for the best experience.

### Default Login Credentials
When you first load the app, you can create a user or use the **Developer Bypass** button at the bottom of the login screen to enter immediately.

---

## Project Structure

```text
/
├── index.html          # Main Entry & Container (Loads scripts)
├── layouts/            # HTML Fragments loaded dynamically
│   ├── student.html
│   ├── teacher.html
│   ├── admin.html
│   └── modals.html     # Shared popups
├── css/
│   ├── core.css        # Layout & logic styles
│   └── themes.css      # CSS Variables for colors
├── js/
│   ├── core/           # The "Brain" (Auth, Storage, Loader)
│   ├── features/       # Shared features (Themes)
│   ├── student/        # Student-specific logic
│   │   ├── actions/    # Click handlers
│   │   └── renders/    # UI generators
│   ├── teacher/        # Teacher logic
│   └── admin/          # Admin logic