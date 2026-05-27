const axios = require("axios");
const getAuthHeaders = require("./getAuthHeaders");
const getTaxonomyUrl = require("./getTaxonomyUrl");

async function deletePost(platform, platform_blog_id) {
  try {
    let url = getTaxonomyUrl(platform, "post");
    const headers = getAuthHeaders(platform);

    const res = await axios.delete(`${url}/${platform_blog_id}?force=true`, { headers });

    return {
      success: true,
      platform: platform.platform_name,
    };
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}

module.exports = deletePost;
