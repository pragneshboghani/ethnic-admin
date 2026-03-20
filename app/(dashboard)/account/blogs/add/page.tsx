'use client';

import { useEffect } from "react";
import PlateformActions from "@/actions/PlateFormActions";
import BlogActions from "@/actions/BlogAction";
import MediaActions from "@/actions/MediaAction";
import { toast } from "react-toastify";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogSidebar from "@/components/blog/BlogSidebar";
import PlatformSettingsSection from "@/components/blog/PlatformSettingsSection";
import BlogTabSwitcher from "@/components/blog/BlogTabSwitcher";
import BlogGeneralSection from "@/components/blog/BlogGeneralSection";
import { useRouter } from "next/navigation";
import SEOActions from "@/actions/SEOAction";
import { normalizeDateForInput } from "@/utils/normalizeDateForInput";
import CategoryModal from "@/components/common/CategoryModal";
import TagModal from "@/components/common/TagModal";
import { generateSlug } from "@/utils/generateSlug";
import UploadMediaModal from "@/components/media/UploadMediaModal";
import blogEditor from "@/utils/blogEditor";
import BlogPreviewModal from "@/components/blog/BlogPreviewModal";
import useBlogForm from "@/hooks/useBlogForm";

const BlogForm = () => {
    const router = useRouter();

    const {
        blogId, setBlogId, activeTab, setActiveTab, selectedPlatforms, setSelectedPlatforms, platformData, setPlatformData, formContent, setFormContent, image,
        setImage, title, setTitle, excerpt, setExcerpt, category, setCategory, isCategoryModalOpen, setIsCategoryModalOpen, publishDate, setPublishDate, globalStatus,
        setGlobalStatus, tags, setTags, relatedBlogs, setRelatedBlogs, isPopupOpen, setIsPopupOpen, allBlogs, setAllBlogs, readingTime, setReadingTime, selectedFile,
        setSelectedFile, mediaFor, setMediaFor, mediaFiles, setMediaFiles, showPreview, setShowPreview, tagsList, setTagsList, isUploadModalOpen, setIsUploadModalOpen,
        selectedTags, setSelectedTags, isTagModalOpen, setIsTagModalOpen, platformSettings, setPlatformSettings, categories, setCategories,
    } = useBlogForm()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setBlogId(params.get("id"));
    }, []);

    const fetchCategories = async () => {
        const res = await BlogActions.FetchCategory();
        setCategories(res.data);
    };

    const fetchTags = async () => {
        const res = await BlogActions.FetchTags();
        setTagsList(res.data);
    };
    const fetchMedia = async () => {
        const res = await MediaActions.getAllMedia();
        setMediaFiles(res.data);
    };
    const fetchPlatforms = async () => {
        const res = await PlateformActions.GetAllPlateform();
        setPlatformData(res);
    };
    const loadBlogs = async () => {
        const blogs = await BlogActions.GetAllBlogs()
        setAllBlogs(blogs);
    };
    useEffect(() => {
        fetchPlatforms();
        loadBlogs();
        // fetchMedia();
        fetchCategories();
        fetchTags()
    }, []);

    const editor = blogEditor({ content: formContent, setContent: setFormContent });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setImage(url);
            setSelectedFile(file);
        }
    };

    const ConvertBase64 = async () => {
        let uploadedImageUrl = image || "";

        if (selectedFile) {
            const reader = new FileReader();

            uploadedImageUrl = await new Promise<string>((resolve, reject) => {
                reader.onload = async () => {
                    const base64 = reader.result as string;
                    try {
                        const res = await MediaActions.uploadMedia(base64, selectedFile.name, selectedPlatforms);
                        resolve(res.fileUrl);
                    } catch (error) {
                        toast.error(`Image Upload failed 😢: ${(error as Error).message}`);
                        reject(error);
                    }
                };
                reader.readAsDataURL(selectedFile);
            });
        }

        const formData = {
            title,
            excerpt,
            formContent,
            image: uploadedImageUrl,
            // author,
            category,
            publishDate,
            globalStatus,
            tags,
            related_blogs: relatedBlogs,
            reading_time: readingTime,
            platforms: selectedPlatforms.map(platformId => ({
                platformId,
                settings: platformSettings[platformId] || {},
            })),
        };

        return formData
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (selectedPlatforms.length === 0) {
            toast.error("Please select at least one platform 😢");
            return;
        }

        if (!publishDate || publishDate.trim() === "") {
            toast.error("Publish date is required 😢");
            return;
        }
        const formData = await ConvertBase64()

        const Selected_PlateForms = formData.platforms.map(p => p.platformId);

        try {
            const BlogFormData = {
                blog_title: formData.title,
                short_excerpt: formData.excerpt,
                full_content: formData.formContent,
                featured_image: formData.image,
                category: formData.category,
                // tags: formData.tags,
                tags: selectedTags,
                // author: formData.author,
                publish_date: formData.publishDate,
                reading_time: formData.reading_time,
                related: formData.related_blogs,
                status: globalStatus,
                platforms: Selected_PlateForms
            };

            const AddedBlogs = await BlogActions.AddBlog(BlogFormData);
            const blogId = AddedBlogs.blogId;

            const seoFormDataArray = formData.platforms.map(p => ({
                platform_id: p.platformId,
                slug: p.settings.slug || "",
                publish_status: p.settings.publishStatus || "draft",
                seo_title: p.settings.seoTitle || "",
                meta_description: p.settings.metaDescription || "",
                canonical_url: p.settings.canonicalUrl || "",
                cta_button_text: p.settings.ctaButtonText || "",
                cta_button_link: p.settings.ctaButtonLink || "",
            }));

            await BlogActions.AddSEO(blogId, seoFormDataArray);

            toast.success("Blog Successfully Added!");

            router.push('/account/blogs')

        } catch (error) {
            toast.error(`Error submitting blog or SEO 😢: ${(error as Error).message}`);

        }
    };

    const handleSaveDraft = async () => {
        try {
            const formData = await ConvertBase64();

            const Selected_PlateForms = formData.platforms.map(p => p.platformId);

            const BlogFormData = {
                blog_title: formData.title || '',
                short_excerpt: formData.excerpt || '',
                full_content: formData.formContent || '',
                featured_image: formData.image || '',
                category: formData.category || '',
                tags: formData.tags || [],
                // author: formData.author || '',
                publish_date: formData.publishDate || '',
                reading_time: formData.reading_time || 0,
                related: formData.related_blogs || [],
                status: "draft",
                platforms: Selected_PlateForms || []
            };

            const AddedBlogs = await BlogActions.AddBlog(BlogFormData);
            const blogId = AddedBlogs.data.blogId;

            const seoFormDataArray = formData.platforms.map(p => ({
                platform_id: p.platformId,
                slug: p.settings.slug || "",
                publish_status: "draft",
                seo_title: p.settings.seoTitle || "",
                meta_description: p.settings.metaDescription || "",
                canonical_url: p.settings.canonicalUrl || "",
                cta_button_text: p.settings.ctaButtonText || "",
                cta_button_link: p.settings.ctaButtonLink || "",
            }));

            await BlogActions.AddSEO(blogId, seoFormDataArray);

            toast.success("Draft Successfully Saved!");

        } catch (error) {
            toast.error(`Draft save error 😢: ${(error as Error).message}`);
        }
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const newTags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        setTags(newTags);
    };

    const handleBlogSelect = (blogId: number) => {
        setRelatedBlogs(prev => {
            if (prev.includes(blogId)) {
                return prev.filter(id => id !== blogId);
            }
            return [...prev, blogId];
        });
    };

    const handlePlatformChange = (platformId: number, field: string, value: string) => {
        setPlatformSettings(prev => ({
            ...prev,
            [platformId]: {
                ...prev[platformId],
                [field]: value,
            }
        }));
    };

    const handleRemoveImage = () => {
        setImage(null);
        setSelectedFile(null);
    };

    const handleAddEditorImage = () => {
        setMediaFor('editor');
        setIsUploadModalOpen(true);
    };

    useEffect(() => {
        if (!title) return;

        const slug = generateSlug(title);

        setPlatformSettings(prev => {
            const updated = { ...prev };

            selectedPlatforms.forEach(platformId => {
                const platform = platformData?.data.find(
                    (p: any) => p.id === platformId
                );

                if (!platform) return;

                const canonicalUrl = `${platform.api_endpoint}/blog/${slug}`;

                updated[platformId] = {
                    seoTitle: prev[platformId]?.seoTitle || title,
                    slug: prev[platformId]?.slug || slug,
                    publishStatus: prev[platformId]?.publishStatus || "draft",
                    metaDescription: prev[platformId]?.metaDescription || excerpt,
                    canonicalUrl: prev[platformId]?.canonicalUrl || canonicalUrl,
                    ctaButtonText: prev[platformId]?.ctaButtonText || "Read more",
                    ctaButtonLink: prev[platformId]?.ctaButtonLink || canonicalUrl,
                };
            });

            return updated;
        });
    }, [title, excerpt, selectedPlatforms, activeTab, platformData]);

    useEffect(() => {
        if (!blogId) return;

        const fetchBlogForEdit = async () => {
            try {
                const res = await BlogActions.GetById(Number(blogId));
                const blog = res.data;

                setTitle(blog.blog_title);
                setExcerpt(blog.short_excerpt);
                setFormContent(blog.full_content);
                setTimeout(() => {
                    editor?.commands.setContent(blog.full_content);
                }, 0);
                // setAuthor(blog.author);
                setCategory(blog.category || []);
                setPublishDate(normalizeDateForInput(blog.publish_date));
                setGlobalStatus((blog.status).toUpperCase());
                setSelectedTags(blog.tags || []);
                setReadingTime(blog.reading_time || 0);
                setRelatedBlogs(blog.related || []);

                if (blog.featured_image) {
                    setImage(blog.featured_image);
                }

                const platforms = blog.platforms || [];
                setSelectedPlatforms(platforms);

                const seoPromises = platforms.map(async (platformId: number) => {
                    const seoRes = await SEOActions.GetByBlogsAndPlatform(blog.id, platformId);
                    return seoRes.data;
                });

                const seoDataArray = await Promise.all(seoPromises);

                const newPlatformSettings: Record<number, any> = {};
                seoDataArray.forEach((seoArray) => {
                    seoArray.forEach((seo: any) => {
                        newPlatformSettings[seo.platform_id] = {
                            slug: seo.slug || "",
                            publishStatus: seo.publish_status || "draft",
                            seoTitle: seo.seo_title || "",
                            metaDescription: seo.meta_description || "",
                            canonicalUrl: seo.canonical_url || "",
                            ctaButtonText: seo.cta_button_text || "",
                            ctaButtonLink: seo.cta_button_link || "",
                        };
                    });
                });

                setPlatformSettings(newPlatformSettings);

            } catch (error) {
                toast.error("Failed to load blog for editing 😢");
                console.error(error);
            }
        };

        fetchBlogForEdit();
    }, [blogId]);

    const handleUpdateBlog = async () => {
        try {
            const formData = await ConvertBase64()

            const Selected_PlateForms = formData.platforms.map(p => p.platformId);

            const BlogFormData = {
                blog_title: formData.title,
                short_excerpt: formData.excerpt,
                full_content: formData.formContent,
                featured_image: formData.image,
                category: formData.category,
                tags: selectedTags,
                // author: formData.author,
                publish_date: formData.publishDate,
                reading_time: formData.reading_time,
                related: formData.related_blogs,
                status: globalStatus,
                platforms: Selected_PlateForms
            };

            const res = await BlogActions.UpdateBlog(Number(blogId), BlogFormData);
            const seoFormDataArray = formData.platforms.map(p => ({
                platform_id: p.platformId,
                slug: p.settings.slug || "",
                publish_status: p.settings.publishStatus || "draft",
                seo_title: p.settings.seoTitle || "",
                meta_description: p.settings.metaDescription || "",
                canonical_url: p.settings.canonicalUrl || "",
                cta_button_text: p.settings.ctaButtonText || "",
                cta_button_link: p.settings.ctaButtonLink || "",
            }));

            await SEOActions.UpdateSEO(Number(blogId), seoFormDataArray);
            toast.success("Blog updated successfully!");
            router.push('/account/blogs')
        } catch (error: any) {
            toast.error(error.message || "Failed to update blog 😢");
        }
    };

    return (
        <form
            className="space-y-8"
            onSubmit={(e) => {
                e.preventDefault();
                if (blogId) {
                    handleUpdateBlog();
                } else {
                    handleSubmit(e);
                }
            }}
        >
            <BlogHeader onPreview={() => setShowPreview(true)} onSaveDraft={handleSaveDraft} />
            <BlogTabSwitcher
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedPlatforms={selectedPlatforms}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'general' ? (
                        <BlogGeneralSection
                            title={title}
                            setTitle={setTitle}
                            excerpt={excerpt}
                            setExcerpt={setExcerpt}
                            editor={editor}
                            handleTagsChange={handleTagsChange}
                            tags={tags}
                            relatedBlogs={relatedBlogs}
                            allBlogs={allBlogs}
                            setIsPopupOpen={setIsPopupOpen}
                            setReadingTime={setReadingTime}
                            readingTime={readingTime}
                            tagsList={tagsList}
                            selectedTags={selectedTags}
                            setSelectedTags={setSelectedTags}
                            setIsTagModalOpen={setIsTagModalOpen}
                            handleAddEditorImage={handleAddEditorImage}
                        />
                    ) : (
                        <PlatformSettingsSection
                            platformData={platformData}
                            selectedPlatforms={selectedPlatforms}
                            setSelectedPlatforms={setSelectedPlatforms}
                            platformSettings={platformSettings}
                            setPlatformSettings={setPlatformSettings}
                            handlePlatformChange={handlePlatformChange}
                            title={title}
                            excerpt={excerpt}
                        />
                    )}
                </div>

                <BlogSidebar
                    globalStatus={globalStatus}
                    setGlobalStatus={setGlobalStatus}
                    publishDate={publishDate}
                    setPublishDate={setPublishDate}
                    // author={author}
                    // setAuthor={setAuthor}
                    category={category}
                    setCategory={setCategory}
                    categories={categories}
                    setIsCategoryModalOpen={setIsCategoryModalOpen}
                    image={image}
                    handleRemoveImage={handleRemoveImage}
                    handleFileChange={handleFileChange}
                    setIsUploadModalOpen={setIsUploadModalOpen}
                    setMediaFor={setMediaFor}
                />
            </div>
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-10">
                    <div className="p-6 w-96 glass-card">
                        <h3 className="text-xl font-semibold text-white mb-4">Select Related Blogs</h3>
                        <div className="space-y-2">
                            {allBlogs.data.map(blog => (
                                <div key={blog.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={relatedBlogs.includes(blog.id)}
                                        onChange={() => handleBlogSelect(blog.id)}
                                        className="mr-3"
                                    />
                                    <label className="text-sm text-white">{blog.blog_title}</label>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end gap-4">
                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="btn"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setIsPopupOpen(false)}
                                className="btn"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showPreview && (
                <BlogPreviewModal
                    showPreview={showPreview}
                    setShowPreview={setShowPreview}
                    image={image}
                    category={category}
                    categories={categories}
                    publishDate={publishDate}
                    readingTime={readingTime}
                    title={title}
                    excerpt={excerpt}
                    formContent={formContent}
                    tags={tags}
                    relatedBlogs={relatedBlogs}
                    allBlogs={allBlogs}
                    selectedPlatforms={selectedPlatforms}
                    platformData={platformData}
                    platformSettings={platformSettings}
                />
            )}
            {isCategoryModalOpen && (
                <CategoryModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    onSuccess={async () => {
                        await fetchCategories();
                    }}
                />
            )}
            {isTagModalOpen && (
                <TagModal
                    isOpen={isTagModalOpen}
                    onClose={() => setIsTagModalOpen(false)}
                    onSuccess={async () => {
                        await fetchTags();
                    }}
                />
            )}
            {isUploadModalOpen && (
                <UploadMediaModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    platformData={platformData}
                    onUploadComplete={fetchMedia}
                    onSelectImage={(url) => {
                        if (mediaFor === 'feature') {
                            // 🖼️ Feature Image
                            setImage(url);
                            setSelectedFile(null);
                        } else {
                            // ✍️ Editor Image
                            editor?.chain().focus().setImage({
                                src: `${process.env.BACKEND_DOMAIN}/${url}`
                            }).run();
                        }
                    }}
                />
            )}
        </form>
    );
};

export default BlogForm;