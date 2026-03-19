const axios = require("axios");

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

    let headers = {};

    if (platform.auth_type === "token") {
      headers["Authorization"] = `Bearer ${platform.auth_token}`;
    } else if (platform.auth_type === "basic") {
      const base64 = Buffer.from(
        `${platform.username}:${platform.password}`,
      ).toString("base64");

      headers["Authorization"] = `Basic ${base64}`;
    }

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
