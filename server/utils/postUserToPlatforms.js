const axios = require("axios");
const getTaxonomyUrl = require("./getTaxonomyUrl");
const getAuthHeaders = require("./getAuthHeaders");
const crypto = require('crypto');

const postUserToPlatforms = async (platform, userData, userId = null) => {
  try {
    const url = getTaxonomyUrl(platform, "user");
    const headers = getAuthHeaders(platform);

    const randomPasswordForPlatform = crypto.randomBytes(8).toString('hex');

    const userRes = await axios.get(`${url}?search=${userData?.email}`, {
      headers,
    });

    const plainDescription = userData?.description
      ?.replace(/<[^>]*>/g, "")
      ?.replace(/&nbsp;/g, " ")
      ?.trim();

    const userDetail = userRes?.data?.length ? {
      name: userData?.name || "",
      first_name: userData?.name?.split(" ")[0] || "",
      last_name: userData?.name?.split(" ").slice(1).join(" ") || "",
      description: plainDescription || "",
    } : {
      username: userData?.name?.split(" ")?.[0]?.toLowerCase() || "",
      email: userData?.email || "",
      password: randomPasswordForPlatform,
      roles: ["author"],
      name: userData?.name || "",
      first_name: userData?.name?.split(" ")[0] || "",
      last_name: userData?.name?.split(" ").slice(1).join(" ") || "",
      description: plainDescription || "",
    };

    // update user if exists
    if (userRes && userRes.data?.length) {
      const updateUrl = url + "/" + userRes.data?.[0].id;
      await axios.put(updateUrl, userDetail, {
        headers,
      });
      
      return {
        success: true,
        platform_id: platform.id,
        platform_name: platform.platform_name,
        data: userRes.data?.[0],
      };
    } else {
      // create user
      const res = await axios.post(url, userDetail, {
        headers,
      });

      return {
        success: true,
        platform_id: platform.id,
        platform_name: platform.platform_name,
        data: res.data,
      };
    }
  } catch (error) {
    console.log("ERROR RESPONSE", error?.response?.data || error.message);

    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

module.exports = postUserToPlatforms;
