const axios = require("axios");
const getTaxonomyUrl = require("./getTaxonomyUrl");

const postMediaToPlateform = async (platform, data) => {
  try {
    const url = getTaxonomyUrl(platform, "media");

    const base64Data = data.file.split(";base64,").pop();
    const buffer = Buffer.from(base64Data, "base64");

    const mimeMatch = data.file.match(/data:(.*?);base64/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/png";

    const extension = mimeType.split("/")[1];
    const filename = `upload_${Date.now()}.${extension}`;

    const token = Buffer.from(
      `${platform.username}:${platform.password}`,
    ).toString("base64");

    const response = await axios.post(url, buffer, {
      headers: {
        Authorization: `Basic ${token}`,
        "Content-Type": mimeType,
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });

    const wpMedia = response.data;

    if (data.alt) {
      await axios.post(
        `${url}/${wpMedia.id}`,
        { alt_text: data.alt },
        {
          headers: {
            Authorization: `Basic ${token}`,
          },
        },
      );
    }

    return {
      success: true,
      platform: platform.platform_name,
      mediaId: wpMedia.id,
      url: wpMedia.source_url,
      platformId: platform.id,
    };
  } catch (error) {
    return {
      success: false,
      platform: platform.platform_name,
      error: error.response?.data || error.message,
    };
  }
};

module.exports = postMediaToPlateform;
