Workout Tracker
A single-file HTML/JS progressive web app for tracking hypertrophy training. The application runs entirely client-side and uses LocalStorage for data persistence.

Demo: https://gustavochanchien.github.io/workout-concept/

Overview
Visual Pacer: animated bar to track eccentric vs. concentric tempo.

Variable Rest Timers: automatically sets rest duration based on exercise type (compound vs. isolation).

Offline Capable: zero dependencies; runs locally in any browser.

State Management: tracks active sets and session completion without an external database.

Configuration References
The default constants in index.html (CONFIG and PRESETS) are derived from the following literature regarding hypertrophy and mechanical tension.

1. Rest Intervals
Configuration: Compound movements default to 180s; Isolation movements default to 90s.

Source: Schoenfeld, B. J., et al. (2016). Longer Interset Rest Periods Enhance Muscle Strength and Hypertrophy in Resistance-Trained Men. Journal of Strength and Conditioning Research.

Summary: The study indicates that 3-minute rest intervals result in significantly greater muscle thickness and strength gains compared to 1-minute intervals. This is attributed to fuller ATP-PC replenishment, allowing for higher volume loads (reps × weight) in subsequent sets.

2. Repetition Tempo
Configuration: Default visualizer is set to a 3-0-1-0 tempo (3s eccentric, 1s concentric).

Source: Schoenfeld, B. J., Ogborn, D. I., & Krieger, J. W. (2015). Effect of repetition duration during resistance training on muscle hypertrophy: a systematic review and meta-analysis. Sports Medicine.

Summary: While specific duration (0.5s to 8s) has a negligible impact on hypertrophy if failure is reached, a controlled eccentric phase is necessary to maintain tension and standardize lifting form. The 3-second descent enforces control rather than relying on gravity.

3. Volume Guidelines
Configuration: Default splits target ~10-15 sets per muscle group per week.

Source: Schoenfeld, B. J., Ogborn, D., & Krieger, J. W. (2017). Dose-response relationship between weekly resistance training volume and increases in muscle mass. Journal of Sports Sciences.

Summary: A dose-response relationship exists where 10+ weekly sets per muscle group yield superior hypertrophy compared to lower volume (<5 sets) protocols.

Usage
Local Development No build step is required.

Download index.html.

Open in Chrome/Safari.

Deployment

Push index.html to a GitHub repository.

Enable GitHub Pages in Repository Settings > Pages.

Select the main branch as the source.

Customization
To modify the split or exercises, edit the WORKOUT_DATA array within the <script> tag in index.html.

License
MIT