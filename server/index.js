const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mysqlpool = require("./config/db");
const BlogRouter = require("./routes/blogs");
const PlatformRouter = require("./routes/platforms");

dotenv.config();
const app = express();

const BACKEND_PORT = process.env.BACKEND_PORT;
const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

app.use(cors());
app.use(express.json());

app.use('/api/blogs',BlogRouter)
app.use('/api/platforms', PlatformRouter)

app.get("/", (req, res) => {
  res.send("Welcome to Ethnic Blog");
});

app.listen(BACKEND_PORT, async () => {
  try {
    const connection = await mysqlpool.getConnection();
    console.log("Database Connected Successfully");
    connection.release();

    console.log(`Server Running On ${BACKEND_DOMAIN}${BACKEND_PORT}`);
  } catch (error) {
    console.log("Database Connection Failed:", error);
  }
});
