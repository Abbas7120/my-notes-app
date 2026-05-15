## Folder structure :-
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

To run:
npm install → copy .env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/notesapp   → fill MongoDB URI
JWT_SECRET=your_super_secret_key_here

Final :
npm run dev
