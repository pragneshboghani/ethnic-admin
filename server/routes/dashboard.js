const Router = require("express");
const mysqlpool = require("../config/db");

const DashboardRouter = Router();

DashboardRouter.get("/all", async (req, res) => {
  try {
    const [[statusCount]] = await mysqlpool.query(`
      SELECT 
        COUNT(*) as TotalBlogs,
        SUM(status='published') as PublishedBlogs,
        SUM(status='scheduled') as ScheduledBlogs,
        SUM(status='draft') as DraftBlogs
      FROM blogs
    `);

    const [[platformCount]] = await mysqlpool.query(`
      SELECT COUNT(*) as TotalPlatforms FROM platforms
    `);

    const DashboardData = {
      ...statusCount,
      ...platformCount
    };

    res.status(200).send({
      success: true,
      countData:DashboardData
    });

  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

module.exports = DashboardRouter;
