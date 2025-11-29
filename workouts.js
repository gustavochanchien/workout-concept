// workouts.js
// Defines SPLIT_LIBRARY used by index.html

const SPLIT_LIBRARY = [
    {
        id: "split_ppl_classic",
        name: "Planet Fitness PPL",
        description: "5 Day Push, Pull, Legs Hybrid",
        days: [
            {
                id: "d1",
                name: "Day 1 - Push",
                exercises: [
                    { name: "Smith Machine Bench Press", sets: 4, reps: "6-8", type: "compound" },
                    { name: "Incline Dumbbell Press", sets: 4, reps: "8-10", type: "compound" },
                    { name: "Chest Press Machine", sets: 3, reps: "10-12", type: "isolation" },
                    { name: "Seated DB Shoulder Press", sets: 4, reps: "6-10", type: "compound" },
                    { name: "Lateral Raises", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Rear Delt Machine", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Cable Tricep Pushdown", sets: 3, reps: "10-12", type: "isolation" },
                    { name: "Overhead Rope Extension", sets: 3, reps: "12-15", type: "isolation" }
                ]
            },
            {
                id: "d2",
                name: "Day 2 - Pull",
                exercises: [
                    { name: "Lat Pulldown (Wide Grip)", sets: 4, reps: "8-12", type: "compound" },
                    { name: "Machine Pulldown (Neutral)", sets: 3, reps: "10-12", type: "isolation" },
                    { name: "Seated Cable Row", sets: 4, reps: "8-12", type: "compound" },
                    { name: "Row Machine", sets: 3, reps: "10-12", type: "isolation" },
                    { name: "One-Arm Dumbbell Row", sets: 3, reps: "8-12", type: "isolation" },
                    { name: "Face Pulls", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Reverse Pec Deck", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Cable Curl", sets: 3, reps: "10-12", type: "isolation" },
                    { name: "Dumbbell Curls", sets: 3, reps: "8-12", type: "isolation" }
                ]
            },
            {
                id: "d3",
                name: "Day 3 - Legs",
                exercises: [
                    { name: "Smith Machine Squat", sets: 4, reps: "6-10", type: "compound" },
                    { name: "Leg Press (Deep Stance)", sets: 4, reps: "10-15", type: "compound" },
                    { name: "Leg Extension Machine", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Romanian Deadlift (RDL)", sets: 4, reps: "8-10", type: "compound" },
                    { name: "Seated Leg Curl", sets: 3, reps: "10-12", type: "isolation" },
                    { name: "Leg Press Calf Raise", sets: 4, reps: "12-15", type: "isolation" },
                    { name: "Cable Crunch", sets: 3, reps: "12-15", type: "isolation" }
                ]
            },
            {
                id: "d4",
                name: "Day 4 - Hybrid",
                exercises: [
                    { name: "Assisted Dips", sets: 3, reps: "6-10", type: "compound" },
                    { name: "Cable Fly", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Assisted Pull-Ups", sets: 3, reps: "6-12", type: "compound" },
                    { name: "Single-Arm Row", sets: 3, reps: "10-12", type: "isolation" },
                    { name: "Arnold Press (DB)", sets: 3, reps: "8-12", type: "compound" },
                    { name: "Cable Lateral Raise", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Cable Curl", sets: 3, reps: "10-12", type: "isolation" }
                ]
            },
            {
                id: "d5",
                name: "Day 5 - Arms (Opt)",
                exercises: [
                    { name: "Lateral Raise Dropset", sets: 4, reps: "15", type: "isolation" },
                    { name: "Reverse Pec Deck", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Machine Dip", sets: 3, reps: "8-12", type: "isolation" },
                    { name: "Rope Extension", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Preacher Curl", sets: 3, reps: "10-12", type: "isolation" },
                    { name: "Hammer Curls", sets: 3, reps: "10-12", type: "isolation" }
                ]
            }
        ]
    },
    // KB + Bodyweight Superhero split
    {
        id: "split_kb_bodyweight_superhero",
        name: "KB + Bodyweight",
        description: "4–5 day kettlebell & calisthenics split",
        days: [
            // Day 1 — Push (Chest, Shoulders, Triceps)
            {
                id: "kb_d1",
                name: "Day 1 - Push (Chest/Shoulders/Triceps)",
                exercises: [
                    { name: "Push-Ups", sets: 4, reps: "12-20", type: "compound" },
                    { name: "KB Floor Chest Press", sets: 3, reps: "10-15", type: "compound" },
                    { name: "KB Squeeze Press (Floor)", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Pike Push-Ups", sets: 3, reps: "8-12", type: "compound" },
                    { name: "KB Single-Arm Shoulder Press", sets: 3, reps: "8-12", type: "compound" },
                    { name: "KB Front-Loaded Lateral Raise", sets: 2, reps: "15-20", type: "isolation" },
                    { name: "Diamond Push-Ups", sets: 3, reps: "10-15", type: "isolation" },
                    { name: "KB Overhead Tricep Extension", sets: 3, reps: "12-15", type: "isolation" }
                ]
            },

            // Day 2 — Pull (Back, Rear Delts, Biceps)
            {
                id: "kb_d2",
                name: "Day 2 - Pull (Back/Rear Delts/Biceps)",
                exercises: [
                    { name: "KB Bent-Over Row (Single-Arm)", sets: 4, reps: "10-15", type: "compound" },
                    { name: "KB Gorilla Row", sets: 3, reps: "8-12", type: "compound" },
                    { name: "KB Deadlift", sets: 3, reps: "10-15", type: "compound" },
                    { name: "Reverse Snow Angels", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Prone Y-T Raises", sets: 3, reps: "10-15", type: "isolation" },
                    { name: "KB Curl (Hammer or Standard)", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "Isometric Chin Curl (Towel Under Foot)", sets: 2, reps: "20-30s", type: "isolation" },
                    { name: "KB Suitcase Hold", sets: 3, reps: "30s", type: "isolation" }
                ]
            },

            // Day 3 — Legs + Glutes
            {
                id: "kb_d3",
                name: "Day 3 - Legs + Glutes",
                exercises: [
                    { name: "Bulgarian Split Squat", sets: 4, reps: "8-12", type: "compound" },
                    { name: "KB Goblet Squat", sets: 3, reps: "10-15", type: "compound" },
                    { name: "Single-Leg Romanian Deadlift (RDL)", sets: 4, reps: "8-12", type: "compound" },
                    { name: "KB Hip Thrust", sets: 3, reps: "12-15", type: "compound" },
                    { name: "Single-Leg Calf Raises", sets: 3, reps: "15-20", type: "isolation" },
                    { name: "KB Calf Raise Hold (Heels Elevated)", sets: 2, reps: "30-45s", type: "isolation" },
                    { name: "KB Dead Bug", sets: 3, reps: "12", type: "isolation" }
                ]
            },

            // Day 4 — Upper Hypertrophy
            {
                id: "kb_d4",
                name: "Day 4 - Upper Hypertrophy",
                exercises: [
                    // Chest
                    { name: "KB Alternating Floor Press", sets: 3, reps: "10-12", type: "compound" },
                    { name: "Push-Up Ladder (1→10→1)", sets: 1, reps: "Ladder", type: "compound" },

                    // Back / Lats
                    { name: "KB Row (Elbow Tucked)", sets: 4, reps: "10-12", type: "compound" },
                    { name: "KB Pullover from Floor", sets: 3, reps: "12-15", type: "isolation" },

                    // Shoulders
                    { name: "Handstand Lean (Against Wall)", sets: 3, reps: "20-30s", type: "isolation" },
                    { name: "KB Arnold Press", sets: 3, reps: "10-12", type: "compound" },

                    // Arms
                    { name: "KB Bicep Curl", sets: 3, reps: "12-15", type: "isolation" },
                    { name: "KB Close-Grip Floor Press", sets: 3, reps: "10-12", type: "isolation" }
                ]
            },

            // Day 5 — Conditioning & Core (Optional)
            {
                id: "kb_d5",
                name: "Day 5 - Conditioning & Core (Optional)",
                exercises: [
                    // 4-round circuit; model as 4 sets each
                    { name: "KB Swings (Circuit)", sets: 4, reps: "20", type: "compound" },
                    { name: "Push-Ups (Circuit)", sets: 4, reps: "15", type: "compound" },
                    { name: "KB Goblet Squat (Circuit)", sets: 4, reps: "15", type: "compound" },
                    { name: "Mountain Climbers (Circuit)", sets: 4, reps: "30s", type: "isolation" },
                    { name: "V-Ups (Circuit)", sets: 4, reps: "12-15", type: "isolation" }
                ]
            }
        ]
    }
];
