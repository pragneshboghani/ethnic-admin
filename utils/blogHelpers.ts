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
        className: "border-[#2f6670]/28 bg-[#2f6670]/16 text-[#b8edf1]",
      };

    case "future":
      return {
        label: "Scheduled",
        className: "border-[#b8664b]/28 bg-[#b8664b]/16 text-[#ffd7c4]",
      };

    default:
      return {
        label: "Draft",
        className: "border-[#7a428f]/28 bg-[#7a428f]/16 text-[#e2c6ff]",
      };
  }
};
