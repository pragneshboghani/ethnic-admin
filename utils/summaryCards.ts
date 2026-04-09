import { CheckCircle2, Clock3, FileText, Globe, Globe2 } from "lucide-react";

export const FetchSummaryCards = (blogs: any[], platformData: any) => {
  const totalBlogs = blogs.length;
  const publishedBlogs = blogs.filter((blog) => blog.status === "publish").length;
  const scheduledBlogs = blogs.filter((blog) => blog.status === "future").length;
  const clampProgress = (value: number) => Math.max(22, Math.min(96, value));
  const publishedProgress = totalBlogs > 0 ? (publishedBlogs / totalBlogs) * 100 : 0;
  const scheduledProgress = totalBlogs > 0 ? (scheduledBlogs / totalBlogs) * 100 : 22;
  const activePlatforms = platformData?.data?.filter((p: any) => p.status == "Active")?.length || 0;    
  const platformProgress = (activePlatforms / platformData?.totalPlatforms) * 100;

  const summaryCards = [
    {
      label: "Total blogs",
      value: totalBlogs,
      description: "Content entries in the current view",
      icon: FileText,
      cardClassName: "bg-[#5d366f] text-white",
      labelClassName: "text-white/72",
      descriptionClassName: "text-white/72",
      iconClassName: "bg-[#24152f] text-white",
      progressTrackClassName: "bg-white/16",
      progressFillClassName: "bg-white",
      progress: 100,
    },
    {
      label: "Published",
      value: publishedBlogs,
      description: "Posts already live on platforms",
      icon: CheckCircle2,
      cardClassName: "bg-[#2f6670] text-white",
      labelClassName: "text-white/72",
      descriptionClassName: "text-white/72",
      iconClassName: "bg-[#16333c] text-white",
      progressTrackClassName: "bg-white/16",
      progressFillClassName: "bg-white",
      progress: publishedProgress,
    },
    {
      label: "Scheduled",
      value: scheduledBlogs,
      description: "Posts waiting for publish time",
      icon: Clock3,
      cardClassName: "bg-[#b8664b] text-white",
      labelClassName: "text-white/72",
      descriptionClassName: "text-white/72",
      iconClassName: "bg-[#4a2a20] text-white",
      progressTrackClassName: "bg-white/16",
      progressFillClassName: "bg-white",
      progress: scheduledProgress,
    },
    {
      label: "Active Platforms",
      value: activePlatforms,
      description: "Connected publishing destinations",
      icon: Globe2,
      cardClassName: "bg-[#354b73] text-white",
      labelClassName: "text-white/72",
      descriptionClassName: "text-white/72",
      iconClassName: "bg-[#1c2b45] text-white",
      progressTrackClassName: "bg-white/16",
      progressFillClassName: "bg-white",
      progress: platformProgress,
    },
  ];

  return summaryCards;
};
