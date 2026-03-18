const axios = require("axios");

const postToPlatform = async (platform, blogData) => {
  try {
    console.log("enter in postToPlatform");
    const url = `${platform.api_endpoint}/posts`;

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
      status: blogData.status === "draft" ? "draft" : "publish",
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
