const axios = require("axios");
const getAuthHeaders = require("./getAuthHeaders");
const getTaxonomyUrl = require("./getTaxonomyUrl");

async function deleteCategory(platform, slug, type) {
  try {
    const url = getTaxonomyUrl(platform, type);
    const headers = getAuthHeaders(platform);
    const resg = await axios.get(url, {
      params: { slug },
      headers,
    });

    if (!resg.data.length) {
      throw new Error(`${type} not found on platform with this slug`);
    }

    const catId = resg.data[0].id;
    const res = await axios.delete(`${url}/${catId}?force=true`, { headers });

    return {
      success: true,
      platform: platform.platform_name,
    };
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}

module.exports = deleteCategory;
