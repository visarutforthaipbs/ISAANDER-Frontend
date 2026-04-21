export default function AuthorLoading() {
  return (
    <main className="flex-1 pb-28">
      {/* Cover skeleton */}
      <div className="h-48 sm:h-64 w-full bg-stone-200 animate-pulse" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-16 relative">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-stone-200 animate-pulse border-4 border-background" />
          <div className="pb-2 space-y-2">
            <div className="h-7 w-48 bg-stone-200 rounded animate-pulse" />
            <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-6 space-y-2">
        <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-stone-200 rounded animate-pulse" />
      </section>

      {/* Posts skeleton */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 mt-10 space-y-4">
        <div className="h-6 w-40 bg-stone-200 rounded animate-pulse mb-4" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-4 bg-surface rounded-lg shadow-sm p-3 items-center">
            <div className="w-[25%] aspect-square bg-stone-200 rounded-md animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-stone-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
