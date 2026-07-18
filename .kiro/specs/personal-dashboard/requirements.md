# Requirements Document

## Introduction

A personal dashboard web application built with HTML, CSS, and Vanilla JavaScript. The dashboard provides a single-page productivity hub featuring a time/date greeting, a Pomodoro-style focus timer, a sortable to-do list, quick-access links, and a light/dark mode toggle. All user data is persisted in the browser's LocalStorage — no backend or build tools required. The app must work in modern browsers (Chrome, Firefox, Edge, Safari) and load quickly with a clean, minimal UI.

## Glossary

- **Dashboard**: The single-page web application described in this document.
- **LocalStorage**: The browser's built-in key-value storage API used for data persistence.
- **Focus_Timer**: The Pomodoro-style countdown timer widget on the Dashboard.
- **Task_List**: The to-do list widget that stores and displays user tasks.
- **Quick_Links**: The widget that stores and displays user-defined shortcut links.
- **Theme_Toggle**: The UI control that switches between light and dark visual themes.
- **Greeting_Widget**: The widget that displays the current date, time, and a personalised greeting.
- **Session**: A single 25-minute Focus_Timer countdown from start to zero.
- **Task**: A single item in the Task_List, consisting of text content and a completion status.
- **Link**: A user-defined entry in Quick_Links consisting of a label and a URL.

---

## Requirements

### Requirement 1: Greeting Widget

**User Story:** As a user, I want to see the current time, date, and a personalised greeting, so that I can quickly orient myself when opening the Dashboard.

#### Acceptance Criteria

1. THE Greeting_Widget SHALL display the current date in the format "Weekday, Month DD, YYYY" (e.g., "Monday, July 14, 2025").
2. THE Greeting_Widget SHALL display the current time in HH:MM:SS format, updating every second.
3. WHEN the local hour is between 05:00 and 11:59, THE Greeting_Widget SHALL display the greeting "Good Morning".
4. WHEN the local hour is between 12:00 and 16:59, THE Greeting_Widget SHALL display the greeting "Good Afternoon".
5. WHEN the local hour is between 17:00 and 20:59, THE Greeting_Widget SHALL display the greeting "Good Evening".
6. WHEN the local hour is between 21:00 and 04:59, THE Greeting_Widget SHALL display the greeting "Good Night".
7. THE Greeting_Widget SHALL provide a text input field for the user to enter a custom name, accepting a maximum of 50 characters.
8. WHEN the user enters a name of 1–50 characters and confirms it by pressing Enter or clicking the Save button, THE Greeting_Widget SHALL append the name to the greeting (e.g., "Good Morning, Alex").
9. WHEN a custom name is saved, THE Greeting_Widget SHALL persist the name in LocalStorage under a dedicated key.
10. WHEN the Dashboard is loaded and a saved name exists in LocalStorage, THE Greeting_Widget SHALL display the saved name without requiring re-entry.
11. WHEN the user clears the name input and confirms, THE Greeting_Widget SHALL remove the saved name from LocalStorage and display the greeting without a name suffix.

---

### Requirement 2: Focus Timer

**User Story:** As a user, I want a 25-minute Pomodoro-style countdown timer with start, stop, and reset controls, so that I can manage focused work sessions from the Dashboard.

#### Acceptance Criteria

1. WHEN the Dashboard page loads, THE Focus_Timer SHALL reset to a duration of 25 minutes (1500 seconds) regardless of any previous timer state.
2. WHEN the Dashboard page loads, THE Focus_Timer SHALL render with the Start button enabled, the Stop button disabled, and the Reset button enabled.
3. WHEN the user activates the Start button while the Focus_Timer is in a stopped or paused state, THE Focus_Timer SHALL begin counting down one second per second from the current remaining time.
4. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL display the remaining time in MM:SS format.
5. WHEN the user activates the Stop button while the Focus_Timer is counting down, THE Focus_Timer SHALL pause the countdown and retain the remaining time.
6. WHEN the user activates the Reset button, THE Focus_Timer SHALL stop any active countdown and restore the display to 25:00.
7. WHEN the countdown reaches 00:00, THE Focus_Timer SHALL stop automatically and display a visible on-page alert indicating the session has ended.
8. WHILE the Focus_Timer is counting down, THE Focus_Timer SHALL disable the Start button to prevent duplicate intervals.
9. WHILE the Focus_Timer is paused or stopped, THE Focus_Timer SHALL disable the Stop button.
10. WHEN the user activates the Start button after the Focus_Timer was paused via the Stop button, THE Focus_Timer SHALL resume counting down from the retained remaining time.

---

### Requirement 3: To-Do List

**User Story:** As a user, I want to add, edit, complete, delete, and sort tasks, so that I can manage my daily to-dos directly from the Dashboard without losing data on page reload.

#### Acceptance Criteria

