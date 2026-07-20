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
      return {
        success: false,
        status: 400,
        message: "Auth token is required for token type",
      };
    }

    if (auth_type === "basic" && (!username || !password)) {
      return {
        success: false,
        status: 400,
        message: "Username and Password are required for basic auth",
      };
    }
  }

  if (data_source === "admin") {
    if (!platform_token || platform_token.trim() === "") {
      return {
        success: false,
        status: 400,
        message: "Platform token is required for Admin data source",
      };
    }
  }

  return {
    success: true,
  };
};

module.exports = {
  validatePlatformData,
};
