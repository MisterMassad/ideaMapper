# MindMapProject

## Setup and Installation Tutorial - 2.5 minutes tutorial to setup the project successfully 

https://github.com/user-attachments/assets/68bbaec1-5062-457c-93e4-39e7b8d68137


<img width="2531" height="1304" alt="Main_page_1" src="https://github.com/user-attachments/assets/1d1d3644-6449-4be9-b44d-67a8ef69d474" />

<img width="1488" height="1014" alt="Sign_up_page_1" src="https://github.com/user-attachments/assets/99d2e672-c878-44c2-aed3-4e88f5bb562c" />

<img width="2010" height="1308" alt="Dashboard_page_1" src="https://github.com/user-attachments/assets/a1141fa2-4068-4ae9-aa30-8230a5a53c88" />

# November Updates:
1. Added a pricing plan and quota limits. Users can create a limited number of maps, unless they upgrade their plan.
   1. Introudced 3 plans:
        - Free (Limit of 5 maps)
        - Pro (Limit of 20 maps)
        - Unlimited (No limit)
     
2. Real-time using broadcast channels instead of database writes and pulls:
   1. Live cursor updates are now using Supabase broadcast channels instead of a regular database write and pull.
   2. Moving nodes is now updated in real-time for all connected users using Supabase broadcast channel.
  
3. Dashboard UI and UX updates:
   1. Added a left menu bar, where users can now sign out from, access their account details, upload a new profile picture, enable/disable light mode, and upgrade/downgrade their subscription.
   2. Updated the Map Cards. A totally new dashboard.
        1. Map Cards now have an update UI, they also include a 3-dot hamburger menu:
             - Edit map name.
             - Edit map description.
             - Duplicate map.
             - Delete map.
         2. Map cards now include the map author name, and also include the last updated timestamp of the map.
     
   3. Map Editor Updates:
        - Added the ability for users to choose:
             - Canvas color
             - Canvas grid (lined, dotted, or none)
             - Grid Color
        - Added live cursor options to allow for more flexibility and less distractions:
             - FPS Slider for how fast "your own" cursor is moving (1-60) FPS.
             - Added an option to hide your own cursor.
             - Added an option top hide other connected users cursors.
        - Added a new mini-map for maps.
        - Users can toggle minimaps on and off.
        - Maps are navigatble using the minimaps.
        - Updated the online/offline tag for users to work in real-time. Whenever a new user joins the map, he appears as "Online", when he leaves he will instantly appear to be "Offline".
        - Updated the nodes UI. 
# Updates:

1. The project now fully works using Supabase and not Firebase. The whole task of this project was to do Firebase to Supabase migration.

# Problems Fixed and Updates:

- Redesigned login/signup page. Made the GUI user friendly and added animations to the login page.
- Reimagined the dashboard page. Made the UI user friendly. 
- Migrated the whole project from Firebase to Supabase, which includes:
   - Migrated Authentication
   - Migrated User tables and information
   - Migrated all map tables
   - Migrated creating, editing, and map deletion
   - Migrated and improved real-time as part of the project.
- Fixed the continuous mouse updates in Realtime. Whenever a user moves his mouse, a great sheer amount of updates (thousands of updates per mouse move) were sent to the Realtime database, which caused using too much quota.
Mouse updates are now less frequent, and much smoother than before.
- Add restrictions for editors to delete the owner's map. In the original project, editors whom joined a certain mindmap, can easily delete it and it would delete the entire mindmap from the database which would also delete it for the owner.
   - Added a restriction that only the owner can delete a map he created.
   - Added a restriction that editors cannot try and delete a map they didn't create.
- Added a demo feature, "Online" and "Offline" feature for users. A user can now check who's currently inside his map. If x amount of users are joined in one map, then there's a participants list that shows all users.
   - Added "Online" tag, for users that are currently inside the current map.
   - Users appear "Online" iff the user is inside the current map.
   - A user would appear "Offline" if he's not in the current map, regardless if he's Online on the App/Website.
   - Not yet implemented in Realtime.
- Added email confirmation before login. No session accesss before confirming your email.
- Added a password reset functionality. (Password reset was a placeholder in the original Firebase project).
   - Users can now reset their passwords.
- Added a one-time-login magic link, that allows the user to login in from a link sent directly to his email.

## Background and Motivation

 This project was developed as part of my studies for my degree at the university of Haifa, under the supervision of Professor Roi Poranne  and Professor Yotam Hod. The goal of MindMapProject is to create an interactive real-time mind mapping tool that enables users to visually organize their thoughts, structure ideas, and collaborate efficiently.

With Firebase's real-time database and Firestore, the project ensures instant updates, allowing multiple users to work on a mind map simultaneously. This project leverages JavaScript and Firebase for a smooth and responsive user experience.


## Project Overview

The MindMapProject provides a real-time collaborative platform where users can create, edit, and manage mind maps dynamically. The system allows multiple users to work together in real time, ensuring an interactive and seamless experience. Users can add descriptions, rename nodes and edges, attach links, and manage access through unique map IDs.

Key functionalities include:

Real-time collaboration: Instant updates with Firebase Realtime Database.  
Access control with unique Map IDs: Ensuring only authorized users can join specific maps.  
User authentication: Secure login and account management.  
Visualization & organization tools: Drag-and-drop node positioning, renaming, linking, and more.  
Live participant tracking: See who is currently working on the mind map.  
Cloud synchronization: Auto-save and retrieval of mind maps from Firebase.  

This tool is designed for students, professionals, and teams who need a structured approach to brainstorming, project planning, and knowledge management.

## Features :

Real-Time Editing : Instant updates with Firebase Realtime Database  

User Registration/Login : Secure authentication with Firebase 

Mind Map Creation : Add, edit, and delete nodes and edges dynamically  

Join a Map with a Unique ID : Users can join an existing mind map by entering its unique map ID 

View Active Participants : Users can see all participants currently working on the map  

Live Presence Updates : Users can see real-time activity when others add, edit, move, or delete nodes  

Drag-and-Drop Nodes : Organize ideas with a smooth UI 

Auto-Save & Cloud Sync : Data is automatically stored in Firebase  

Collaboration Support : Multiple users can work on the same mind map 

Custom Themes : The users can color the edges/nodes in the map and they can choose specific type of edges to connect the nodes, they can custom their maps the way they like   

Unique Map ID System : Every mind map has a unique ID, ensuring that only authorized users can access and edit the map  

Descriptions for Nodes and Maps : Each node can have a detailed description, and the entire map can also have an overview description  

Renaming Nodes and Edges : Users can rename nodes and edges dynamically to refine their mind maps  

Adding Links to Nodes : Each node can include a clickable link to external resources or references  

Profile Page : Displays user information and provides editing options  

Logout and Password Reset : Options for users to log out and reset their passwords  



##  Tech Stack
- React (JavaScript, HTML, CSS) 
- Supabase (Authentication, Database, Realtime, RLS)  
- Development Tools: VSCode, Photoshop for designs, Git, Github


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

## You're done! Happy coding!

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

