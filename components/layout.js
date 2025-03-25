import Link from "next/link";
import { useRouter } from "next/router";

export default function Layout({ children }) {
  const router = useRouter();

  const navItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Scan Now", path: "/onboarding" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r shadow-sm px-6 py-8 space-y-8">
        <div className="text-2xl font-bold tracking-tight">🔐 Kumo24</div>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`block px-3 py-2 rounded-md font-medium transition ${
                router.pathname === item.path
                  ? "bg-gray-200"
                  : "hover:bg-gray-100"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}