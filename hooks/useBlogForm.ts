"use client";

import { useState } from "react";

type CategoryType = {
  id: number;
  name: string;
};

const useBlogForm = () => {
  const [blogId, setBlogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "platforms">(
    "general",
  );
  const [selectedPlatforms, setSelectedPlatforms] = useState<number[]>([]);
  const [platformData, setPlatformData] = useState<any>(null);
  const [formContent, setFormContent] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  // const [author, setAuthor] = useState('');
  const [category, setCategory] = useState<number[]>([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [publishDate, setPublishDate] = useState<string>("");
  const [globalStatus, setGlobalStatus] = useState("draft");
  const [tags, setTags] = useState<string[]>([]);
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [allBlogs, setAllBlogs] = useState<{ data: any[] }>({ data: [] });
  const [readingTime, setReadingTime] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaFor, setMediaFor] = useState<"feature" | "editor">("feature");
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [tagsList, setTagsList] = useState<{ id: number; name: string }[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
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

  return {
    blogId, setBlogId, activeTab, setActiveTab, selectedPlatforms, setSelectedPlatforms, platformData, setPlatformData, formContent, setFormContent, image,
    setImage, title, setTitle, excerpt, setExcerpt, category, setCategory, isCategoryModalOpen, setIsCategoryModalOpen, publishDate, setPublishDate, globalStatus,
    setGlobalStatus, tags, setTags, relatedBlogs, setRelatedBlogs, isPopupOpen, setIsPopupOpen, allBlogs, setAllBlogs, readingTime, setReadingTime, selectedFile,
    setSelectedFile, mediaFor, setMediaFor, mediaFiles, setMediaFiles, showPreview, setShowPreview, tagsList, setTagsList, isUploadModalOpen, setIsUploadModalOpen,
    selectedTags,  setSelectedTags,  isTagModalOpen, setIsTagModalOpen, platformSettings, setPlatformSettings, categories, setCategories,
  };
};

export default useBlogForm;
