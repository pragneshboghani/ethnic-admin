const mysqlpool = require("../config/db");

const getPlatformsByIds = async (platformIds = []) => {
  try {
    if (!platformIds || platformIds.length === 0) {
      return [];
    }

    const [data] = await mysqlpool.query(
      `SELECT * FROM platforms WHERE id IN (?) AND data_source = 'platform'`,
      [platformIds],
    );

    return data;
  } catch (error) {
    console.error("Error fetching platforms:", error);
    throw error;
  }
};

module.exports = {
  getPlatformsByIds,
};
