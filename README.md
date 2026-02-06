# Mellow-Tools

Welcome to **Mellow Tools** — a platform crafted out of a passion for simplifying digital workflows. My goal is to provide intuitive, user-friendly tools that help developers, designers, and tech enthusiasts alike streamline their tasks, enhance productivity, and focus on what truly matters.

Visit [Mellow Tools](https://mellow-tools.vercel.app/) for the live application.

## 🚀 Features

Mellow Tools offers a suite of utilities to manage your professional life and workflows:

-   **Job Tracker**: Keep track of your job applications, statuses (Applied, Interview, Offer, Rejected), and history in one centralized dashboard.
-   **Notes**: Create, edit, and organize rich-text notes for your projects or personal thoughts.
-   **Text Templates**: Manage reusable text snippets for repetitive tasks like cold emails or cover letters.
-   **Bookmarks**: Save and categorize important links for quick access.
-   **Automation**: Backend automation capabilities and scripts to streamline data management.

## 🛠 Tech Stack

The project is built using a modern full-stack architecture (MERN):

### Frontend (`/client`)
-   **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
-   **Language**: TypeScript
-   **State Management**: Redux Toolkit
-   **Styling**: Chakra UI, Framer Motion
-   **Rich Text Editor**: TinyMCE, Editor.js
-   **Routing**: React Router DOM

### Backend (`/server`)
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: MongoDB (with Mongoose ODM)
-   **Security**: xss-clean, hpp, express-mongo-sanitize, express-rate-limit, CORS
-   **Authentication**: JWT (JSON Web Tokens)

### Automation (`/automation`)
-   **Tool**: [Puppeteer](https://pptr.dev/)
-   **Scripts**: Node.js scripts for browser automation and data seeding (`seed_full.js`, `capture-screenshots.js`).

## 📂 Project Structure

```bash
/
├── client/         # Frontend React Application
├── server/         # Backend Express API
├── automation/     # Puppeteer Automation Scripts
└── README.md       # Project Documentation
```

## ⚙️ Installation & Setup

### Prerequisites
-   [Node.js](https://nodejs.org/) (v18+ recommended)
-   [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
-   [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/PranayD1807/Mellow-Tools.git
cd Mellow-Tools
```

### 2. Environment Variables

You need to set up environment variables for both the client and server.

**Client** (`client/.env`):
Create a `.env` file in the `client` directory:
```env
VITE_ENV=DEV # or PROD
VITE_EDITOR_KEY=your_tinymce_api_key
```

**Server** (`server/.env`):
Create a `.env` file in the `server` directory:
```env
DATABASE=your_mongodb_connection_string
# Example: mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_PASSWORD=your_mongodb_password
NODE_ENV=DEV # or PROD
TOKEN_SECRET=your_jwt_secret_key
# Optional
PORT=8080
```

### 3. Install Dependencies

You need to install dependencies for each part of the application separately.

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd ../server
npm install
```

**Automation (Optional):**
```bash
cd ../automation
npm install
```

## 🏃‍♂️ Running the Application

To run the full stack locally, you need to start both the client and server terminals.

**Start Server:**
The server runs on port `8080` by default.
```bash
cd server
npm start
```
API Endpoint: `http://localhost:8080/api/v1`

**Start Client:**
The client uses Vite and will typically run on `http://localhost:5173`.
```bash
cd client
npm run dev
```

## 🤖 Automation Scripts

The `automation` directory contains scripts for specific tasks:
-   **`seed_full.js`**: Populates the database with sample data (requires valid DB connection).
-   **`capture-screenshots.js`**: Captures screenshots of the application for documentation or testing.

Run them using Node:
```bash
cd automation
node seed_full.js
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is open source.
