// app.js

const App = {
    state: {
        currentSplit: null,
        currentDayIdx: 0,
        currentExercise: null,
        currentExerciseIdx: 0,
        currentSet: 1,
        phase: "IDLE",
        timerValue: 0,
        timerInterval: null,
        repsRemaining: 0,
        isPaused: false,
        pacerStartTime: 0,
        currentTempo: PRESETS.default,
        completed: new Set(),
        weights: {},
        favoriteSplitId: null,
        isManualFinish: false,
        totalPausedTime: 0,
        lastPauseStart: 0,
        wasConcentric: false,
        animationFrameId: null,
        soundMode: "vibrate", // may be overridden in init
        audioCtx: null,
        isIOS: false,
        supportsVibrate: false,
        isExtraRepsMode: false,
        theme: "auto", // "auto" | "dark" | "light" | "battery"
    },

    init() {
        // Completed flags
        const saved = localStorage.getItem("wt_completed_v2");
        if (saved) {
            this.state.completed = new Set(JSON.parse(saved));
        }

        // Weights
        const savedWeights = localStorage.getItem("wt_weights");
        if (savedWeights) {
            try {
                this.state.weights = JSON.parse(savedWeights);
            } catch (e) {
                console.error("Error parsing weights:", e);
                this.state.weights = {};
            }
        }

        // Favorite split
        this.state.favoriteSplitId = localStorage.getItem("wt_favorite_split");

        // Device capability
        const ua = navigator.userAgent || "";

        this.state.isIOS =
            /iPad|iPhone|iPod/.test(ua) ||
            (navigator.platform === "MacIntel" &&
                navigator.maxTouchPoints > 1);

        // Only treat as "supports vibrate" on mobile-ish devices
        const isMobile =
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                ua
            );

        this.state.supportsVibrate =
            typeof navigator !== "undefined" &&
            typeof navigator.vibrate === "function" &&
            isMobile;

        // THEME preference
        const savedTheme = localStorage.getItem("wt_theme") || "auto";
        this.state.theme = savedTheme;
        this.applyTheme();
        this.updateThemeButtons();

        // SOUND preference
        const savedSound = localStorage.getItem("wt_sound_mode");

        // Decide which modes are allowed on this device
        const allowedSoundModes =
            !this.state.supportsVibrate || this.state.isIOS
                ? ["beep", "silent"]
                : ["vibrate", "beep", "silent"];

        if (savedSound && allowedSoundModes.includes(savedSound)) {
            // Use saved preference if it's valid for this device
            this.state.soundMode = savedSound;
        } else {
            // Fallback defaults
            if (!this.state.supportsVibrate || this.state.isIOS) {
                this.state.soundMode = "beep";
            } else {
                this.state.soundMode = "vibrate";
            }
        }

        this.ensureAudio();
        this.updateSoundButton();

        // Render list of splits
        this.renderSplitList();

        // Auto-load favorite
        if (this.state.favoriteSplitId) {
            const fav = SPLIT_LIBRARY.find(
                (s) => s.id === this.state.favoriteSplitId
            );
            if (fav) {
                this.selectSplit(fav);
            }
        }
    },

    // ---------------- THEME HANDLING ----------------

    getSystemTheme() {
        if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            return "dark";
        }
        return "light";
    },

    ensureThemeMediaListener() {
        if (this._mqListenerAttached || !window.matchMedia) return;

        const mq = window.matchMedia("(prefers-color-scheme: dark)");
        const handler = () => {
            if (this.state.theme === "auto") {
                this.applyTheme();
            }
        };

        if (mq.addEventListener) {
            mq.addEventListener("change", handler);
        } else if (mq.addListener) {
            mq.addListener(handler); // older Safari
        }

        this._mqListenerAttached = true;
    },

    applyTheme() {
        const root = document.documentElement;
        let themeToApply = this.state.theme;

        if (this.state.theme === "auto") {
            this.ensureThemeMediaListener();
            themeToApply = this.getSystemTheme(); // "dark" or "light"
        }

        root.setAttribute("data-theme", themeToApply);
    },

    setTheme(theme) {
        this.state.theme = theme;
        localStorage.setItem("wt_theme", theme);
        this.applyTheme();
        this.updateThemeButtons();
    },

    setThemeFromUI(theme) {
        this.setTheme(theme);
        this.hideSettings();
    },

    updateThemeButtons() {
        const buttons = document.querySelectorAll("[data-theme-option]");
        buttons.forEach((btn) => {
            const val = btn.getAttribute("data-theme-option");
            btn.classList.toggle("active", val === this.state.theme);
        });
    },

    toggleSettings() {
        const panel = document.getElementById("settings-panel");
        if (!panel) return;
        panel.classList.toggle("hidden");
    },

    hideSettings() {
        const panel = document.getElementById("settings-panel");
        if (!panel) return;
        panel.classList.add("hidden");
    },

    // ---------------- HELPERS ----------------

    saveWeight(splitId, dayIdx, exIdx, val) {
        const key = `${splitId}|${dayIdx}|${exIdx}`;
        this.state.weights[key] = val;
        localStorage.setItem("wt_weights", JSON.stringify(this.state.weights));
    },

    getExerciseSeconds(ex) {
        const repStr = String(ex.reps).split("-").pop();
        const reps = parseInt(repStr) || 10;
        const tempo = 4; // rough estimate, independent of PRESETS
               const type = ex.type || "isolation";
        const rest = CONFIG.rest[type] || CONFIG.rest.default;
        return ex.sets * (reps * tempo + rest);
    },

    formatDuration(totalSeconds) {
        if (totalSeconds < 60) return "< 1m";
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.round((totalSeconds % 3600) / 60);
        if (h > 0) return `${h}h ${m}m`;
        return `${m}m`;
    },

    saveProgress() {
        localStorage.setItem(
            "wt_completed_v2",
            JSON.stringify([...this.state.completed])
        );
    },

    // ---------------- NAVIGATION / RENDERING ----------------

    navTo(viewId) {
        document.getElementById("view-splits").classList.add("hidden");
        document.getElementById("view-days").classList.add("hidden");
        document.getElementById("view-exercises").classList.add("hidden");
        document.getElementById("workout-overlay").classList.add("hidden");
        document.body.style.backgroundColor = "var(--bg-dark)";

        if (viewId === "splits") {
            document.getElementById("view-splits").classList.remove("hidden");
            this.state.currentSplit = null;
        } else if (viewId === "days") {
            document.getElementById("view-days").classList.remove("hidden");
        } else if (viewId === "exercises") {
            document.getElementById("view-exercises").classList.remove("hidden");
        }

        // Always hide settings when switching main views
        this.hideSettings();
    },

    renderSplitList() {
        const list = document.getElementById("split-list");
        if (!list) {
            console.error("Missing #split-list in DOM");
            return;
        }

        list.innerHTML = "";

        if (!Array.isArray(SPLIT_LIBRARY)) {
            console.error("SPLIT_LIBRARY is not an array or not defined");
            return;
        }

        SPLIT_LIBRARY.forEach((split) => {
            const isFav = this.state.favoriteSplitId === split.id;
            const starClass = isFav ? "active" : "";

            const btn = document.createElement("div");
            btn.className = "card";

            // Make the entire card clickable (except the star button)
            btn.onclick = () => this.selectSplit(split);

            btn.innerHTML = `
                <div class="card-content">
                    <span class="card-title" style="color:var(--accent-blue)">${split.name}</span>
                    <div class="card-meta">
                        <span>${split.days.length} Workouts</span>
                        <span>${split.description}</span>
                    </div>
                </div>
                <button class="star-btn ${starClass}" onclick="App.toggleFavorite('${split.id}', event)">★</button>
            `;
            list.appendChild(btn);
        });
    },

    toggleFavorite(splitId, event) {
        event.stopPropagation();
        if (this.state.favoriteSplitId === splitId) {
            this.state.favoriteSplitId = null;
        } else {
            this.state.favoriteSplitId = splitId;
        }
        localStorage.setItem(
            "wt_favorite_split",
            this.state.favoriteSplitId || ""
        );
        this.renderSplitList();
    },

    selectSplit(splitObj) {
        this.state.currentSplit = splitObj;
        document.getElementById("split-title-display").innerText =
            splitObj.name;
        this.renderDayList();
        this.navTo("days");
    },

    renderDayList() {
        const list = document.getElementById("day-list");
        list.innerHTML = "";
        const split = this.state.currentSplit;

        split.days.forEach((day, dayIdx) => {
            let completedCount = 0;
            let totalSeconds = 0;

            day.exercises.forEach((ex, exIdx) => {
                const key = `${split.id}|${dayIdx}|${exIdx}`;
                if (this.state.completed.has(key)) completedCount++;
                totalSeconds += this.getExerciseSeconds(ex);
            });

            const durationStr = this.formatDuration(totalSeconds);

            const btn = document.createElement("div");
            btn.className = "card";
            btn.innerHTML = `
                <div class="card-content">
                    <span class="card-title">
                        ${day.name}
                        <span class="time-est">~${durationStr}</span>
                    </span>
                    <div class="card-meta">
                        <span>${day.exercises.length} Exercises</span>
                        <span style="color: ${
                            completedCount === day.exercises.length
                                ? "var(--status-go)"
                                : "var(--accent-blue)"
                        }">
                            ${completedCount}/${day.exercises.length} Completed
                        </span>
                    </div>
                </div>
            `;
            btn.onclick = () => this.selectDay(dayIdx);
            list.appendChild(btn);
        });
    },

    selectDay(dayIdx) {
        this.state.currentDayIdx = dayIdx;
        const day = this.state.currentSplit.days[dayIdx];
        const splitId = this.state.currentSplit.id;

        document.getElementById("day-title-display").innerText = day.name;
        this.updateRemainingHeader();

        const list = document.getElementById("exercise-list");
        list.innerHTML = "";

        day.exercises.forEach((ex, exIdx) => {
            const key = `${splitId}|${dayIdx}|${exIdx}`;
            const isDone = this.state.completed.has(key);
            const weightVal =
                this.state.weights && this.state.weights[key]
                    ? this.state.weights[key]
                    : "";

            const exSeconds = this.getExerciseSeconds(ex);
            const exDuration = this.formatDuration(exSeconds);

            const btn = document.createElement("div");
            btn.className = "card";
            btn.onclick = () => App.startExercisePreview(exIdx);

            btn.innerHTML = `
                <div class="card-content">
                    <span class="card-title">${ex.name}</span>
                    <div class="card-meta">
                        <span class="tag">${ex.sets} Sets</span>
                        <span class="tag">${ex.reps} Reps</span>
                        <span class="tag">~${exDuration}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <input
                        type="number"
                        class="weight-input"
                        placeholder="lbs"
                        value="${weightVal}"
                        onclick="event.stopPropagation()"
                        oninput="App.saveWeight('${splitId}', ${dayIdx}, ${exIdx}, this.value)"
                    >
                    <div class="check-area">
                        <button
                            class="check-btn ${isDone ? "completed" : ""}"
                            onclick="App.toggleCompletion(${dayIdx}, ${exIdx}, event)"
                        >
                            ✓
                        </button>
                    </div>
                </div>
            `;
            list.appendChild(btn);
        });

        this.navTo("exercises");
    },

    toggleCompletion(dayIdx, exIdx, event) {
        if (event) event.stopPropagation();
        const key = `${this.state.currentSplit.id}|${dayIdx}|${exIdx}`;

        if (this.state.completed.has(key)) {
            this.state.completed.delete(key);
        } else {
            this.state.completed.add(key);
        }
        this.saveProgress();
        this.selectDay(this.state.currentDayIdx);
    },

    resetDayProgress(btnElement) {
        if (btnElement.dataset.confirm === "true") {
            const splitId = this.state.currentSplit.id;
            const dayIdx = this.state.currentDayIdx;
            this.state.currentSplit.days[dayIdx].exercises.forEach(
                (_, exIdx) => {
                    this.state.completed.delete(
                        `${splitId}|${dayIdx}|${exIdx}`
                    );
                }
            );
            this.saveProgress();
            this.selectDay(dayIdx);

            btnElement.innerText = "Reset Day Progress";
            btnElement.dataset.confirm = "false";
            btnElement.classList.remove("confirm-state");
        } else {
            btnElement.innerText = "Tap Again to Confirm";
            btnElement.dataset.confirm = "true";
            btnElement.classList.add("confirm-state");
            setTimeout(() => {
                if (btnElement.dataset.confirm === "true") {
                    btnElement.innerText = "Reset Day Progress";
                    btnElement.dataset.confirm = "false";
                    btnElement.classList.remove("confirm-state");
                }
            }, 3000);
        }
    },

    updateRemainingHeader() {
        const day = this.state.currentSplit.days[this.state.currentDayIdx];
        let totalSeconds = 0;
        let completedCount = 0;

        day.exercises.forEach((ex, exIdx) => {
            const key = `${this.state.currentSplit.id}|${this.state.currentDayIdx}|${exIdx}`;
            if (!this.state.completed.has(key)) {
                totalSeconds += this.getExerciseSeconds(ex);
            } else {
                completedCount++;
            }
        });

        const text =
            completedCount === day.exercises.length
                ? "All Done!"
                : `Time Remaining: ${this.formatDuration(totalSeconds)}`;
        document.getElementById("header-subtitle").innerText = text;
    },

    // ---------------- AUDIO / SOUND ----------------

    ensureAudio() {
        if (this.state.soundMode === "beep") {
            if (!this.state.audioCtx) {
                const AudioCtx =
                    window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.state.audioCtx = new AudioCtx();
                }
            }
            if (
                this.state.audioCtx &&
                this.state.audioCtx.state === "suspended"
            ) {
                this.state.audioCtx.resume();
            }
        }
    },

    toggleSoundMode() {
        const supportsVibrate = this.state.supportsVibrate;
        const modes =
            !supportsVibrate || this.state.isIOS
                ? ["beep", "silent"]
                : ["vibrate", "beep", "silent"];

        const currentIndex = modes.indexOf(this.state.soundMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        this.state.soundMode = modes[nextIndex];

        // Persist user preference
        localStorage.setItem("wt_sound_mode", this.state.soundMode);

        this.ensureAudio();
        this.updateSoundButton();
        this.playSound("standard");
    },

    updateSoundButton() {
        const btn = document.getElementById("btn-sound-toggle");
        const supportsVibrate = this.state.supportsVibrate;

        if (!btn) return;

        // Devices without vibrate or on iOS: never show "Vibrate"
        if (!supportsVibrate || this.state.isIOS) {
            if (this.state.soundMode === "silent") {
                btn.textContent = "Silent";
            } else {
                btn.innerHTML =
                    "Beep<div style='font-size:0.65rem; opacity:0.8; margin-top:2px; font-weight:400;'>(Enable Ringer)</div>";
            }
            return;
        }

        // Devices that support vibrate and are not iOS
        if (this.state.soundMode === "vibrate") {
            btn.textContent = "Vibrate";
        } else if (this.state.soundMode === "beep") {
            btn.innerHTML =
                "Beep<div style='font-size:0.65rem; opacity:0.8; margin-top:2px; font-weight:400;'>(Enable Ringer)</div>";
        } else {
            btn.textContent = "Silent";
        }
    },

    playSound(type) {
        if (this.state.soundMode === "vibrate") {
            if (this.state.supportsVibrate && navigator.vibrate) {
                if (type === "deep") navigator.vibrate([100]);
                else if (type === "switch") navigator.vibrate([50]);
                else if (type === "double") navigator.vibrate([100, 50, 100]);
                else if (type === "victory")
                    navigator.vibrate([100, 100, 100, 300]);
                else navigator.vibrate([200]);
            }
            return;
        }

        if (this.state.soundMode !== "beep" || !this.state.audioCtx) return;

        const ctx = this.state.audioCtx;
        if (ctx.state === "suspended") ctx.resume();
        const now = ctx.currentTime;

        if (type === "standard") this.playTone(523.25, now, 0.4, 0.5);
        else if (type === "switch") this.playTone(440, now, 0.15, 1.0);
        else if (type === "deep") this.playTone(220, now, 0.3, 1.0);
        else if (type === "double") {
            this.playTone(880, now, 0.1, 0.4);
            this.playTone(880, now + 0.15, 0.1, 0.4);
        } else if (type === "victory") {
            const vol = 0.3;
            const n = 0.12;
            this.playTone(523.25, now, n, vol);
            this.playTone(659.25, now + n, n, vol);
            this.playTone(783.99, now + n * 2, n, vol);
            this.playTone(1046.5, now + n * 3, 0.4, vol);
        }
    },

    playTone(freq, startTime, duration, maxGain = 1.0) {
        const ctx = this.state.audioCtx;
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(maxGain, startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
    },

    // ---------------- WORKOUT FLOW ----------------

    startExercisePreview(exIdx) {
        const day = this.state.currentSplit.days[this.state.currentDayIdx];
        const exercise = day.exercises[exIdx];
        this.state.currentExercise = exercise;
        this.state.currentExerciseIdx = exIdx;
        this.state.currentSet = 1;
        this.state.isPaused = false;
        this.setSpeed("default");

        const repStr = String(exercise.reps).split("-").pop();
        this.state.repsRemaining = parseInt(repStr) || 10;

        document.getElementById("wk-name").innerText = exercise.name;
        this.updateSetDisplay();

        document.getElementById("view-exercises").classList.add("hidden");
        document.getElementById("workout-overlay").classList.remove("hidden");
        document.getElementById("active-workout-view").classList.remove(
            "hidden"
        );
        document.getElementById("done-view").classList.add("hidden");

        this.setPhase("IDLE");
        this.updateTimeEstimate();
    },

    handleMainAction() {
        this.ensureAudio();
        if (this.state.phase === "IDLE") this.startCountdown();
        else if (this.state.phase === "COUNTDOWN") this.skipCountdown();
        else if (this.state.phase === "WORK") this.finishSet();
        else if (this.state.phase === "REST") this.skipRest();
    },

    skipCountdown() {
        this.clearTimers();
        this.startSet();
    },

    setSpeed(mode) {
        this.state.currentTempo = PRESETS[mode];
        document
            .querySelectorAll(".btn-speed")
            .forEach((b) => b.classList.remove("active"));
        const btn = document.getElementById(`btn-${mode}`);
        if (btn) btn.classList.add("active");
        this.updateTimeEstimate();
    },

    toggleExtraReps() {
        this.state.isExtraRepsMode = !this.state.isExtraRepsMode;
        const btn = document.getElementById("btn-extra-reps");
        if (this.state.isExtraRepsMode) btn.classList.add("filled");
        else btn.classList.remove("filled");
    },

    getMotivation() {
        return MOTIVATION[Math.floor(Math.random() * MOTIVATION.length)];
    },

    updateTimeEstimate() {
        const ex = this.state.currentExercise;
        const label = document.getElementById("total-time-left");
        if (!label || !ex) {
            if (label) label.innerText = "Time Remaining: --";
            return;
        }

        const totalSets = ex.sets;
        const currentSet = this.state.currentSet;

        const repStr = String(ex.reps).split("-").pop();
        const targetReps = parseInt(repStr) || 10;
        const tempoTotal = this.state.currentTempo.total;
        const type = ex.type || "isolation";
        const restTimePerSet = CONFIG.rest[type] || CONFIG.rest.default;

        const setsLeftAfterCurrent = Math.max(0, totalSets - currentSet);
        let futureTime = 0;

        if (setsLeftAfterCurrent > 0) {
            futureTime += setsLeftAfterCurrent * targetReps * tempoTotal;
            futureTime += setsLeftAfterCurrent * restTimePerSet;
        }

        let currentPhaseTime = 0;
        if (
            this.state.phase === "WORK" ||
            this.state.phase === "IDLE" ||
            this.state.phase === "COUNTDOWN"
        ) {
            const totalDurationForThisSet = targetReps * tempoTotal;
            let elapsedInSet = 0;
            if (this.state.phase === "WORK" && this.state.pacerStartTime) {
                const now = Date.now();
                const effectiveTime = now - this.state.totalPausedTime;
                elapsedInSet = (effectiveTime - this.state.pacerStartTime) / 1000;
            }
            const timeLeftInSet = Math.max(
                0,
                totalDurationForThisSet - elapsedInSet
            );
            currentPhaseTime += timeLeftInSet;
            if (currentSet < totalSets) currentPhaseTime += restTimePerSet;
        } else if (this.state.phase === "REST") {
            currentPhaseTime = this.state.timerValue;
        }

        const totalSeconds = Math.ceil(futureTime + currentPhaseTime);
        label.innerText = `Time Remaining: ${this.formatDuration(
            totalSeconds
        )}`;
    },

    startCountdown() {
        this.setPhase("COUNTDOWN");
        let count = 3;
        const display = document.getElementById("main-display");
        display.innerText = count;
        display.classList.add("pulse");

        this.state.timerInterval = setInterval(() => {
            count--;
            if (count > 0) display.innerText = count;
            else if (count === 0) {
                display.innerText = "GO!";
                this.playSound("standard");
            } else {
                clearInterval(this.state.timerInterval);
                display.classList.remove("pulse");
                this.startSet();
            }
        }, 1000);
    },

    startSet() {
        this.state.pacerStartTime = Date.now();
        this.state.totalPausedTime = 0;
        this.state.isPaused = false;
        this.state.wasConcentric = false;

        const repStr = String(this.state.currentExercise.reps).split("-").pop();
        this.state.repsRemaining = parseInt(repStr) || 10;

        this.setPhase("WORK");
        this.runWorkLoop();
    },

    finishSet() {
        this.clearTimers();
        this.state.isPaused = false;
        this.playSound("double");

        if (this.state.currentSet >= this.state.currentExercise.sets) {
            this.showDoneScreen();
            return;
        }
        const type = this.state.currentExercise.type || "isolation";
        this.state.timerValue = CONFIG.rest[type] || CONFIG.rest.default;
        this.setPhase("REST");
        this.formatRestTime(this.state.timerValue);
        this.runRestLoop();
    },

    showDoneScreen() {
        this.setPhase("DONE");
        document.getElementById("active-workout-view").classList.add("hidden");
        document.getElementById("done-view").classList.remove("hidden");
        this.playSound("victory");
    },

    completeAndExit() {
        const key = `${this.state.currentSplit.id}|${this.state.currentDayIdx}|${this.state.currentExerciseIdx}`;
        if (!this.state.completed.has(key)) {
            this.state.completed.add(key);
            this.saveProgress();
        }
        this.quitWorkout();
    },

    addExtraSet() {
        this.state.currentExercise.sets++;
        this.updateSetDisplay();
        document.getElementById("active-workout-view").classList.remove("hidden");
        document.getElementById("done-view").classList.add("hidden");
        const type = this.state.currentExercise.type || "isolation";
        this.state.timerValue = CONFIG.rest[type] || CONFIG.rest.default;
        this.setPhase("REST");
        this.runRestLoop();
    },

    skipRest() {
        this.clearTimers();
        this.state.currentSet++;
        this.updateSetDisplay();
        this.startCountdown();
    },

    runWorkLoop() {
        const display = document.getElementById("main-display");
        const label = document.getElementById("main-label");
        const subLabel = document.getElementById("sub-label");
        const bar = document.getElementById("pacer-bar");
        const text = document.getElementById("pacer-text");

        const loop = () => {
            if (this.state.phase !== "WORK") return;
            if (!this.state.isPaused) {
                const tempo = this.state.currentTempo;
                const totalTempo = tempo.total * 1000;
                const eccentric = tempo.eccentric * 1000;
                const now = Date.now();
                const effectiveTime = now - this.state.totalPausedTime;
                const diff =
                    (effectiveTime - this.state.pacerStartTime) % totalTempo;
                const isConcentric = diff >= eccentric;

                if (isConcentric && !this.state.wasConcentric)
                    this.playSound("switch");
                else if (!isConcentric && this.state.wasConcentric)
                    this.playSound("deep");

                this.state.wasConcentric = isConcentric;

                let percentage = 0;
                if (!isConcentric) {
                    percentage = (diff / eccentric) * 100;
                    text.innerText = "RESIST (ECCENTRIC)";
                    bar.style.left = "auto";
                    bar.style.right = "0";
                    bar.style.background = "#fff";
                    bar.style.width = `${percentage}%`;
                } else {
                    const concentricTime = diff - eccentric;
                    const concentricTotal = totalTempo - eccentric;
                    percentage = (concentricTime / concentricTotal) * 100;
                    text.innerText = "CONTRACT (CONCENTRIC)";
                    bar.style.left = "0";
                    bar.style.right = "auto";
                    bar.style.background = "var(--accent-blue)";
                    bar.style.width = `${percentage}%`;
                }

                const totalElapsed = effectiveTime - this.state.pacerStartTime;
                const repsDone = Math.floor(totalElapsed / totalTempo);
                const remaining = this.state.repsRemaining - repsDone;

                if (remaining > 0) {
                    display.innerText = remaining;
                    label.innerText = "REPS LEFT";
                } else {
                    display.innerText = "+" + Math.abs(remaining);
                    label.innerText = "EXTRA REPS";
                }

                subLabel.innerText = `(Total Reps: ${repsDone})`;

                if (remaining <= 0 && !this.state.isExtraRepsMode) {
                    this.finishSet();
                    return;
                }
                this.updateTimeEstimate();
            }
            this.state.animationFrameId = requestAnimationFrame(loop);
        };
        this.state.animationFrameId = requestAnimationFrame(loop);
    },

    runRestLoop() {
        this.formatRestTime(this.state.timerValue);
        this.updateTimeEstimate();
        this.state.timerInterval = setInterval(() => {
            if (this.state.isPaused) return;
            this.state.timerValue--;
            this.formatRestTime(this.state.timerValue);
            this.updateTimeEstimate();
            if (this.state.timerValue <= 0) {
                this.playSound("standard");
                this.skipRest();
            }
        }, 1000);
    },

    formatRestTime(val) {
        const m = Math.floor(val / 60);
        const s = val % 60;
        document.getElementById(
            "main-display"
        ).innerText = `${m}:${s < 10 ? "0" : ""}${s}`;
    },

    setPhase(phase) {
        this.state.phase = phase;
        const btn = document.getElementById("btn-action");
        const label = document.getElementById("main-label");
        const subLabel = document.getElementById("sub-label");
        const pacer = document.getElementById("pacer-wrapper");
        const speedControls = document.getElementById("speed-controls-ui");

        let bgColor = "var(--bg-dark)";

        if (phase === "IDLE") {
            bgColor = "var(--bg-dark)";
            btn.innerText = "START SET";
            label.innerText = "TARGET REPS";
            subLabel.innerText = this.getMotivation();
            pacer.style.opacity = "0.3";
            speedControls.style.opacity = "1";
            speedControls.style.pointerEvents = "auto";
            document.getElementById("main-display").innerText =
                this.state.repsRemaining;
            document.getElementById("pacer-bar").style.width = "0%";
        } else if (phase === "COUNTDOWN") {
            bgColor = "var(--status-rest)";
            btn.innerText = "SKIP COUNTDOWN";
            label.innerText = "STARTING IN...";
            subLabel.innerText = "Focus!";
            pacer.style.opacity = "0.5";
            speedControls.style.opacity = "0.5";
            speedControls.style.pointerEvents = "none";
            document.getElementById("pacer-bar").style.width = "0%";
        } else if (phase === "WORK") {
            bgColor = "var(--status-go)";
            btn.innerText = "FINISH SET";
            label.innerText = "REPS LEFT";
            subLabel.innerText = "(Total Reps: 0)";
            pacer.style.opacity = "1";
            speedControls.style.opacity = "1";
            speedControls.style.pointerEvents = "auto";
        } else if (phase === "REST") {
            bgColor = "var(--status-rest)";
            btn.innerText = "SKIP REST";
            label.innerText = "RECOVERY REST";
            subLabel.innerText = this.getMotivation();
            pacer.style.opacity = "0";
            speedControls.style.opacity = "0";
            speedControls.style.pointerEvents = "none";
        }

        document.body.style.backgroundColor = bgColor;
        this.updateTimeEstimate();
    },

    updateSetDisplay() {
        document.getElementById("wk-set-curr").innerText =
            this.state.currentSet;
        document.getElementById("wk-set-total").innerText =
            this.state.currentExercise.sets;
    },

    togglePause() {
        this.state.isPaused = !this.state.isPaused;
        const btns = document.querySelectorAll(".btn-sec");
        const pauseBtn = btns[1]; // Extra Reps, Pause, Sound
        if (pauseBtn) {
            pauseBtn.innerText = this.state.isPaused ? "Resume" : "Pause";
        }
        if (this.state.isPaused) {
            this.state.lastPauseStart = Date.now();
        } else {
            this.state.totalPausedTime +=
                Date.now() - this.state.lastPauseStart;
        }
    },

    clearTimers() {
        if (this.state.timerInterval) {
            clearInterval(this.state.timerInterval);
            this.state.timerInterval = null;
        }
        if (this.state.animationFrameId) {
            cancelAnimationFrame(this.state.animationFrameId);
            this.state.animationFrameId = null;
        }
        document.getElementById("main-display").classList.remove("pulse");
    },

    quitWorkout() {
        this.clearTimers();
        document.getElementById("workout-overlay").classList.add("hidden");
        document.body.style.backgroundColor = "var(--bg-dark)";
        document.getElementById("view-exercises").classList.remove("hidden");
        this.selectDay(this.state.currentDayIdx);
    },
};

// Init on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    App.init();
});
