/* ============================================================
           TAB NAVIGATION
        ============================================================ */
        function switchTab(tab, clickedBtn) {
            document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');
            if (clickedBtn) clickedBtn.classList.add('active');

            if (tab === 'tracker') {
                setTimeout(() => {
                    tracker.renderSleepChart();
                }, 50);
            }
        }

        /* ============================================================
           THEME TOGGLE
        ============================================================ */
        document.getElementById('theme-toggle').onclick = () => {
            document.body.classList.toggle('light-mode');
            document.getElementById('theme-toggle').textContent =
                document.body.classList.contains('light-mode') ? 'Dark' : 'Light';
        };

        /* ============================================================
           APP - PLAN GENERATION
        ============================================================ */
        const app = {
            state: {
                currentMeals: [],
                currentExercises: [],
                generated: false,
                weight: 0,
                height: 0,
                goal: ''
            },

            data: {
                nutrition: {
                    lose: {
                        title: "Fat Loss Plan - High Protein, Controlled Carbs",
                        meals: [
                            "Meal 1 (Breakfast): Greek yogurt bowl + oats + berries + chia seeds",
                            "Meal 2 (Lunch): Grilled chicken breast + quinoa + mixed green salad",
                            "Meal 3 (Pre-workout): Banana + whey protein shake in water",
                            "Meal 4 (Dinner): Baked salmon + steamed vegetables + small sweet potato",
                            "Meal 5 (Evening snack): Cottage cheese or skyr + cucumber slices"
                        ]
                    },
                    gain: {
                        title: "Muscle Gain Plan - Lean Bulk Performance",
                        meals: [
                            "Meal 1 (Breakfast): Oats cooked in milk + banana + peanut butter + 3 eggs",
                            "Meal 2 (Lunch): Lean beef or turkey + jasmine rice + avocado salad",
                            "Meal 3 (Pre-workout): Rice cakes + honey + whey isolate",
                            "Meal 4 (Post-workout): Chicken thigh or tuna pasta + olive oil drizzle",
                            "Meal 5 (Evening snack): Greek yogurt + mixed nuts + dark chocolate square"
                        ]
                    },
                    health: {
                        title: "Balanced Health Plan - Mediterranean International",
                        meals: [
                            "Meal 1 (Breakfast): Whole-grain toast + avocado + poached eggs + fruit",
                            "Meal 2 (Lunch): Mediterranean bowl with chickpeas, feta, olives, and vegetables",
                            "Meal 3 (Snack): Apple + almonds + plain yogurt",
                            "Meal 4 (Dinner): Grilled white fish or tofu + brown rice + roasted vegetables",
                            "Meal 5 (Optional): Herbal tea + protein pudding or kefir"
                        ]
                    }
                },
                exercises: [
                    { name: "Bodyweight Squats", sets: 3, note: "Keep back straight, knees over toes" },
                    { name: "Push-ups", sets: 3, note: "Chest to floor, elbows at 45 deg" },
                    { name: "Lunges", sets: 3, note: "10 reps per leg, controlled descent" },
                    { name: "Plank Hold", sets: 3, note: "Hold as long as possible, core tight" },
                    { name: "Glute Bridges", sets: 3, note: "Squeeze glutes hard at the top" }
                ]
            },

            init: () => {
                document.getElementById('chat-input').addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') chatbot.send();
                });
            },

            transitionTo: (id) => {
                ['hero-section', 'input-section', 'dashboard-section'].forEach(s => {
                    const el = document.getElementById(s);
                    if (el) el.classList.add('hidden');
                });
                document.getElementById(id).classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },

            generatePlan: () => {
                const w = parseFloat(document.getElementById('weight').value);
                const h = parseFloat(document.getElementById('height').value);
                const g = document.getElementById('goal').value;

                if (!w || !h) return alert("Please enter valid weight and height!");

                app.state.weight = w;
                app.state.height = h;
                app.state.goal = g;

                // BMI
                const bmi = (w / ((h / 100) ** 2)).toFixed(1);
                document.getElementById('bmi-val').innerText = bmi;

                let pos = 50, status = "Healthy Weight";
                const alertBox = document.getElementById('health-alert');
                alertBox.classList.add('hidden');

                if (bmi < 18.5) {
                    pos = 8; status = "Underweight";
                    alertBox.classList.remove('hidden');
                    alertBox.innerHTML = "<strong>Note:</strong> Focus on calorie surplus and strength training.";
                } else if (bmi >= 18.5 && bmi <= 24.9) {
                    pos = 35; status = "Healthy Weight";
                } else if (bmi >= 25 && bmi < 30) {
                    pos = 72; status = "Overweight";
                } else if (bmi >= 30) {
                    pos = 93; status = "Obese";
                    alertBox.classList.remove('hidden');
                    alertBox.innerHTML = "<strong>Important:</strong> Please consult a doctor before intense exercise.";
                }

                document.getElementById('bmi-status').innerText = status;
                document.getElementById('bmi-marker').style.left = pos + "%";

                // Nutrition
                app.state.currentMeals = [...app.data.nutrition[g].meals];
                app.renderMeals(app.state.currentMeals);
                document.getElementById('macro-info').innerText = app.data.nutrition[g].title;

                // Workouts
                app.state.currentExercises = app.data.exercises.map(e => ({ ...e }));
                const reps = g === 'lose' ? "15-20" : (g === 'gain' ? "8-12" : "12-15");
                const rest = g === 'lose' ? "30s rest" : "60s rest";
                document.getElementById('workout-summary').innerText =
                    `Goal: ${g.toUpperCase()} | Frequency: 3 Days/Week | ${rest}`;
                app.renderWorkouts(app.state.currentExercises, reps);

                app.state.generated = true;
                app.transitionTo('dashboard-section');

                chatbot.addMsg("Your personalized plan is ready. Tell me what you'd like to change.", 'system');
            },

            renderMeals: (mealArray) => {
                document.getElementById('meal-list').innerHTML = mealArray.map((m, i) => `
                    <li>
                        <span>${m}</span>
                        <button class="remove-btn" onclick="app.removeMeal(${i})">Remove</button>
                    </li>
                `).join('');
            },

            renderWorkouts: (exerciseArray, reps) => {
                document.getElementById('workout-rows').innerHTML = exerciseArray.map((ex, i) => `
                    <tr>
                        <td>
                            <span class="exercise-name">${ex.name}</span>
                            <span class="exercise-note">${ex.note}</span>
                        </td>
                        <td>${ex.sets}</td>
                        <td>${reps}</td>
                        <td><button class="remove-btn" onclick="app.removeExercise(${i})">Remove</button></td>
                    </tr>
                `).join('');
            },

            removeMeal: (index) => {
                if (app.state.currentMeals.length <= 2) {
                    alert("You need at least 2 meals!");
                    return;
                }
                const removed = app.state.currentMeals.splice(index, 1)[0];
                app.renderMeals(app.state.currentMeals);
                app.showUpdateMessage(`Removed: ${removed.split(':')[0]}`);
                chatbot.addMsg(`I removed "${removed.split(':')[0]}" from your meal plan.`, 'bot');
            },

            removeExercise: (index) => {
                if (app.state.currentExercises.length <= 2) {
                    alert("You need at least 2 exercises!");
                    return;
                }
                const removed = app.state.currentExercises.splice(index, 1)[0].name;
                const reps = app.state.goal === 'lose' ? "15-20" : (app.state.goal === 'gain' ? "8-12" : "12-15");
                app.renderWorkouts(app.state.currentExercises, reps);
                app.showUpdateMessage(`Removed: ${removed}`);
                chatbot.addMsg(`I removed "${removed}" from your workout.`, 'bot');
            },

            showUpdateMessage: (text) => {
                const msg = document.getElementById('ai-update-msg');
                document.getElementById('update-text').innerText = text;
                msg.classList.remove('hidden');
                setTimeout(() => msg.classList.add('hidden'), 4000);
            }
        };

        /* ============================================================
           CHATBOT - Uses Anthropic API (claude-sonnet-4-20250514)
        ============================================================ */
        const chatbot = {
            localCoachReply: (userText) => {
                const t = userText.toLowerCase();

                if (t.includes('remove') || t.includes('no ')) {
                    const mealKeywords = ['fish', 'tuna', 'egg', 'soup', 'yogurt', 'almond', 'chicken', 'turkey', 'couscous'];
                    const exKeywords = ['push', 'squat', 'lunge', 'plank', 'bridge'];

                    for (const k of mealKeywords) {
                        if (t.includes(k)) return `REMOVE_MEAL: ${k}`;
                    }
                    for (const k of exKeywords) {
                        if (t.includes(k)) return `REMOVE_EXERCISE: ${k}`;
                    }
                }

                if (t.includes('easier') || t.includes('beginner')) {
                    return [
                        'COACH_TALK: Great call. I made your routine easier so you can stay consistent and avoid burnout.',
                        'ADD_EXERCISES: Incline Push-ups | 3 | Use a wall or table to reduce load',
                        'ADD_EXERCISES: March in Place | 3 | Keep a steady pace for 45-60 seconds'
                    ].join('\n');
                }

                if (t.includes('protein') || t.includes('meal') || t.includes('food')) {
                    return [
                        'COACH_TALK: Nice focus. Here are two simple high-protein options you can rotate this week.',
                        'ADD_MEALS: Snack: Greek yogurt + dates + crushed nuts | Dinner: Grilled chicken escalope + lentil salad'
                    ].join('\n');
                }

                return 'COACH_TALK: I can help you remove meals/exercises, make workouts easier, or add protein meals. Try: "Remove push-ups" or "Add more protein meals".';
            },

            toggle: () => {
                document.getElementById('chat-window').classList.toggle('hidden');
            },

            addMsg: (text, type) => {
                const div = document.createElement('div');
                div.className = `msg ${type}`;
                div.innerHTML = text;
                const container = document.getElementById('chat-messages');
                container.appendChild(div);
                container.scrollTop = container.scrollHeight;
                return div;
            },

            showTyping: () => {
                const div = document.createElement('div');
                div.className = 'typing-indicator';
                div.innerHTML = '<span></span><span></span><span></span>';
                div.id = 'typing-indicator';
                const container = document.getElementById('chat-messages');
                container.appendChild(div);
                container.scrollTop = container.scrollHeight;
            },

            hideTyping: () => {
                const el = document.getElementById('typing-indicator');
                if (el) el.remove();
            },

            quickSend: (text) => {
                document.getElementById('chat-input').value = text;
                chatbot.send();
            },

            send: async () => {
                const input = document.getElementById('chat-input');
                const userText = input.value.trim();
                const chatEndpoint = (window.SMARTFIT_CHAT_ENDPOINT || 'http://localhost:3000/api/chat').trim();

                if (!app.state.generated) {
                    chatbot.addMsg("Please generate your initial plan first!", 'bot');
                    return;
                }
                if (!userText) return;

                chatbot.addMsg(userText, 'user');
                input.value = '';
                chatbot.showTyping();

                try {
                    const systemPrompt = `You are a supportive Tunisian Fitness Coach AI. Help users modify their fitness plan.

IMPORTANT RULES - follow these exactly:
1. If user wants to REMOVE something, respond ONLY with one of these exact formats:
   REMOVE_MEAL: [keyword from meal name]
   REMOVE_EXERCISE: [keyword from exercise name]

2. If user wants to ADD or SWAP, use this format:
   COACH_TALK: [Your friendly 1-2 sentence response]
   ADD_MEALS: [meal description] | [meal description]
   ADD_EXERCISES: [Exercise Name] | [sets as number] | [short tip]

3. Always be encouraging and specific to Tunisian foods and home workouts.
4. Keep responses concise and actionable.

Current user plan:
- Goal: ${app.state.goal}
- Weight: ${app.state.weight}kg
- Current Meals: ${app.state.currentMeals.join(' | ')}
- Current Exercises: ${app.state.currentExercises.map(e => e.name).join(', ')}`;

                    const response = await fetch(chatEndpoint, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            userText,
                            systemPrompt,
                            context: {
                                goal: app.state.goal,
                                weight: app.state.weight,
                                height: app.state.height,
                                meals: app.state.currentMeals,
                                exercises: app.state.currentExercises.map(e => e.name)
                            }
                        })
                    });

                    chatbot.hideTyping();

                    if (!response.ok) {
                        const err = await response.json().catch(() => ({}));
                        throw new Error(err?.error || `HTTP ${response.status}`);
                    }

                    const data = await response.json();
                    const aiReply = data?.reply || '';

                    if (!aiReply) throw new Error('Empty response from AI');

                    chatbot.processAIResponse(aiReply);

                } catch (error) {
                    chatbot.hideTyping();
                    chatbot.addMsg("Backend unavailable. Switching to local coach mode.", 'system');
                    const localReply = chatbot.localCoachReply(userText);
                    chatbot.processAIResponse(localReply);
                    console.error('Chat error:', error);
                }
            },

            processAIResponse: (aiReply) => {
                // Handle REMOVE commands
                if (aiReply.includes("REMOVE_MEAL:")) {
                    const keyword = aiReply.split("REMOVE_MEAL:")[1].split("\n")[0].trim().toLowerCase();
                    const index = app.state.currentMeals.findIndex(m => m.toLowerCase().includes(keyword));
                    if (index !== -1) {
                        app.removeMeal(index);
                    } else {
                        chatbot.addMsg(`I couldn't find "${keyword}" in your meal list. Try being more specific.`, 'bot');
                    }
                    return;
                }

                if (aiReply.includes("REMOVE_EXERCISE:")) {
                    const keyword = aiReply.split("REMOVE_EXERCISE:")[1].split("\n")[0].trim().toLowerCase();
                    const index = app.state.currentExercises.findIndex(e => e.name.toLowerCase().includes(keyword));
                    if (index !== -1) {
                        app.removeExercise(index);
                    } else {
                        chatbot.addMsg(`I couldn't find "${keyword}" in your workout. Try being more specific.`, 'bot');
                    }
                    return;
                }

                // Handle COACH_TALK / ADD commands
                let coachMsg = aiReply;
                if (aiReply.includes("COACH_TALK:")) {
                    coachMsg = aiReply.split("COACH_TALK:")[1].split(/ADD_MEALS:|ADD_EXERCISES:/)[0].trim();
                }
                if (coachMsg) chatbot.addMsg(coachMsg, 'bot');

                if (aiReply.includes("ADD_MEALS:")) {
                    const mealsSection = aiReply.split("ADD_MEALS:")[1].split(/ADD_EXERCISES:|$/)[0].trim();
                    const newMeals = mealsSection.split("|").map(m => m.trim()).filter(Boolean);
                    newMeals.forEach(meal => {
                        if (!app.state.currentMeals.includes(meal)) app.state.currentMeals.push(meal);
                    });
                    app.renderMeals(app.state.currentMeals);
                    app.showUpdateMessage("Meals updated with AI suggestions!");
                }

                if (aiReply.includes("ADD_EXERCISES:")) {
                    const exSection = aiReply.split("ADD_EXERCISES:")[1].trim();
                    exSection.split("\n").forEach(line => {
                        const parts = line.replace(/^[-*]\s*/, '').split("|").map(p => p.trim());
                        if (parts.length >= 2) {
                            app.state.currentExercises.push({
                                name: parts[0],
                                sets: parseInt(parts[1]) || 3,
                                note: parts[2] || "Focus on form"
                            });
                        }
                    });
                    const reps = app.state.goal === 'lose' ? "15-20" : (app.state.goal === 'gain' ? "8-12" : "12-15");
                    app.renderWorkouts(app.state.currentExercises, reps);
                    app.showUpdateMessage("Exercises updated with AI suggestions!");
                }

                // If no structured commands, just show the plain response
                if (!aiReply.includes("COACH_TALK:") && !aiReply.includes("REMOVE_") && !aiReply.includes("ADD_")) {
                    chatbot.addMsg(aiReply, 'bot');
                }
            }
        };

        /* ============================================================
           TRACKER - 30-Day Habit, Sleep & Mood Tracker
        ============================================================ */
        const tracker = {
            currentDay: Math.min(new Date().getDate(), 30),

            habits: [
                { id: 'gym',         name: 'Gym',             points: 2 },
                { id: 'water',       name: 'Drink Water',     points: 1 },
                { id: 'clean-eat',   name: 'Clean Eating',    points: 1 },
                { id: 'protein',     name: 'Protein Goal',    points: 1 },
                { id: 'meditation',  name: 'Meditation',      points: 1 },
                { id: 'no-junk',     name: 'No Junk Food',    points: 1 },
                { id: 'screen',      name: 'Screen <2h',      points: 1 },
                { id: 'journal',     name: 'Journaling',      points: 1 }
            ],

            data: { habits: {}, sleep: {}, mood: {}, points: {} },

            init: () => {
                const saved = localStorage.getItem('smartfit-tracker-v2');
                if (saved) {
                    try {
                        const parsed = JSON.parse(saved);
                        // Sanitize: ensure all top-level keys exist and mood values are valid strings
                        tracker.data.habits = parsed.habits || {};
                        tracker.data.sleep  = parsed.sleep  || {};
                        tracker.data.points = parsed.points || {};
                        tracker.data.mood   = {};
                        const validMoods = ['Happy','Neutral','Sad','Motivated','Tired','Sick'];
                        Object.entries(parsed.mood || {}).forEach(([k, v]) => {
                            if (validMoods.includes(v)) tracker.data.mood[k] = v;
                        });
                    } catch(e) { console.warn('Tracker data corrupted, resetting.', e); }
                }
                tracker.currentDay = Math.min(new Date().getDate(), 30);

                // Strip any habit/sleep data saved for future days (stale from a previous session)
for (let d = tracker.currentDay + 1; d <= 30; d++) {
    delete tracker.data.sleep[d];
    tracker.habits.forEach(h => delete tracker.data.habits[`${h.id}-${d}`]);
    
    // FIX: Clear stale points and moods so they don't corrupt the total
    delete tracker.data.points[d];
    delete tracker.data.mood[d];
}

                tracker.buildHabitsTable();
                tracker.buildMoodTracker();
                // Sleep chart deferred — renders correctly when tracker tab is first opened
                tracker.updateStats();

                // Restore sleep input
                const todaySleep = tracker.data.sleep[tracker.currentDay] || 0;
                document.getElementById('sleep-input').value = todaySleep;
            },

            buildHabitsTable: () => {
                const table = document.getElementById('habits-table');
                const tbody = document.getElementById('habits-body');

                // Header
                let headerHTML = '<tr><th>Habits</th>';
                for (let d = 1; d <= 30; d++) {
                    const isToday = d === tracker.currentDay;
                    headerHTML += `<th style="${isToday ? 'color:var(--primary);' : ''}">${d}</th>`;
                }
                headerHTML += '<th>Total</th></tr>';
                table.querySelector('thead').innerHTML = headerHTML;

                // Rows
                let bodyHTML = '';
                tracker.habits.forEach(habit => {
                    bodyHTML += `<tr><td title="${habit.points} pts/day">${habit.name}</td>`;
                    for (let d = 1; d <= 30; d++) {
                        const key = `${habit.id}-${d}`;
                        const isFuture = d > tracker.currentDay;
                        // Never show a future day as checked — delete stale data if found
                        if (isFuture && tracker.data.habits[key]) {
                            delete tracker.data.habits[key];
                        }
                        const checked = (!isFuture && tracker.data.habits[key]) ? 'checked' : '';
                        const disabled = isFuture ? 'disabled' : '';
                        bodyHTML += `<td>
                            <input type="checkbox" class="habit-checkbox" id="${key}"
                                ${checked} ${disabled}
                                onchange="tracker.toggleHabit('${habit.id}', ${d})">
                        </td>`;
                    }
                    const total = tracker.getHabitTotal(habit.id);
                    bodyHTML += `<td><strong>${total}</strong></td></tr>`;
                });

                // Points row
                bodyHTML += '<tr class="total-row"><td>Points</td>';
                for (let d = 1; d <= 30; d++) {
                    bodyHTML += `<td id="points-${d}">${tracker.data.points[d] || 0}</td>`;
                }
                const totalPts = Object.values(tracker.data.points).reduce((a, b) => a + b, 0);
                bodyHTML += `<td><strong>${totalPts}</strong></td></tr>`;

                tbody.innerHTML = bodyHTML;
            },

            toggleHabit: (habitId, day) => {
                if (day > tracker.currentDay) return; // safety: never allow future day edits
                const key = `${habitId}-${day}`;
                const checkbox = document.getElementById(key);
                if (checkbox.checked) {
                    tracker.data.habits[key] = true;
                } else {
                    delete tracker.data.habits[key];
                }

                let dayPoints = 0;
                tracker.habits.forEach(h => {
                    if (tracker.data.habits[`${h.id}-${day}`]) dayPoints += h.points;
                });
                tracker.data.points[day] = dayPoints;

                tracker.save();
                tracker.updateStats();
                // Update total column for that row
                tracker.buildHabitsTable();
            },

            getHabitTotal: (habitId) => {
                let total = 0;
                for (let d = 1; d <= 30; d++) {
                    if (tracker.data.habits[`${habitId}-${d}`]) total++;
                }
                return total;
            },

            updateSleep: () => {
                const hours = parseInt(document.getElementById('sleep-input').value);
                tracker.data.sleep[tracker.currentDay] = hours;
                tracker.save();
                tracker.renderSleepChart();
                tracker.updateStats();
            },

            renderSleepChart: () => {
                const plot = document.getElementById('sleep-plot');
                if (!plot) return;
                plot.innerHTML = '';

                const maxHours = 10;
                const chartWidth = plot.offsetWidth || 300;
                const chartHeight = plot.offsetHeight || 160;
                const dayWidth = chartWidth / 30;

                let prevX = null, prevY = null;

                for (let d = 1; d <= tracker.currentDay; d++) {
                    const hours = tracker.data.sleep[d] || 0;
                    if (hours > 0) {
                        const x = (d - 1) * dayWidth + dayWidth / 2;
                        const y = chartHeight - (hours / maxHours) * chartHeight;

                        if (prevX !== null) {
                            const dx = x - prevX;
                            const dy = y - prevY;
                            const length = Math.sqrt(dx * dx + dy * dy);
                            const angle = Math.atan2(dy, dx) * 180 / Math.PI;

                            const line = document.createElement('div');
                            line.className = 'sleep-line';
                            line.style.left = prevX + 'px';
                            line.style.top = prevY + 'px';
                            line.style.width = length + 'px';
                            line.style.transform = `rotate(${angle}deg)`;
                            plot.appendChild(line);
                        }

                        const point = document.createElement('div');
                        point.className = 'sleep-point';
                        point.style.left = x + 'px';
                        point.style.top = y + 'px';
                        point.title = `Day ${d}: ${hours} hours`;
                        plot.appendChild(point);

                        prevX = x;
                        prevY = y;
                    }
                }
            },

            buildMoodTracker: () => {
                const container = document.getElementById('mood-tracker');
                container.innerHTML = '';
                for (let d = 1; d <= 30; d++) {
                    const mood = tracker.data.mood[d] || '';
                    const isToday = d === tracker.currentDay;
                    const isFuture = d > tracker.currentDay;

                    const div = document.createElement('div');
                    div.className = 'mood-day' +
                        (mood ? ' has-mood' : '') +
                        (isToday ? ' today' : '') +
                        (isFuture ? ' future' : '');
                    div.textContent = mood || d;
                    div.title = mood ? `Day ${d}: ${mood}` : `Day ${d}`;
                    container.appendChild(div);
                }
            },

            setMood: (emoji) => {
                tracker.data.mood[tracker.currentDay] = emoji;
                tracker.save();
                tracker.buildMoodTracker();

                // Highlight active mood option
                document.querySelectorAll('.mood-option').forEach(el => {
                    el.classList.toggle('active', el.textContent.startsWith(emoji));
                });
            },

            updateStats: () => {
                // Streak
                let streak = 0;
                for (let d = tracker.currentDay; d >= 1; d--) {
                    let hasAny = tracker.habits.some(h => tracker.data.habits[`${h.id}-${d}`]);
                    if (hasAny) streak++;
                    else break;
                }
                document.getElementById('total-streak').textContent = streak;

                // Gym count
                let gymCount = 0;
                for (let d = 1; d <= 30; d++) {
                    if (tracker.data.habits[`gym-${d}`]) gymCount++;
                }
                document.getElementById('gym-count').textContent = gymCount;

                // Avg sleep
                const sleepVals = Object.values(tracker.data.sleep).filter(h => h > 0);
                const avgSleep = sleepVals.length > 0
                    ? (sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1)
                    : 0;
                document.getElementById('avg-sleep').textContent = avgSleep;

                // Total points
                const totalPts = Object.values(tracker.data.points).reduce((a, b) => a + b, 0);
                document.getElementById('total-points').textContent = totalPts;
            },

            resetMonth: () => {
                if (confirm('Start a new month? This will clear all current tracker data.')) {
                    tracker.data = { habits: {}, sleep: {}, mood: {}, points: {} };
                    tracker.save();
                    tracker.init();
                }
            },

            save: () => {
                localStorage.setItem('smartfit-tracker-v2', JSON.stringify(tracker.data));
            }
        };

        /* ============================================================
           INIT
        ============================================================ */
        app.init();
        tracker.init();

        // Re-render sleep chart when tab becomes visible (handles zero-width issue)
        window.addEventListener('resize', () => tracker.renderSleepChart());