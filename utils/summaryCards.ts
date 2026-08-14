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
      cardClassName: "bg-[var(--status-purple-bg)] text-[var(--text-strong)]",
      labelClassName: "text-[var(--text-muted)]",
      descriptionClassName: "text-[var(--text-muted)]",
      iconClassName: "bg-white text-[var(--status-purple-text)]",
      progressTrackClassName: "bg-black/[0.06]",
      progressFillClassName: "bg-[#a142f4]",
      progress: 100,
    },
    {
      label: "Published",
      value: publishedBlogs,
      description: "Posts already live on platforms",
      icon: CheckCircle2,
      cardClassName: "bg-[var(--status-green-bg)] text-[var(--text-strong)]",
      labelClassName: "text-[var(--text-muted)]",
      descriptionClassName: "text-[var(--text-muted)]",
      iconClassName: "bg-white text-[var(--status-green-text)]",
      progressTrackClassName: "bg-black/[0.06]",
      progressFillClassName: "bg-[#1e8e3e]",
      progress: publishedProgress,
    },
    {
      label: "Scheduled",
      value: scheduledBlogs,
      description: "Posts waiting for publish time",
      icon: Clock3,
      cardClassName: "bg-[var(--status-amber-bg)] text-[var(--text-strong)]",
      labelClassName: "text-[var(--text-muted)]",
      descriptionClassName: "text-[var(--text-muted)]",
      iconClassName: "bg-white text-[var(--status-amber-text)]",
      progressTrackClassName: "bg-black/[0.06]",
      progressFillClassName: "bg-[#f9ab00]",
      progress: scheduledProgress,
    },
    {
      label: "Active Platforms",
      value: activePlatforms,
      description: "Connected publishing destinations",
      icon: Globe2,
      cardClassName: "bg-[var(--bg-selected)] text-[var(--text-strong)]",
      labelClassName: "text-[var(--text-muted)]",
      descriptionClassName: "text-[var(--text-muted)]",
      iconClassName: "bg-white text-[var(--accent-text)]",
      progressTrackClassName: "bg-black/[0.06]",
      progressFillClassName: "bg-[var(--accent)]",
      progress: platformProgress,
    },
  ];

  return summaryCards;
};
