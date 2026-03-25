require("dotenv").config();

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({
      success: false,
      apiKey,
      API_KEY: process.env.API_KEY,
      message: "Unauthorized - Invalid API Key",
    });
  }

  next();
};

module.exports = verifyApiKey;
