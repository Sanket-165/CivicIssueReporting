<div align="center">
<img src="https://raw.githubusercontent.com/Sanket-165/CivicIssueReporting/main/frontend/public/logo.png" alt="JanNivaran Logo" width="200"/>

<p><strong>A Crowdsourced Civic Issue Reporting System</strong></p>

</div>

## 📖 Table of Contents
- [About The Project](#about-the-project)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [The Blockchain Advantage](#the-blockchain-advantage)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Team Members](#team-members)

🎯 About The Project
Local governments often face challenges in promptly identifying, prioritizing, and resolving everyday civic issues. This gap in communication limits municipal responsiveness and can erode public trust.

JanNivaran is a modern, mobile-first platform that provides a streamlined solution to bridge this gap. It features an intuitive interface for citizens to report issues with geotagged media and a powerful dashboard for authorities to manage and resolve complaints. The entire lifecycle of a complaint is recorded on a blockchain, creating an immutable and transparent audit trail that fosters accountability and rebuilds trust.


🚀 Live Demo
Frontend (Vercel): https://civic-issue-reporting-topaz.vercel.app/

Backend (Render): 

✨ Key Features
Citizen-Centric Reporting: Users can submit complaints with a geotagged photo, an optional voice note, and a detailed description.

AI-Powered Prioritization: Google's Gemini API analyzes complaint descriptions to automatically assign a Low, Medium, or High priority level.

Real-time Tracking: Both citizens and administrators can track the status of a complaint from "Pending" to "Resolved" and "Closed".

Interactive Map Dashboard: A live map visualizes all reported issues, allowing administrators to identify problem hotspots and manage resources effectively.

Immutable Audit Trail: Users can view a permanent, unchangeable history of their complaint's status updates, retrieved directly from the blockchain.

Role-Based Access Control:

👤 Citizens: Submit reports, track their issues, and provide feedback on resolutions.

👨‍💼 Admins (Departmental): Manage complaints specific to their department (e.g., Waste Management, Roads & Potholes).

👑 Superadmins: Have a global analytics overview, manage user roles, and handle escalated/reopened cases.

🏗️ Architecture
The application follows a modern, decoupled architecture. The backend serves as the central hub, managing business logic and communication between the frontend, the database, and the blockchain.

When a key action occurs (like a status update), the backend performs a dual-write:

It saves the data to MongoDB for fast, efficient retrieval by the app.

It sends a transaction to a Blockchain Smart Contract to create an immutable, timestamped record of the action.

```text
+----------------+      +---------------------+      +-----------------------------+
| Frontend       |      | Backend API         |      | Data Stores                 |
| (React/Vercel) |----->| (Node.js/Render)    |----->| - MongoDB (for app state)   |
+----------------+      |                     |      | - Cloudinary (for media)    |
                        |                     |      +-----------------------------+
                        |                     |
                        | (Ethers.js)         |      +-----------------------------+
                        |                     |----->| Blockchain Node             |
                        +---------------------+      | (Sepolia Testnet)           |
                                                     +-----------------------------+
```

🔗 The Blockchain Advantage
The core of JanNivaran's commitment to transparency is its use of a permissioned blockchain model.

The Problem: In a traditional system, a database administrator could alter timestamps or status logs to manipulate performance metrics. This erodes public trust.

Our Solution: Every critical status update is a cryptographically signed transaction sent to our IssueTracker smart contract.

The Benefit: This creates an immutable, timestamped, and auditable trail of every complaint's lifecycle. Once a status is recorded on the chain, it cannot be altered or deleted. This provides a "single source of truth" that holds all parties accountable.

🛠️ Technology Stack
Category	Technologies Used
Frontend	React.js (Vite), Tailwind CSS, React Router, Axios, Google Maps API, Lucide React
Backend	Node.js, Express.js, MongoDB (Mongoose), JWT, Cloudinary, Google Gemini API
Blockchain	Solidity, Truffle Suite, Ganache, Ethers.js, Sepolia Testnet, MetaMask

Export to Sheets
🚀 Getting Started
Follow these instructions to set up and run the project locally.

Prerequisites
Node.js (v18.x.x - LTS recommended)



1. Backend Setup
Next, set up the backend server.

Bash

1. Navigate to the backend directory
cd backend

 . Install dependencies
npm install

3. Create a .env file (see Environment Variables section)
Add all the required keys (MongoDB, JWT, Cloudinary, Gemini, Blockchain).

4. Start the server
npm start
The server will run on http://localhost:5001

3. Frontend Setup
Finally, set up and run the React frontend.

Bash

1. Navigate to the frontend directory
cd frontend

2. Install dependencies
npm install

3. Create a .env file (see Environment Variables section)
Add the backend API URL and Google Maps API Key.

4. Start the development server
npm run dev
The application will be accessible at http://localhost:5173

👥 Team Members
Anand Lavhale

Aditi

Vedant Pawar

Ayush Jaiswal

Sanket Gavhane

Abhinav Chavan
