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

### Deployment with Cloudflare Tunnel (from Raspberry Pi)

This method allows you to securely expose your local Raspberry Pi server to the internet via a Cloudflare Tunnel, without opening any inbound firewall ports.

**Prerequisites:**

*   **Cloudflare Account:** An active Cloudflare account.
*   **Domain Name:** A domain name added to your Cloudflare account and its DNS managed by Cloudflare.
*   **Website Running on Pi:** Your full-stack website (both frontend and backend) must be running on your Raspberry Pi Zero 2 W, accessible locally at `http://localhost:5000`.

**Important Note on Frontend API Calls:**

When deploying with Cloudflare Tunnel, your frontend will make API calls to the same public domain as the website itself. Therefore, **before building your frontend for Cloudflare Tunnel deployment**, you need to set the `VITE_API_URL` environment variable to your chosen public domain. This can be done by creating a `.env` file in your project's root directory (where `package.json` is) with the following content:

```dotenv
VITE_API_URL=https://your-chosen-domain.com
```

Replace `https://your-chosen-domain.com` with the actual domain you will use for your Cloudflare Tunnel (e.g., `https://mywebsite.example.com`). After creating this `.env` file, run `npm run build` again to ensure the frontend is built with the correct API URL.

**Steps to Deploy via Cloudflare Tunnel:**

These steps are executed on your Raspberry Pi Zero 2 W via SSH.

#### 1. Install `cloudflared` on your Raspberry Pi

```bash
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64
chmod +x cloudflared-linux-arm64
sudo mv cloudflared-linux-arm64 /usr/local/bin/cloudflared
cloudflared --version
```

#### 2. Authenticate `cloudflared` with your Cloudflare Account

```bash
cloudflared tunnel login
```
Copy the provided URL, paste it into a web browser on your computer, and follow the instructions to authenticate with your Cloudflare account and select your domain.

#### 3. Create and Configure Your Tunnel

Choose a name for your tunnel (e.g., `personal-website-tunnel`).

```bash
cloudflared tunnel create personal-website-tunnel
```
Note down the **Tunnel ID** (a long string of characters) from the output.

Create a `config.yml` file in the `~/.cloudflared/` directory:

```bash
nano ~/.cloudflared/config.yml
```
Paste the following content, replacing `<YOUR_TUNNEL_ID>` and `your-subdomain.your-domain.com`:

```yaml
tunnel: <YOUR_TUNNEL_ID>
credentials-file: /home/pi/.cloudflared/<YOUR_TUNNEL_ID>.json

ingress:
  - hostname: your-subdomain.your-domain.com
    service: http://localhost:5000
  - service: http_status:404
```
Save and exit.

#### 4. Create DNS Record for Your Tunnel

```bash
cloudflared tunnel route dns personal-website-tunnel your-subdomain.your-domain.com
```
Replace `personal-website-tunnel` with your tunnel name and `your-subdomain.your-domain.com` with your chosen public domain.

#### 5. Run Your Tunnel

```bash
cloudflared tunnel run personal-website-tunnel
```
Your website should now be accessible at `your-subdomain.your-domain.com`.

#### 6. (Optional) Run `cloudflared` as a System Service

To ensure your tunnel starts automatically on boot and runs reliably in the background:

```bash
sudo nano /etc/systemd/system/cloudflared.service
```
Paste the following content, replacing `<YOUR_TUNNEL_ID>`:

```ini
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
TimeoutStartSec=0
Type=notify
ExecStart=/usr/local/bin/cloudflared tunnel run --config /home/pi/.cloudflared/config.yml <YOUR_TUNNEL_ID>
Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```
Save and exit.

```bash
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

---

Feel free to customize this README further with more details, screenshots, or specific instructions relevant to your project!
