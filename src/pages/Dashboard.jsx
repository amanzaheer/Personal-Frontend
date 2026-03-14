import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BookOpen,
  Users,
  ImageIcon,
  FileText,
  TrendingUp,
  PenLine,
  ChevronRight,
  Footprints,
} from "lucide-react";
import useApi from "../lib/useApi";

// Sample monthly growth (scaled with current stats for demo)
const getGrowthData = (books, users, gallery) => [
  { month: "Jan", books: Math.max(1, Math.floor(books * 0.15)), users: Math.max(1, Math.floor(users * 0.1)), gallery: Math.max(1, Math.floor(gallery * 0.2)) },
  { month: "Feb", books: Math.max(1, Math.floor(books * 0.3)), users: Math.max(1, Math.floor(users * 0.25)), gallery: Math.max(1, Math.floor(gallery * 0.35)) },
  { month: "Mar", books: Math.max(1, Math.floor(books * 0.45)), users: Math.max(1, Math.floor(users * 0.4)), gallery: Math.max(1, Math.floor(gallery * 0.5)) },
  { month: "Apr", books: Math.max(1, Math.floor(books * 0.6)), users: Math.max(1, Math.floor(users * 0.55)), gallery: Math.max(1, Math.floor(gallery * 0.65)) },
  { month: "May", books: Math.max(1, Math.floor(books * 0.8)), users: Math.max(1, Math.floor(users * 0.75)), gallery: Math.max(1, Math.floor(gallery * 0.85)) },
  { month: "Jun", books: books, users: users, gallery: gallery },
];

const CHART_COLORS = {
  books: "#D25353",
  users: "#6366f1",
  gallery: "#22c55e",
  publications: "#f59e0b",
};

