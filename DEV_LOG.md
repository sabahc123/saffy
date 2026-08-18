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

## 18 August 2026 — Day 2

### Completed

- Built Create Topic functionality.
- Added topic name input.
- Created Add Content screen.
- Added Question and Answer inputs.
- Added multiple prompt entry.
- Cursor now returns to the Question field after adding a prompt.
- Disabled autocorrect and automatic capitalisation for learning inputs.
- Added numbered prompt list.
- Added scrollable prompt list.
- Added minimum requirement of 10 prompts before Done is enabled.
- Added local prompt persistence using AsyncStorage.
- Added edit functionality:
  - Edit loads an existing prompt back into the fields.
  - Add button changes to Update.
  - Updated prompt stays in the same position.
  - Changes save locally.
- Created Topic Summary screen.
- Added scrollable Question / Answer table.
- Added Edit option from Topic Summary.
- Restored stable Home → Create Topic → Add Content → Topic Summary flow after fixing an accidental file overwrite.

### Current App Flow

Home  
↓  
Create Topic  
↓  
Add Content  
↓  
Add / Edit prompts  
↓  
Done after minimum 10 prompts  
↓  
Topic Summary

### Current Persistence

- Prompt lists are saved locally on the device using AsyncStorage.
- Saved prompts reload when returning to the same topic.
- User accounts and cloud persistence are not yet implemented.

### Next

1. Add Save Topic functionality.
2. Saved topic should appear on the Home dashboard.
3. Make saved topics reopenable from Home.
4. Then begin the Recall flow.

### Stable Checkpoint

The current build has a working topic creation and content-entry flow with local persistence and editing.

---