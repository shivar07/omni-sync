# ⚡ OmniSync — Devlogs & Project Journal
**Developer:** `shivar07`

---

## 📝 Devlog #1: Building Core Calendar & Event Scheduler
**Time Spent:** ~2.5 Hours

Started working on OmniSync project Today to solve my daily Event tracking problems
Created the initial Vite React application setup with dark Glassmorphic UI design tokens
Implemented custom Calendar component showing monthly Grid views with Day selection
Added event creation Modal where users can enter Event titles start and End times
Stored Events in local State so clicking on any calendar Date shows scheduled Events for that Day
Everything feels super smooth and Responsive for the first 2 hours of Coding

---

## 📝 Devlog #2: Firebase Cloud Sync & Category Filtering
**Time Spent:** ~2.5 Hours

Next Step was making sure all Data syncs everywhere across devices in Realtime
Set up Firebase Google Auth so anyone can Sign in securely with their Google Account
Connected Firebase Realtime Database RTDB to save all Events Tasks Applications and Ideas under user UID
Created color coded Category badges like Workshops Meetings Urgent and Personal Events
Added category Filtering controls above the Calendar so you can filter specific Event types instantly
Now whenever you add an Event on Web it updates live on your Cloud database without reloading

---

## 📝 Devlog #3: Daily Command Planner Section
**Time Spent:** ~1.5 Hours

Now we have Calendar we have Meeting Hub Idea Vault and Application where you know the Links
Added a Daily Planner section to scope all todos by Date so I can plan my morning agenda
Created beautiful custom Date Navigator panel to toggle between Yesterday Today and Tomorrow
Integrated inline editing and neat priority and category Badges for every Task item
Created smart actions to Import unfinished tasks from Yesterday and postpone pending Tasks to Tomorrow
Everything is synced live to Firebase Database scoped under the active User UID and compiles cleanly
Fixed low Contrast select options dropdown coloring in Daily Planner page Form inputs

---

## 📝 Devlog #4: Mobile Companion App & Realtime Push Alerts
**Time Spent:** ~10 Hours

Developed and built a mobile Android APK using Kotlin and Compose
Connected device securely using 6 digit pairing Code and user UID
Setup background foreground polling service to check pending events
Triggers instant phone notification shade alerts for upcoming deadlines
Disconnecting from either phone or Web resets both in Realtime

---



