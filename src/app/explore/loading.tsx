export default function ExploreLoading() {
  return (
    <main className="flex-1 pb-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        <div className="h-8 w-40 bg-stone-200 rounded animate-pulse mb-6" />
        <div className="flex flex-wrap gap-2 mb-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-9 w-24 bg-stone-200 rounded-full animate-pulse" />
          ))}
        </div>
      </div>

      {[...Array(3)].map((_, i) => (
        <section key={i} className="mb-10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 mb-4">
            <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />
          </div>
          <div className="max-w-3xl mx-auto pl-4 sm:pl-6">
            <div className="flex gap-4 overflow-x-auto pb-2 pr-4 sm:pr-6">
              {[...Array(3)].map((_, j) => (
                <div key={j} className="w-64 shrink-0 bg-surface rounded-lg shadow-sm p-4 flex flex-col gap-3">
                  <div className="aspect-[16/10] w-full bg-stone-200 rounded-md animate-pulse" />
                  <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
                  <div className="h-3 w-20 bg-stone-200 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
