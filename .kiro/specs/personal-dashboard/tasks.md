# Implementation Plan: Personal Dashboard

## Overview

Implement a single-page personal dashboard as three static files (`index.html`, `css/style.css`, `js/app.js`) using only HTML, CSS, and Vanilla JavaScript. Widgets are built incrementally: project skeleton first, then shared utilities, then each widget in isolation, then final integration. All user data is persisted in `localStorage`. A property-based test harness using fast-check (via CDN) validates the 19 correctness properties defined in the design document.

---

## Tasks

- [x] 1. Set up project structure and HTML skeleton
  - [x] 1.1 Create `index.html` with semantic structure and theme-flash prevention
    - Create `index.html` with semantic landmarks: `<header>` for theme toggle, `<main>` with five `<section>` elements (greeting, timer, task list, quick links)
    - Add the theme-flash-prevention inline `<script>` in `<head>` (before any CSS) that reads `localStorage['dashboard-theme']` and sets `document.documentElement.className` synchronously before first paint
    - Add placeholder containers with the IDs referenced in the design: `#greeting-widget`, `#timer-widget`, `#task-widget`, `#links-widget`, `#theme-toggle`
    - _Requirements: 6.1, 6.4, 5.5_
  - [x] 1.2 Create `css/style.css` and `js/app.js` stubs
    - Create `css/style.css` and link it in `<head>`
    - Create `js/app.js` as an IIFE stub and load it at the end of `<body>`
    - Confirm `index.html` opens directly in a browser without errors
    - _Requirements: 6.2, 6.3, 6.4_

- [x] 2. Implement shared utilities and CSS foundation
  - [x] 2.1 Write shared utilities in `js/app.js`
    - Implement `safeGet(key)`: wraps `localStorage.getItem` in `try/catch`; returns `null` on error
    - Implement `safeSet(key, value)`: wraps `localStorage.setItem` in `try/catch`; returns `false` on quota/error, `true` on success
    - Implement `qs(selector, root?)` and `qsa(selector, root?)` as aliases for `querySelector` / `querySelectorAll`
    - _Requirements: 6.1, 3.8, 4.6_
  - [x] 2.2 Add CSS custom properties and base layout
    - Define `:root.light` and `:root.dark` variable sets for background, surface, text, accent, and border colours
    - Add a base CSS reset and a responsive grid layout that arranges the five widget sections without overlap at 320px–2559px
    - _Requirements: 5.1, 5.2, 6.6_

- [x] 3. Implement Theme Toggle widget
  - [x] 3.1 Write `initTheme()` and `toggleTheme()` in `js/app.js`
    - `initTheme()`: read `localStorage['dashboard-theme']` via `safeGet`; apply class to `<html>`; update `#theme-icon` src/class; default to `"light"` when no value stored; bind click on `#theme-toggle`
    - `toggleTheme()`: flip class on `<html>`; persist new value via `safeSet`; update icon; on `safeSet` failure apply theme for session only without displaying an error
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  - [x] 3.2 Add Theme Toggle HTML markup and CSS
    - Add `#theme-toggle` button and `#theme-icon` element inside the header
    - Style the button to be accessible at all viewport widths without scrolling; add sun/moon icon assets or SVG inline
    - _Requirements: 5.1, 5.3, 6.6_
  - [x] 3.3 Write property tests for Theme widget
    - **Property 18: Theme toggle icon reflects the active theme**
    - **Validates: Requirements 5.3**
    - **Property 19: Theme persistence round-trip**
    - **Validates: Requirements 5.4, 5.5**