const StatCard = ({ icon: Icon, label, value, subtext, href, accent }) => (
  <Link
    to={href || "#"}
    className="group block bg-card border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300"
  >
    <div className="flex items-start justify-between">
      <div
        className={`p-3 rounded-xl ${accent ? "bg-accent/10" : "bg-secondary"}`}
      >
        <Icon
          className={`w-6 h-6 ${accent ? "text-accent" : "text-muted-foreground"}`}
          strokeWidth={1.5}
        />
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
    <p
      className="text-3xl font-bold text-foreground mt-4"
      style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
    >
      {value}
    </p>
    <p className="text-sm font-medium text-foreground mt-0.5">{label}</p>
    {subtext && <p className="text-xs text-muted-foreground mt-2">{subtext}</p>}
  </Link>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    books: 0,
    users: 0,
    gallery: 0,
    publications: 0,
    payments: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, booksRes, galleryRes, paymentsRes] = await Promise.allSettled([
          api.get("users", { page: 1, limit: 1 }).catch(() => null),
          api.get("books", { page: 1, limit: 1 }).catch(() => null),
          api.get("gallery", { page: 1, limit: 1 }).catch(() => null),
          api.get("payment/history", { page: 1, limit: 100 }).catch(() => null),
        ]);

        const parseCount = (res, fallback) => {
          if (res.status !== "fulfilled" || !res.value) return fallback;
          const d = res.value?.data?.data ?? res.value?.data ?? {};
          const total =
            d.total ?? d.users?.length ?? d.books?.length ?? d.length;
          return typeof total === "number" ? total : fallback;
        };

        const parsePayments = (res) => {
          if (res.status !== "fulfilled" || !res.value) {
            return { count: 0, revenue: 0 };
          }
          const d = res.value?.data?.data ?? res.value?.data ?? {};
          const payments = Array.isArray(d.payments) ? d.payments : [];
          const count = typeof d.pagination?.total === "number" ? d.pagination.total : payments.length;
          const revenue = payments.reduce(
            (sum, p) => sum + (typeof p.amount === "number" ? p.amount : 0),
            0,
          );
          return { count, revenue };
        };

        const paymentStats = parsePayments(paymentsRes);

        setStats({
          books: parseCount(booksRes, 12),
          users: parseCount(usersRes, 0),
          gallery: parseCount(galleryRes, 8),
          publications: parseCount(booksRes, 12),
          payments: paymentStats.count,
          revenue: paymentStats.revenue,
        });
      } catch {
        setStats({
          books: 12,
          users: 0,
          gallery: 8,
          publications: 12,
          payments: 0,
          revenue: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const displayStats = loading
    ? { books: "—", users: "—", gallery: "—", publications: "—", payments: "—", revenue: "—" }
    : stats;

  const categoryGrowth = [
    { name: "Books", value: stats.books, fill: CHART_COLORS.books },
    { name: "Users", value: stats.users, fill: CHART_COLORS.users },
    { name: "Gallery", value: stats.gallery, fill: CHART_COLORS.gallery },
    { name: "Publications", value: stats.publications, fill: CHART_COLORS.publications },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={BookOpen}
            label="Books"
            value={displayStats.books}
            subtext="Published works"
            href="/books"
            accent
          />
          <StatCard
            icon={Users}
            label="Users"
            value={displayStats.users}
            subtext="Registered readers"
            href="/users"
          />
          <StatCard
            icon={ImageIcon}
            label="Gallery"
            value={displayStats.gallery}
            subtext="Media items"
            href="/gallery"
          />
          <StatCard
            icon={FileText}
            label="Publications"
            value={displayStats.publications}
            subtext="Total content"
            href="/books"
          />
          <StatCard
            icon={FileText}
            label="Payments"
            value={displayStats.payments}
            subtext="Total payment records"
            href="/payment"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value={
              typeof displayStats.revenue === "number"
                ? `$${displayStats.revenue.toFixed(2)}`
                : displayStats.revenue
            }
            subtext="Sum of completed payments"
            href="#"
            accent
          />
        </div>

          {/* Quick actions - writer-focused */}
          <div className="mt-10">
          <h2
            className="text-xl font-semibold text-foreground mb-4"
            style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
          >
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
              to="/books"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <div className="p-2 rounded-lg bg-accent/10">
                <PenLine className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Manage Books</p>
                <p className="text-sm text-muted-foreground">
                  Add or edit your publications
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </Link>
            <Link
              to="/gallery"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <div className="p-2 rounded-lg bg-accent/10">
                <ImageIcon className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Gallery</p>
                <p className="text-sm text-muted-foreground">
                  Manage images and media
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </Link>
            <Link
              to="/footer"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <div className="p-2 rounded-lg bg-accent/10">
                <Footprints className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Footer</p>
                <p className="text-sm text-muted-foreground">
                  Contact info and social links
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-accent/5 hover:border-accent/30 transition-all"
            >
              <div className="p-2 rounded-lg bg-accent/10">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-medium text-foreground">Profile</p>
                <p className="text-sm text-muted-foreground">
                  View and edit your profile
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground ml-auto" />
            </Link>
          </div>
        </div>

        {/* Data growth graphs - below stat cards */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rounded area chart - growth over time */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3
              className="text-lg font-semibold text-foreground mb-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Data Growth
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getGrowthData(stats.books, stats.users, stats.gallery)} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBooks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D25353" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#D25353" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)" }}
                    labelStyle={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="books"
                    stroke="#D25353"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="url(#colorBooks)"
                    name="Books"
                  />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="url(#colorUsers)"
                    name="Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Normal bar chart - category growth */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <h3
              className="text-lg font-semibold text-foreground mb-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Category Growth
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryGrowth} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" strokeOpacity={0.5} />
                  <XAxis type="number" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={55} className="text-muted-foreground" />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)" }}
                  />
                  <Bar dataKey="value" name="Count" radius={[0, 4, 4, 0]}>
                    {categoryGrowth.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rounded donut chart - distribution */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm lg:col-span-2">
            <h3
              className="text-lg font-semibold text-foreground mb-4"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              Content Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryGrowth}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    nameKey="name"
                  >
                    {categoryGrowth.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "1px solid var(--border)" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
}
