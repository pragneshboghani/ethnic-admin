const axios = require("axios");
const getAuthHeaders = require("./getAuthHeaders");

async function deletePost(platform, slug) {
  try {
    let url = "";
    if (platform.plateform_type == "wordpress") {
      url = `${platform.api_endpoint}/wp-json/wp/v2/posts`;
    } else {
      url = `${platform.api_endpoint}/blog`;
    }
    const headers = getAuthHeaders(platform);
    const resg = await axios.get(url, {
      params: { slug, status: "any" },
      headers,
    });

    if (!resg.data.length) {
      throw new Error("Post not found on platform with this slug");
    }

    const postId = resg.data[0].id;

    const res = await axios.delete(
      `${url}/${postId}?force=true`,
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
