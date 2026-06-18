# Mellow Tools - Frontend (`/client`)

Welcome to the frontend code base of **Mellow Tools**, a clean, reactive, and feature-rich React client powered by **Vite**, **TypeScript**, and **Chakra UI (v3)**.

## 🚀 Key Features

- **Global Navigation & Interceptors**: Centralized API handlers with automated authentication token headers, token refresh interceptors, and dynamic `multipart/form-data` content type resolution for file uploads.
- **User Feedback Modal**: Accessible globally via the main Navigation Header and Mobile Menu. Users can draft submissions and upload up to two image attachments (JPEG/PNG, under 5MB). Includes stacking file selectors and pre-upload file preview management.
- **Admin Feedback Panel**: A secure viewer interface where administrators can view all submitted feedback, user metadata (display name and email), and expand uploaded image attachments.
- **Tools Dashboard**: Interfaces to manage and track notes, text templates with dynamic tag replacements, categorized bookmarks, and job applications.

## 🛠 Tech Stack

- **Framework**: React with Vite
- **Language**: TypeScript
- **Styling & Layout**: Chakra UI (v3), Framer Motion, Vanilla CSS
- **Notifications**: `react-toastify` for unified, sleek alerts
- **State Management**: Redux Toolkit (RTK)
- **Rich Text Editor**: TinyMCE and Editor.js integration

## ⚙️ Development Setup

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Configure Environment Variables
Create a `.env` file in the `client` directory:
```env
VITE_ENV=DEV # DEV or PROD
VITE_EDITOR_KEY=your_tinymce_api_key
VITE_LOGO_DEV_KEY=your_dev_logo_key

# Cloudinary (Optional, for client-side reference if needed)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
```

### 3. Install Dependencies
Run the following command inside the `client` directory:
```bash
npm install
```

### 4. Run Locally
Start the local Vite development server (typically served at `http://localhost:5173`):
```bash
npm run dev
```

### 5. Build for Production
Create an optimized production bundle:
```bash
npm run build
```
