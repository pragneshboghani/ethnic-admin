import {
  LayoutDashboard,
  FileText,
  Globe,
  Image as ImageIcon,
} from "lucide-react";

export const navItems = [
  {
    id: 1,
    name: "Dashboard",
    href: "/account/dashboard",
    icon: LayoutDashboard,
  },
  { id: 2, name: "Blogs", href: "/account/blogs", icon: FileText },
  { id: 3, name: "Platforms", href: "/account/plateforms", icon: Globe },
  { id: 4, name: "Media Library", href: "/account/media", icon: ImageIcon },
];
