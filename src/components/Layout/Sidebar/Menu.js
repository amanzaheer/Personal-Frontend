import {
  Settings,
  Users,
  CreditCard,
  BookOpen,
  ImageIcon,
  LayoutGrid,
  LayoutDashboard,
  Footprints,
} from "lucide-react";

export const menu = [
  {
    Icon: LayoutDashboard,
    title: "Dashboard",
    to: "/dashboard",
    permission: "",
    disabled: false,
  },

  {
    Icon: CreditCard,
    title: "Payment",
    to: "/payment",
    permission: "",
    disabled: false,
  },
  {
    Icon: BookOpen,
    title: "Books",
    to: "/books",
    permission: "",
    disabled: false,
  },
  {
    Icon: ImageIcon,
    title: "Gallery",
    to: "/gallery",
    permission: "",
    disabled: false,
  },
  {
    Icon: Footprints,
    title: "Footer",
    to: "/footer",
    permission: "",
    disabled: false,
  },
  {
    Icon: Settings,
    title: "Settings",
    to: "/settings",
    permission: "",
    disabled: false,
    submenu: [
      {
        Icon: Users,
        title: "User",
        to: "/users",
        permission: "view_all_users",
      },
      {
        Icon: LayoutGrid,
        title: "Sliders",
        to: "/sliders",
        permission: "",
      },
    ],
  },
];
