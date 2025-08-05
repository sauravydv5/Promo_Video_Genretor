const express = require("express");
const connectDB = require("./src/config/db");
const router = require("./src/routers/mediaRoutes");

const app = express();

app.use("/", (req, res) => {
  res.send("Server Running...");
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use("/api/media", router);

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
