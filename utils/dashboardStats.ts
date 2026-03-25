import DashBoardActions from "@/actions/DashboardAction";
import { CheckCircle, Clock, FileText, Globe } from "lucide-react";
import { useEffect, useState } from "react";

export const FetchDashBoardData = () => {
  const [data, setData] = useState({
    TotalBlogs: 0,
    PublishedBlogs: 0,
    ScheduledBlogs: 0,
    TotalPlatforms: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      const res = await DashBoardActions.getAllDashboardData();
      setData(res);
    };

    fetchData();
  }, []);
  const stats = [
    {
      title: "Total Blogs",
      value: data.TotalBlogs,
      icon: FileText,
      color: "text-blue-400",
    },
    {
      title: "Published",
      value: data.PublishedBlogs,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      title: "Scheduled",
      value: data.ScheduledBlogs,
      icon: Clock,
      color: "text-yellow-400",
    },
    {
      title: "Platforms",
      value: data.TotalPlatforms,
      icon: Globe,
      color: "text-purple-400",
    },
  ];

  return stats;
};
