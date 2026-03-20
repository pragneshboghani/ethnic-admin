const axios = require("axios");
const getAuthHeaders = require("./getAuthHeaders");

const postCategoryToPlatform = async (platform, category, path) => {
  try {
    const url = `${platform.api_endpoint}/wp-json/wp/v2/${path}`;

    const payload = {
      name: category.name,
      slug: category.slug,
      description: category.description,
      status: category.status || "publish",
    };

    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(platform),
    };

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
