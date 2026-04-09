const axios = require("axios");
const fs = require("fs");
const path = require("path");
const generateSlug = require("./generateSlug");
const getAuthHeaders = require("./getAuthHeaders");
const mysqlpool = require("../config/db");
const postMediaToPlateform = require("./postMediaToPlateform");
const syncTaxonomy = require("./syncTaxonomy");
const getTaxonomyUrl = require("./getTaxonomyUrl");

const fileToBase64 = (filePath, mimeType) => {
  const absolutePath = path.join(__dirname, "..", filePath);

  if (!fs.existsSync(absolutePath)) {
    console.log("File not found!");
    return null;
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
};

const postToPlatform = async (platform, blogData, slug = null) => {
  try {
    let url = getTaxonomyUrl(platform, "post");

    let method = "post";
    let featuredMediaId = null;
    let wpCategoryIds = [];
    let wpTagIds = [];

    if (blogData.featured_image) {
      const [[image]] = await mysqlpool.query(
        `SELECT * FROM media WHERE file_url=?`,
        [blogData.featured_image],
      );

      if (image.platforms && image.platforms.length > 0) {
        featuredMediaId = image.platforms[0].id;
      } else {
        const base64Image = fileToBase64(image.file_url, image.mime_type);
        const data = {
          file: base64Image,
          alt: image.platforms[0]?.alt_text || "",
        };

        const UpdateImage = await postMediaToPlateform(platform, data);
        featuredMediaId = UpdateImage.mediaId;

        const updatedPlatforms = [
          {
            id: UpdateImage.mediaId,
            url: UpdateImage.url,
            platformId: UpdateImage.platformId,
          },
        ];

        await mysqlpool.query(`UPDATE media SET platforms = ? WHERE id = ?`, [
          JSON.stringify(updatedPlatforms),
          image.id,
        ]);
      }
    }

    let category_api_path = platform.plateform_type == 'wordpress' ? 'wp-json/wp/v2/categories' : 'category'
    if (blogData.category) {
      wpCategoryIds = await syncTaxonomy({
        ids: blogData.category,
        tableName: "category",
        apiPath: category_api_path,
        platform,
      });
    }

    let tag_api_path = platform.plateform_type == 'wordpress' ? 'wp-json/wp/v2/tags' : 'tags'
    if (blogData.tags) {
      wpTagIds = await syncTaxonomy({
        ids: blogData.tags,
        tableName: "tags",
        apiPath: tag_api_path,
        platform,
      });
    }

    const headers = getAuthHeaders(platform);
    if (slug) {
      const res = await axios.get(url, {
        headers,
        params: { slug, status: "any" },
      });
      if (res.data.length) {
        const postId = res.data[0].id;
        url = `${url}/${postId}`;
        method = "put";
      }
    }

    const payload = {
      title: blogData.blog_title,
      excerpt: blogData.short_excerpt,
      content: blogData.full_content,
      date_gmt: new Date(blogData.publish_date).toISOString(),
      slug: slug || (await generateSlug(blogData.blog_title)),
      status: blogData.status.toLowerCase(),
      categories: wpCategoryIds,
      tags: wpTagIds,
      ...(featuredMediaId && { featured_media: featuredMediaId }),
    };

    const response = await axios({
      method,
      url,
      data: payload,
      headers,
    });

    return {
      success: true,
      platform: platform.platform_name,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      platform: platform.platform_name,
      error: error.response?.data || error.message,
    };
  }
};

module.exports = postToPlatform;
