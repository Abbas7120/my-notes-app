## To Run:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following variables:
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
