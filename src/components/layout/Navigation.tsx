import { Link, useLocation } from 'wouter';

export default function Navigation() {
  const [location] = useLocation();

  const links = [
    { path: '/', label: 'Home' },
    { path: '/tasks', label: 'Task Manager' },
    { path: '/chat', label: 'CLAI Chat' },
  ];

  return (
    <nav className="border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Portfolio
          </Link>
          <div className="flex space-x-8">
            {links.map(({ path, label }) => (
              <Link
                key={path}
                href={path}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  location === path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