- [x] 4. Implement Greeting Widget
  - [x] 4.1 Write pure helper functions: `greetingText(hour)`, `formatDate(date)`, `formatTime(date)`
    - `greetingText(hour)`: map integer hour 0–23 to exactly one of "Good Morning" (5–11), "Good Afternoon" (12–16), "Good Evening" (17–20), "Good Night" (21–23, 0–4)
    - `formatDate(date)`: return `"Weekday, Month DD, YYYY"` with zero-padded two-digit day
    - `formatTime(date)`: return `"HH:MM:SS"` with all three components zero-padded to two digits
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_
  - [x] 4.2 Write property tests for Greeting helper functions
    - **Property 1: Date format is always correct** — `fc.date()` → verify `formatDate` output matches `"Weekday, Month DD, YYYY"` pattern with correct values
    - **Validates: Requirements 1.1**
    - **Property 2: Time format is always correct** — `fc.date()` → verify `formatTime` output matches `"HH:MM:SS"` with correct zero-padded components
    - **Validates: Requirements 1.2**
    - **Property 3: Greeting phrase is correct for all hours** — `fc.integer({min:0, max:23})` → verify `greetingText` maps each hour to exactly one expected phrase
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6**
  - [x] 4.3 Write `loadName()`, `saveName(name)`, `clearName()`, `initGreeting()`, `tickClock()`
    - `loadName()`: read `localStorage['dashboard-name']` via `safeGet`; return string or `null`
    - `saveName(name)`: validate 1–50 chars (non-empty after trim); write via `safeSet('dashboard-name', name)`; update `#greeting-text` to append name
    - `clearName()`: remove `localStorage['dashboard-name']`; update `#greeting-text` to remove name suffix
    - `initGreeting()`: call `loadName()`; pre-fill `#name-input` if name exists; render greeting + date + time; start 1-second `setInterval` → `tickClock()`; bind Enter key on `#name-input` and click on `#name-save-btn` to `saveName`/`clearName` logic
    - `tickClock()`: update `#greeting-text`, `#date-display`, `#time-display` every second using `greetingText`, `formatDate`, `formatTime`
    - _Requirements: 1.7, 1.8, 1.9, 1.10, 1.11_
  - [x] 4.4 Write property tests for name persistence
    - **Property 4: Saved name appears in the greeting** — `fc.string({minLength:1, maxLength:50})` → call `saveName(name)`, verify `#greeting-text` contains the name as a suffix
    - **Validates: Requirements 1.8**
    - **Property 5: Name persistence round-trip** — `fc.string({minLength:1, maxLength:50})` → `saveName(name)` → `loadName()` returns same string → `clearName()` → `loadName()` returns `null`
    - **Validates: Requirements 1.9, 1.11**
  - [x] 4.5 Add Greeting Widget HTML markup and CSS
    - Add `#greeting-text`, `#date-display`, `#time-display`, `#name-input` (maxlength=50), `#name-save-btn` elements inside the greeting section
    - Style with responsive typography; integrate colours via CSS custom properties; input and button accessible at all viewport widths
    - _Requirements: 1.1, 1.2, 1.7, 6.6_

- [x] 5. Implement Focus Timer Widget
  - [x] 5.1 Write `formatTimerDisplay(totalSeconds)` pure function
    - Return `"MM:SS"` where `MM * 60 + SS === totalSeconds` and both parts are zero-padded to two digits; valid input range 0–1500
    - _Requirements: 2.4_
  - [x] 5.2 Write property test for timer display format
    - **Property 6: Timer display format is correct for all durations** — `fc.integer({min:0, max:1500})` → verify output matches `"MM:SS"` pattern and `MM * 60 + SS === input`
    - **Validates: Requirements 2.4**
  - [x] 5.3 Write `initTimer()`, `startTimer()`, `stopTimer()`, `resetTimer()`, `tickTimer()`, `showAlert()`
    - `initTimer()`: set `remaining = 1500`; render `formatTimerDisplay(1500)` to `#timer-display`; bind button clicks; set initial disabled states (Start enabled, Stop disabled, Reset enabled)
    - `startTimer()`: guard against double-start; begin 1-second interval → `tickTimer()`; disable `#timer-start`, enable `#timer-stop`
    - `stopTimer()`: clear interval; retain `remaining`; enable `#timer-start`, disable `#timer-stop`
    - `resetTimer()`: clear interval; set `remaining = 1500`; render; restore initial button states; hide `#timer-alert`
    - `tickTimer()`: decrement `remaining`; render via `formatTimerDisplay`; when `remaining === 0` call `stopTimer()` then `showAlert()`
    - `showAlert()`: un-hide `#timer-alert` with "Session complete!" text; attempt Web Audio API beep via `AudioContext` + `OscillatorNode` wrapped in `try/catch`; silent fail if audio blocked
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10_
  - [x] 5.4 Add Focus Timer HTML markup and CSS
    - Add `#timer-display`, `#timer-start`, `#timer-stop`, `#timer-reset`, `#timer-alert` elements inside the timer section
    - Style for both themes via CSS custom properties; `#timer-alert` hidden by default (`display: none` or `hidden` attribute)
    - _Requirements: 2.2, 2.4, 2.7, 6.6_

