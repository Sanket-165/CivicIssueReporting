JanNivaran: A Crowdsourced Civic Issue Reporting System
JanNivaran is a modern, mobile-first platform designed to bridge the gap between citizens and municipal authorities. It empowers users to report local civic issues and track their resolution with unprecedented transparency, powered by blockchain technology.

Table of Contents
Problem Statement

Our Solution

Live Demo

Key Features

How It Works (Architecture)

The Blockchain Advantage

Technology Stack

Setup and Installation

Prerequisites

Blockchain Setup

Backend Setup

Frontend Setup

Environment Variables

Project Structure

Team Members

Problem Statement
Local governments often face challenges in promptly identifying, prioritizing, and resolving everyday civic issues like potholes, non-functional streetlights, or overflowing garbage bins. While citizens encounter these issues daily, a lack of effective reporting and tracking mechanisms limits municipal responsiveness and erodes public trust.

Our Solution
JanNivaran is a web application that provides a streamlined, mobile-first solution to bridge this gap. It features an intuitive interface for citizens to report issues with geotagged media and a powerful dashboard for municipal authorities to manage, assign, and resolve these complaints. The entire lifecycle of a complaint is recorded on a blockchain, creating an immutable and transparent audit trail that fosters accountability and rebuilds trust.

Live Demo
Frontend (Vercel): [Link to your deployed Vercel frontend]

Backend (Render): [Link to your deployed Render backend]

Key Features
Citizen-Centric Reporting: Users can submit complaints with a geotagged photo, an optional voice note, and a detailed description.

AI-Powered Prioritization: Google's Gemini API analyzes the description of an issue to automatically assign a "Low," "Medium," or "High" priority level.

Real-time Tracking: Both citizens and administrators can track the status of a complaint from "Pending" to "Resolved" and "Closed".

Interactive Map Dashboard: A live map visualizes all reported issues, allowing administrators to identify problem hotspots and manage resources effectively.

Role-Based Access Control:

Citizens: Can submit reports, track their own issues, and provide feedback on resolutions.

Admins (Departmental): Manage complaints specific to their department (e.g., Waste Management, Roads & Potholes).

Superadmins: Have a global overview, manage user roles, and handle escalated/reopened cases.

Immutable Audit Trail: Every status update is recorded as a permanent transaction on the Sepolia testnet, providing an unchangeable and verifiable history for complete transparency.

How It Works (Architecture)
The application follows a modern, decoupled architecture. The backend serves as the central hub, managing business logic and communication between the frontend, the database, and the blockchain.

Standard Flow:
User (React Frontend) -> REST API (Node.js/Express Backend) -> MongoDB (Database) & Cloudinary (Media Storage)

Blockchain Flow for Transparency:
When a key action occurs (like creating or updating a complaint), the backend performs a dual-write:

It saves the data to the MongoDB database for fast retrieval.

It sends a transaction to a deployed smart contract to create an immutable, timestamped record of the action.

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
The Blockchain Advantage for Transparency
The core of JanNivaran's commitment to transparency is its use of a permissioned blockchain model, demonstrated on a public testnet.

The Problem: In a traditional system, a database administrator could theoretically alter timestamps or status logs to manipulate performance metrics or incorrectly close an issue without a trace. This leads to a breakdown of trust.

Our Solution: Every critical status update ('pending', 'resolved', 'reopened', etc.) is not just a database entry; it's a cryptographically signed transaction sent to our IssueTracker smart contract.

The Benefit: This creates an immutable, timestamped, and auditable trail of every complaint's lifecycle. Once a status is recorded on the chain, it cannot be altered or deleted. This provides a "single source of truth" that holds all parties accountable. Citizens can click "View On-Chain History" to see this permanent record for themselves.

Technology Stack
Frontend	Backend	Blockchain
React.js (Vite)	Node.js	Solidity
Tailwind CSS	Express.js	Truffle Suite (Development & Migration)
React Router	MongoDB (with Mongoose)	Ganache (Local Blockchain)
Axios	JSON Web Tokens (JWT)	Ethers.js (Backend Interaction)
React Hot Toast	Cloudinary API (for Media)	Sepolia Testnet (for Demo)
Lucide React (Icons)	Google Gemini API (for AI)	MetaMask (Wallet)
Google Maps API		

Export to Sheets
Setup and Installation
Follow these instructions to set up and run the project locally.

Prerequisites
Node.js (v18.x.x - LTS recommended)

nvm (Node Version Manager)

Truffle (npm install -g truffle)

Ganache Desktop Application

A web browser with the MetaMask extension installed.

1. Blockchain Setup
First, deploy the smart contract to the Sepolia testnet.

Bash

# 1. Navigate to the blockchain project directory
cd civic-tracker

# 2. Install local dependencies
npm install

# 3. Create a .env file and add your secrets (see .env.example section below)
# Add your MetaMask 12-word phrase and your Infura/Alchemy API key

# 4. Deploy the contract to the Sepolia testnet
npx truffle migrate --network sepolia

# 5. After deployment, SAVE the deployed contract address. You will need it for the backend.
2. Backend Setup
Next, set up and run the backend server.

Bash

# 1. Navigate to the backend project directory
cd backend

# 2. Install dependencies
npm install

# 3. Create a .env file and add your configuration (see .env.example section)
# You need to add your MongoDB URI, JWT Secret, Cloudinary keys, Gemini key,
# and the blockchain variables (RPC URL, Wallet Private Key, Contract Address).

# 4. Start the server
npm start
The server will be running on http://localhost:5001.

3. Frontend Setup
Finally, set up and run the React frontend.

Bash

# 1. Navigate to the frontend project directory
cd frontend

# 2. Install dependencies
npm install

# 3. Create a .env file and add your configuration (see .env.example section)
# You need VITE_API_URL (pointing to your backend) and your Google Maps API Key.

# 4. Start the development server
npm run dev
The application will be accessible at http://localhost:5173.

Environment Variables
You will need to create .env files for each part of the project.

Blockchain (/civic-tracker/.env.example)
MNEMONIC="your twelve word metamask secret recovery phrase here"
INFURA_API_KEY="your infura api key here"
Backend (/backend/.env.example)
PORT=5001
MONGO_URI="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
GEMINI_API_KEY="your_google_gemini_api_key"

CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"

# Blockchain Configuration
RPC_URL="https://sepolia.infura.io/v3/YOUR_INFURA_API_KEY"
WALLET_PRIVATE_KEY="0xYOUR_METAMASK_PRIVATE_KEY_FOR_TRANSACTIONS"
CONTRACT_ADDRESS="THE_DEPLOYED_CONTRACT_ADDRESS_ON_SEPOLIA"
Frontend (/frontend/.env.example)
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_MAPS_API_KEY="your_google_maps_api_key"
Project Structure
.
├── backend/         # Node.js & Express.js server logic
├── civic-tracker/   # Truffle project with the Solidity smart contract
└── frontend/        # React.js (Vite) client application

Team Members : 
Anand Lavhale
Aditi
Vedant Pawar
Ayush Jaiswal
Sanket Gavhane
Abhinav Chavan
