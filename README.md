# Full-Stack Weather Application

A production-ready full-stack Weather Application built from scratch using HTML5, CSS3, Vanilla JavaScript, Node.js, Express.js, and MongoDB Atlas.

## ✨ Features

- **Modern UI/UX**: Glassmorphism design and responsive layout.
- **Dynamic Backgrounds**: Theme changes automatically based on the current weather condition (e.g., snow, rain, clear, clouds).
- **Real-Time Data**: Integrates the OpenWeatherMap API for live temperature, humidity, and wind speed.
- **Unit Conversion**: Seamlessly toggle between Celsius and Fahrenheit.
- **Search History**: Automatically caches and retrieves the top 5 recent searches using MongoDB Atlas.
- **Robust Error Handling**: Graceful fallback UI elements for missing cities or failed network queries.

## 📁 Project Structure

```text
weather/
├── backend/
│   ├── models/
│   │   └── Weather.js      # Mongoose Schema for Search History
│   ├── .env.example        # Environment variables example
│   ├── package.json        
│   └── server.js           # Express Application
├── frontend/
│   ├── index.html          # UI Layout
│   ├── style.css           # Styling & Animations
│   └── script.js           # Client-side Logic & API Fetches
└── README.md
```

## 🛠️ Local Development

### 1. Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   PORT=5000
   MONGO_URI=your_mongodb_cluster_uri_here
   API_KEY=your_openweathermap_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The API will run at `http://localhost:5000/api`.

### 2. Frontend Setup

1. Since we used Vanilla JS, there is no build step required.
2. Open `frontend/index.html` directly in your browser using "Live Server" via VSCode or a similar local web server.

---

## 🚀 Deployment Guide

### Step 1: MongoDB Atlas Setup
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign in.
2. Create a Free Cluster (M0).
3. Under **Database Access**, create a user and copy the generated password.
4. Under **Network Access**, add the IP address `0.0.0.0/0` to allow access from anywhere (especially Render).
5. Go to Databases -> **Connect** -> "Connect your application" and copy the MongoDB connection string. 
6. Replace `<password>` with your database user password and paste it into `MONGO_URI` in Render.

### Step 2: Deploy Backend on Render
1. Go to [Render](https://render.com/) and connect your GitHub account.
2. Create a new **Web Service**.
3. Connect the GitHub repository that holds this code.
4. Set the **Root Directory** to `backend`.
5. Set **Build Command** to: `npm install`
6. Set **Start Command** to: `node server.js`
7. Click on **Advanced** -> **Environment Variables** and add the following:
   - `PORT`: 5000
   - `MONGO_URI`: `your_mongodb_atlas_connection_string`
   - `API_KEY`: `your_openweathermap_api_key`
8. Deploy and copy your new backend URL (e.g., `https://your-backend-name.onrender.com`).

### Step 3: Connect Frontend to the Live Backend
1. Open `frontend/script.js`.
2. Locate the `getApiBaseUrl` block at the very top.
3. Replace the placeholder URL `'https://your-production-backend.onrender.com/api'` with the Render API domain you just received. For example:
   ```javascript
   // Change this:
   return 'https://your-production-backend.onrender.com/api';
   // To your Render URL:
   return 'https://my-backend.onrender.com/api'; 
   ```

### Step 4: Deploy Frontend on Vercel or GitHub Pages
**Option A: Vercel (Recommended)**
1. Go to [Vercel](https://vercel.com/) and sign in via GitHub.
2. Import this repository.
3. Set the **Root Directory** setting to `frontend`.
4. Leave the Build Command and Output Directory as default (since it’s a static HTML project).
5. Click **Deploy**. Vercel will process and give you a live domain automatically.

**Option B: GitHub Pages**
1. Push your code to a public repository on GitHub.
2. Go to **Settings** -> **Pages** in the repository.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Set the branch to `main`. If asked for a folder path, make sure `frontend` is set or move the static contents to the root of the branch.
5. Save. Your frontend will be live at `https://<your-username>.github.io/<repo-name>/`.