- [x] 6. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Task List Widget
  - [x] 7.1 Write `addTask(text)`, `persistTasks()`, `renderTasks()`
    - `addTask(text)`: validate 1–200 non-whitespace characters (reject empty/whitespace-only); generate `id = "t_" + Date.now()`; push `{id, text: text.trim(), done: false, createdAt: Date.now()}`; call `persistTasks()` + `renderTasks()`; show inline message in `#task-validation` on invalid input; clear message on `input` event
    - `persistTasks()`: JSON-encode `{tasks, sorted}`; call `safeSet('dashboard-tasks', ...)`; show error badge on widget header if `safeSet` returns `false`
    - `renderTasks()`: clear and rebuild `#task-list` `<ul>` from in-memory array; for each task render a `<li class="task-item">` with checkbox, text span, edit button, delete button; bind event handlers inline
    - _Requirements: 3.1, 3.2, 3.3, 3.8_
  - [x] 7.2 Write property tests for `addTask` and `persistTasks`
    - **Property 7: Adding any valid task persists it correctly** — `fc.string({minLength:1, maxLength:200})` (filtered to exclude all-whitespace) → `addTask(text)` → parse `localStorage['dashboard-tasks']` → verify entry exists with matching `text` and `done: false`
    - **Validates: Requirements 3.2, 3.8**
    - **Property 8: Whitespace-only or empty task input is rejected** — `fc.stringMatching(/^\s*$/)` → `addTask(text)` → verify array is unchanged and `#task-validation` is non-empty
    - **Validates: Requirements 3.3**
    - **Property 13: Task list persistence round-trip** — `fc.array(taskArb)` → `persistTasks()` → parse `localStorage['dashboard-tasks']` → verify `tasks` array is deeply equal to input
    - **Validates: Requirements 3.8, 3.9**
  - [x] 7.3 Write `toggleTask(id)`, `editTask(id, newText)`, `deleteTask(id)`
    - `toggleTask(id)`: find task by id; flip `done` boolean; call `persistTasks()` + `renderTasks()`
    - `editTask(id, newText)`: validate newText is non-empty (1–200 chars); update `task.text`; persist; render; on blank input show inline validation message and leave task unchanged
    - `deleteTask(id)`: find and splice task from array by id; call `persistTasks()` + `renderTasks()`
    - _Requirements: 3.4, 3.5, 3.6, 3.8_
  - [x] 7.4 Write property tests for `toggleTask`, `editTask`, `deleteTask`
    - **Property 9: Task completion toggle is its own inverse** — `fc.array(taskArb)` + valid index → `toggleTask` twice → verify `done` restored to original value
    - **Validates: Requirements 3.4**
    - **Property 10: Task edit updates text for valid input; rejects whitespace** — `fc.array(taskArb)`, `fc.string(...)` → valid input updates `text`; whitespace input leaves task unchanged
    - **Validates: Requirements 3.5**
    - **Property 11: Deleting a task removes it from storage** — `fc.array(taskArb, {minLength:1})` + valid index → `deleteTask(id)` → verify no task with that id in array or `localStorage`
    - **Validates: Requirements 3.6, 3.8**
  - [x] 7.5 Write `sortTasks()` and `initTaskList()`
    - `sortTasks()`: perform a stable sort of the in-memory array placing all `done === false` tasks before all `done === true` tasks, preserving relative order within each group; set `sorted = true`; call `persistTasks()` + `renderTasks()`
    - `initTaskList()`: parse `localStorage['dashboard-tasks']` via `safeGet`; restore `tasks` array and `sorted` flag; call `renderTasks()`; bind `#task-add-btn` click and Enter key on `#task-input` to `addTask`; bind `#task-sort-btn` click to `sortTasks`
    - _Requirements: 3.7, 3.9_
  - [x] 7.6 Write property test for `sortTasks`
    - **Property 12: Sort places all incomplete tasks before all completed tasks** — `fc.array(taskArb)` → `sortTasks()` → verify every `done === false` task precedes every `done === true` task and relative order within groups is preserved
    - **Validates: Requirements 3.7**
  - [x] 7.7 Add Task List HTML markup and CSS
    - Add `#task-input` (maxlength=200), `#task-add-btn`, `#task-sort-btn`, `#task-list` (`<ul>`), `#task-validation` elements inside the task section
    - Style `.task-item`, `.task-checkbox`, `.task-text` (add `text-decoration: line-through` when done), `.task-edit-btn`, `.task-delete-btn`; integrate with CSS custom property themes
    - _Requirements: 3.1, 3.4, 6.6_

