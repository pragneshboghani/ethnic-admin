const axios = require("axios");
const getTaxonomyUrl = require("./getTaxonomyUrl");
const getAuthHeaders = require("./getAuthHeaders");
const crypto = require('crypto');

const slugifyUsername = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);

// WordPress usernames must be globally unique on each site, so deriving them
// from the first name alone collides whenever two authors share one (e.g.
// "Pragnesh Boghani" and "Pragnesh Boghani Emp" both became "pragnesh").
// Use the full name, falling back to the email local part.
const buildBaseUsername = (userData) =>
  slugifyUsername(userData?.name) ||
  slugifyUsername(String(userData?.email || "").split("@")[0]) ||
  "user";

const postUserToPlatforms = async (platform, userData, userId = null) => {
  try {
    const url = getTaxonomyUrl(platform, "user");
    const headers = getAuthHeaders(platform);

    const randomPasswordForPlatform = crypto.randomBytes(8).toString('hex');

    // The email must be URL-encoded: a raw "+" in a query string decodes to a
    // space, so plus-addressed emails (user+tag@example.com) silently fail to
    // match an existing remote user and get treated as a new one.
    const userRes = await axios.get(`${url}?search=${encodeURIComponent(userData?.email || "")}`, {
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
      username: buildBaseUsername(userData),
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
      // create user — retry with a numeric suffix if the derived username is
      // already taken on this platform (two authors with the same full name).
      const baseUsername = buildBaseUsername(userData);
      let lastError = null;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const username = attempt === 0 ? baseUsername : `${baseUsername}-${attempt + 1}`;

        try {
          const res = await axios.post(url, { ...userDetail, username }, { headers });

          return {
            success: true,
            platform_id: platform.id,
            platform_name: platform.platform_name,
            data: res.data,
          };
        } catch (createError) {
          lastError = createError;

          if (createError?.response?.data?.code !== "existing_user_login") {
            throw createError;
          }
        }
      }

      throw lastError;
    }
  } catch (error) {
    console.log("ERROR RESPONSE", error?.response?.data || error.message);

    return {
      success: false,
      platform_id: platform.id,
      platform_name: platform.platform_name,
      message: `${platform.platform_name}: ${error?.response?.data?.message || error.message}`,
    };
  }
};

module.exports = postUserToPlatforms;
