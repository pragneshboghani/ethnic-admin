require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mysqlpool = require("./config/db");
const blogRouter = require("./routes/blogs");
const categoryRouter = require("./routes/category");
const dashboardRouter = require("./routes/dashboard");
const mediarouter = require("./routes/media");
const platformRouter = require("./routes/platforms");
const seoRouter = require("./routes/seo");
const tagRouter = require("./routes/tags");
const userRouter = require("./routes/user");

const app = express();

const BACKEND_PORT = process.env.BACKEND_PORT;
const BACKEND_DOMAIN = process.env.BACKEND_DOMAIN;

app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));

app.use("/media", express.static("media"));

app.use("/api/blogs", blogRouter);
app.use("/api/platforms", platformRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/media", mediarouter);
app.use("/api/seo", seoRouter);
app.use("/api/user", userRouter);
app.use("/api/category", categoryRouter)
app.use("/api/tags",tagRouter)

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
