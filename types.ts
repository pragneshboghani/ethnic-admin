import {
  Control,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormSetValue,
} from "react-hook-form";
import type { Dispatch, SetStateAction } from "react";
import { TaxonomyItem } from "./app/(dashboard)/account/category/page";
import { Category } from "./components/category/ViewDetailsModal";

export interface Platform {
  id?: number;
  platform_name: string;
  website_url: string;
  api_endpoint: string;
  plateform_type: "wordpress" | "custom";
  auth_type: "none" | "token" | "basic";
  auth_token?: string;
  username?: string;
  password?: string;
  status: "Active" | "Inactive";
  created_at?: string;
  updated_at?: string;
  data_source: string;
  blog_path: string;
  CTA_link: string;
  CTA_button_text: string;
}

export interface Media {
  id: number;
  url: string;
  alt: string;
  type: string;
}

export type BlogPreviewModalProps = {
  showPreview: boolean;
  setShowPreview: (val: boolean) => void;
  mode?: "preview" | "publish";
  onConfirmPublish?: () => void;
  image: string | null;
  category: number[];
  categories: { id: number; name: string }[];
  publishDate: string;
  updateDate?: string;
  createDate?: string;
  readingTime: number;
  title: string;
  excerpt: string;
  formContent: string;
  tags: string[];
  relatedBlogs: number[];
  allBlogs: { data: any[] };
  selectedPlatforms: number[];
  platformData: any;
  platformSettings: any;
  faq: { question: string; answer: string }[];
};

export type BlogGeneralSectionProps = {
  register: any;
  control: Control<any>;
  setValue: UseFormSetValue<any>;
  content: string;
  relatedBlogs: any[];
  allBlogs: { data: any[] };
  platformData: any;
  setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  tagsList: { id: number; name: string }[];
  setIsTagModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedTags: number[];
};

export type PlatformSettingsProps = {
  platformData: any;
  selectedPlatforms: number[];
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<number[]>>;
  fields: FieldArrayWithId<BlogFormUIType, "platforms", "id">[];
  append: UseFieldArrayAppend<BlogFormUIType, "platforms">;
  remove: UseFieldArrayRemove;
  platformSettings: PlatformSettings;
  setPlatformSettings: React.Dispatch<React.SetStateAction<PlatformSettings>>;
  handlePlatformChange: (
    platformId: number,
    field: string,
    value: string,
  ) => void;
  title: string;
  excerpt: string;
};

export type PlatformSettingFields = {
  seoTitle: string;
  slug: string;
  publishStatus: "draft" | "future" | "publish";
  metaDescription: string;
  canonicalUrl: string;
  ctaButtonText: string;
  ctaButtonLink: string;
};

export type PlatformItem = {
  platformId: number;
  settings: PlatformSettingFields;
};

export type BlogFormType = {
  BlogTitle: string;
  BlogExcerpt: string;
  BlogContent: string;
  BlogFaq: { question: string; answer: string }[];
  image: string;
  BlogSelectedCategories: number[];
  BlogAuthor: string;
  BlogPublishDate: string;
  BlogGlobalStatus: "draft" | "publish" | "future";
  BlogTags: number[] | undefined;
  BlogRalated: number[] | undefined;
  BlogReadingTime: number;
  platforms: PlatformItem[];
};

export type BlogFormUIType = {
  title: string;
  excerpt: string;
  content: string;
  faq: { question: string; answer: string }[];
  publishDate: string;
  globalStatus: "draft" | "publish" | "future";
  category: number[];
  reading_time: number;
  tags: number[];
  relatedBlogs: number[];
  platforms: PlatformItem[];
};

export type PlatformSetting = {
  seoTitle: string;
  slug: string;
  publishStatus: "draft" | "publish" | "future";
  metaDescription: string;
  canonicalUrl: string;
  ctaButtonText: string;
  ctaButtonLink: string;
};

export type PlatformSettings = {
  [platformId: number]: PlatformSetting;
};

export type BlogSidebarProps = {
  category: number[];
  setValue: any;
  register: any;
  publishDate: string;
  categories: {
    id: number;
    name: string;
  }[];
  image: string | null;
  handleRemoveImage: () => void;
  setIsCategoryModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUploadModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setMediaFor: React.Dispatch<React.SetStateAction<"feature" | "editor">>;
  globalStatus: "draft" | "publish" | "future";
  blogId: string | null;
};

export type CategoryType = {
  id: number;
  name: string;
};

export type DashboardBlog = {
  id: number;
  blog_title: string;
  publish_date?: string | null;
  status?: "draft" | "publish" | "future";
  platforms?: number[];
  featured_image?: string | null;
  author?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type NamedCollection<T> = {
  data: T[];
};

export type PlatformCollection = NamedCollection<Platform> & {
  totalPlatforms?: number;
};

export type BlogListItem = DashboardBlog & {
  category?: number[];
  tags?: number[];
};

export type BlogListTableType = {
  blogs: BlogListItem[];
  platformData: PlatformCollection | null;
  categoryData: NamedCollection<CategoryType> | null;
  tagData: NamedCollection<CategoryType> | null;
  setSelectedBlog: Dispatch<SetStateAction<BlogListItem | null>>;
  setShowPreview: Dispatch<SetStateAction<boolean>>;
  setSelectUpdate: Dispatch<SetStateAction<number | null>>;
  setDuplicateBlogId: Dispatch<SetStateAction<number | null>>;
  setDeleteBlogId: Dispatch<SetStateAction<number | null>>;
  loading: boolean
};

export type TaxonomyCardProps = {
  title: string;
  description: string;
  items: TaxonomyItem[];
  type: "category" | "tag";
  emptyText: string;
  onDelete: (item: TaxonomyItem, type: string) => void;
  setShowdata: (data: { data: Category | null; type: string }) => void;
};

export type StatCardProps = {
  label: string;
  value: number;
  note: string;
  tone: string;
};

export type BlogFiltersProps = {
    loading: boolean;
    blogs: any[];
    draftBlogs: number;
    search: string;
    setSearch: (val: string) => void;
    author: string;
    setAuthor: (val: string) => void;
    category: string;
    setCategory: (val: string) => void;
    categoryData: any;
    tags: string;
    setTags: (val: string) => void;
    tagData: any;
    platform: string;
    setPlatform: (val: string) => void;
    platformData: any;
    status: string;
    setStatus: (val: string) => void;
    sort: string;
    setSort: (val: string) => void;
};

export type UploadPlatformData = {
    data?: Array<{
        id: number;
        platform_name?: string;
        status?: string;
        api_endpoint?: string;
    }>;
} | null;

export type MediaFileItem = {
    id: number;
    file_url: string;
    file_type: "image" | "video";
    mime_type?: string | null;
};

export interface UploadMediaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: () => void;
    onSelectImage?: (url: string) => void;
    onSelectMedia?: (media: { url: string; fileType: "image" | "video"; mimeType?: string | null }) => void;
    allowedMediaType?: "image" | "all";
    platformData: UploadPlatformData
}