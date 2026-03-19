const axios = require("axios");
const generateSlug = require("./generateSlug");

const postToPlatform = async (platform, blogData, slug = null) => {
  try {
    let url = `${platform.api_endpoint}/wp-json/wp/v2/posts`;
    let method = "post";

    let headers = {};

    if (platform.auth_type === "token") {
      headers["Authorization"] = `Bearer ${platform.auth_token}`;
    } else if (platform.auth_type === "basic") {
      const base64 = Buffer.from(
        `${platform.username}:${platform.password}`,
      ).toString("base64");

      headers["Authorization"] = `Basic ${base64}`;
    }

    if (slug) {
      const res = await axios.get(url, {
        headers,
        params: { slug },
      });

      if (!res.data.length) {
        throw new Error("Post not found on platform with this slug");
      }

      const postId = res.data[0].id;

      url = `${platform.api_endpoint}/wp-json/wp/v2/posts/${postId}`;
      method = "put";
    }

    const payload = {
      title: blogData.blog_title,
      excerpt: blogData.short_excerpt,
      content: blogData.full_content,
      slug: await generateSlug(blogData.blog_title),
      status: (blogData.status).toLowerCase(),
      categories: (blogData.category || []).map(Number),
      tags: blogData.tags,
    };

    const response = await axios({
      method,
      url,
      data: payload,
      headers,
    });

    return {
      success: true,
      platform: platform.platform_name,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      platform: platform.platform_name,
      error: error.response?.data || error.message,
    };
  }
};

module.exports = postToPlatform;
