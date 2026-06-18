# Mellow-Tools

Welcome to **Mellow Tools** — a platform crafted out of a passion for simplifying digital workflows. My goal is to provide intuitive, user-friendly tools that help developers, designers, and tech enthusiasts alike streamline their tasks, enhance productivity, and focus on what truly matters.

Visit [Mellow Tools](https://mellow-tools.vercel.app/) for the live application.

## 🚀 Features

Mellow Tools offers a suite of utilities to manage your professional life and workflows:

-   **Job Tracker**: Keep track of your job applications, statuses (Applied, Interview, Offer, Rejected), and history in one centralized dashboard.
-   **Notes**: Create, edit, and organize rich-text notes for your projects or personal thoughts.
-   **Text Templates**: Manage reusable text snippets for repetitive tasks like cold emails or cover letters.
-   **Bookmarks**: Save and categorize important links for quick access.
-   **User Feedback**: Submit text feedback along with up to 2 image attachments directly from the app. Uploads are streamed directly to Cloudinary.
-   **Admin Dashboard**: Administrators can view real-time statistics (total users, users with 2FA/encryption enabled, monthly activity graphs) and browse/manage submitted feedbacks.
-   **Automation**: Backend automation capabilities and scripts to streamline data management.

## 🛠 Tech Stack

The project is built using a modern full-stack architecture (MERN):

### Frontend (`/client`)
-   **Framework**: [React](https://reactjs.org/) with [Vite](https://vitejs.dev/)
-   **Language**: TypeScript
-   **State Management**: Redux Toolkit
-   **Styling**: Chakra UI (v3), Framer Motion
-   **Rich Text Editor**: TinyMCE, Editor.js
-   **Routing**: React Router DOM

### Backend (`/server`)
-   **Runtime**: [Node.js](https://nodejs.org/)
-   **Framework**: [Express.js](https://expressjs.com/)
-   **Database**: MongoDB (with Mongoose ODM)
-   **Image Storage & Processing**: Cloudinary (streamed directly via `multer` and `multer-storage-cloudinary`)
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
VITE_LOGO_DEV_KEY=your_dev_logo_key

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Server** (`server/.env`):
Create a `.env` file in the `server` directory:
```env
DATABASE=your_mongodb_connection_string
# Example: mongodb+srv://<username>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_PASSWORD=your_mongodb_password
NODE_ENV=DEV # or PROD
TOKEN_SECRET=your_jwt_secret_key
TEMP_PASS=your_temp_password

# Cloudinary Config
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

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

## 🧪 Testing

The backend contains a suite of Jest tests covering all routes, middleware, and database operations.

- **ES Modules (ESM) Mocking**: The test runner executes with the `--experimental-vm-modules` flag to enable ES Modules support in Jest.
- **In-Memory Database**: Tests utilize `mongodb-memory-server` to automatically spin up a local in-memory instance. Data is completely wiped between tests to ensure strict isolation.
- **Cloudinary Mocking**: Cloudinary integrations are fully mocked using `jest.unstable_mockModule` and dynamic imports to bypass network requirements.

To run the test suite and generate a detailed code coverage report:
```bash
cd server
npm run test
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
