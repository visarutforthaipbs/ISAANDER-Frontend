/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { fetchWixWriters } from "@/lib/author-utils";
import { StickyHeader, MobileBottomNav } from "@/components/navigation";

export const metadata = {
  title: "ทีมผู้เขียน — The Isaander",
  description:
    "พบกับทีมนักข่าว นักเขียน และผู้เชี่ยวชาญของ The Isaander — สำนักข่าวเชิงสืบสวนและสารคดีเชิงวัฒนธรรมแห่งภาคอีสาน",
};

export const revalidate = 300;

export default async function AuthorsPage() {
  const writers = await fetchWixWriters();

  return (
    <>
      <StickyHeader />
      <main id="main-content" className="flex-1 pb-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="font-prompt text-2xl font-bold text-text-main">
              ทีมผู้เขียน
            </h1>
            <p className="font-sarabun text-base text-text-muted mt-2">
              นักข่าว นักเขียน & ผู้เชี่ยวชาญของ The Isaander
            </p>
          </div>

          {/* Author Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {writers.map((writer) => {
              const expertise = writer.localAuthor?.expertise;
              return (
                <Link
                  key={writer.wixMemberId}
                  href={`/author/${writer.slug}`}
                  className="bg-surface rounded-xl shadow-sm border border-black/5 p-5 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    {writer.avatar ? (
                      <img
                        src={writer.avatar}
                        alt={writer.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/50 transition-colors"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-prompt text-xl font-bold">
                        {writer.name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-prompt font-semibold text-text-main group-hover:text-primary transition-colors">
                        {writer.name}
                      </h3>
                      <p className="text-sm text-text-muted font-sarabun">
                        {writer.title}
                      </p>
                      {/* Post count */}
                      <p className="text-xs text-text-muted font-sarabun mt-1">
                        {writer.postCount} บทความ
                      </p>
                      {/* Expertise badges */}
                      {expertise && expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {expertise.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="bg-secondary/10 text-secondary text-xs font-sarabun px-2 py-0.5 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Category badges from posts */}
                      {writer.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {writer.categories.slice(0, 4).map((cat) => (
                            <span
                              key={cat}
                              className="bg-secondary/15 text-secondary text-xs font-sarabun px-2 py-0.5 rounded-full"
                            >
                              {cat}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  {writer.bio && (
                    <p className="font-sarabun text-sm text-text-muted mt-3 line-clamp-2">
                      {writer.bio}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </main>
      <MobileBottomNav />
    </>
  );
}
