import type { CategoryType, NamedCollection,  PlatformCollection } from "@/types";

export const getPlatformNames = (
  platformIds: number[] = [],
  platformData: PlatformCollection | null,
): string[] => {
  if (!Array.isArray(platformIds)) return [];

  return platformIds
    .map((platformId) => {
      const selectedPlatform = platformData?.data?.find(
        (item) => item.id === platformId,
      );
      return selectedPlatform?.platform_name || null;
    })
    .filter((name): name is string => Boolean(name));
};

export const getCategoryNames = (
  categoryIds: number[] = [],
  categoryData: NamedCollection<CategoryType> | null,
): string[] => {
  if (!Array.isArray(categoryIds)) return [];

  return categoryIds
    .map((categoryId) => {
      const selectedCategory = categoryData?.data?.find(
        (item) => item.id === categoryId,
      );
      return selectedCategory?.name || null;
    })
    .filter((name): name is string => Boolean(name));
};

export const getTagNames = (
  tagIds: number[] = [],
  tagData:NamedCollection<CategoryType> | null,
): string[] => {
  if (!Array.isArray(tagIds)) return [];

  return tagIds
    .map((tagId) => {
      const selectedTag = tagData?.data?.find((item) => item.id === tagId);
      return selectedTag?.name || null;
    })
    .filter((name): name is string => Boolean(name));
};

export const getStatusMeta = (blogStatus: string) => {
  switch (blogStatus) {
    case "publish":
      return {
        label: "Published",
        className: "border-[var(--status-green-text)]/28 bg-[#1e8e3e]/16 text-[var(--status-green-text)]",
      };

    case "future":
      return {
        label: "Scheduled",
        className: "border-[var(--status-amber-text)]/28 bg-[#f9ab00]/16 text-[var(--status-amber-text)]",
      };

    default:
      return {
        label: "Draft",
        className: "border-[var(--status-purple-text)]/28 bg-[#a142f4]/16 text-[var(--status-purple-text)]",
      };
  }
};
