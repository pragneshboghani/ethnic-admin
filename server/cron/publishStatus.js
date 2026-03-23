const cron = require("node-cron");
const axios = require("axios");
const mysqlpool = require("../config/db");
const getAuthHeaders = require("../utils/getAuthHeaders");

cron.schedule("* * * * *", async () => {
  try {
    const [blogs] = await mysqlpool.query(`
      SELECT * FROM blogs 
      WHERE status = 'future'
    `);

    const currentTime = new Date();
    const now = currentTime.getTime();

    for (const blog of blogs) {
      const publishDate = blog.publish_date;
      const publishTime = publishDate.getTime();

      if (now >= publishTime) {

        const [platforms] = await mysqlpool.query(
          `SELECT * FROM platforms WHERE id IN (?)`,
          [blog.platforms],
        );

        for (const platform of platforms) {
          let url = "";
          if (platform.plateform_type == "wordpress") {
            url = `${platform.api_endpoint}/wp-json/wp/v2/posts`;
          } else {
            url = `${platform.api_endpoint}/blog`;
          }

          const headers = getAuthHeaders(platform);
          const res = await axios.get(`${url}`, {
            headers,
            params: { slug: blog.slug, status: "any" },
          });

          const postId = res.data[0].id;

          const update = await axios.put(
            `${url}/${postId}`,
            { status: "publish" },
            { headers },
          );

          console.log("update", update.data);
          const responce = await mysqlpool.query(
            `UPDATE blogs SET status = 'publish' WHERE id = ?`,
            [blog.id],
          );

          console.log("responce", responce);
        }
        console.log(`Published blog ID ${blog.id}`);
      }
    }
  } catch (err) {
    console.error("Cron error:", err.message);
  }
});
