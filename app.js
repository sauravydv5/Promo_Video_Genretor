const express = require("express");
const connectDB = require("./src/config/db");
const mediaRoutes = require("./src/routers/mediaRoutes");
const cors = require("cors");
const path = require("path");

const app = express();

// ✅ CORS only once
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://willowy-paletas-6ae5c1.netlify.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

// ✅ Serve static folders (important for frontend preview!)
app.use("/processed", express.static(path.join(__dirname, "processed")));
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/output", express.static(path.join(__dirname, "output")));

// ✅ Register media routes
app.use("/", mediaRoutes);

const PORT = process.env.PORT || 4001;

connectDB()
  .then(() => {
    console.log("✅ Database connection established!");
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
