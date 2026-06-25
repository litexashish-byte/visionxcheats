export default function AdminLoading() {
  return (
    <div className="min-h-screen pt-20">
      <div className="flex">
        {/* Sidebar skeleton */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <div className="fixed top-20 left-0 w-64 h-[calc(100vh-5rem)] border-r border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 backdrop-blur-xl p-6">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-9 h-9 rounded-xl skeleton" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-3 w-16" />
              </div>
            </div>
            <nav className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex items-center space-x-3 px-4 py-3">
                  <div className="skeleton w-5 h-5 rounded" />
                  <div className="skeleton h-4 flex-1" />
                </div>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content skeleton */}
        <div className="flex-1 min-w-0 p-6 lg:ml-64">
          <div className="max-w-6xl mx-auto animate-pulse">
            {/* Title skeleton */}
            <div className="mb-8">
              <div className="skeleton h-8 w-48 mb-2 rounded-lg" />
              <div className="skeleton h-4 w-72 rounded-lg" />
            </div>

            {/* Content skeleton - adapts to page type */}
            <div className="glass-card rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="rounded-2xl p-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-start justify-between mb-4">
                      <div className="skeleton w-12 h-12 rounded-xl" />
                    </div>
                    <div className="skeleton h-8 w-20 mb-2" />
                    <div className="skeleton h-4 w-24" />
                  </div>
                ))}
              </div>
              <div className="skeleton h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