- [x] 8. Implement Quick Links Widget
  - [x] 8.1 Write `isValidUrl(url)`, `addLink(label, url)`, `persistLinks()`, `renderLinks()`
    - `isValidUrl(url)`: return `true` iff URL starts with `http://` or `https://`
    - `addLink(label, url)`: validate non-empty label (≤50 chars), non-empty URL (≤2048 chars) passing `isValidUrl`, no duplicate URL already in array, and current count < 20; push `{label, url}`; call `persistLinks()` + `renderLinks()`; show inline message in `#link-validation` on any validation failure; clear message on `input` event
    - `persistLinks()`: JSON-encode links array; call `safeSet('dashboard-links', ...)`
    - `renderLinks()`: clear and rebuild `#links-grid` from array; each link is a wrapper `.link-item` containing an `<a class="link-btn" target="_blank">` and a `.link-delete-btn`; show `#link-limit-msg` and disable `#link-add-btn` when `count === 20`; re-enable when `count < 20`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.6, 4.8_
  - [x] 8.2 Write property tests for `addLink` and `persistLinks`
    - **Property 14: Adding any valid link stores it correctly** — `fc.string({minLength:1, maxLength:50})`, valid URL arbitrary (`http://` or `https://` prefix) → `addLink` → parse `localStorage['dashboard-links']` → verify entry with matching `label` and `url`
    - **Validates: Requirements 4.2, 4.6**
    - **Property 15: Invalid or duplicate link input is rejected** — empty label, empty URL, bad-scheme URL, duplicate URL → `addLink` → verify array unchanged and `#link-validation` non-empty
    - **Validates: Requirements 4.3**
    - **Property 17: Link list persistence round-trip** — `fc.array(linkArb)` → `persistLinks()` → parse `localStorage['dashboard-links']` → verify deeply equal to input
    - **Validates: Requirements 4.6, 4.7**
  - [x] 8.3 Write `deleteLink(index)` and `initQuickLinks()`
    - `deleteLink(index)`: splice link at given index from array; call `persistLinks()` + `renderLinks()`
    - `initQuickLinks()`: parse `localStorage['dashboard-links']` via `safeGet`; restore array; call `renderLinks()`; bind `#link-add-btn` click to `addLink`; ensure all `<a>` elements carry `target="_blank"`
    - _Requirements: 4.4, 4.5, 4.6, 4.7_
  - [x] 8.4 Write property test for `deleteLink`
    - **Property 16: Deleting a link removes it from storage** — `fc.array(linkArb, {minLength:1})` + valid index → `deleteLink(index)` → verify the link at that index no longer appears in array or parsed `localStorage['dashboard-links']`
    - **Validates: Requirements 4.5, 4.6**
  - [x] 8.5 Add Quick Links HTML markup and CSS
    - Add `#link-label-input` (maxlength=50), `#link-url-input` (maxlength=2048), `#link-add-btn`, `#links-grid`, `#link-validation`, `#link-limit-msg` elements inside the quick links section
    - Style `.link-item`, `.link-btn`, `.link-delete-btn` with a responsive grid; integrate with CSS custom property themes; `#link-limit-msg` hidden by default
    - _Requirements: 4.1, 4.4, 4.8, 6.6_

