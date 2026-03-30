'use client';

import { useEffect, useState } from "react";
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
import BlogPreviewModal from "@/components/blog/BlogPreviewModal";
import { BlogFormType, CategoryType, PlatformSettings } from "@/types";
import DashBoardActions from "@/actions/DashboardAction";
import { useFieldArray, useForm } from "react-hook-form";
import blogSchema from "@/hooks/blogSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import getDefaultPublishDate from "@/utils/getDefaultPublishDate";

type AllDataType = {
    allBlogs: any[];
    categories: CategoryType[];
    tagsList: { id: number; name: string }[];
    mediaFiles: any[];
    platformData: {
        data: any[];
        totalPlatforms: number;
    } | null;
};

const BlogForm = () => {
    const router = useRouter();

    const [blogId, setBlogId] = useState<string | null>(null);
    const [duplicateBlogId, setDuplicateBlogId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"general" | "platforms">("general");
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
    const [image, setImage] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
    const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({});
    const [mediaFor, setMediaFor] = useState<"feature" | "editor">("feature");
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [allData, setAllData] = useState<AllDataType>({
        allBlogs: [],
        categories: [],
        tagsList: [],
        mediaFiles: [],
        platformData: null,
    });

    const form = useForm({
        resolver: zodResolver(blogSchema),
        defaultValues: {
            title: "",
            excerpt: "",
            content: "",
            faq: [],
            publishDate: "",
            globalStatus: "draft",
            author: "",
            category: [],
            reading_time: 0,
            tags: [],
            relatedBlogs: [],
            platforms: []
        }
    });

    const { watch, register, setValue, control, reset } = form

    const { fields, append, remove } = useFieldArray({
        control,
        name: "platforms"
    });

    const title = watch("title");
    const excerpt = watch('excerpt');
    const content = watch("content");
    const faq = watch("faq") || [];
    const tagsValue = watch("tags");
    const related = watch('relatedBlogs')
    const readingTime = watch('reading_time')
    const selectedTags = watch("tags") || [];
    const globalStatus = watch('globalStatus')
    const publishDate = watch('publishDate')
    const selectedCategories = watch("category") || [];
    const author = watch('author')

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setBlogId(params.get("id"));
        setDuplicateBlogId(params.get("duplicateId"));
    }, []);

    const fetchAll = async () => {
        try {
            const res = await DashBoardActions.getAllData();
            setAllData({
                allBlogs: res.blogData || [],
                categories: res.categoryData || [],
                tagsList: res.tagsData || [],
                mediaFiles: res.mediaData || [],
                platformData: {
                    data: res.plateformData || [],
                    totalPlatforms: res.plateformData?.length || 0,
                },
            });
        } catch (err) {
            console.error("Error fetching all data:", err);
            toast.error("Failed to load initial data 😢");
        }
    };
    useEffect(() => {
        fetchAll();
    }, []);

    const ConvertBase64 = async (): Promise<BlogFormType | undefined> => {
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

        let finalPublishDate = publishDate;

        if (!finalPublishDate || finalPublishDate.trim() === "") {
            finalPublishDate = getDefaultPublishDate(globalStatus) || "";
        }

        const formData: BlogFormType = {
            BlogTitle: title,
            BlogExcerpt: excerpt,
            BlogContent: content,
            BlogFaq: faq,
            BlogTags: tagsValue,
            BlogRalated: related,
            BlogAuthor: author,
            BlogReadingTime: readingTime,
            BlogGlobalStatus: globalStatus,
            BlogPublishDate: finalPublishDate,
            BlogSelectedCategories: selectedCategories,
            image: uploadedImageUrl,
            platforms: selectedPlatforms.map(platformId => ({
                platformId,
                settings: platformSettings[platformId] || {},
            })),
        };

        if (selectedPlatforms.length === 0) { toast.error("Please select at least one platform 😢"); return; }

        return formData
    }

    const handleSubmit = async (isDraft: boolean = false) => {
        const formData = await ConvertBase64()

        if (!formData) return;

        const Selected_PlateForms = formData.platforms.map(p => p.platformId);
        try {
            const BlogFormData = {
                blog_title: formData.BlogTitle,
                short_excerpt: formData.BlogExcerpt,
                full_content: formData.BlogContent,
                faq: formData.BlogFaq,
                featured_image: formData.image,
                category: formData.BlogSelectedCategories,
                author: formData.BlogAuthor,
                tags: formData.BlogTags,
                publish_date: formData.BlogPublishDate,
                reading_time: formData.BlogReadingTime,
                related: formData.BlogRalated,
                status: isDraft ? "draft" : formData.BlogGlobalStatus,
                platforms: Selected_PlateForms
            };

            const seoFormDataArray = formData.platforms.map(p => ({
                platform_id: p.platformId,
                slug: p.settings.slug || "",
                publish_status: isDraft ? "draft" : (p.settings.publishStatus || "draft"),
                seo_title: p.settings.seoTitle || "",
                meta_description: p.settings.metaDescription || "",
                canonical_url: p.settings.canonicalUrl || "",
                cta_button_text: p.settings.ctaButtonText || "",
                cta_button_link: p.settings.ctaButtonLink || "",
            }));

            let newBlogId = null
            if (blogId == null) {
                const AddedBlogs = await BlogActions.addBlog(BlogFormData);
                newBlogId = AddedBlogs.blogId;

                await SEOActions.addSEO(newBlogId, seoFormDataArray);

                toast.success(isDraft ? "Draft Successfully Saved!" : "Blog Successfully Added!");
            } else {
                await BlogActions.updateBlog(Number(blogId), BlogFormData);
                await SEOActions.updateSEO(Number(blogId), seoFormDataArray);
                toast.success(isDraft ? "Draft updated successfully!" : "Blog updated successfully!");
            }

            router.push('/account/blogs')

        } catch (error) {
            toast.error(`Error submitting blog or SEO 😢: ${(error as Error).message}`);

        }
    };

    const handleBlogSelect = (blogId: number) => {
        setRelatedBlogs(prev => {
            let updated;

            if (prev.includes(blogId)) {
                updated = prev.filter(id => id !== blogId);
            } else {
                updated = [...prev, blogId];
            }

            setValue("relatedBlogs", updated);

            return updated;
        });
    };

    const handlePlatformChange = (platformId: number, field: string, value: string) => {
        setPlatformSettings(prev => ({
            ...prev,
            [platformId]: {
                ...prev[platformId],
                [field]:
                    field === "publishStatus"
                        ? (value as "draft" | "publish" | "future")
                        : value,
            }
        }));
    };

    const handleRemoveImage = () => {
        setImage(null);
        setSelectedFile(null);
    };

    useEffect(() => {
        if (!selectedPlatforms.length) return;

        const slug = generateSlug(title || "");

        setPlatformSettings(prev => {
            const updated = { ...prev };

            selectedPlatforms.forEach(platformId => {
                const platform = allData.platformData?.data.find(p => p.id === platformId);
                if (!platform) return;

                const date = publishDate ? new Date(publishDate) : new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");

                const isWordpress = platform.plateform_type === "wordpress";

                const canonicalUrl = isWordpress
                    ? `${platform.api_endpoint}/${year}/${month}/${day}/${slug}`
                    : `${platform.blog_path}/${slug}`;  

                const CTA_Button_text = platform.CTA_button_text || "Read more";
                const oldSlug = prev[platformId]?.slug;

                const shouldUpdateSlug =
                    !oldSlug || oldSlug === generateSlug(prev[platformId]?.seoTitle || "");

                updated[platformId] = {
                    seoTitle: prev[platformId]?.seoTitle || title,
                    slug: shouldUpdateSlug ? slug : oldSlug,
                    publishStatus: prev[platformId]?.publishStatus || globalStatus,
                    metaDescription: prev[platformId]?.metaDescription || excerpt,
                    canonicalUrl: prev[platformId]?.canonicalUrl || canonicalUrl,
                    ctaButtonText: prev[platformId]?.ctaButtonText || CTA_Button_text,
                    ctaButtonLink: prev[platformId]?.ctaButtonLink || canonicalUrl,
                };
            });

            return updated;
        });
    }, [selectedPlatforms, title, excerpt, publishDate, blogId, allData.platformData, globalStatus]);

    useEffect(() => {
        if (!blogId && !duplicateBlogId) return;

        const sourceBlogId = blogId || duplicateBlogId;
        const isDuplicateMode = !blogId && !!duplicateBlogId;

        const fetchBlogForEdit = async () => {
            try {
                const res = await BlogActions.getById(Number(sourceBlogId));
                const blog = res.data;

                reset({
                    title: isDuplicateMode ? `${blog.blog_title || ""} (Copy)` : blog.blog_title || "",
                    excerpt: blog.short_excerpt || "",
                    content: blog.full_content || "",
                    faq: blog.faq || [],
                    publishDate: isDuplicateMode ? getDefaultPublishDate("draft") || "" : normalizeDateForInput(blog.publish_date),
                    author: blog.author,
                    globalStatus: isDuplicateMode ? "draft" : blog.status || "draft",
                    category: blog.category || [],
                    reading_time: blog.reading_time || 0,
                    tags: blog.tags || [],
                    relatedBlogs: blog.related || [],
                    platforms: blog.platforms?.map((id: number) => ({
                        platformId: id,
                        settings: {}
                    })) || []
                });
                setValue("content", blog.full_content);
                setRelatedBlogs(blog.related || []);

                if (blog.featured_image) {
                    setImage(blog.featured_image);
                }

                const platforms = blog.platforms || [];
                setSelectedPlatforms(platforms);

                if (isDuplicateMode) {
                    setPlatformSettings({});
                } else {
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
                }

            } catch (error) {
                toast.error(isDuplicateMode ? "Failed to load blog for duplication 😢" : "Failed to load blog for editing 😢");
                console.error(error);
            }
        };

        fetchBlogForEdit();
    }, [blogId, duplicateBlogId, reset, setValue]);

    useEffect(() => {
        const defaultDate = getDefaultPublishDate(globalStatus) || "";
        setValue("publishDate", defaultDate);
    }, [globalStatus]);

    useEffect(() => {
        if (!selectedPlatforms.length) return;

        setPlatformSettings(prev => {
            let hasChanges = false;
            const updated = { ...prev };

            selectedPlatforms.forEach(platformId => {
                const settings = prev[platformId];
                const platform = allData.platformData?.data.find(p => p.id === platformId);

                if (!settings || !platform) return;

                const slug = settings.slug;
                if (!slug) return;

                const isWordpress = platform.plateform_type === "wordpress";

                const date = publishDate ? new Date(publishDate) : new Date();
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");

                const newCanonicalUrl = isWordpress
                    ? `${platform.api_endpoint}/${year}/${month}/${day}/${slug}`
                    : `${platform.blog_path}/${slug}`;


                if (settings.canonicalUrl !== newCanonicalUrl) {
                    updated[platformId] = {
                        ...settings,
                        canonicalUrl: newCanonicalUrl,
                        ctaButtonLink: newCanonicalUrl,
                    };
                    hasChanges = true;
                }
            });

            return hasChanges ? updated : prev;
        });

    }, [selectedPlatforms, platformSettings]);

    return (
        <form
            className="space-y-8"
            onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(false);
            }}
        >
            <BlogHeader onPreview={() => setShowPreview(true)} onSaveDraft={() => handleSubmit(true)} />
            <BlogTabSwitcher
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                selectedPlatforms={selectedPlatforms}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'general' ? (
                        <BlogGeneralSection
                            register={register}
                            control={control as any}
                            setValue={setValue}
                            relatedBlogs={relatedBlogs}
                            allBlogs={{ data: allData.allBlogs }}
                            platformData={allData.platformData}
                            setIsPopupOpen={setIsPopupOpen}
                            selectedTags={selectedTags}
                            content={content}
                            tagsList={allData.tagsList}
                            setIsTagModalOpen={setIsTagModalOpen}
                        />
                    ) : (
                        <PlatformSettingsSection
                            platformData={allData.platformData}
                            selectedPlatforms={selectedPlatforms}
                            setSelectedPlatforms={setSelectedPlatforms}
                            platformSettings={platformSettings}
                            setPlatformSettings={setPlatformSettings}
                            handlePlatformChange={handlePlatformChange}
                            title={title}
                            excerpt={excerpt}
                            fields={fields as any}
                            append={append as any}
                            remove={remove}
                        />
                    )}
                </div>

                <BlogSidebar
                    register={register}
                    category={selectedCategories}
                    setValue={setValue}
                    publishDate={publishDate}
                    categories={allData.categories}
                    setIsCategoryModalOpen={setIsCategoryModalOpen}
                    image={image}
                    handleRemoveImage={handleRemoveImage}
                    setIsUploadModalOpen={setIsUploadModalOpen}
                    setMediaFor={setMediaFor}
                    globalStatus={globalStatus}
                    blogId={blogId}
                />
            </div>
            {isPopupOpen && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-10">
                    <div className="p-6 w-96 glass-card">
                        <h3 className="text-xl font-semibold text-white mb-4">Select Related Blogs</h3>
                        <div className="space-y-2">
                            {allData.allBlogs.filter(blog => blog.id !== Number(blogId)).map(blog => (
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
                    category={selectedCategories}
                    categories={allData.categories}
                    publishDate={publishDate}
                    readingTime={readingTime}
                    title={title}
                    faq={faq}
                    excerpt={excerpt}
                    formContent={content}
                    tags={selectedTags.map(tagId => {
                        const tagObj = allData.tagsList.find(t => t.id === tagId);
                        return tagObj ? tagObj.name : '';
                    }).filter(name => name !== '')}
                    relatedBlogs={relatedBlogs}
                    allBlogs={{ data: allData.allBlogs }}
                    selectedPlatforms={selectedPlatforms}
                    platformData={allData.platformData}
                    platformSettings={platformSettings}
                />
            )}
            {isCategoryModalOpen && (
                <CategoryModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    onSuccess={async () => {
                        await fetchAll();
                    }}
                />
            )}
            {isTagModalOpen && (
                <TagModal
                    isOpen={isTagModalOpen}
                    onClose={() => setIsTagModalOpen(false)}
                    onSuccess={async () => {
                        await fetchAll();
                    }}
                />
            )}
            {isUploadModalOpen && (
                <UploadMediaModal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    platformData={allData.platformData}
                    onUploadComplete={fetchAll}
                    onSelectImage={(url) => {
                        setImage(url);
                        setSelectedFile(null);
                    }}
                />
            )}
        </form>
    );
};

export default BlogForm;
