'use client';

import { useEffect, useState } from "react";
import { X } from 'lucide-react';
import PlateformActions from "@/actions/PlateFormActions";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import BlogActions from "@/actions/BlogAction";
import MediaActions from "@/actions/MediaAction";
import { toast } from "react-toastify";
import BlogHeader from "@/components/blog/BlogHeader";
import BlogSidebar from "@/components/blog/BlogSidebar";
import PlatformSettingsSection from "@/components/blog/PlatformSettingsSection";
import BlogTabSwitcher from "@/components/blog/BlogTabSwitcher";
import BlogGeneralSection from "@/components/blog/BlogGeneralSection";
import { useRouter } from "next/navigation";
import { formatDateTime } from "@/utils/formatDateTime";
import SEOActions from "@/actions/SEOAction";
import { normalizeDateForInput } from "@/utils/normalizeDateForInput";
import CategoryModal from "@/components/common/CategoryModal";
import TagModal from "@/components/common/TagModal";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Highlight from "@tiptap/extension-highlight";

type CategoryType = {
    id: number;
    name: string;
};

const BlogForm = () => {
    const router = useRouter();

    const [blogId, setBlogId] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setBlogId(params.get("id"));
    }, []);

    const [activeTab, setActiveTab] = useState<'general' | 'platforms'>('general');
    const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
    const [platformData, setPlatformData] = useState<any>(null);
    const [formContent, setFormContent] = useState<string>('');
    const [image, setImage] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    // const [author, setAuthor] = useState('');
    const [category, setCategory] = useState<number[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [publishDate, setPublishDate] = useState<string>('');
    const [globalStatus, setGlobalStatus] = useState('draft');
    const [tags, setTags] = useState<string[]>([]);
    const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [allBlogs, setAllBlogs] = useState<{ data: any[] }>({ data: [] });
    const [readingTime, setReadingTime] = useState<number>(0);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isMediaPopupOpen, setIsMediaPopupOpen] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [tagsList, setTagsList] = useState<{ id: number; name: string }[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);
    const [isTagModalOpen, setIsTagModalOpen] = useState(false);
    const [platformSettings, setPlatformSettings] = useState<{
        [platformId: number]: {
            seoTitle: string;
            slug: string;
            publishStatus: string;
            metaDescription: string;
            canonicalUrl: string;
            ctaButtonText: string;
            ctaButtonLink: string;
        };
    }>({});

    const [categories, setCategories] = useState<CategoryType[]>([]);

    const fetchCategories = async () => {
        const res = await BlogActions.FetchCategory();
        setCategories(res.data);
    };

    const fetchTags = async () => {
        const res = await BlogActions.FetchTags();
        setTagsList(res.data);
    };
    useEffect(() => {
        const fetchPlatforms = async () => {
            const res = await PlateformActions.GetAllPlateform();
            setPlatformData(res);
        };
        fetchPlatforms();
        const loadBlogs = async () => {
            const blogs = await BlogActions.GetAllBlogs()
            setAllBlogs(blogs);
        };
        loadBlogs();
        const fetchMedia = async () => {
            const res = await MediaActions.getAllMedia();
            setMediaFiles(res.data);
        };
        fetchMedia();
        fetchCategories();
        fetchTags()
    }, []);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: true }),
            Image,
            Highlight,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content: formContent,
        immediatelyRender: false,
        editorProps: {
            handlePaste(view, event, slice) {
                const html = event.clipboardData?.getData('text/plain');
                if (html) {
                    view.dispatch(
                        view.state.tr.replaceSelectionWith(
                            view.state.schema.text(html), false
                        )
                    );
                    return true;
                }
                return false;
            }
        },
        onUpdate: ({ editor }) => {
            setFormContent(editor.getHTML());
        },
    });

    // useEffect(() => {
    //     if (editor) {
    //         editor.commands.setContent(formContent);
    //     }
    // }, [editor, formContent]);

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
                        const res = await MediaActions.uploadMedia(base64, selectedFile.name);
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

    useEffect(() => {
        if (!blogId) return;

        const fetchBlogForEdit = async () => {
            try {
                const res = await BlogActions.GetById(Number(blogId));
                const blog = res.data;

                setTitle(blog.blog_title);
                setExcerpt(blog.short_excerpt);
                setFormContent(blog.full_content);
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
                        />
                    ) : (
                        <PlatformSettingsSection
                            platformData={platformData}
                            selectedPlatforms={selectedPlatforms}
                            setSelectedPlatforms={setSelectedPlatforms}
                            platformSettings={platformSettings}
                            setPlatformSettings={setPlatformSettings}
                            handlePlatformChange={handlePlatformChange}
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
                    setIsMediaPopupOpen={setIsMediaPopupOpen}
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
            {isMediaPopupOpen && (
                <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50">
                    <div className="p-6 w-[850px] glass-card max-h-[80vh] overflow-y-auto">

                        <div className="w-full flex justify-between mb-4">
                            <h3 className="text-xl font-semibold text-white">
                                Select Image From Media Library
                            </h3>
                            <X size={20} onClick={() => setIsMediaPopupOpen(false)} />
                        </div>

                        <div className="grid grid-cols-4 gap-4">
                            {mediaFiles.map((file) => (
                                <img
                                    key={file.id}
                                    src={`${process.env.BACKEND_DOMAIN}/${file.file_url}`}
                                    className="cursor-pointer rounded-lg border w-[200px] h-[200px] object-cover"
                                    onClick={() => {
                                        setImage(file.file_url);
                                        setIsMediaPopupOpen(false);
                                        setSelectedFile(null);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {showPreview && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
                    <div className="w-[1000px] max-h-[90vh] overflow-y-auto rounded-2xl text-white glass-card">
                        <div className="flex justify-between items-center border-b p-6">
                            <h2 className="text-xl font-bold">Blog Preview</h2>
                            <button onClick={() => setShowPreview(false)} className="text-white">
                                <X />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            {image && (
                                <img src={image.startsWith("blob:") ? image : `${process.env.BACKEND_DOMAIN}/${image}`}
                                    className="w-full max-w-[30%] object-cover rounded-xl float-right aspect-square" />
                            )}
                            <div className="flex items-center gap-3 text-sm text-white justify-between pr-5">
                                <div className="flex items-center gap-3">
                                    <span className="text-white glass-card p-2"><span>
                                        {category
                                            .map(id => categories.find(c => c.id === id)?.name)
                                            .filter(Boolean)
                                            .join(', ')
                                        }
                                    </span></span>
                                    {publishDate && (<span>{formatDateTime(publishDate)}</span>)}
                                </div>
                                <div className="text-white text-sm">
                                    {/* {author && (<span className="font-medium"> By {author}</span>)} */}
                                    {/* {" • "} */}
                                    {readingTime || 0} min read
                                </div>
                            </div>
                            {title &&
                                (<div className="flex items-center gap-3 text-sm text-white justify-between">
                                    <h1 className="text-4xl font-bold leading-tight">{title}</h1>
                                </div>
                                )}
                            {excerpt && (
                                <p className="text-lg text-gray-700 border-l-4 border-blue-500 pl-4 italic"><strong>Short Excerpt: </strong>{excerpt}</p>
                            )}
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formContent }} />
                            {tags.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Tags</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map((tag, index) => (
                                            <span key={index} className="rounded-full text-sm">
                                                {`${tag}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {relatedBlogs.length > 0 && (
                                <div>
                                    <h3 className="font-semibold mb-2">Related Blogs</h3>
                                    <ul className="list-disc list-inside text-sm text-gray-700">
                                        {relatedBlogs.map((blogId) => {
                                            const blog = allBlogs.data.find(b => b.id === blogId)
                                            return blog ? (
                                                <li key={blogId}>{blog.blog_title}</li>
                                            ) : null
                                        })}
                                    </ul>
                                </div>
                            )}
                            {selectedPlatforms.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Platform Publishing Settings</h3>
                                    {selectedPlatforms.map((platformId) => {
                                        const platform = platformData?.data.find(
                                            (p: any) => p.id === platformId
                                        )
                                        const settings = platformSettings[platformId]
                                        return (
                                            <div key={platformId} className="border rounded-xl p-4 space-y-2">
                                                <h4 className="font-semibold text-lg">{platform?.platform_name}</h4>
                                                <p><b>Slug:</b> {settings?.slug || "-"}</p>
                                                <p><b>Status:</b> {settings?.publishStatus || "draft"}</p>
                                                <p><b>SEO Title:</b> {settings?.seoTitle || "-"}</p>
                                                <p><b>Meta Description:</b> {settings?.metaDescription || "-"}</p>
                                                <p><b>Canonical URL:</b> {settings?.canonicalUrl || "-"}</p>
                                                <p><b>CTA:</b> {settings?.ctaButtonText} → {settings?.ctaButtonLink}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
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
        </form>
    );
};

export default BlogForm;