1. THE Task_List SHALL provide an input field and an "Add" button to create new tasks.
2. WHEN the user submits a non-empty task entry of 1–200 characters, THE Task_List SHALL add the task and display it in the task list.
3. IF the user attempts to submit an empty task entry, THEN THE Task_List SHALL not add a task and SHALL display an inline validation message.
4. WHEN the user marks a task as done, THE Task_List SHALL visually distinguish the completed task (e.g., strikethrough text) and update its completion status.
5. WHEN the user activates the edit control for a task, THE Task_List SHALL allow the user to modify the task text in place and save the change; IF the edited text is empty, THEN THE Task_List SHALL not save the change and SHALL display an inline validation message.
6. WHEN the user activates the delete control for a task, THE Task_List SHALL remove that task from the list.
7. WHEN the user activates the sort control, THE Task_List SHALL reorder the displayed tasks so that all incomplete tasks appear before all completed tasks.
8. WHEN any task is added, edited, completed, uncompleted, or deleted, THE Task_List SHALL persist the updated task collection to LocalStorage; IF the LocalStorage write fails, THEN THE Task_List SHALL display an error indication without blocking the UI.
9. WHEN the Dashboard has finished loading, THE Task_List SHALL restore all previously saved tasks from LocalStorage and display them in insertion order, or in sort order if sorting was the last operation applied before the previous session ended.

---

### Requirement 4: Quick Links

**User Story:** As a user, I want to save and manage shortcut buttons to my favourite websites, so that I can open them directly from the Dashboard.

#### Acceptance Criteria

1. THE Quick_Links widget SHALL provide an input field for a link label (max 50 characters) and an input field for a URL (max 2048 characters), plus an "Add Link" button.
2. WHEN the user provides a non-empty label and a URL starting with "http://" or "https://" and activates "Add Link", THE Quick_Links widget SHALL add the link and display it as a clickable button.
3. IF the user attempts to add a link with an empty label, an empty URL, a URL not starting with "http://" or "https://", or a URL already present in the list, THEN THE Quick_Links widget SHALL not add the link and SHALL display an inline validation message that clears when the invalid input is corrected.
4. WHEN the user activates a link button, THE Dashboard SHALL open the corresponding URL in a new browser tab.
5. THE Quick_Links widget SHALL provide a delete control for each link that, when activated, removes that link from the widget.
6. WHEN any link is added or deleted, THE Quick_Links widget SHALL persist the updated link collection to LocalStorage.
7. WHEN the Dashboard is loaded, THE Quick_Links widget SHALL restore all previously saved links from LocalStorage and display them as clickable buttons.
8. WHEN the number of saved links reaches 20, THE Quick_Links widget SHALL disable the "Add Link" button and display a visible message indicating the maximum number of links has been reached.

---

### Requirement 5: Light / Dark Mode Toggle

**User Story:** As a user, I want to switch between light and dark visual themes, so that I can use the Dashboard comfortably in different lighting conditions.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Theme_Toggle control (button or switch) that is accessible in the viewport without scrolling on every page state.
2. WHEN the user activates the Theme_Toggle, THE Dashboard SHALL switch from the current theme to the opposite theme (light ↔ dark) within 100 milliseconds, including on rapid successive activations.
3. THE Theme_Toggle SHALL display a distinct icon for each theme (e.g., sun icon for light mode, moon icon for dark mode) such that the active theme can be identified by the icon alone without relying on colour.
4. WHEN a theme is selected, THE Dashboard SHALL persist the selected theme identifier in LocalStorage.
5. WHEN the Dashboard is loaded and a saved theme exists in LocalStorage, THE Dashboard SHALL apply that saved theme before rendering any content to prevent a flash of the wrong theme.
6. WHEN no saved theme exists in LocalStorage, THE Dashboard SHALL apply the light theme as the default.
7. IF a LocalStorage write fails when persisting the theme, THEN THE Dashboard SHALL apply the theme for the current session only without displaying an error to the user.

---

### Requirement 6: Project Structure & Technical Constraints

**User Story:** As a developer, I want the project to follow strict file organisation rules, so that the codebase remains simple and maintainable.

#### Acceptance Criteria

1. THE Dashboard SHALL be implemented using only HTML, CSS, and Vanilla JavaScript with no external frameworks or libraries.
2. THE Dashboard SHALL contain exactly one CSS file located at `css/style.css`.
3. THE Dashboard SHALL contain exactly one JavaScript file located at `js/app.js`.
4. THE Dashboard SHALL be structured so that opening `index.html` directly in the latest stable release of Chrome, Firefox, Edge, or Safari runs the application without a build step.
5. THE Dashboard SHALL load and become interactive — defined as responding to user input within 100 milliseconds — when loaded over a connection of at least 10 Mbps.
6. THE Dashboard SHALL render all widgets without overlapping or clipped elements, without a horizontal scrollbar, and with all interactive controls operable at viewport widths from 320px up to 2559px.
