const cron = require("node-cron");
const mysqlpool = require("../config/db");
const postToPlatform = require("../utils/postToPlatform");
const { getPlatformsByIds } = require("../utils/platformHelper");

cron.schedule("* * * * *", async () => {
  try {
    const [blogs] = await mysqlpool.query(`
      SELECT * FROM blogs 
      WHERE status = 'future'
    `);

    if (blogs.length > 0) {
      console.log(`Found ${blogs.length} blogs scheduled for publishing.`);
      const currentTime = new Date();
      const now = currentTime.getTime();

      for (const blog of blogs) {
        const publishDate = blog.publish_date;
        const publishTime = publishDate.getTime();

        console.log(`Checking blog ID ${blog.id} - Scheduled publish time: ${publishDate}`);
        console.log(`Current time: ${currentTime}`);

        if (now >= publishTime) {
          const platformData = await getPlatformsByIds(blog.platforms);

          const payload = {
            status: "publish",
            slug: blog.slug,
          };

          const results = await Promise.all(
            platformData.map((platform) =>
              postToPlatform(platform, payload, payload.slug),
            ),
          );

          const responce = await mysqlpool.query(
            `UPDATE blogs SET status = 'publish' WHERE id = ?`,
            [blog.id],
          );

          console.log(`Published blog ID ${blog.id}`);
        }
      }
    }
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});
