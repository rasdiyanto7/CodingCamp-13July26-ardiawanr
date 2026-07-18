(function () {

  // ─── Shared Utilities ─────────────────────────────

  /**
   * Safely reads a value from localStorage.
   * @param {string} key
   * @returns {string|null} The stored value, or null on error/missing key.
   */
  function safeGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  /**
   * Safely writes a value to localStorage.
   * @param {string} key
   * @param {string} value
   * @returns {boolean} true on success, false on quota exceeded or other error.
   */
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Alias for querySelector. Defaults root to document if not provided.
   * @param {string} selector
   * @param {Element|Document} [root=document]
   * @returns {Element|null}
   */
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  /**
   * Alias for querySelectorAll. Defaults root to document if not provided.
   * @param {string} selector
   * @param {Element|Document} [root=document]
   * @returns {NodeList}
   */
  function qsa(selector, root) {
    return (root || document).querySelectorAll(selector);
  }

  // ─── Widget: Theme ────────────────────────────────

  /** SVG markup for the sun icon (shown in light mode). */
  var SVG_SUN =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"' +
    ' fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round"' +
    ' role="img" aria-label="Sun — light mode active">' +
    '<circle cx="12" cy="12" r="5"/>' +
    '<line x1="12" y1="1"  x2="12" y2="3"/>' +
    '<line x1="12" y1="21" x2="12" y2="23"/>' +
    '<line x1="4.22" y1="4.22"  x2="5.64" y2="5.64"/>' +
    '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>' +
    '<line x1="1"  y1="12" x2="3"  y2="12"/>' +
    '<line x1="21" y1="12" x2="23" y2="12"/>' +
    '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>' +
    '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>' +
    '</svg>';

  /** SVG markup for the moon icon (shown in dark mode). */
  var SVG_MOON =
    '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"' +
    ' fill="none" stroke="currentColor" stroke-width="2"' +
    ' stroke-linecap="round" stroke-linejoin="round"' +
    ' role="img" aria-label="Moon — dark mode active">' +
    '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' +
    '</svg>';

  /**
   * Updates the #theme-icon innerHTML to the sun or moon SVG,
   * and updates the button's aria-label to describe the action it will take.
   * @param {string} theme - "light" or "dark"
   */
  function updateThemeIcon(theme) {
    var icon = qs('#theme-icon');
    var btn  = qs('#theme-toggle');
    if (icon) {
      icon.innerHTML = theme === 'dark' ? SVG_MOON : SVG_SUN;
    }
    if (btn) {
      btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    }
  }

  /**
   * Reads the saved theme from localStorage (via safeGet), applies the class
   * to <html>, updates the icon, defaults to "light" when no value stored,
   * and binds the click handler on #theme-toggle.
   */
  function initTheme() {
    var saved = safeGet('dashboard-theme');
    var theme = saved === 'dark' ? 'dark' : 'light';

    document.documentElement.className = theme;
    updateThemeIcon(theme);

    var btn = qs('#theme-toggle');
    if (btn) {
      btn.addEventListener('click', toggleTheme);
    }
  }

  /**
   * Flips the theme class on <html>, persists the new value via safeSet,
   * and updates the icon. If safeSet fails, the theme is applied for the
   * session only — no error is shown to the user.
   */
  function toggleTheme() {
    var current = document.documentElement.className;
    var next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.className = next;
    updateThemeIcon(next);

    // Persist silently — ignore safeSet failure (requirement 5.7)
    safeSet('dashboard-theme', next);
  }

  // ─── Widget: Greeting ─────────────────────────────
  // initGreeting(), tickClock(), greetingText(hour)
  // loadName(), saveName(), clearName()

  /**
   * Maps a 0–23 hour integer to the appropriate greeting phrase.
   * @param {number} hour  Integer in the range [0, 23]
   * @returns {string}  One of "Good Morning", "Good Afternoon", "Good Evening", "Good Night"
   */
  function greetingText(hour) {
    if (hour >= 5  && hour <= 11) return 'Good Morning';
    if (hour >= 12 && hour <= 16) return 'Good Afternoon';
    if (hour >= 17 && hour <= 20) return 'Good Evening';
    return 'Good Night'; // 21–23 and 0–4
  }

  /**
   * Formats a Date object as "Weekday, Month DD, YYYY".
   * The day is always zero-padded to two digits.
   * @param {Date} date
   * @returns {string}  e.g. "Wednesday, July 09, 2025"
   */
  function formatDate(date) {
    var weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var months   = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    var weekday = weekdays[date.getDay()];
    var month   = months[date.getMonth()];
    var day     = String(date.getDate()).padStart(2, '0');
    var year    = date.getFullYear();
    return weekday + ', ' + month + ' ' + day + ', ' + year;
  }

  /**
   * Formats a Date object as "HH:MM:SS" with all parts zero-padded to two digits.
   * @param {Date} date
   * @returns {string}  e.g. "09:05:03"
   */
  function formatTime(date) {
    var hh = String(date.getHours()).padStart(2, '0');
    var mm = String(date.getMinutes()).padStart(2, '0');
    var ss = String(date.getSeconds()).padStart(2, '0');
    return hh + ':' + mm + ':' + ss;
  }

  /**
   * Reads the user's name from localStorage.
   * @returns {string|null} The saved name, or null if absent/error.
   */
  function loadName() {
    return safeGet('dashboard-name');
  }

  /**
   * Validates, saves, and applies a user name.
   * If `name` trims to empty, delegates to clearName().
   * If 1–50 chars after trim, writes to localStorage and updates #greeting-text.
   * @param {string} name
   */
  function saveName(name) {
    var trimmed = name.trim();

    // Empty after trim → treat as clear
    if (trimmed.length === 0) {
      clearName();
      return;
    }

    // Reject names longer than 50 chars
    if (trimmed.length > 50) {
      return;
    }

    safeSet('dashboard-name', trimmed);
    renderGreeting();
  }

  /**
   * Removes the saved name from localStorage and updates the greeting display.
   */
  function clearName() {
    try {
      localStorage.removeItem('dashboard-name');
    } catch (e) {
      // Silently ignore removal errors
    }
    renderGreeting();
  }

  /**
   * Updates #greeting-text, #date-display, and #time-display to reflect the
   * current time. Called once immediately in initGreeting() and then every
   * second via setInterval.
   */
  function tickClock() {
    var now = new Date();
    renderGreeting(now);

    var dateEl = qs('#date-display');
    if (dateEl) dateEl.textContent = formatDate(now);

    var timeEl = qs('#time-display');
    if (timeEl) timeEl.textContent = formatTime(now);
  }

  /**
   * Updates #greeting-text using the current time and the saved name (if any).
   * Accepts an optional Date so tickClock can pass the same 'now' to avoid
   * re-creating Date objects.
   * @param {Date} [now]
   */
  function renderGreeting(now) {
    var greetingEl = qs('#greeting-text');
    if (!greetingEl) return;

    var date = now || new Date();
    var phrase = greetingText(date.getHours());
    var storedName = loadName();

    greetingEl.textContent = storedName
      ? phrase + ', ' + storedName
      : phrase;
  }

  /**
   * Builds the Greeting widget DOM inside #greeting-widget, pre-fills the name
   * input if a name is already saved, renders the initial greeting/date/time,
   * starts the 1-second clock interval, and binds the save/clear controls.
   */
  function initGreeting() {
    var section = qs('#greeting-widget');
    if (!section) return;

    // Build widget HTML only if static markup is absent (index.html already
    // contains the elements; this fallback keeps the widget functional if
    // initGreeting() is called before the HTML is present in the DOM).
    if (!qs('#greeting-text')) {
      section.innerHTML =
        '<p id="greeting-text"></p>' +
        '<p id="date-display"></p>' +
        '<p id="time-display"></p>' +
        '<div class="greeting-name-row">' +
          '<input id="name-input" type="text" maxlength="50" placeholder="Enter your name" aria-label="Your name" />' +
          '<button id="name-save-btn" type="button">Save</button>' +
        '</div>';
    }

    // Pre-fill input if name already saved (Requirement 1.10)
    var savedName = loadName();
    var input = qs('#name-input');
    if (savedName && input) {
      input.value = savedName;
    }

    // Initial render
    tickClock();

    // Clock tick every second (Requirement 1.2)
    setInterval(tickClock, 1000);

    // Bind Save button (Requirement 1.8)
    var saveBtn = qs('#name-save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', function () {
        var val = input ? input.value : '';
        saveName(val);
        // Keep input in sync: if cleared, wipe the field; otherwise show trimmed name
        if (input) {
          input.value = loadName() || '';
        }
      });
    }

    // Bind Enter key on the input (Requirement 1.8)
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          saveName(input.value);
          input.value = loadName() || '';
        }
      });
    }
  }

  // ─── Widget: Focus Timer ──────────────────────────
  // initTimer(), startTimer(), stopTimer(), resetTimer()
  // tickTimer(), formatTimerDisplay(seconds)

  /** Module-level timer state (not persisted — Requirement 2.1) */
  var timerInterval = null;
  var remaining = 1500;

  /**
   * Formats a total number of seconds into a "MM:SS" display string.
   * Both minutes and seconds are zero-padded to two digits.
   *
   * @param {number} totalSeconds - Integer in the range 0–1500
   * @returns {string} e.g. "25:00", "01:30", "00:00", "01:05"
   *
   * Examples:
   *   formatTimerDisplay(1500) → "25:00"
   *   formatTimerDisplay(90)   → "01:30"
   *   formatTimerDisplay(0)    → "00:00"
   *   formatTimerDisplay(65)   → "01:05"
   */
  function formatTimerDisplay(totalSeconds) {
    var minutes = Math.floor(totalSeconds / 60);
    var seconds = totalSeconds % 60;
    var mm = minutes < 10 ? '0' + minutes : '' + minutes;
    var ss = seconds < 10 ? '0' + seconds : '' + seconds;
    return mm + ':' + ss;
  }

  /**
   * Builds the Focus Timer widget DOM inside #timer-widget (if not already
   * present), resets remaining to 1500, renders the display, and binds all
   * button click handlers. Called once on DOMContentLoaded.
   *
   * Initial button states (Requirement 2.2):
   *   Start → enabled, Stop → disabled, Reset → enabled
   */
  function initTimer() {
    var section = qs('#timer-widget');
    if (!section) return;

    // Build widget HTML if the elements are not already present
    if (!qs('#timer-display')) {
      section.innerHTML =
        '<p id="timer-display" aria-live="polite" aria-label="Timer display"></p>' +
        '<div class="timer-controls">' +
          '<button id="timer-start" type="button">Start</button>' +
          '<button id="timer-stop"  type="button" disabled>Stop</button>' +
          '<button id="timer-reset" type="button">Reset</button>' +
        '</div>' +
        '<p id="timer-alert" role="alert" hidden></p>';
    }

    // Reset state
    remaining = 1500;

    // Render initial display
    var display = qs('#timer-display');
    if (display) display.textContent = formatTimerDisplay(remaining);

    // Restore initial button states (Requirement 2.2)
    var startBtn = qs('#timer-start');
    var stopBtn  = qs('#timer-stop');
    var resetBtn = qs('#timer-reset');

    if (startBtn) startBtn.disabled = false;
    if (stopBtn)  stopBtn.disabled  = true;
    if (resetBtn) resetBtn.disabled = false;

    // Hide alert
    var alert = qs('#timer-alert');
    if (alert) alert.hidden = true;

    // Bind button click handlers
    if (startBtn) startBtn.addEventListener('click', startTimer);
    if (stopBtn)  stopBtn.addEventListener('click',  stopTimer);
    if (resetBtn) resetBtn.addEventListener('click', resetTimer);
  }

  /**
   * Begins counting down one second per second from the current `remaining`
   * value. Guards against double-start (does nothing if already running).
   * Disables Start, enables Stop (Requirements 2.3, 2.8).
   */
  function startTimer() {
    // Guard: do nothing if a tick interval is already running (Requirement 2.8)
    if (timerInterval !== null) return;

    var startBtn = qs('#timer-start');
    var stopBtn  = qs('#timer-stop');

    if (startBtn) startBtn.disabled = true;
    if (stopBtn)  stopBtn.disabled  = false;

    // Hide any previous alert when starting
    var alert = qs('#timer-alert');
    if (alert) alert.hidden = true;

    timerInterval = setInterval(tickTimer, 1000);
  }

  /**
   * Pauses the countdown by clearing the interval. Retains the current
   * `remaining` value so the timer can be resumed from the same point.
   * Enables Start, disables Stop (Requirements 2.5, 2.9).
   */
  function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;

    var startBtn = qs('#timer-start');
    var stopBtn  = qs('#timer-stop');

    if (startBtn) startBtn.disabled = false;
    if (stopBtn)  stopBtn.disabled  = true;
  }

  /**
   * Stops any active countdown, resets `remaining` to 1500, re-renders the
   * display, restores initial button states, and hides the alert.
   * (Requirement 2.6)
   */
  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;

    remaining = 1500;

    var display  = qs('#timer-display');
    var startBtn = qs('#timer-start');
    var stopBtn  = qs('#timer-stop');
    var resetBtn = qs('#timer-reset');
    var alert    = qs('#timer-alert');

    if (display)  display.textContent  = formatTimerDisplay(remaining);
    if (startBtn) startBtn.disabled    = false;
    if (stopBtn)  stopBtn.disabled     = true;
    if (resetBtn) resetBtn.disabled    = false;
    if (alert)    alert.hidden         = true;
  }

  /**
   * Called every second while the timer is running. Decrements `remaining`,
   * updates the display, and — when `remaining` reaches 0 — stops the timer
   * and calls showAlert() (Requirements 2.4, 2.7).
   */
  function tickTimer() {
    remaining -= 1;

    var display = qs('#timer-display');
    if (display) display.textContent = formatTimerDisplay(remaining);

    if (remaining === 0) {
      stopTimer();
      showAlert();
    }
  }

  /**
   * Un-hides #timer-alert with "Session complete!" text, then attempts to
   * play a short beep via the Web Audio API. If the browser blocks audio
   * (e.g. no prior user gesture), the error is caught silently — the visible
   * alert is always shown regardless (Requirements 2.7).
   */
  function showAlert() {
    var alert = qs('#timer-alert');
    if (alert) {
      alert.textContent = 'Session complete!';
      alert.hidden = false;
    }

    // Attempt audio beep — silent fail if blocked (Requirement 2.7)
    try {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        var ctx  = new AudioCtx();
        var osc  = ctx.createOscillator();
        var gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = 880; // A5 — a clear, pleasant beep tone

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.6);

        // Close the context after the beep to free resources
        osc.onended = function () {
          ctx.close();
        };
      }
    } catch (e) {
      // Audio blocked or unavailable — visual alert still shown above
    }
  }

  // ─── Widget: Task List ────────────────────────────
  // initTaskList(), addTask(), editTask(), toggleTask()
  // deleteTask(), sortTasks(), renderTasks(), persistTasks()

  /** In-memory task array and sort flag (Requirements 3.1, 3.8, 3.9) */
  var tasks = [];
  var sorted = false;

  /**
   * Persists the current tasks array and sort flag to localStorage.
   * JSON-encodes { tasks, sorted } and calls safeSet.
   * If safeSet returns false (quota exceeded), shows an error badge on the
   * widget header (Requirement 3.8).
   */
  function persistTasks() {
    var payload = JSON.stringify({ tasks: tasks, sorted: sorted });
    var ok = safeSet('dashboard-tasks', payload);
    var header = qs('#task-widget h2');
    if (!ok) {
      // Show error badge on widget header
      if (header && !qs('#task-storage-err')) {
        var badge = document.createElement('span');
        badge.id = 'task-storage-err';
        badge.title = 'Storage error – changes may not be saved';
        badge.textContent = ' ⚠';
        badge.style.color = 'red';
        badge.style.fontSize = '0.85em';
        header.appendChild(badge);
      }
    } else {
      // Clear any existing error badge on success
      var existingBadge = qs('#task-storage-err');
      if (existingBadge) existingBadge.parentNode.removeChild(existingBadge);
    }
  }

  /**
   * Validates task text (1–200 non-whitespace characters after trim).
   * On valid input: generates id, pushes task object, calls persistTasks()
   * and renderTasks().
   * On invalid input: shows inline message in #task-validation (Req 3.3).
   * @param {string} text
   */
  function addTask(text) {
    var validationEl = qs('#task-validation');
    var trimmed = (text || '').trim();

    // Reject empty or whitespace-only (Requirement 3.3)
    if (trimmed.length === 0) {
      if (validationEl) validationEl.textContent = 'Task cannot be empty.';
      return;
    }

    // Reject if exceeds 200 characters (Requirement 3.2)
    if (trimmed.length > 200) {
      if (validationEl) validationEl.textContent = 'Task must be 200 characters or fewer.';
      return;
    }

    // Clear any previous validation message
    if (validationEl) validationEl.textContent = '';

    var id = 't_' + Date.now();
    tasks.push({
      id: id,
      text: trimmed,
      done: false,
      createdAt: Date.now()
    });

    persistTasks();
    renderTasks();

    // Clear the input field after a successful add
    var input = qs('#task-input');
    if (input) input.value = '';
  }

  /**
   * Rebuilds the #task-list <ul> from the in-memory tasks array.
   * Each task renders as a <li class="task-item"> containing a checkbox,
   * text span, edit button, and delete button (Requirements 3.1–3.7).
   */
  function renderTasks() {
    var list = qs('#task-list');
    if (!list) return;

    // Clear existing items
    list.innerHTML = '';

    tasks.forEach(function (task) {
      var li = document.createElement('li');
      li.className = 'task-item';
      li.dataset.id = task.id;

      // Checkbox — triggers toggleTask (Requirement 3.4)
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.done;
      checkbox.setAttribute('aria-label', 'Mark "' + task.text + '" as ' + (task.done ? 'incomplete' : 'complete'));
      checkbox.addEventListener('change', function () {
        toggleTask(task.id);
      });

      // Text span — strike-through when done (Requirement 3.4)
      var span = document.createElement('span');
      span.className = 'task-text' + (task.done ? ' done' : '');
      span.textContent = task.text;
      if (task.done) {
        span.style.textDecoration = 'line-through';
      }

      // Edit button — triggers editTask via prompt (Requirement 3.5)
      var editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'task-edit-btn';
      editBtn.textContent = 'Edit';
      editBtn.setAttribute('aria-label', 'Edit task: ' + task.text);
      editBtn.addEventListener('click', function () {
        var newText = prompt('Edit task:', task.text);
        if (newText !== null) {
          editTask(task.id, newText);
        }
      });

      // Delete button — triggers deleteTask (Requirement 3.6)
      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'task-delete-btn';
      deleteBtn.textContent = 'Delete';
      deleteBtn.setAttribute('aria-label', 'Delete task: ' + task.text);
      deleteBtn.addEventListener('click', function () {
        deleteTask(task.id);
      });

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
      list.appendChild(li);
    });
  }

  /**
   * Flips the `done` flag on the task with the given id; persists; renders.
   * (Requirement 3.4)
   * @param {string} id
   */
  function toggleTask(id) {
    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i].done = !tasks[i].done;
        break;
      }
    }
    persistTasks();
    renderTasks();
  }

  /**
   * Updates the text of the task with the given id; persists; renders.
   * Validates that newText is non-empty (1–200 chars after trim).
   * On invalid input, shows an inline validation message in #task-validation
   * and leaves the task unchanged. (Requirements 3.5, 3.8)
   * @param {string} id
   * @param {string} newText
   */
  function editTask(id, newText) {
    var validationEl = qs('#task-validation');
    var trimmed = (newText || '').trim();

    // Reject empty or whitespace-only (Requirement 3.5)
    if (trimmed.length === 0) {
      if (validationEl) validationEl.textContent = 'Task cannot be empty.';
      return;
    }

    // Reject if exceeds 200 characters (Requirement 3.5)
    if (trimmed.length > 200) {
      if (validationEl) validationEl.textContent = 'Task must be 200 characters or fewer.';
      return;
    }

    // Clear any previous validation message on success
    if (validationEl) validationEl.textContent = '';

    for (var i = 0; i < tasks.length; i++) {
      if (tasks[i].id === id) {
        tasks[i].text = trimmed;
        break;
      }
    }
    persistTasks();
    renderTasks();
  }

  /**
   * Removes the task with the given id from the array; persists; renders.
   * (Requirement 3.6, 3.8)
   * @param {string} id
   */
  function deleteTask(id) {
    tasks = tasks.filter(function (t) { return t.id !== id; });
    persistTasks();
    renderTasks();
  }

  /**
   * Stable-sorts the in-memory tasks array so that all incomplete tasks
   * (done === false) appear before all completed tasks (done === true),
   * preserving the relative order of tasks within each group (stable sort).
   *
   * Stability is guaranteed by tagging each element with its original index
   * before sorting, so equal-priority items break ties by their prior position.
   * This works correctly regardless of whether the JS engine's native sort is
   * stable (all modern browsers are, but this makes it explicit).
   *
   * Sets sorted = true; persists; re-renders. (Requirements 3.7, 3.9)
   */
  function sortTasks() {
    // Tag each task with its original position to enforce stable ordering
    var tagged = tasks.map(function (task, index) {
      return { task: task, index: index };
    });

    tagged.sort(function (a, b) {
      // Primary key: incomplete (false) before complete (true)
      var aDone = a.task.done ? 1 : 0;
      var bDone = b.task.done ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      // Secondary key: preserve original insertion order (stable)
      return a.index - b.index;
    });

    tasks = tagged.map(function (item) { return item.task; });

    sorted = true;
    persistTasks();
    renderTasks();
  }

  /**
   * Builds the Task List widget DOM inside #task-widget, loads persisted
   * tasks from localStorage, and binds all event handlers.
   */
  function initTaskList() {
    var section = qs('#task-widget');
    if (!section) return;

    // Build widget HTML
    section.innerHTML =
      '<h2>Task List</h2>' +
      '<div class="task-input-row">' +
        '<input id="task-input" type="text" maxlength="200" placeholder="Add a task…" aria-label="New task" />' +
        '<button id="task-add-btn" type="button">Add</button>' +
        '<button id="task-sort-btn" type="button">Sort</button>' +
      '</div>' +
      '<p id="task-validation" role="alert" aria-live="polite"></p>' +
      '<ul id="task-list" aria-label="Task list"></ul>';

    // Load persisted tasks
    var raw = safeGet('dashboard-tasks');
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed.tasks)) {
          tasks = parsed.tasks;
        }
        sorted = !!parsed.sorted;
      } catch (e) {
        tasks = [];
        sorted = false;
      }
    }

    // Initial render
    renderTasks();

    // Bind Add button
    var addBtn = qs('#task-add-btn');
    var input  = qs('#task-input');

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        addTask(input ? input.value : '');
      });
    }

    // Add on Enter key in input
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          addTask(input.value);
        }
      });

      // Clear validation message on any input change (Requirement 3.3)
      input.addEventListener('input', function () {
        var validationEl = qs('#task-validation');
        if (validationEl) validationEl.textContent = '';
      });
    }

    // Bind Sort button
    var sortBtn = qs('#task-sort-btn');
    if (sortBtn) {
      sortBtn.addEventListener('click', sortTasks);
    }
  }

  // ─── Widget: Quick Links ──────────────────────────
  // initQuickLinks(), addLink(), deleteLink()
  // renderLinks(), persistLinks(), isValidUrl()

  /** In-memory links array (Requirement 4.6, 4.7) */
  var links = [];

  /**
   * Returns true iff the given URL string starts with "http://" or "https://".
   * @param {string} url
   * @returns {boolean}
   */
  function isValidUrl(url) {
    return typeof url === 'string' &&
      (url.indexOf('http://') === 0 || url.indexOf('https://') === 0);
  }

  /**
   * Persists the current links array to localStorage as a JSON array.
   * Calls safeSet('dashboard-links', ...).
   */
  function persistLinks() {
    safeSet('dashboard-links', JSON.stringify(links));
  }

  /**
   * Clears and rebuilds #links-grid from the in-memory links array.
   * Each link is rendered as a .link-item wrapper containing:
   *   - an <a class="link-btn" target="_blank"> for the link
   *   - a <button class="link-delete-btn"> for deletion
   * Shows #link-limit-msg and disables #link-add-btn when count === 20;
   * re-enables when count < 20.
   */
  function renderLinks() {
    var grid = qs('#links-grid');
    if (!grid) return;

    // Clear existing items
    grid.innerHTML = '';

    links.forEach(function (link, index) {
      var item = document.createElement('div');
      item.className = 'link-item';

      // Anchor — opens in new tab (Requirement 4.4)
      var a = document.createElement('a');
      a.className = 'link-btn';
      a.href = link.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = link.label;
      a.setAttribute('aria-label', 'Open ' + link.label + ' in new tab');

      // Delete button (Requirement 4.5)
      var deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'link-delete-btn';
      deleteBtn.textContent = '✕';
      deleteBtn.setAttribute('aria-label', 'Delete link: ' + link.label);
      deleteBtn.addEventListener('click', (function (i) {
        return function () { deleteLink(i); };
      }(index)));

      item.appendChild(a);
      item.appendChild(deleteBtn);
      grid.appendChild(item);
    });

    // Enforce 20-link cap UI (Requirement 4.8)
    var addBtn  = qs('#link-add-btn');
    var limitMsg = qs('#link-limit-msg');
    if (links.length >= 20) {
      if (addBtn)   addBtn.disabled = true;
      if (limitMsg) limitMsg.hidden = false;
    } else {
      if (addBtn)   addBtn.disabled = false;
      if (limitMsg) limitMsg.hidden = true;
    }
  }

  /**
   * Validates inputs and adds a new link to the array.
   * Validation rules:
   *   - label: non-empty after trim, ≤50 chars
   *   - url:   non-empty, ≤2048 chars, passes isValidUrl()
   *   - url must not already be present in the links array
   *   - current count must be < 20
   * On success: pushes {label, url}; calls persistLinks() + renderLinks().
   * On failure: shows inline message in #link-validation.
   * @param {string} label
   * @param {string} url
   */
  function addLink(label, url) {
    var validationEl = qs('#link-validation');

    function showError(msg) {
      if (validationEl) validationEl.textContent = msg;
    }

    var trimmedLabel = (label || '').trim();
    var trimmedUrl   = (url   || '').trim();

    // Validate label
    if (trimmedLabel.length === 0) {
      showError('Label cannot be empty.');
      return;
    }
    if (trimmedLabel.length > 50) {
      showError('Label must be 50 characters or fewer.');
      return;
    }

    // Validate URL
    if (trimmedUrl.length === 0) {
      showError('URL cannot be empty.');
      return;
    }
    if (trimmedUrl.length > 2048) {
      showError('URL must be 2048 characters or fewer.');
      return;
    }
    if (!isValidUrl(trimmedUrl)) {
      showError('URL must start with http:// or https://');
      return;
    }

    // Check for duplicate URL (Requirement 4.3)
    for (var i = 0; i < links.length; i++) {
      if (links[i].url === trimmedUrl) {
        showError('This URL is already in your links.');
        return;
      }
    }

    // Enforce 20-link maximum (Requirement 4.8)
    if (links.length >= 20) {
      showError('Maximum of 20 links reached.');
      return;
    }

    // Clear any previous validation message on success
    if (validationEl) validationEl.textContent = '';

    links.push({ label: trimmedLabel, url: trimmedUrl });
    persistLinks();
    renderLinks();

    // Clear input fields after a successful add
    var labelInput = qs('#link-label-input');
    var urlInput   = qs('#link-url-input');
    if (labelInput) labelInput.value = '';
    if (urlInput)   urlInput.value   = '';
  }

  /**
   * Removes the link at the given index from the array; persists; renders.
   * (Requirement 4.5)
   * @param {number} index
   */
  function deleteLink(index) {
    links.splice(index, 1);
    persistLinks();
    renderLinks();
  }

  /**
   * Builds the Quick Links widget DOM inside #links-widget, loads persisted
   * links from localStorage, renders them, and binds all event handlers.
   */
  function initQuickLinks() {
    var section = qs('#links-widget');
    if (!section) return;

    // Build widget HTML
    section.innerHTML =
      '<h2>Quick Links</h2>' +
      '<div class="link-input-row">' +
        '<input id="link-label-input" type="text" maxlength="50" placeholder="Label" aria-label="Link label" />' +
        '<input id="link-url-input"   type="text" maxlength="2048" placeholder="https://…" aria-label="Link URL" />' +
        '<button id="link-add-btn" type="button">Add Link</button>' +
      '</div>' +
      '<p id="link-validation" role="alert" aria-live="polite"></p>' +
      '<p id="link-limit-msg" hidden>Maximum of 20 links reached.</p>' +
      '<div id="links-grid" aria-label="Quick links"></div>';

    // Load persisted links (Requirement 4.7)
    var raw = safeGet('dashboard-links');
    if (raw) {
      try {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          links = parsed;
        }
      } catch (e) {
        links = [];
      }
    }

    // Initial render
    renderLinks();

    // Bind Add Link button
    var addBtn      = qs('#link-add-btn');
    var labelInput  = qs('#link-label-input');
    var urlInput    = qs('#link-url-input');
    var validationEl = qs('#link-validation');

    if (addBtn) {
      addBtn.addEventListener('click', function () {
        addLink(
          labelInput ? labelInput.value : '',
          urlInput   ? urlInput.value   : ''
        );
      });
    }

    // Clear validation message on input change (Requirement 4.3)
    function clearValidation() {
      if (validationEl) validationEl.textContent = '';
    }
    if (labelInput) labelInput.addEventListener('input', clearValidation);
    if (urlInput)   urlInput.addEventListener('input',   clearValidation);
  }

  // ─── Test Exports (property-based test harness only) ──────────────────────
  // Exposed so tests/property-tests.html can call these functions without a
  // build step.  Not intended for production use.
  window._dashTest = {
    // Greeting helper exports
    greetingText: greetingText,
    formatDate: formatDate,
    formatTime: formatTime,
    // Theme exports
    toggleTheme: toggleTheme,
    initTheme: initTheme,
    updateThemeIcon: updateThemeIcon,
    // Focus Timer exports
    initTimer: initTimer,
    startTimer: startTimer,
    stopTimer: stopTimer,
    resetTimer: resetTimer,
    tickTimer: tickTimer,
    formatTimerDisplay: formatTimerDisplay,
    getTimerInterval: function () { return timerInterval; },
    getRemaining: function () { return remaining; },
    setRemaining: function (v) { remaining = v; },
    // Task List exports
    addTask: addTask,
    editTask: editTask,
    toggleTask: toggleTask,
    deleteTask: deleteTask,
    sortTasks: sortTasks,
    renderTasks: renderTasks,
    persistTasks: persistTasks,
    getTasks: function () { return tasks; },
    getSorted: function () { return sorted; },
    resetTasks: function () { tasks = []; sorted = false; },
    // Quick Links exports
    isValidUrl: isValidUrl,
    addLink: addLink,
    deleteLink: deleteLink,
    persistLinks: persistLinks,
    renderLinks: renderLinks,
    getLinks: function () { return links; },
    resetLinks: function () { links = []; }
  };

  // ─── Bootstrap ────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    initTheme();
    initGreeting();
    initTimer();
    initTaskList();
    initQuickLinks();
  });

}());
