import Link from "next/link";
import Image from "next/image";
import { media } from "@wix/sdk";
import { BookOpen } from "lucide-react";

interface RelatedPost {
  _id?: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  media?: {
    wixMedia?: {
      image?: any;
    };
  } | null;
}

export function InlineRelatedReads({
  post,
  categoryLabel,
}: {
  post: RelatedPost;
  categoryLabel?: string | null;
}) {
  if (!post || !post.slug) return null;

  const imageUrl = post.media?.wixMedia?.image
    ? (() => {
        try {
          return media.getScaledToFillImageUrl(
            post.media!.wixMedia!.image!,
            400,
            250,
            {}
          );
        } catch {
          return null;
        }
      })()
    : null;

  return (
    <div className="my-8 w-full max-w-2xl mx-auto">
      <Link
        href={`/post/${post.slug}`}
        className="group block relative overflow-hidden bg-stone-50/70 hover:bg-stone-50 border border-black/5 rounded-2xl shadow-xs transition-all duration-300 hover:shadow-md hover:border-black/10"
      >
        <div className="flex flex-col sm:flex-row items-stretch min-h-[140px]">
          {/* Cover image (scaled container with micro-animations) */}
          <div className="relative w-full sm:w-[35%] min-h-[140px] overflow-hidden bg-black/5">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={post.title ?? ""}
                fill
                sizes="(max-width: 640px) 100vw, 240px"
                className="object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-stone-200 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-stone-400" />
              </div>
            )}
            
            {/* Quick tag on image */}
            {categoryLabel && (
              <span className="absolute top-3 left-3 bg-[#E65C00] text-white font-prompt font-semibold tracking-wider text-[9px] uppercase px-2 py-0.5 rounded shadow-sm">
                {categoryLabel}
              </span>
            )}
          </div>

          {/* Context Details */}
          <div className="flex-1 p-5 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[#E65C00] font-prompt font-semibold text-xs mb-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>คุณอาจสนใจอ่านเพิ่ม</span>
              </div>
              <h3 className="font-prompt font-bold text-text-main text-base leading-snug group-hover:text-[#E65C00] transition-colors duration-200 line-clamp-2">
                {post.title}
              </h3>
              {post.excerpt && (
                <p className="font-sarabun text-text-muted text-xs leading-relaxed mt-1.5 line-clamp-2">
                  {post.excerpt}
                </p>
              )}
            </div>
            
            <div className="flex items-center text-xs font-sarabun font-bold text-text-main group-hover:text-[#E65C00] transition-colors gap-1 self-start mt-1">
              <span>อ่านบทความนี้ต่อ</span>
              <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
