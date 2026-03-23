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
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  excerpt: string;
  setExcerpt: React.Dispatch<React.SetStateAction<string>>;
  editor: any;
  handleTagsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tags: string[];
  relatedBlogs: any[];
  allBlogs: { data: any[] };
  setIsPopupOpen: React.Dispatch<React.SetStateAction<boolean>>;
  readingTime: number;
  setReadingTime: React.Dispatch<React.SetStateAction<number>>;
  tagsList: { id: number; name: string }[];
  selectedTags: number[];
  setSelectedTags: React.Dispatch<React.SetStateAction<number[]>>;
  setIsTagModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleAddEditorImage: () => void;
};

export type PlatformSettingsProps = {
  platformData: any;
  selectedPlatforms: number[];
  setSelectedPlatforms: React.Dispatch<React.SetStateAction<number[]>>;
  platformSettings: {
    [platformId: number]: {
      seoTitle: string;
      slug: string;
      publishStatus: string;
      metaDescription: string;
      canonicalUrl: string;
      ctaButtonText: string;
      ctaButtonLink: string;
    };
  };
  setPlatformSettings: React.Dispatch<
    React.SetStateAction<{
      [platformId: number]: {
        seoTitle: string;
        slug: string;
        publishStatus: string;
        metaDescription: string;
        canonicalUrl: string;
        ctaButtonText: string;
        ctaButtonLink: string;
      };
    }>
  >;
  handlePlatformChange: (
    platformId: number,
    field: string,
    value: string,
  ) => void;
  title: string;
  excerpt: string;
};

export type BlogFormType = {
  title: string;
  excerpt: string;
  formContent: string;
  image: string;
  category: any;
  publishDate: string;
  globalStatus: string;
  tags: string[];
  related_blogs: number[];
  reading_time: number;
  platforms: {
    platformId: number;
    settings: any;
  }[];
};