- [x] 9. Checkpoint — Ensure all tests pass, ask the user if questions arise.

- [x] 10. Wire all widgets together and finalise
  - [x] 10.1 Wire `DOMContentLoaded` bootstrap in `js/app.js`
    - Add `document.addEventListener('DOMContentLoaded', function() { initTheme(); initGreeting(); initTimer(); initTaskList(); initQuickLinks(); });` as the last statement inside the IIFE
    - Confirm all five widgets initialise in sequence without errors in the browser console
    - _Requirements: 6.4_
  - [x] 10.2 Finalise responsive CSS layout
    - Ensure the five widget sections lay out as a fluid grid/flexbox with no overlapping or clipped elements, no horizontal scrollbar, at every viewport width from 320px to 2559px
    - Verify that switching the theme class on `<html>` re-renders all widgets correctly via CSS custom properties with no additional JavaScript
    - _Requirements: 6.6, 5.2_
  - [x] 10.3 Write unit tests for timer state machine and button states
    - Test all timer state transitions: STOPPED→RUNNING (start), RUNNING→PAUSED (stop), PAUSED→RUNNING (start), any→STOPPED (reset), RUNNING→STOPPED (reaches 00:00)
    - Test disabled/enabled states of `#timer-start` and `#timer-stop` on each transition
    - _Requirements: 2.1, 2.2, 2.3, 2.5, 2.6, 2.7, 2.8, 2.9_
  - [x] 10.4 Write unit tests for edge cases and error handling
    - Quick Links cap: verify `#link-add-btn` is disabled and `#link-limit-msg` is visible at exactly 20 links
    - Theme default: no `localStorage` entry → `initTheme()` applies `"light"` class to `<html>`
    - `localStorage` failure: mock `setItem` to throw; verify `safeSet` returns `false` and widget shows error badge without blocking UI
    - Link new-tab: verify each rendered `<a>` element carries `target="_blank"` attribute
    - _Requirements: 4.8, 5.6, 3.8, 4.4_

- [x] 11. Final checkpoint — Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP build.
- Property tests use **fast-check** loaded via CDN in a separate `tests/` HTML harness — no build step needed.
- Each property test task references the specific property number from the design document for full traceability.
- Unit tests (tasks 10.3 and 10.4) cover timer state-machine transitions and error-handling scenarios complementing the property tests.
- All `localStorage` reads/writes go through `safeGet`/`safeSet`; widget code must never access `localStorage` directly.
- Checkpoints at tasks 6 and 9 provide natural review milestones before the final integration step.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0,  "tasks": ["1.1", "1.2"] },
    { "id": 1,  "tasks": ["2.1", "2.2"] },
    { "id": 2,  "tasks": ["3.1", "4.1", "5.1"] },
    { "id": 3,  "tasks": ["3.2", "4.2", "5.2", "4.3"] },
    { "id": 4,  "tasks": ["3.3", "4.4", "5.3", "4.5"] },
    { "id": 5,  "tasks": ["5.4", "7.1"] },
    { "id": 6,  "tasks": ["7.2", "7.3"] },
    { "id": 7,  "tasks": ["7.4", "7.5"] },
    { "id": 8,  "tasks": ["7.6", "7.7", "8.1"] },
    { "id": 9,  "tasks": ["8.2", "8.3"] },
    { "id": 10, "tasks": ["8.4", "8.5"] },
    { "id": 11, "tasks": ["10.1", "10.2"] },
    { "id": 12, "tasks": ["10.3", "10.4"] }
  ]
}
```
