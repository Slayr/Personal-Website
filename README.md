# Personal Website

A full-stack personal website designed to showcase blog posts, photography, and provide an administrative interface for content management.

## ✨ Features

*   **Dynamic Blog:**
    *   Create, read, update, and delete blog posts.
    *   Supports Markdown formatting for rich content.
    *   Image uploads directly within blog posts.
*   **Photography Gallery:**
    *   Display a curated collection of photographs.
    *   Automatic conversion of TIFF images to optimized JPEGs upon upload.
    *   Extraction and display of EXIF metadata for each photo.
    *   Option to download original TIFF files.
*   **Secure Admin Panel:**
    *   Protected login for administrators.
    *   Manage blog posts (create, edit, delete).
    *   Manage photos (upload, delete).
*   **Interactive User Interface:**
    *   Modern and responsive design built with Material-UI.
    *   Interactive background elements for an engaging user experience.
    *   Smooth page transitions and animations using Framer Motion.

## 🚀 Technologies Used

This project is built with a modern JavaScript stack, separating the frontend and backend concerns.

### Frontend

*   **React.js:** A JavaScript library for building user interfaces.
*   **Vite:** A fast build tool that provides a lightning-fast development experience.
*   **Material-UI (MUI):** A comprehensive React UI library implementing Google's Material Design.
*   **Emotion:** A CSS-in-JS library for styling React components.
*   **React Router DOM:** For declarative routing in React applications.
*   **Framer Motion:** A production-ready motion library for React.
*   **React-TSParticles / TS.Particles:** For creating interactive particle backgrounds.
*   **React Markdown:** For rendering Markdown content in blog posts.
*   **@fontsource/roboto & @fontsource/space-mono:** For self-hosting Google Fonts.

### Backend

*   **Node.js:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
*   **Express.js:** A fast, unopinionated, minimalist web framework for Node.js.
*   **`dotenv`:** For loading environment variables from a `.env` file.
*   **`jsonwebtoken` (JWT):** For secure authentication and authorization.
*   **`bcryptjs`:** For hashing passwords securely.
*   **`multer`:** Middleware for handling `multipart/form-data`, primarily for file uploads.
*   **`sharp`:** High-performance Node.js image processing, used for TIFF to JPEG conversion.
*   **`exiftool-vendored`:** A Node.js wrapper for ExifTool, used for extracting image metadata.
*   **`fs-extra`:** Extends Node's `fs` module with more convenient methods.
*   **`cors`:** Node.js middleware for enabling Cross-Origin Resource Sharing.
*   **`body-parser`:** Node.js middleware for parsing incoming request bodies.
*   **`chokidar`:** A robust, cross-platform, and efficient file watcher.

### Development Tools

*   **ESLint:** For maintaining code quality and consistency.

## ⚙️ Setup and Installation

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository

```bash
git clone git@github.com:Slayr/Personal-Website.git
cd Personal-Website
```

### 2. Install Dependencies

The project has separate `package.json` files for the frontend (root directory) and the backend (`server/` directory).

```bash
# Install frontend dependencies
npm install

# Navigate to the backend directory and install its dependencies
cd server
npm install
cd .. # Go back to the root directory
```

### 3. Configure Environment Variables (Backend)

Create a `.env` file in the `server/` directory with the following content:

```dotenv
ADMIN_PASSWORD=your_secure_admin_password
JWT_SECRET=your_long_and_random_jwt_secret_key
```

*   Replace `your_secure_admin_password` with a strong password for your admin login.
*   Replace `your_long_and_random_jwt_secret_key` with a long, random string. This is crucial for JWT security.

### 4. Build the Frontend

The frontend needs to be built into static files that the backend can serve.

```bash
npm run build
```
This command will compile your React application and place the output in the `public/` directory, which your Node.js backend is configured to serve.

### 5. Run the Application

First, start the backend server:

```bash
cd server
npm start
```

You should see a message like `Server running on port 5000`.

Now, open your web browser and navigate to `http://localhost:5000`.

## 🔑 Admin Panel Access

To access the admin panel, navigate to `/admin/login` on your running website (e.g., `http://localhost:5000/admin/login`) and log in using the `ADMIN_PASSWORD` you set in your `.env` file.

## ☁️ Deployment

This application is designed for easy deployment to platforms like [Render.com](https://render.com/).

*   **Backend (Web Service):** Deploy the `server/` directory as a Node.js Web Service. Configure `ADMIN_PASSWORD` and `JWT_SECRET` as environment variables on Render.
*   **Frontend (Static Site):** Deploy the root directory as a Static Site. Configure `VITE_API_URL` as an environment variable pointing to your deployed backend's URL. Ensure the build command is `npm install && npm run build` and the publish directory is `public`.

---

Feel free to customize this README further with more details, screenshots, or specific instructions relevant to your project!