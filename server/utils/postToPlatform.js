const axios = require("axios");
const generateSlug = require("./generateSlug");

const postToPlatform = async (platform, blogData) => {
  try {
    const url = `${platform.api_endpoint}/wp-json/wp/v2/posts`;

    let headers = {};

    if (platform.auth_type === "token") {
      headers["Authorization"] = `Bearer ${platform.auth_token}`;
    } else if (platform.auth_type === "basic") {
      const base64 = Buffer.from(
        `${platform.username}:${platform.password}`,
      ).toString("base64");

      headers["Authorization"] = `Basic ${base64}`;
    }

    const payload = {
      title: blogData.blog_title,
      excerpt: blogData.short_excerpt,
      content: blogData.full_content,
      slug: await generateSlug(blogData.blog_title),
      status: blogData.status === "draft" ? "draft" : "publish",
      categories: blogData.category,
      tags: blogData.tags
    };

    const response = await axios.post(url, payload, { headers });

    return {
      success: true,
      platform: platform.platform_name,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      platform: platform.platform_name,
      error: error.message,
    };
  }
};

module.exports = postToPlatform;
