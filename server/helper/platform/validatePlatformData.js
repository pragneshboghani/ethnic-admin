const validatePlatformData = (data) => {
  let {
    auth_type,
    data_source,
    auth_token,
    username,
    password,
    platform_token,
  } = data;

  if (data_source !== "admin") {
    if (auth_type === "token" && !auth_token) {
      return res.status(400).json({
        success: false,
        message: "Auth token is required for token type",
      });
    }

    if (auth_type === "basic" && (!username || !password)) {
      return res.status(400).json({
        success: false,
        message: "Username and Password are required for basic auth",
      });
    }
  }

  if (data_source === "admin") {
    if (!platform_token || platform_token.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Platform token is required for Admin data source",
      });
    }
  }

  return {
    success: true,
  };
};

module.exports = {
  validatePlatformData,
};
