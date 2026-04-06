const axios = require("axios");
const getAuthHeaders = require("./getAuthHeaders");
const getTaxonomyUrl = require("./getTaxonomyUrl");

async function updateCategoryOnPlatform(platform, category, path, slug) {
  try {
    const baseUrl = getTaxonomyUrl(platform, path);
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(platform),
    };

    const lookupResponse = await axios.get(baseUrl, {
      params: { slug },
      headers,
    });

    if (!lookupResponse.data.length) {
      throw new Error(`${path} not found on platform with this slug`);
    }

    const payload = {
      name: category.name,
      description: category.description,
    };

    if (category.status) {
      payload.status = category.status;
    }

    const res = await axios.post(
      `${baseUrl}/${lookupResponse.data[0].id}`,
      payload,
      { headers },
    );

    return {
      success: true,
      platform: platform.platform_name,
      data: res.data,
    };
  } catch (error) {
    console.error(
      `Error updating ${path} on ${platform.platform_name}:`,
      error.response?.data || error.message,
    );

    return {
      success: false,
      platform: platform.platform_name,
      error: error.response?.data || error.message,
    };
  }
}

module.exports = updateCategoryOnPlatform;
