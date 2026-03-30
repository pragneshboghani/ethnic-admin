import {
  Control,
  FieldArrayWithId,
  UseFieldArrayAppend,
  UseFieldArrayRemove,
  UseFormSetValue,
} from "react-hook-form";

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
  image: string | null;
  category: number[];
  categories: { id: number; name: string }[];
  publishDate: string;
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
