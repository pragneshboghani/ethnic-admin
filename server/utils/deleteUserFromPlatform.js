const getAuthHeaders = require("./getAuthHeaders");
const getTaxonomyUrl = require("./getTaxonomyUrl");
const axios = require("axios");

const deleteUserFromPlatform = async (platform, user) => {
  try {
    const url = getTaxonomyUrl(platform, "user");
    const headers = getAuthHeaders(platform);

    const userRes = await axios.get(url, {
      headers,
      params: {
        search: user.name,
      },
    });

    if (!userRes.data.length) {
      return {
        success: false,
        message: "User not found on WordPress",
      };
    }

    const userId = userRes.data[0].id;

    const res = await axios.delete(`${url}/${userId}?force=true&reassign=1`, {
      headers,
    });

    return {
      success: true,
      platform: platform.platform_name,
      platform_id: platform.id,
    };
  } catch (error) {
    console.log("DELETE ERROR:", error?.response?.data || error.message);

    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

module.exports = deleteUserFromPlatform;
