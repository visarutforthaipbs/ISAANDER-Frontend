import Link from "next/link";
import Image from "next/image";
import { media } from "@wix/sdk";
import { Sparkles, User, Award, ArrowRight } from "lucide-react";
import { TipButton, HireButton, ShareButton } from "@/components/share-button";
import { FollowButton } from "@/components/follow-button";
import { formatDate } from "@/lib/utils";

interface Author {
  name: string;
  avatar: string;
  title: string;
  bio?: string;
  slug: string;
  hireEmail?: string;
  promptPayId?: string;
  promptPayName?: string;
  buyMeCoffeeUrl?: string;
}

interface Post {
  _id?: string | null;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  lastPublishedDate?: any;
  minutesToRead?: number;
  categoryIds?: string[];
  media?: {
    wixMedia?: {
      image?: any;
    };
  } | null;
}

interface MagazineDrawerProps {
  postTitle: string;
  author: Author;
  relatedPosts: Post[];
  categoryMap: Map<string, string>;
  categoryLabel?: string | null;
}

export function MagazineDrawer({
  postTitle,
  author,
  relatedPosts,
  categoryMap,
  categoryLabel,
}: MagazineDrawerProps) {
  // Pull category lists for taxonomy explorer
  const categories = Array.from(categoryMap.entries()).slice(0, 5);

  return (
    <section 
      aria-label="discovery-lounge" 
      className="w-full mt-16 border-t border-black/5"
      style={{
        background: "linear-gradient(to bottom, transparent 0%, rgba(252, 248, 242, 0.4) 10%, rgba(252, 248, 242, 0.95) 100%)",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-12">
        
        {/* SECTION 1: END OF POST SHARE */}
        <div className="flex flex-col items-center gap-3 text-center bg-white/40 border border-black/5 p-6 rounded-2xl backdrop-blur-xs">
          <div className="w-8 h-8 rounded-full bg-[#E65C00]/10 flex items-center justify-center text-[#E65C00]">
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="font-prompt font-semibold text-text-main text-base">
            อ่านจบแล้ว — ร่วมแบ่งปันประเด็นนี้ให้สังคม
          </p>
          <ShareButton title={postTitle} />
        </div>

        {/* SECTION 3: WRITER PROFILE SPOTLIGHT PORTAL */}
        <div className="bg-white border border-black/5 rounded-2xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-linear-to-br from-[#E65C00]/10 to-transparent rounded-bl-full pointer-events-none" />
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            {author.avatar ? (
              <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-[#E65C00]/20">
                <Image
                  src={author.avatar}
                  alt={author.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="bg-primary/10 flex items-center justify-center shrink-0 w-16 h-16 rounded-full border-2 border-[#E65C00]/20">
                <User className="w-8 h-8 text-[#E65C00]" />
              </div>
            )}

            {/* Profile Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-text-muted mb-0.5">
                <Award className="w-3.5 h-3.5 text-[#E65C00]" />
                <span className="font-prompt text-[10px] font-bold uppercase tracking-wider">ผู้เขียนบทความ</span>
              </div>
              
              <Link 
                href={`/author/${author.slug}`}
                className="inline-block font-prompt font-bold text-text-main text-lg hover:text-[#E65C00] transition-colors"
              >
                {author.name}
              </Link>
              
              <p className="font-sarabun text-text-muted text-xs mt-0.5">{author.title}</p>
              
              {author.bio && (
                <p className="font-sarabun text-text-main text-sm mt-3 leading-relaxed line-clamp-3">
                  {author.bio}
                </p>
              )}

              {/* Tipping & Hiring Integration */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-5 border-t border-black/5 pt-4">
                <FollowButton
                  writer={{
                    name: author.name,
                    slug: author.slug,
                    avatar: author.avatar,
                    title: author.title,
                  }}
                />

                <TipButton
                  writerSlug={author.slug}
                  writerName={author.name}
                  promptPayId={author.promptPayId}
                  promptPayName={author.promptPayName}
                  variant="primary"
                />

                {author.buyMeCoffeeUrl && (
                  <a
                    href={author.buyMeCoffeeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 bg-[#FCD116] hover:bg-[#FCD116]/95 text-black font-prompt font-bold text-xs px-4 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all duration-200"
                  >
                    <span>☕</span>
                    <span>เลี้ยงกาแฟ</span>
                  </a>
                )}

                <HireButton
                  writerName={author.name}
                  hireEmail={author.hireEmail ?? `contact@theisaander.com`}
                  variant="link"
                />

                <Link
                  href={`/author/${author.slug}`}
                  className="inline-flex items-center gap-1 text-xs font-sarabun font-bold text-text-muted hover:text-text-main transition-colors py-2 px-3"
                >
                  <span>ดูบทความทั้งหมด</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: TACTILE TAXONOMY PILLS */}
        {categories.length > 0 && (
          <div className="text-center sm:text-left border-t border-black/5 pt-8">
            <h3 className="font-prompt font-semibold text-text-muted text-xs uppercase tracking-wider mb-4">
              สำรวจประเด็นอื่นที่คุณสนใจ
            </h3>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2.5">
              {categories.map(([id, label]) => (
                <Link
                  key={id}
                  href={`/explore?category=${id}`}
                  className="bg-white hover:bg-stone-50 text-text-main font-sarabun text-xs font-semibold px-4 py-2 rounded-full border border-black/5 hover:border-black/10 hover:shadow-xs transition-all duration-200"
                >
                  #{label}
                </Link>
              ))}
              <Link
                href="/explore"
                className="bg-[#E65C00] text-white hover:bg-[#E65C00]/90 font-prompt text-xs font-bold px-4 py-2 rounded-full shadow-xs transition-all duration-200"
              >
                ดูทั้งหมด →
              </Link>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
