# BlogSpace

A MERN blogging platform: sign up, write posts with images, read others' posts, comment.

## Run locally
1. Install Node.js 18+
2. In this folder:
   npm run install-all
   npm run dev
3. Open http://localhost:5173  (API runs on http://localhost:5000)

Config lives in `server/.env` (MONGO_URI, JWT_SECRET, PORT).
Uploaded images are stored in `server/uploads/`.
In MongoDB Atlas, allow your IP under Network Access.
