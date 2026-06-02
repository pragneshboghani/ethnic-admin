const { default: axios } = require("axios");
const mysqlpool = require("./config/db");
const getTaxonomyUrl = require("./utils/getTaxonomyUrl");
const { getPlatformsByIds } = require("./utils/platformHelper");
const getAuthHeaders = require("./utils/getAuthHeaders");
const generateSlug = require("./utils/generateSlug");

async function findPostId(url, headers, slug) {
    if (!slug) return null;

    const res = await axios.get(url, {
        params: {
            slug,
            status: "any",
        },
        headers,
    });

    return res?.data?.length ? res.data[0].id : null;
}

async function update_platform_blog_id_for_seo() {
    const [raw] = await mysqlpool.query(`SELECT 
        blogs.id,
        blogs.slug,
        blogs.platforms,
        blogs.blog_title,
        JSON_ARRAYAGG( 
            JSON_OBJECT(
                'platform_id', seo_blog.platform_id, 
                'slug', seo_blog.slug, 
                'platform_blog_id', seo_blog.platform_blog_id 
            ) 
        ) 
    AS seo 
        FROM blogs 
    LEFT JOIN seo_blog 
        ON seo_blog.blog_id = blogs.id 
    GROUP BY blogs.id`);

    raw.map(async (blog) => {
        const platformData = await getPlatformsByIds(blog.platforms);

        const results = await Promise.all(
            platformData.map(async (platform) => {
                const platfrom_post = blog.seo?.find((seo) => seo.platform_id === platform.id)

                if (!platfrom_post?.platform_blog_id) {
                    let url = getTaxonomyUrl(platform, "post");
                    const headers = getAuthHeaders(platform);

                    let postId = null;

                    // 1. Try blog slug
                    postId = await findPostId(url, headers, blog.slug);

                    // 2. Try generated title slug
                    if (!postId) {
                        const titleSlug = await generateSlug(blog.blog_title);
                        postId = await findPostId(url, headers, titleSlug);
                    }

                    // 3. Try seo slug
                    if (!postId) {
                        postId = await findPostId(
                            url,
                            headers,
                            platfrom_post?.slug
                        );
                    }

                    if (postId) {
                        await mysqlpool.query(`UPDATE seo_blog 
                                SET platform_blog_id = ?
                            WHERE blog_id = ? AND platform_id = ?`, [postId, blog.id, platform.id])
                    } else {
                        console.log(blog.id, platform.id);
                    }
                }
            }),
        );
    });
}

update_platform_blog_id_for_seo();