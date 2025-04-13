# PharmClinical: Comprehensive Clinical Education Platform for Pharmacy Students

A full-stack web application for documenting and evaluating clinical activities conducted by pharmacy students at hospitals.

## Features

- **Case Documentation and Evaluation**: Document clinical patient encounters with comprehensive forms
- **Query Documentation**: Teachers create and assign clinical questions for students to research
- **Class Test Creation**: Online assessment tools for evaluating student knowledge
- **Dashboard and Analytics**: Visualization of student progress and performance
- **Communication System**: Built-in messaging and notification system
- **Document Management**: Centralized repository for educational materials

## Tech Stack

- **Frontend**: React with Material UI/Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **File Storage**: Firebase/AWS S3
- **Authentication**: JWT-based with role-based access control
- **Deployment**: Docker containerization

## Getting Started

### Prerequisites

- Node.js (v14+)
- MongoDB
- Docker and Docker Compose (optional)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd pharmacy-clinical-platform
   ```

2. Install dependencies:
   ```
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   ```
   # Server
   cd ../server
   cp .env.example .env
   
   # Client
   cd ../client
   cp .env.example .env
   ```

4. Start the development servers:
   ```
   # Start server
   cd ../server
   npm run dev
   
   # Start client in a new terminal
   cd ../client
   npm start
   ```

5. Alternatively, use Docker Compose:
   ```
   docker-compose up
   ```

## Project Structure 
pharmacy-clinical-platform/
├── client/ # Frontend React application
│ ├── public/ # Static assets
│ ├── src/ # React source files
│ └── ...
├── server/ # Backend Node.js application
│ ├── src/ # Server source files
│ └── ...
├── docker-compose.yml # Docker Compose configuration
└── README.md # Project documentation