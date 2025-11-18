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

Create and organize ideas visually

Move, rename, and customize nodes

Collaborate with others in real-time with no lag

Track who is online inside each map (realtime using Supabase broadcast)

Control permissions and map ownership

Customize canvas appearance (Colors, to grid type and grid color)

Manage their account and subscription plan

Navigate maps using a built-in minimap

The application is powered by:

Supabase Authentication (email/password, magic links)

Supabase Realtime Broadcast (WebSocket-based collaboration)

Supabase Postgres + RLS (secure, permission-controlled storage)

ReactFlow for graph visualization

This version represents a full migration from Firebase to Supabase, along with a full UI/UX redesign and implementation of all previously incomplete features.

# Features

## 🔐 Authentication & Account Management

✔ Email/Password Authentication (Supabase)
✔ Required Email Confirmation

Users must verify their email before gaining access and granting them a session in the backend.

✔ Password Reset

Fully implemented password recovery flow (non-functional in the old version).

✔ Magic Link Login

Users can log in using a secure one-time link sent to their email.

✔ Profile Page

View and edit profile

Upload profile picture (Supabase Storage)


## 🧭 Dashboard & Maps Management
✔ Fully redesigned dashboard UI/UX

Modern layout, smoother navigation, and improved usability.

✔ Map Cards with full metadata:

Map name

Description

Author name

“Last updated” timestamp

Beautiful modern presentation

✔ Map actions menu (3-dot hamburger)

Rename map

Edit description

Duplicate map

Delete map

✔ Safe permission system

Only owners can delete their own maps

Editors cannot delete maps they did not create

Prevents destructive actions by non-owners

✔ Subscription system with map limits:

Free Plan → 5 maps

Pro Plan → 20 maps

Unlimited Plan → infinite maps

Integrated UI messages when limits are reached and upgrade options.

✔ New sidebar menu:

Sign out

Profile/account settings

Light/dark mode toggle

Upgrade subscription

User info section


## Real-Time Collaboration

All real-time features now use Supabase Realtime Broadcast channels instead of database writes.

✔ Live cursor sharing

Smooth, low-latency cursor position updates for all users.

✔ Adjustable cursor FPS

Users can choose how fast their own cursor animates (1–60 FPS).

✔ Toggle cursor visibility

Hide your own cursor

Hide all other users’ cursors

✔ Real-time node movement

Dragging nodes updates instantly for all connected users.

✔ Real-time online/offline presence (accurate)

Users appear Online the moment they enter the map

Switch to Offline instantly when they leave

No refresh required

✔ Participants list

Shows all users with presence status inside the map.

## 🧩 Mind Map Editing Features
✔ Drag-and-drop nodes
✔ Rename nodes
✔ Add descriptions to maps
✔ Connect nodes
✔ Custom edge styles
✔ Add links to nodes

(Previously listed but not fully functional — now working.)


## 🖼 Canvas & UI Customization
✔ Canvas background options

Dotted grid

Lined grid

No grid

✔ Custom canvas color
✔ Custom grid color
✔ Updated node UI

Improved spacing, color scheme, hover effects, and shadows.

## 🗺 Mini-Map Navigation
✔ Toggle mini-map
✔ Real-time preview of the entire map
✔ Click-to-navigate and drag support

Helps users navigate large mind maps easily.

## ☁️ Cloud Features (Supabase Database & RLS)
✔ Automatic map saving
✔ Cloud synchronization
✔ Row-Level Security (RLS)

Ensures that:

A user cannot modify another user’s data

Editors cannot delete maps

All access rules are enforced via SQL policies

✔ Database schema fully migrated to Supabase

Includes detailed SQL migrations in
sapubase/migrations/20251023180322_remote_schema.sql


## 🔧 Performance Fixes and Improvements
✔ Eliminated high-frequency realtime writes

Old version spammed thousands of writes per mouse movement.
Now replaced by WebSocket packets + throttled updates.

✔ Faster dashboard loading
✔ Efficient Supabase queries
✔ Optimized ReactFlow rendering
✔ UI animations on login screen
✔ Cleaner code structure

# Tech Stack

Frontend

React

ReactFlow

JavaScript / JSX

CSS

Backend / Database

Supabase Auth

Supabase Realtime Broadcast

Supabase Postgres

Supabase Storage

Row-Level Security (RLS)

Dev Tools

VSCode

Git / GitHub

Photoshop for design assets

Docker (for local Supabase development)



## Installation and Setup

The project is now migrated to Supabase. Meaning, we don't need Firebase to run the project.
You need to setup *Supabase*.

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
