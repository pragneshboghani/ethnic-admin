const axios = require("axios");
const fs = require("fs");
const path = require("path");
const generateSlug = require("./generateSlug");
const getAuthHeaders = require("./getAuthHeaders");
const mysqlpool = require("../config/db");
const postMediaToPlateform = require("./postMediaToPlateform");

const fileToBase64 = (filePath, mimeType) => {
  const absolutePath = path.join(__dirname, "..", filePath);

  console.log("Checking path:", absolutePath);

  if (!fs.existsSync(absolutePath)) {
    console.log("File not found!");
    return null;
  }

  const fileBuffer = fs.readFileSync(absolutePath);
  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`;
};

const postToPlatform = async (platform, blogData, slug = null) => {
  try {
    let url = `${platform.api_endpoint}/${platform.blog_path}`;

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

    if (blogData.category) {
      const categoryIds = blogData.category
        .map((cat) => Number(cat))
        .filter((id) => !isNaN(id));

      wpCategoryIds = await Promise.all(
        categoryIds.map(async (id) => {
          const [[category]] = await mysqlpool.query(
            `SELECT * FROM category WHERE id = ?`,
            [id],
          );

          const res = await axios.get(
            `${platform.api_endpoint}/${platform.extra_paths.category}?slug=${category.slug}`,
            {
              headers: getAuthHeaders(platform),
            },
          );

          if (res.data.length > 0) {
            return res.data[0].id;
          } else {
            const createRes = await axios.post(
              `${platform.api_endpoint}/${platform.extra_paths.category}`,
              {
                name: category.name,
                slug: category.slug,
                description: category.description || "",
              },
              {
                headers: getAuthHeaders(platform),
              },
            );

            const existingPlatforms = category.platforms
              ? category.platforms
              : [];
            const updatedPlatforms = [
              ...new Set([...existingPlatforms, platform.id]),
            ];

            await mysqlpool.query(
              `UPDATE category SET platform_ids = ? WHERE id = ?`,
              [JSON.stringify(updatedPlatforms), category.id],
            );
            return createRes.data.id;
          }
        }),
      );

      wpCategoryIds = wpCategoryIds.filter(Boolean);
    }

    if (blogData.tags) {
      const tagIds = blogData.tags
        .map((tag) => Number(tag))
        .filter((id) => !isNaN(id));

      wpTagIds = await Promise.all(
        tagIds.map(async (id) => {
          const [[tag]] = await mysqlpool.query(
            `SELECT * FROM tags WHERE id = ?`,
            [id],
          );

          const res = await axios.get(
            `${platform.api_endpoint}/${platform.extra_paths.tag}?slug=${tag.slug}`,
            {
              headers: getAuthHeaders(platform),
            },
          );

          if (res.data.length > 0) {
            return res.data[0].id;
          } else {
            const createRes = await axios.post(
              `${platform.api_endpoint}/${platform.extra_paths.tag}`,
              {
                name: tag.name,
                slug: tag.slug,
                description: tag.description || "",
              },
              {
                headers: getAuthHeaders(platform),
              },
            );

            const existingPlatforms = tag.platforms ? tag.platforms : [];

            const updatedPlatforms = [
              ...new Set([...existingPlatforms, platform.id]),
            ];

            const [result] = await mysqlpool.query(
              `UPDATE tags SET platform_ids = ? WHERE id = ?`,
              [JSON.stringify(updatedPlatforms), tag.id],
            );

            return createRes.data.id;
          }
        }),
      );

      wpTagIds = wpTagIds.filter(Boolean);
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
