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
import { PreviewPlatform } from "./components/blog/BlogPreviewModal";

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

export type PublishHistoryItem = {
  id: number;
  blog_id: number;
  entity_type: "blog" | "seo_blog";
  entity_id: number | null;
  platform_id: number | null;
  action_type: "create" | "update" | "delete";
  change_field: string;
  changed_fields?: string | string[] | null;
  old_values?: string | Record<string, unknown> | null;
  new_values?: string | Record<string, unknown> | null;
  trigger_source?: string | null;
  changed_by_user_id?: number | null;
  changed_by_name?: string | null;
  created_at?: string | null;
};

export type BlogPreviewModalProps = {
  showPreview: boolean;
  setShowPreview: (val: boolean) => void;
  mode?: "preview" | "publish";
  onConfirmPublish?: () => void;
  image: string | null;
  category: number[];
  categories: { id: number; name: string }[];
  publishDate: string;
  globalStatus?: "draft" | "publish" | "future";
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
  blogId?: number;
  publishHistory?: PublishHistoryItem[];
  publishHistoryLoading?: boolean;
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
  blogId: string | null;
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
  author: string;
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
  authors: authorData[];
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
    platformData?: UploadPlatformData
}

export type GeneralTabContentProps = {
    categoryNames: string[];
    title: string;
    excerpt: string;
    readingTime: number;
    publishDate: string;
    updateDate?: string;
    createDate?: string;
    image: string | null;
    formContent: string;
    faq: Array<{ question: string; answer: string }>;
    tags: string[];
    relatedBlogs: number[];
    allBlogs: { data: any[] };
};

export type PlatformSpecificPreviewProps = {
    title: string;
    excerpt: string;
    selectedPlatforms: number[];
    platformData: {
        data?: PreviewPlatform[];
    } | null;
    platformSettings: PlatformSettings;
};

export type PlatformPreviewItem = {
    id: number;
    platformName: string;
    websiteUrl: string;
    settings?: PlatformSetting;
};

export type authorData = {
    id: number;
    description: string | null;
    email: string;
    name: string;
    img_url: string;
    role: string;
}

export type Role = "super_admin" | "admin" | "sub_admin";

export type Author = {
  id: number;
  name: string;
  email: string;
  role: Role;
}
export type AuthorFormData = {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role: string;
  admin_id?: number;
  profile_image: string;
  description: string;
  members?: number[];
  social_links?: { [key: string]: string };
};

export type GroupMember = {
  name: string;
  description: string;
  image: string;
  id: number;
  created_by?: number;
  members?: {
    id: number;
    name: string;
  }[];
}

export type AuthorInitialData = {
  id?: number;
  name: string;
  email: string;
  role: string;
  profile_image?: string;
  admin_id?: number;
  description?: string;
  user_groups?: GroupMember[];
  social_links?: { [key: string]: string };
  selected_platforms?: number[] | undefined
};

export type AuthorFormProps = {
  mode: "create" | "update";
  initialData?: AuthorInitialData | null;
};

export type Authors = {
    id: number;
    name: string;
    email: string;
    role: Role;
    img_url: string;
};

export type AuthorDetailType = {
  id: number;
  name: string;
  email: string;
  role: string;
  profile_image?: string;
  created_at?: string;
  description?: string;
  user_groups?: {
    id: number;
    members?: {
      id: number;
      name: string;
    }[];
  }[];
};

export type Group = {
  id: number;
  group_name: string;
  group_description?: string;
  role: string;
  name?: string;
  members?: string[];
  member_ids?: number[];
  created_by: number;
  image: string;
};

export type LinkModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: {
    url: string;
    text: string;
    openInNewTab: boolean;
  }) => void;
  onRemove?: () => void;
  hasSelection: boolean;
  initialUrl?: string;
  initialText?: string;
  initialOpenInNewTab?: boolean;
  isExistingLink?: boolean;
};

export type ToolbarButtonProps = {
    title: string;
    icon: React.ReactNode;
    onAction: () => void;
};

export type LinkFormValues = {
    url: string;
    text: string;
    openInNewTab: boolean;
};

export type EditorPlatformData = {
    data?: Array<{
        id: number;
        platform_name?: string;
        status?: string;
        api_endpoint?: string;
    }>;
} | null;

export type replyType = {
    type: "reply" | "status_change";
    replied_at: string;
    admin_reply?: string;
    adminData: {
        name: string;
        img_url: string;
    };
}

export type comments = {
    comment_id: number;
    created_at: string;
    commentor_name: string;
    commentor_email: string;
    comment_status: string;
    comment: string;
    admins_reply: replyType[] | [];
    blog_title?: string;
}

export type groupedComments = {
    platform_name: string;
    comments: comments[];
}

export type BlogCommentPopupProps = {
    onClose: () => void;
    selectedComment: any | null;
    setSelectedComment: React.Dispatch<React.SetStateAction<any | null>>;
    loadComments: () => Promise<void>;
};