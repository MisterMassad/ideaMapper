# MindMapProject

## Setup and Installation Tutorial - 2.5 minutes tutorial to setup the project successfully 

https://github.com/user-attachments/assets/68bbaec1-5062-457c-93e4-39e7b8d68137


<img width="2531" height="1304" alt="Main_page_1" src="https://github.com/user-attachments/assets/1d1d3644-6449-4be9-b44d-67a8ef69d474" />

<img width="1488" height="1014" alt="Sign_up_page_1" src="https://github.com/user-attachments/assets/99d2e672-c878-44c2-aed3-4e88f5bb562c" />

<img width="2010" height="1308" alt="Dashboard_page_1" src="https://github.com/user-attachments/assets/a1141fa2-4068-4ae9-aa30-8230a5a53c88" />

# Background & Motivation

The original version of the project was built using Firebase and implemented a basic collaborative mind-mapping environment. Although it was functional, it had many limitations.:

Real-time interactions caused extreme database load (thousands of writes per second for cursor movement).

Some features listed in the previous README weren't implemented or non-functional.

The UI/UX was outdated and difficult to use. A simple green UI.

Authentication lacked critical workflows (email confirmation before granting a session, password reset).

Editors had too much power (They could delete the owner's map).

The dashboard and map editor were not scalable or user-friendly.

Code was messy and condensed into 3-4 .jsx files. While .css files were present and written, they weren't connected to the .jsx correctly. All of the designs were done in-line, in files that were 1000+ lines.

There was no reusable modals or code.

The real-time collaboration system relied entirely on Firebase database writes/reads, resulting in lag, quota issues, and poor performance.

The goal of this new version was to fully redesign the project from the ground up, migrate it to Supabase, fix all of the broken and missing features, improve performance, build a new UI, design a better UX, and build a modern real-time environment to deploy a production project later.

The project now operates on a stronger foundation, with a new architecture, a new real-time engine that uses Supabase built in sockets, new UI/UX, and new features that follow a modern 2025 UI/UX.


# Project Overview

ideaMapper is a real-time collaborative mind-mapping web application where multiple users can create, join, and work on shared maps simultaneously.

Users can:

1. Create and organize ideas visually

2. Move, rename, and customize nodes

3. Collaborate with others in real-time with no lag

4. Track who is online inside each map (realtime using Supabase broadcast)

5. Control permissions and map ownership

6. Customize canvas appearance (Colors, to grid type and grid color)

7. Manage their account and subscription plan

8. Navigate maps using a built-in minimap

9. The application is powered by:

10. Supabase Authentication (email/password, magic links)

11. Supabase Realtime Broadcast (WebSocket-based collaboration)

12. Supabase Postgres + RLS (secure, permission-controlled storage)

13. ReactFlow for graph visualization

This version represents a full migration from Firebase to Supabase, along with a full UI/UX redesign and implementation of all previously incomplete features.

# Features

## 🔐 Authentication & Account Management

- Email/Password Authentication (Supabase)
- Required Email Confirmation
Users must verify their email before gaining access and granting them a session in the backend.

- Password Reset
Fully implemented password recovery flow (non-functional in the old version).

- Magic Link Login
Users can log in using a secure one-time link sent to their email.

- Profile Page
   - View and edit profile
   - Upload profile picture (Supabase Storage)


## 🧭 Dashboard & Maps Management
- Fully redesigned dashboard UI/UX
   - Modern layout, smoother navigation, and improved usability.

- Map Cards with full metadata:
   1. Map name
   2. Description
   3. Author name
   4. “Last updated” timestamp
   5. Beautiful modern presentation

- Map actions menu (3-dot hamburger)
   1. Rename map
   2. Edit description
   3. Duplicate map
   4. Delete map

- Safe permission system
   - Only owners can delete their own maps
   - Editors cannot delete maps they did not create
   - Prevents destroying others' work

## Subscription system with map limits:

- Introudced 3 plans:
   - Free (Limit of 5 maps)
   - Pro (Limit of 20 maps)
   - Unlimited (No limit)

- Integrated UI messages when limits are reached and upgrade options.

- New sidebar menu:
   1. Sign out
   2. Profile/account settings
   3. Light/dark mode toggle
   4. Upgrade subscription
   5. User info section


## Real-Time Collaboration

All real-time features now use Supabase Realtime Broadcast channels instead of database writes and pulls which consumed a lot of quota previously.

- Live cursor sharing
   - Smooth, low-latency cursor position updates for all users.

- Adjustable cursor FPS
   - Users can choose how fast their own cursor animates (1–60 FPS).

- Toggle cursor visibility
   1. Hide your own cursor
   2. Hide all other users’ cursors

- Real-time node movement
   - Dragging nodes updates instantly for all connected users.

- Real-time online/offline presence (accurate)
   - Users appear Online the moment they enter the map
   - Switch to Offline instantly when they leave
   - No refresh required

- Participants list
   - Shows all users with presence status inside the map.

## Mind Map Editing Features
- Drag-and-drop nodes
- Rename nodes
- Add descriptions to maps
- Connect nodes
- Custom edge styles
- Add links to nodes


## Canvas & UI Customization
- Canvas background options
   1. Dotted grid
   2. Lined grid
   3. No grid

- Custom canvas color
- Custom grid color
- Updated node UI

Improved spacing, introduced a new default color scheme, hover effects, and shadows.

## Mini-Map 
- Toggle mini-map
- Real-time preview of the entire map
- Click-to-navigate and drag support

Helps users navigate large mind maps easily.

## Cloud Features (Supabase Database & RLS)
- Automatic map saving
- Cloud synchronization
- Row-Level Security (RLS)

Ensures that:

- A user cannot modify another user’s data
- Editors cannot delete maps
- All access rules are enforced via SQL policies

- Database schema fully migrated to Supabase

## - Performance Fixes and Improvements
- Eliminated the need to save/write to db for realtime updates, and introduced Supabase built-in sockets for realtime: Supabase broadcast.

The Old version sends thousands of live cursor updated to the database. I replaced it with WebSocket packets and throttled the update rate. 

- Faster dashboard loading
- Efficient Supabase queries
- Optimized ReactFlow rendering
- UI animations on login screen
- Cleaner code structure


## Login and Sign-up
- New UI/UX
- Ability to sign-in using email/password, google, or github.
- Added a mind-map interactive background that the user can interact with in the login/signup page.
- Reset password.
- One time magic link sign in by email.

# Tech Stack

- Frontend
   1. React
   2. ReactFlow
   3. JavaScript / JSX
   4. CSS

- Backend / Database

1. Supabase Auth
2. Supabase Realtime Broadcast
3. Supabase Postgres
4. Supabase Storage
5. Row-Level Security (RLS)
6. VSCode
7. Git / GitHub
8. Photoshop for design assets
9. Docker (Mainly for supabase SQL exporting (I exported the .sql for Supabase using Docker))



## Installation and Setup

You can clone the project and use it, updates are sent to my Supabase cloud. If you want to develop, update, or edit the project, especially from the database side, then you need to setup your own *Supabase*.

### Step 1: Clone the repo:
1. From your cmd, in your chosen location, clone the repository using "git clone https://github.com/MisterMassad/ideaMapper"
2. Install the necessary dependencies for React and Supabase: "npm install" in the root.
   1. Additionally, do the following:
      1. "cd server" -> "npm install"
      2. "cd client" -> "npm install"


### Step 2: Setup Supabase

1. Go to your Supabase console.
2. Create a new project (Dashboard -> New Project).
3. Open the SQL Editor in your Supabase project. (You can find it in the left menu)
4. Open the file: "supabase/migrations/20251023180322_remote_schema.sql" and copy the *entire* file.
5. Paste the file contents in teh SQL  editor, and click *Run* or alternatively, press "CTRL + ENTER".
6. Find your API keys and Project ID:
   1. Navigate to Project settings form the left menu, then navigate to "General".
   2. Find your project ID, and copy it.
   3. Open the supabaseClient.js file. ("client\src\supabaseClient.js")
   4. Put your project ID as follows:
   https://<PROJECT_ID>.supabase.co
   (Don't include <> around the PROJECT_ID)
   5. Navigate to Project Settings from the Left Menu. (Press the settings icon)
   6. Find and navigate to API Keys. (Link: https://supabase.com/dashboard/project/mfljgxvjzvlolkalkxsh/settings/api-keys)
   3. Open the supabaseClient.js file. ("client\src\supabaseClient.js")
   4. Copy and paste your anon public key.

### Step 3: Run the project

1. Run the server first using "npm start"
2. Run the client using "npm start"

## Common Problems:
- You need to install dependencies in the:
     - The root directory
     - Server
     - Client
 
- If you can run the server, but not the client, then the dependencies weren't installed correctly in the client:
   - You can re run npm install inside the client.
   - A common error is that react scripts are not found, you can fix using: "npm install react-scripts@5.0.1 --save"

## Notes and Credits:
- My task in this project was to migrate the project from using Firebase to Supabase, patch bugs, and add new features to the project.
- This project is being worked on by students in the Semester Project at the University of Haifa.
- Original project's repo: https://github.com/xCraftLab/HiveMindMap

## You're done! Happy coding!

# Update Suggestions:
- Add new types of maps that offer different types than the current node system.

- Implement payment backend for plan upgrading.

- Update the UX of node and edge customization.

- Add the ability to add a description, an image, a video to the nodes.

- Add the ability for an owner to kick an editor.

- Add the ability to add a viewer to the map with no editing privileges.


