import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Dashboard from "../pages/Dashboard";
import Users from "../pages/Users";
import ResetPassword from "../pages/ResetPassword";
import Profile from "../pages/Profile";
import { MembershipPage } from "../pages/Placeholder";
import Sliders from "../pages/Sliders";
import Books from "../pages/Books";
import Gallery from "../pages/Gallery";
import Payments from "../pages/Payments";
import BookSubscription from "../pages/BookSubscription";

export const routes = [
  { path: "/", element: Home, permission: "", pageTitle: "Home" },
  { path: "/home", element: Home, permission: "", pageTitle: "Home" },
  { path: "/login", element: Login, permission: "", pageTitle: "Login" },
  { path: "/signup", element: Signup, permission: "", pageTitle: "Signup" },
  { path: "/reset/:token", element: ResetPassword, permission: "", pageTitle: "Reset Password" },

  {
    path: "/dashboard",
    element: Dashboard,
    permission: "",
    pageTitle: "Dashboard",
  },
  {
    path: "/profile",
    element: Profile,
    permission: "",
    pageTitle: "Profile",
  },

  {
    path: "/membership",
    element: MembershipPage,
    permission: "",
    pageTitle: "Membership",
  },
  {
    path: "/payment",
    element: Payments,
    permission: "",
    pageTitle: "Payment",
  },
  {
    path: "/payment/book",
    element: BookSubscription,
    permission: "",
    pageTitle: "Book Subscription",
  },
  {
    path: "/books",
    element: Books,
    permission: "",
    pageTitle: "Books",
  },
  {
    path: "/sliders",
    element: Sliders,
    permission: "",
    pageTitle: "Sliders",
  },
  {
    path: "/gallery",
    element: Gallery,
    permission: "",
    pageTitle: "Gallery",
  },
  {
    path: "/settings",
    element: Users,
    permission: "view_all_users",
    pageTitle: "Settings",
  },
  {
    path: "/users",
    element: Users,
    permission: "view_all_users",
    pageTitle: "Users",
  },
];
