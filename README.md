# MindMapProject

# Updates:

1. The project now fully works using Supabase and not Firebase. The whole task of this project was to do Firebase to Supabase migration.

# Problems Fixed and Updates:

1. Re-designed the sign up and login page. Made the signup/login GUI user friendly and up-to-date using CSS.
1. Redesigned login/signup page. Made the GUI user friendly and added animations to the login page.
2. Reimagined the dashboard page. Made the UI user friendly. 
3. Migrated the whole project from Firebase to Supabase, which includes:
   1) Migrated Authentication
   2) Migrated User tables and information
   3) Migrated all map tables
   4) Migrated creating, editing, and map deletion
   5) Migrated and improved real-time as part of the project.
4. Fixed the continuous mouse updates in Realtime. Whenever a user moves his mouse, a great sheer amount of updates (thousands of updates per mouse move) were sent to the Realtime database, which caused using too much quota.
Mouse updates are now less frequent, and much smoother than before.
5. Add restrictions for editors to delete the owner's map. In the original project, editors whom joined a certain mindmap, can easily delete it and it would delete the entire mindmap from the database which would also delete it for the owner.
   1) Added a restriction that only the owner can delete a map he created.
   2) Added a restriction that editors cannot try and delete a map they didn't create.
6. Added a demo feature, "Online" and "Offline" feature for users. A user can now check who's currently inside his map. If x amount of users are joined in one map, then there's a participants list that shows all users.
   1) Added "Online" tag, for users that are currently inside the current map.
   2) Users appear "Online" iff the user is inside the current map.
   3) A user would appear "Offline" if he's not in the current map, regardless if he's Online on the App/Website.
   4) Not yet implemented in Realtime.


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
- Firebase (Authentication, Firestore, Realtime Database)  
- Development Tools:Visual Studio Code, Git & GitHub  


## Installation and Setup

## Supabase Setup
The project is now migrated to Supabase. Meaning, we don't need Firebase to run the project.
You need to setup *Supabase*.

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

## Firebase
We used Firebase as our backend, in order to run our project, you need to setup *Firebase*:

1. Go to the Firebase Console and create a new project.
2. In the Project Settings, navigate to the General tab and register your app -> choose Web as the platform.
3. Get Your Firebase Service Account Key:
Navigate to Project Settings,Go to the Service accounts tab-> Click Generate new private key under the Firebase Admin SDK section:
then a JSON file will be downloaded to your computer. 
"we will use this file later ".

Enable Firebase Services:
1. Firebase Authentication is used to manage user sign-ups, logins, and authentication state.<br>
In the Firebase Console, go to the Authentication section and enable the Email/Password sign-in methods.
2. Cloud Firestore:<br>
Go to Firestore Database and Create a new database.
3. Realtime Database:<br>
Go to Realtime Database and click Create Database.<br>
Set the database rules to allow necessary read/write access (public access).

## Run the project:
After you set up Firebase, you can follow these steps to run the project:

1. Clone the Repository: (https://github.com/IsraaBsoul/MindMapProject.git)<br>
Then, open the project and update the Firebase configuration:<br>
   a. Open the file: firebaseConfig -> server\config\firebaseConfig.js, <br>
   and replace the placeholder path with the path to your downloaded JSON file->const serviceAccount = require("path/to/your/firebase-key.json");

   b. Go to the Firebase Console for your project-> navigate to Project Settings-> Scroll down to the "Your apps" section <br>
   then copy your Firebase configuration values, and replace the existing values in the `client\src\firebase.js` file with your own configuration.

2. Install necessary packages for React and Firebase: npm install
3. Navigate to the Project Directory: cd MindMapProject
4. Run the Application:<br>
You should run the server first-> Open a terminal and navigate to the server directory: cd server -> Then start the server: npm start.<br>
Open another terminal and navigate to the client directory: cd client-> Then start the client: npm start.<br>
*DONE :)*
![image](https://github.com/user-attachments/assets/49893958-7f81-4962-babe-63924c6a28e2)

 ![image](https://github.com/user-attachments/assets/24b94d77-3dfc-4a07-b58f-5ca7a96d3cce)





