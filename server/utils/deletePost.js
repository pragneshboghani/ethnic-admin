const axios = require("axios");
const getAuthHeaders = require("./getAuthHeaders");

async function deletePost(platform, slug) {
  try {
    const resg = await axios.get(
      `${platform.api_endpoint}/wp-json/wp/v2/posts`,
      {
        params: { slug },
      },
    );

    if (!resg.data.length) {
      throw new Error("Post not found on platform with this slug");
    }

    const postId = resg.data[0].id;

    const headers = getAuthHeaders(platform);

    const res = await axios.delete(
      `${platform.api_endpoint}/wp-json/wp/v2/posts/${postId}?force=true`,
      { headers },
    );

    return {
      success: true,
      platform: platform.platform_name,
    };
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}

module.exports = deletePost;
