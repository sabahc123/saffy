# Saffy — Development Log

A running record of Saffy's development progress and next steps.

---

## 17 August 2026 — Day 1

### Completed

- Set up the Saffy development environment.
- Created the Saffy mobile app using:
  - TypeScript
  - React Native
  - Expo
  - Expo Router
- Successfully launched Saffy on a physical iPhone using Expo Go.
- Replaced the default Expo screen with Saffy's Home screen.
- Built the initial Home/Dashboard:
  - "Time to learn!"
  - "Your topics will live here."
  - `+` button
- Created the Create Topic screen.
- Added working navigation:
  - Home → Create Topic
  - Create Topic → Home
- Added a Back button.

### Current App Flow

Home  
↓  
Create Topic  
↓  
Back to Home

### Current Screens

- `index.tsx` — Home
- `create-topic.tsx` — Create Topic

### Next

Build the Create Topic functionality:

1. Add topic name input.
2. Add Create Topic button.
3. Create Add Content screen.
4. Pass the new topic into the Add Content flow.

### Core Build Priority

Home → Create Topic → Add Content → Topic Summary → Recall → Feedback → Results → Test Again

Authentication, Supabase and cloud persistence come after the core learning loop is working.

---git --version