require("dotenv").config();

const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: You have no access",
    });
  }

  next();
};

module.exports = verifyApiKey;
