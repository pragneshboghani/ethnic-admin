function getTaxonomyUrl(platform, type) {
  const pathMap = {
    category: 'wp-json/wp/v2/categories',
    tags: 'wp-json/wp/v2/tags',
    media: 'wp-json/wp/v2/media'
  };

  const path = pathMap[type];

  if (!path) {
    throw new Error("Invalid type");
  }

  return `${platform.api_endpoint}/${path}`;
}

module.exports = getTaxonomyUrl;
