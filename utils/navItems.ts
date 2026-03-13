import {
  LayoutDashboard,
  FileText,
  Globe,
  Users,
  Tag,
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
  { id: 3, name: "Platforms", href: "#", icon: Globe },
  { id: 4, name: "Authors", href: "#", icon: Users },
  { id: 5, name: "Categories", href: "#", icon: Tag },
  { id: 6, name: "Media Library", href: "#", icon: ImageIcon },
];
