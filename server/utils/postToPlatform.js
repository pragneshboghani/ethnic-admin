const axios = require("axios");
const generateSlug = require("./generateSlug");
const getAuthHeaders = require("./getAuthHeaders");
const mysqlpool = require("../config/db");

const postToPlatform = async (platform, blogData, slug = null) => {
  try {
    let url = "";
    if (platform.plateform_type == "wordpress") {
      url = `${platform.api_endpoint}/wp-json/wp/v2/posts`;
    } else {
      url = `${platform.api_endpoint}/blog`;
    }

    let method = "post";
    let featuredMediaId = null;

    if (blogData.featured_image) {
      const [[image]] = await mysqlpool.query(
        `SELECT * FROM media WHERE file_url=?`,
        [blogData.featured_image],
      );

      if (image) {
        featuredMediaId = image.wp_id;
      }
    }

    const headers = getAuthHeaders(platform);
    if (slug) {
      const res = await axios.get(url, {
        headers,
        params: { slug },
      });

      if (!res.data.length) {
        throw new Error("Post not found on platform with this slug");
      }

      const postId = res.data[0].id;

      if (platform.plateform_type == "wordpress") {
        url = `${platform.api_endpoint}/wp-json/wp/v2/posts/${postId}`;
      } else {
        url = `${platform.api_endpoint}/blog/${postId}`;
      }
      method = "put";
    }

    const payload = {
      title: blogData.blog_title,
      excerpt: blogData.short_excerpt,
      content: blogData.full_content,
      slug: await generateSlug(blogData.blog_title),
      status: blogData.status.toLowerCase(),
      categories: (blogData.category || []).map(Number),
      tags: blogData.tags,
      ...(featuredMediaId && { featured_media: featuredMediaId }),
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
