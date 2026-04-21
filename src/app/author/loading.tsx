export default function AuthorsLoading() {
  return (
    <main className="flex-1 pb-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="h-8 w-32 bg-stone-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-56 bg-stone-200 rounded animate-pulse mb-8" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl shadow-sm border border-black/5 p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-stone-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-stone-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-stone-200 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
