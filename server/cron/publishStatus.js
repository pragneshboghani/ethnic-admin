const cron = require("node-cron");
const mysqlpool = require("../config/db");
const postToPlatform = require("../utils/postToPlatform");
const { getPlatformsByIds } = require("../utils/platformHelper");
const { logBlogHistory, logSeoHistory } = require("../utils/blogHistory");

cron.schedule("* * * * *", async () => {
  try {
    const [blogs] = await mysqlpool.query(`
      SELECT * FROM blogs 
      WHERE status = 'future'
    `);

    if (blogs.length > 0) {
      const currentTime = new Date();
      const now = currentTime.getTime();

      for (const blog of blogs) {
        const publishDate = blog.publish_date;
        const publishTime = publishDate.getTime();

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

          await mysqlpool.query(
            `UPDATE blogs SET status = 'publish' WHERE id = ?`,
            [blog.id],
          );

          const [seoRows] = await mysqlpool.query(
            `SELECT * FROM seo_blog WHERE blog_id = ?`,
            [blog.id],
          );

          await mysqlpool.query(
            `UPDATE seo_blog SET publish_status = 'publish' WHERE blog_id = ?`,
            [blog.id],
          );

          for (const seoRow of seoRows) {
            await logSeoHistory({
              blogId: blog.id,
              seoId: seoRow.id,
              platformId: seoRow.platform_id ? Number(seoRow.platform_id) : null,
              actionType: "update",
              oldSeo: seoRow,
              newSeo: {
                ...seoRow,
                publish_status: "publish",
              },
              changedByUserId: null,
              changedByName: "system-cron",
              triggerSource: "cron",
            });
          }

          await logBlogHistory({
            blogId: blog.id,
            actionType: "update",
            oldBlog: blog,
            newBlog: {
              ...blog,
              status: "publish",
            },
            changedByUserId: null,
            changedByName: "system-cron",
            triggerSource: "cron",
          });

          console.log(`Published blog ID ${blog.id}`);
        }
      }
    }
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});
