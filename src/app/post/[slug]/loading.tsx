export default function PostLoading() {
  return (
    <main className="flex-1 pb-28">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* Category badge */}
        <div className="h-6 w-24 bg-stone-200 rounded-full animate-pulse mb-3" />
        {/* Title */}
        <div className="h-8 w-3/4 bg-stone-200 rounded animate-pulse mb-2" />
        <div className="h-8 w-1/2 bg-stone-200 rounded animate-pulse mb-4" />
        {/* Author */}
        <div className="flex items-center gap-3 mt-4">
          <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-4 w-32 bg-stone-200 rounded animate-pulse" />
            <div className="h-3 w-20 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
        {/* Meta row: date + read time */}
        <div className="flex items-center gap-4 mt-3 mb-8">
          <div className="h-4 w-28 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-20 bg-stone-200 rounded animate-pulse" />
        </div>
        {/* Body paragraphs */}
        <div className="space-y-3">
          <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-11/12 bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-stone-200 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-stone-200 rounded animate-pulse" />
        </div>
      </article>
    </main>
  );
}
