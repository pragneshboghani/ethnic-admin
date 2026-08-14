import {
  LayoutDashboard,
  FileText,
  Globe,
  Image as ImageIcon,
  StretchHorizontal,
  Users,
  Group,
  MessageSquareMore,
  FolderOpen,
  CalendarDays,
  FolderKanban,
} from "lucide-react";
import { Role } from "@/types";
import type { ElementType } from "react";

type NavItem = {
  id: number;
  name: string;
  href: string;
  icon: ElementType;
  roles?: Role[];
  requiresCalendarAccess?: boolean;
};

export const navItems: NavItem[] = [
  {
    id: 1,
    name: "Dashboard",
    href: "/account/dashboard",
    icon: LayoutDashboard,
  },
  { id: 2, name: "Blogs", href: "/account/blogs", icon: FileText },
  { id: 10, name: "Content Calendar", href: "/account/calendar", icon: CalendarDays, requiresCalendarAccess: true },
  { id: 11, name: "Projects", href: "/account/projects", icon: FolderKanban, requiresCalendarAccess: true },
  { id: 3, name: "Platforms", href: "/account/plateforms", icon: Globe },
  { id: 4, name: "Media Library", href: "/account/media", icon: ImageIcon },
  { id: 5, name: "Categories & Tags", href: "/account/category", icon: StretchHorizontal},
  { id: 6, name: "Authors", href: "/account/authors", icon: Users },
  { id: 7, name: "Groups", href: "/account/groups", icon: Group },
  { id: 8, name: "Resources", href: "/account/resources", icon: FolderOpen },
  { id: 9, name: "Comments", href: "/account/comments", icon: MessageSquareMore },
];
