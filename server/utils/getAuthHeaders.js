function getAuthHeaders(platform) {
  let headers = {};

  if (platform.auth_type === "token") {
    headers["Authorization"] = `Bearer ${platform.auth_token}`;
  } else if (platform.auth_type === "basic") {
    const base64 = Buffer.from(
      `${platform.username}:${platform.password}`,
    ).toString("base64");

    headers["Authorization"] = `Basic ${base64}`;
  }

  return headers;
}

module.exports = getAuthHeaders;
