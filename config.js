// config.js
// Global configuration values for the workout app

// Tempo presets: seconds for eccentric, concentric, and total per rep
const PRESETS = {
    slow: { eccentric: 4, concentric: 2, total: 6 },
    default: { eccentric: 3, concentric: 1, total: 4 },
    fast: { eccentric: 2, concentric: 1, total: 3 },
};

// Rest times by exercise type (in seconds)
const CONFIG = {
    rest: {
        compound: 180,
        isolation: 90,
        default: 60,
    },
};

// Short motivation snippets shown in workout view
const MOTIVATION = [
    "Keep pushing",
    "You can do it",
    "Squeeze at the top",
    "LOCK IN",
    "Connect to the muscle",
];
