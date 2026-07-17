const mysqlpool = require("../config/db");

const verifyPlatformToken = async (req, res, next) => {
  const { platformKey } = req.query;

  const [platform] = await mysqlpool.query(
    `SELECT id, platform_name, data_source, platform_token FROM platforms WHERE platform_token = ? `,
    [platformKey],
  );

  if (!platform.length) {
    return res.status(404).json({
      success: false,
      message: "Platform not found or invalid platform key",
    });
  }

  req.platform = platform[0];

  next();
};

module.exports = verifyPlatformToken;
