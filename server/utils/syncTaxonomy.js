const mysqlpool = require("../config/db");
const axios = require("axios");
const getAuthHeaders = require("./getAuthHeaders");

const syncTaxonomy = async ({ ids, tableName, apiPath, platform }) => {
  const validIds = ids.map((id) => Number(id)).filter((id) => !isNaN(id));

  const wpIds = await Promise.all(
    validIds.map(async (id) => {
      const [[item]] = await mysqlpool.query(
        `SELECT * FROM ${tableName} WHERE id = ?`,
        [id],
      );
      if (!item) return null;

      const res = await axios.get(
        `${platform.api_endpoint}/${apiPath}?slug=${item.slug}`,
        { headers: getAuthHeaders(platform) },
      );

      if (res.data.length > 0) {
        return res.data[0].id;
      }

      const createRes = await axios.post(
        `${platform.api_endpoint}/${apiPath}`,
        {
          name: item.name,
          slug: item.slug,
          description: item.description || "",
        },
        { headers: getAuthHeaders(platform) },
      );

      const existingPlatforms = item.platforms || [];
      const updatedPlatforms = [
        ...new Set([...existingPlatforms, platform.id]),
      ];

      await mysqlpool.query(
        `UPDATE ${tableName} SET platform_ids = ? WHERE id = ?`,
        [JSON.stringify(updatedPlatforms), item.id],
      );

      return createRes.data.id;
    }),
  );

  return wpIds.filter(Boolean);
};

module.exports = syncTaxonomy;
