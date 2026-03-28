const Router = require("express");
const mysqlpool = require("../config/db");
const authMiddleware = require("../middleware/authMiddleware");

const dashboardRouter = Router();

dashboardRouter.get("/all", authMiddleware, async (req, res) => {
  try {
    const [[statusCount]] = await mysqlpool.query(`
SELECT 
  COUNT(*) as TotalBlogs,
  COALESCE(SUM(status='publish'), 0) as PublishedBlogs,
  COALESCE(SUM(status='future'), 0) as ScheduledBlogs,
  COALESCE(SUM(status='draft'), 0) as DraftBlogs
FROM blogs
    `);

    const [[platformCount]] = await mysqlpool.query(`
      SELECT COUNT(*) as TotalPlatforms FROM platforms
    `);

    const DashboardData = {
      ...statusCount,
      ...platformCount,
    };

    res.status(200).send({
      success: true,
      countData: DashboardData,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

dashboardRouter.get("/allData", authMiddleware, async (req, res) => {
  try {
    const [results] = await mysqlpool.query(`
      SELECT * FROM blogs;
      SELECT * FROM platforms;
      SELECT * FROM category;
      SELECT * FROM tags;
      SELECT * FROM media;
      SELECT * FROM seo_blog;
    `);

    const data = {
      blogData: results[0],
      plateformData: results[1],
      categoryData: results[2],
      tagsData: results[3],
      mediaData: results[4],
      seoData: results[5],
    };

    res.status(200).send({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching Data:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = dashboardRouter;
