const axios = require("axios");
const getTaxonomyUrl = require("./getTaxonomyUrl");
const getAuthHeaders = require("./getAuthHeaders");
const mysqlpool = require("../config/db");

const postUserToPlatforms = async (platform, userData, userId = null) => {
  try {
    const url = getTaxonomyUrl(platform, "user");
    const headers = getAuthHeaders(platform);
    let userRes = null;

    if (userId) {
      const [[user]] = await mysqlpool.query(
        `SELECT * FROM users WHERE id = ?`,
        [userId],
      );
      const usedPlarforms = user.platform_userId;
      const thisPlatform = usedPlarforms.find(
        (p) => p.platform_id === platform.id,
      );
      if (thisPlatform) {
        userRes = await axios.get(`${url}/${thisPlatform.user_id}`, {
          headers,
        });
      }
    }

    const plainDescription = userData?.description
      ?.replace(/<[^>]*>/g, "")
      ?.replace(/&nbsp;/g, " ")
      ?.trim();

    const userDetail = {
      username: userData?.name?.split(" ").join("-").toLowerCase() || "",
      email: userData?.email || "",
      password: userData?.password,
      roles: ["author"],
      name: userData?.name || "",
      first_name: userData?.name?.split(" ")[0] || "",
      last_name: userData?.name?.split(" ").slice(1).join(" ") || "",
      description: plainDescription || "",
    };

    // update user if exists
    if (userRes && userRes.data) {
      const updateUrl = url + "/" + userRes.data.id;
      await axios.put(updateUrl, userDetail, {
        headers,
      });
      return {
        success: true,
        platform_id: platform.id,
        platform_name: platform.platform_name,
        data: userRes.data,
      };
    }

    if (!userData?.password) {
      return {
        success: false,
        message: "Password is required for WordPress user creation",
      };
    }

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
  } catch (error) {
    console.log("ERROR RESPONSE", error?.response?.data || error.message);

    return {
      success: false,
      message: error?.response?.data?.message || error.message,
    };
  }
};

module.exports = postUserToPlatforms;
