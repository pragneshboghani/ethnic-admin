"use client";

import DashBoardActions from "@/actions/DashboardAction";
import AddEditPlatformModal from "@/components/plateform/AddEditPlatformModal";
import { FetchDashBoardData } from "@/utils/dashboardStats";
import {
  Bell,
  CheckCircle2,
  Circle,
  ExternalLink,
  MoreVertical,
  Plus,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type RecentBlog = {
  id: number;
  blog_title: string;
};

type DashboardBlog = {
  id: number;
  blog_title: string;
  publish_date?: string | null;
  status?: "draft" | "publish" | "future";
  platforms?: number[];
};

type ActivePlatform = {
  id: number;
  platform_name: string;
  website_url: string;
};

const taskNotes = [
  "Prepare Figma file",
  "Design publishing flow",
  "Review channel setup",
];

const taskColors = ["bg-[#ff824d]", "bg-[#7a3f94]", "bg-[#9ad8de]"];
const cardColors = [
  {
    card: "bg-[#5d366f]",
    text: "text-white",
    subtext: "text-white/72",
    chip: "bg-[#1b1326] text-white",
    progress: "bg-white/15",
    fill: "bg-white",
  },
  {
    card: "bg-[#2f6670]",
    text: "text-white",
    subtext: "text-white/72",
    chip: "bg-[#10242c] text-white",
    progress: "bg-white/15",
    fill: "bg-white",
  },
  {
    card: "bg-[#b8664b]",
    text: "text-white",
    subtext: "text-white/72",
    chip: "bg-[#261821] text-white",
    progress: "bg-white/15",
    fill: "bg-white",
  },
];

const getBlogStatusLabel = (status?: "draft" | "publish" | "future") => {
  if (status === "future") return "Scheduled";
  if (status === "publish") return "Published";
  return "Draft";
};

const Dashboard = () => {
  const router = useRouter();
  const [days, setDays] = useState("7");
  const [recentBlogs, setRecentBlogs] = useState<RecentBlog[]>([]);
  const [calendarBlogs, setCalendarBlogs] = useState<DashboardBlog[]>([]);
  const [allPlatforms, setAllPlatforms] = useState<ActivePlatform[]>([]);
  const [activePlateform, setactivePlateform] = useState<ActivePlatform[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState(null);
  const [openScheduleMenu, setOpenScheduleMenu] = useState<string | null>(null);
  const [collapsedScheduleGroups, setCollapsedScheduleGroups] = useState<string[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const stats = FetchDashBoardData();
  const featuredStats = [stats[0], stats[1], stats[3]].filter(Boolean);

  useEffect(() => {
    const fetchRecentBlogs = async () => {
      const res = await DashBoardActions.getRecentlyBlog(days);
      setRecentBlogs(res.data);
    };

    fetchRecentBlogs();
  }, [days]);

  const fetchActivePlatform = async () => {
    const res = await DashBoardActions.getActivePlatform();
    setactivePlateform(res.data);
  };

  useEffect(() => {
    fetchActivePlatform();
  }, []);

  useEffect(() => {
    const fetchCalendarBlogs = async () => {
      try {
        const res = await DashBoardActions.getAllData();
        setCalendarBlogs(Array.isArray(res.blogData) ? res.blogData : []);
        setAllPlatforms(Array.isArray(res.plateformData) ? res.plateformData : []);
      } catch (error) {
        console.error("Error fetching calendar blogs:", error);
      }
    };

    fetchCalendarBlogs();
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      if (!target.closest("[data-schedule-menu]")) {
        setOpenScheduleMenu(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

  const todayText = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const featuredCards = featuredStats.map((item, index) => {
    const totalBlogs = Number(stats[0]?.value ?? 0);
    const safeValue = Number(item?.value ?? 0);
    const progress =
      index === 0
        ? Math.max(32, Math.min(96, safeValue * 10 + 24))
        : index === 1
          ? Math.max(
              24,
              Math.min(96, totalBlogs > 0 ? (safeValue / totalBlogs) * 100 : 30),
            )
          : Math.max(26, Math.min(96, safeValue * 18 + 18));

    return {
      ...item,
      progress,
      tasksLabel:
        index === 0
          ? `${safeValue} total`
          : index === 1
            ? `${safeValue} live`
            : `${safeValue} active`,
      rateLabel:
        index === 0
          ? `${Math.min(99, safeValue * 12 + 24)}%`
          : index === 1
            ? `${Math.min(99, Math.round(progress))}%`
            : `${Math.min(99, safeValue * 21 + 15)}%`,
    };
  });

  const taskItems =
    recentBlogs.length > 0
      ? recentBlogs.slice(0, 3).map((blog, index) => ({
          id: blog.id,
          title: blog.blog_title,
          note: taskNotes[index] || "Review task",
          color: taskColors[index % taskColors.length],
          done: index === 2,
        }))
      : [
          {
            id: 1,
            title: "Mobile App",
            note: "Prepare Figma file",
            color: taskColors[0],
            done: false,
          },
          {
            id: 2,
            title: "UX wireframes",
            note: "Design UX wireframes",
            color: taskColors[1],
            done: false,
          },
          {
            id: 3,
            title: "Mobile App",
            note: "Research",
            color: taskColors[2],
            done: true,
          },
        ];

  const getPlatformNames = (platformIds: number[] = []): string[] =>
    Array.isArray(platformIds)
      ? platformIds
          .map((platformId) => {
            const matchedPlatform = allPlatforms.find((platform) => platform.id === platformId);
            return matchedPlatform?.platform_name || null;
          })
          .filter((platformName): platformName is string => Boolean(platformName))
      : [];

  const getBlogPlatformNames = (blogId: number) => {
    const matchedBlog = calendarBlogs.find((blog) => blog.id === blogId);
    return getPlatformNames(matchedBlog?.platforms || []);
  };

  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  const searchMatchedBlogItems = calendarBlogs
    .map((blog, index) => {
      const platformNames = getPlatformNames(blog.platforms || []);
      const statusLabel = getBlogStatusLabel(blog.status);
      const matchesSearch =
        blog.blog_title.toLowerCase().includes(normalizedSearchQuery) ||
        statusLabel.toLowerCase().includes(normalizedSearchQuery) ||
        platformNames.some((platformName) =>
          platformName.toLowerCase().includes(normalizedSearchQuery),
        );

      if (!matchesSearch) {
        return null;
      }

      return {
        id: blog.id,
        title: blog.blog_title,
        note:
          platformNames.length > 0
            ? platformNames.join(" • ")
            : `${statusLabel} blog`,
        color: taskColors[index % taskColors.length],
        done: blog.status === "publish",
      };
    })
    .filter(Boolean) as typeof taskItems;

  const filteredTaskItems = normalizedSearchQuery
    ? searchMatchedBlogItems.slice(0, 6)
    : taskItems;

  const statBoxes = [
    {
      value: `${Number(stats[0]?.value ?? 0)}`,
      label: "Total blogs",
    },
    {
      value: `${Number(stats[1]?.value ?? 0)}`,
      label: "Published",
    },
    {
      value: `${Number(stats[2]?.value ?? 0)}`,
      label: "Scheduled",
      dashed: true,
    },
  ];

  const calendarEntries = calendarBlogs
    .filter((blog) => blog.publish_date && blog.status !== "draft")
    .map((blog) => {
      const publishDate = new Date(blog.publish_date as string);

      if (Number.isNaN(publishDate.getTime())) {
        return null;
      }

      return {
        id: blog.id,
        blog_title: blog.blog_title,
        platformNames: getPlatformNames(blog.platforms || []),
        statusLabel: getBlogStatusLabel(blog.status),
        timeLabel: new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(publishDate),
        timestamp: publishDate.getTime(),
        dateLabel: new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(publishDate),
      };
    })
    .filter(Boolean) as Array<{
    id: number;
    blog_title: string;
    platformNames: string[];
    statusLabel: string;
    timeLabel: string;
    timestamp: number;
    dateLabel: string;
  }>;

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const upcomingCalendarEntries = calendarEntries
    .filter((item) => item.timestamp >= startOfToday.getTime())
    .sort((a, b) => a.timestamp - b.timestamp);

  const fallbackCalendarEntries = [...calendarEntries]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 8)
    .sort((a, b) => a.timestamp - b.timestamp);

  const visibleCalendarEntries =
    upcomingCalendarEntries.length > 0 ? upcomingCalendarEntries : fallbackCalendarEntries;

  const calendarSearchSource = normalizedSearchQuery
    ? [...calendarEntries].sort((a, b) => a.timestamp - b.timestamp)
    : visibleCalendarEntries;

  const filteredCalendarEntries = calendarSearchSource.filter((item) => {
    if (!normalizedSearchQuery) return true;

    return (
      item.blog_title.toLowerCase().includes(normalizedSearchQuery) ||
      item.platformNames.some((platformName) =>
        platformName.toLowerCase().includes(normalizedSearchQuery),
      ) ||
      item.statusLabel.toLowerCase().includes(normalizedSearchQuery) ||
      item.dateLabel.toLowerCase().includes(normalizedSearchQuery) ||
      item.timeLabel.toLowerCase().includes(normalizedSearchQuery)
    );
  });

  const scheduleGroups = Array.from(
    filteredCalendarEntries.reduce((map, item) => {
      if (!map.has(item.dateLabel) && map.size >= 3) {
        return map;
      }

      const group = map.get(item.dateLabel) ?? [];
      if (group.length < 3) {
        group.push(item);
      }

      map.set(item.dateLabel, group);
      return map;
    }, new Map<string, typeof visibleCalendarEntries>()),
  ).map(([dateLabel, items]) => ({
    dateLabel,
    items,
  }));

  const toggleGroupCollapse = (dateLabel: string) => {
    setCollapsedScheduleGroups((prev) =>
      prev.includes(dateLabel)
        ? prev.filter((item) => item !== dateLabel)
        : [...prev, dateLabel],
    );
    setOpenScheduleMenu(null);
  };

  const filteredPlatforms = activePlateform.filter((platform) => {
    if (!normalizedSearchQuery) return true;

    return (
      platform.platform_name.toLowerCase().includes(normalizedSearchQuery) ||
      platform.website_url.toLowerCase().includes(normalizedSearchQuery)
    );
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1fr)_minmax(340px,368px)] 2xl:grid-cols-[minmax(0,1fr)_minmax(360px,392px)]">
        <div className="space-y-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-[38px] font-semibold leading-none tracking-[-0.04em] text-[#eef4ff]">
                Hello, Team
              </h1>
              <p className="mt-3 text-sm font-normal text-[#8ea0b8]">
                Today is {todayText}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div
                className={`transition-all duration-300 ${
                  isSearchOpen ? "w-full sm:w-[320px]" : "w-12"
                }`}
              >
                {isSearchOpen ? (
                  <div className="flex h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#151d2c] px-4 text-[#dce6f4] shadow-[0_12px_26px_rgba(0,0,0,0.24)]">
                    <Search size={18} className="shrink-0 text-[#8ea0b8]" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search blogs, status, or platforms..."
                      className="h-full min-w-0 flex-1 bg-transparent text-sm text-[#eef4ff] placeholder:text-[#6f8096] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#8ea0b8] transition hover:bg-white/[0.04] hover:text-[#eef4ff]"
                      aria-label="Close dashboard search"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-[#151d2c] text-[#dce6f4] shadow-[0_12px_26px_rgba(0,0,0,0.24)] transition hover:border-[#31425e] hover:bg-[#182438]"
                    aria-label="Open dashboard search"
                  >
                    <Search size={18} />
                  </button>
                )}
              </div>

              <Link
                href="/account/blogs/add"
                className="inline-flex items-center justify-center rounded-xl border border-white/8 bg-[#1c2636] px-7 py-3.5 text-sm font-medium text-white shadow-[0_14px_28px_rgba(0,0,0,0.28)] transition hover:bg-[#243247]"
              >
                Add New Blog
              </Link>
            </div>
          </div>

          {normalizedSearchQuery && (
            <div className="mt-2 flex flex-wrap items-center gap-3 rounded-[18px] border border-white/8 bg-[#151d2c] px-4 py-3 text-sm text-[#8ea0b8] shadow-[0_12px_26px_rgba(0,0,0,0.18)]">
              <span className="inline-flex items-center rounded-full border border-[#2f6670]/35 bg-[#17303a] px-3 py-1 text-xs font-medium text-[#9ad8de]">
                Dashboard search
              </span>
              <span>
                Showing results for <span className="font-medium text-[#eef4ff]">"{searchQuery}"</span>
              </span>
            </div>
          )}

          <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {featuredCards.map((item, index) => {
              const theme = cardColors[index];

              return (
                <div
                  key={item.title}
                  className={`rounded-3xl border border-white/8 p-6 shadow-[0_18px_40px_rgba(0,0,0,0.28)] ${theme.card} ${theme.text}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex -space-x-2">
                      <span className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${theme.chip}`}>
                        +{index + 3}
                      </span>
                      <span className="h-10 w-10 rounded-full border-2 border-white/80 bg-[#f8d2bb]" />
                      <span className="h-10 w-10 rounded-full border-2 border-white/80 bg-[#dce5f3]" />
                    </div>
                    <MoreVertical size={18} className={theme.subtext} />
                  </div>

                  <div className="mt-12">
                    <h2 className="max-w-[180px] text-[18px] font-semibold leading-7">
                      {item.title}
                    </h2>

                    <div className={`mt-8 flex items-center gap-3 text-sm ${theme.subtext}`}>
                      <span>{item.tasksLabel}</span>
                      <span className="h-4 w-px bg-white/35" />
                      <span>{item.rateLabel}</span>
                    </div>

                    <div className={`mt-4 h-1.5 rounded-full ${theme.progress}`}>
                      <div
                        className={`h-full rounded-full ${theme.fill}`}
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          <div className="grid grid-cols-1 gap-10 xl:grid-cols-[minmax(0,1.05fr)_minmax(300px,0.95fr)]">
            <section>
              <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-[#eef4ff]">
                Tasks for today
              </h3>

              {filteredTaskItems.length > 0 ? (
                <div className="mt-6 space-y-5">
                  {filteredTaskItems.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 rounded-[24px] border border-white/8 bg-[#151d2c] px-5 py-5 shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
                    >
                      <span className={`h-20 w-1 rounded-full ${task.color}`} />

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[17px] font-semibold text-[#eef4ff]">
                          {task.title}
                        </p>
                        <p className="mt-3 text-sm text-[#8ea0b8]">{task.note}</p>
                      </div>

                      {task.done ? (
                        <CheckCircle2 className="text-[#9ad8de]" size={20} />
                      ) : (
                        <Circle className="text-[#40506a]" size={20} />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-[24px] border border-white/8 bg-[#151d2c] px-5 py-6 text-sm text-[#8ea0b8] shadow-[0_14px_34px_rgba(0,0,0,0.24)]">
                  No task matches your current dashboard search.
                </div>
              )}
            </section>

            <div>
              <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-[#eef4ff]">
                Statistics
              </h3>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {statBoxes.map((box) => (
                  <div
                    key={box.label}
                    className={`rounded-[20px] px-5 py-6 ${
                      box.dashed
                        ? "border border-dashed border-white/14 bg-transparent"
                        : "border border-white/8 bg-[#151d2c]"
                    }`}
                  >
                    <p className="text-[20px] font-semibold text-[#eef4ff]">
                      {box.value}
                    </p>
                    <p className="mt-4 text-sm leading-6 text-[#8ea0b8]">{box.label}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 overflow-hidden rounded-[28px] border border-white/8 bg-[#151d2c] shadow-[0_18px_40px_rgba(0,0,0,0.24)]">
                <div className="relative min-h-[220px] overflow-hidden bg-[radial-gradient(circle_at_20%_28%,rgba(255,190,130,0.12),transparent_24%),linear-gradient(180deg,#141e2d_0%,#101827_100%)]">
                  <div className="absolute bottom-[-18px] left-8 h-24 w-24 rounded-full bg-[#9ad8de]/45" />
                  <div className="absolute bottom-12 left-20 h-32 w-28 rounded-[30px] bg-[#ff8c63]/75" />
                  <div className="absolute bottom-0 right-10 h-40 w-24 rounded-t-[28px] bg-[#7a428f]/85" />
                  <div className="absolute bottom-6 right-24 h-24 w-20 rounded-[22px] bg-[#f9c36b]/75" />
                  <div className="absolute right-4 top-8 h-16 w-16 rounded-full bg-[#fce2c4]/35" />
                  <div className="absolute left-10 top-10 h-14 w-14 rounded-full bg-[#c3ebee]/35" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside className="rounded-[32px] border border-white/8 bg-[#111927] px-7 py-7 shadow-[0_18px_40px_rgba(0,0,0,0.28)] xl:px-8 xl:py-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-[30px] font-semibold tracking-[-0.04em] text-[#eef4ff]">
                Calendar
              </h3>
            </div>

            <button
              type="button"
              className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-[#151d2c] text-[#dce6f4] shadow-[0_12px_26px_rgba(0,0,0,0.24)]"
            >
              <Bell size={16} />
            </button>
          </div>

          <div className="mt-8 space-y-10">
            {scheduleGroups.map((group, groupIndex) => (
              <div key={group.dateLabel} className="relative">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <p className="text-sm text-[#8ea0b8]">{group.dateLabel}</p>
                  <div className="relative" data-schedule-menu>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenScheduleMenu((prev) =>
                          prev === group.dateLabel ? null : group.dateLabel,
                        )
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/8 bg-[#151d2c] text-[#7f90a8] transition hover:border-[#31425e] hover:bg-[#182438] hover:text-[#dbe5f3]"
                      aria-label={`Open actions for ${group.dateLabel}`}
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openScheduleMenu === group.dateLabel && (
                      <div className="absolute right-0 top-11 z-30 w-44 rounded-[18px] border border-white/10 bg-[#151d2c] p-2 shadow-[0_18px_40px_rgba(0,0,0,0.34)]">
                        <button
                          type="button"
                          onClick={() => toggleGroupCollapse(group.dateLabel)}
                          className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[#dbe5f3] transition hover:bg-white/[0.04]"
                        >
                          {collapsedScheduleGroups.includes(group.dateLabel)
                            ? "Expand day"
                            : "Collapse day"}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenScheduleMenu(null);
                            router.push("/account/blogs");
                          }}
                          className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[#dbe5f3] transition hover:bg-white/[0.04]"
                        >
                          Open blog list
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenScheduleMenu(null);
                            router.push("/account/blogs/add");
                          }}
                          className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm text-[#9ad8de] transition hover:bg-white/[0.04]"
                        >
                          Create blog
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {collapsedScheduleGroups.includes(group.dateLabel) ? (
                  <div className="rounded-[18px] border border-white/8 bg-[#151d2c] px-4 py-3 text-sm text-[#8ea0b8]">
                    {group.items.length} item{group.items.length === 1 ? "" : "s"} hidden for this day.
                  </div>
                ) : (
                  <div className="space-y-7">
                    {group.items.map((item, itemIndex) => (
                      <div
                        key={`${group.dateLabel}-${item.id}`}
                        className="flex min-w-0 items-start gap-4"
                      >
                        <span
                          className={`mt-1 h-11 w-1.5 shrink-0 rounded-full ${taskColors[(groupIndex + itemIndex) % taskColors.length]}`}
                        />
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <p className="block truncate pr-2 text-[15px] leading-6 text-[#8ea0b8]">
                            {item.blog_title}
                          </p>
                          <p className="mt-1 text-[15px] font-medium leading-6 text-[#eef4ff]">
                            {item.statusLabel}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {scheduleGroups.length === 0 && (
              <div className="rounded-[22px] border border-white/8 bg-[#151d2c] px-5 py-5 text-sm text-[#8ea0b8]">
                {normalizedSearchQuery
                  ? "No calendar entries match your current dashboard search."
                  : "No blogs with a publish date are available yet."}
              </div>
            )}

            <div className="rounded-[24px] border border-white/8 bg-[#151d2c] px-5 py-5 shadow-[0_12px_26px_rgba(0,0,0,0.24)] xl:px-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[18px] font-semibold text-[#eef4ff]">Platforms</p>
                  <p className="mt-1 text-sm text-[#8ea0b8]">Connected destinations</p>
                </div>

                <button
                  onClick={() => {
                    setEditingPlatform(null);
                    setOpenModal(true);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/8 bg-[#1c2636] text-white"
                >
                  <Plus size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {filteredPlatforms.length === 0 ? (
                  <p className="text-sm text-[#8ea0b8]">
                    {normalizedSearchQuery
                      ? "No platforms match your current dashboard search."
                      : "No active platforms yet."}
                  </p>
                ) : (
                  filteredPlatforms.slice(0, 3).map((platform, index) => (
                    <div key={platform.id} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={`h-10 w-1 rounded-full ${taskColors[index % taskColors.length]}`} />
                        <div className="min-w-0">
                          <p className="truncate text-sm text-[#8ea0b8]">{platform.platform_name}</p>
                          <p className="mt-1 text-[15px] font-medium text-[#eef4ff]">
                            Live connection
                          </p>
                        </div>
                      </div>

                      <a
                        href={platform.website_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#9ad8de] transition hover:text-[#c2edf0]"
                      >
                        Visit
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {openModal && (
        <AddEditPlatformModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          editingPlatform={editingPlatform}
          refreshPlatforms={fetchActivePlatform}
        />
      )}
    </>
  );
};

export default Dashboard;
