require("dotenv").config({
  path: "./.env",
});

const express = require("express");
const cors = require("cors");
const mysqlpool = require("./config/db");
const BlogRouter = require("./routes/blogs");
const PlatformRouter = require("./routes/platforms");
const DashboardRouter = require("./routes/dashboard");
const Mediarouter = require("./routes/media");
const SEORouter = require("./routes/seo");
const UserRouter = require("./routes/user");
const CategoryRouter = require("./routes/category");

const app = express();

const BACKEND_PORT = process.env.BACKEND_PORT;
const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/media", express.static("media"));

app.use("/api/blogs", BlogRouter);
app.use("/api/platforms", PlatformRouter);
app.use("/api/dashboard", DashboardRouter);
app.use("/api/media", Mediarouter);
app.use("/api/seo", SEORouter);
app.use("/api/user", UserRouter);
app.use("/api/category", CategoryRouter)

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
