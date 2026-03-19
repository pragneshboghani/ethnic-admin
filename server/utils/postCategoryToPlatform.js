const axios = require("axios");

const postCategoryToPlatform = async (platform, category, path) => {
  try {
    const url = `${platform.api_endpoint}/wp-json/wp/v2/${path}`;

    const payload = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status || "publish",
    };

    let headers = {
      "Content-Type": "application/json",
    };

    if (platform.auth_type === "token") {
      headers.Authorization = `Bearer ${platform.auth_token}`;
    }

    if (platform.auth_type === "basic") {
      const base64 = Buffer.from(
        `${platform.username}:${platform.password}`,
      ).toString("base64");

      headers.Authorization = `Basic ${base64}`;
    }

    const res = await axios.post(url, payload, { headers });

    return {
      success: true,
      platform: platform.platform_name,
      data: res.data,
    };
  } catch (error) {
    console.error(
      `Error posting category to ${platform.platform_name}:`,
      error.response?.data || error.message,
    );

    return {
      success: false,
      platform: platform.platform_name,
      error: error.response?.data || error.message,
    };
  }
};

module.exports = postCategoryToPlatform;
