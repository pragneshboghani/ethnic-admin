function getTaxonomyUrl(platform, type) {
  const pathMap = {
    category: platform.extra_paths.category,
    tags: platform.extra_paths.tag,
    media: platform.extra_paths.media
  };

  const path = pathMap[type];

  if (!path) {
    throw new Error("Invalid type");
  }

  return `${platform.api_endpoint}/${path}`;
}

module.exports = getTaxonomyUrl;
