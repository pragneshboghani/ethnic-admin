const mysqlpool = require("../config/db");
const generateSlug = require("./generateSlug");

const generateUniqueBlogSlug = async (title, excludeId = null) => {
  let baseSlug = await generateSlug(title);
  let slug = baseSlug;
  let count = 1;

  while (true) {
    let query = "SELECT id FROM blogs WHERE slug = ?";
    let params = [slug];

    // 👉 exclude current blog in update
    if (excludeId) {
      query += " AND id != ?";
      params.push(excludeId);
    }

    const [[existing]] = await mysqlpool.query(query, params);

    if (!existing) break;

    slug = `${baseSlug}-${count++}`;
  }

  return slug;
};

module.exports = generateUniqueBlogSlug;
