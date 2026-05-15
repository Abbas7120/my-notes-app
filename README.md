## Project Structure

```text
notes-app/
├── configDB/
│   ├── db.js
│   ├── User.js
│   └── Note.js
├── controllers/
│   ├── authController.js
│   └── notesController.js
├── middleware/
│   └── authMiddleware.js
├── routes/
│   ├── authRoutes.js
│   └── notesRoutes.js
├── .env.example
├── package.json
└── server.js
```

## To Run:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory based on `.env.example`:
   ```env
   PORT=3000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/notesapp
   JWT_SECRET=your_super_secret_key_here
   ```
   *Make sure to replace `<username>` and `<password>` with your actual MongoDB credentials.*

3. **Start the development server:**
   ```bash
   npm run dev
   ```
