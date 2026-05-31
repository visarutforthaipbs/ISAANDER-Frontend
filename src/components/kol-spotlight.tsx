"use client";

import Link from "next/link";
import Image from "next/image";
import { Award, Eye, FileText, Sparkles, User } from "lucide-react";
import { FollowButton } from "@/components/follow-button";
import { TipButton } from "@/components/share-button";

interface LocalAuthor {
  expertise?: string[];
  province?: string;
  hometownNameTh?: string;
}

interface Writer {
  slug: string;
  name: string;
  avatar?: string | null;
  title?: string | null;
  bio?: string | null;
  postCount: number;
  totalViews: number;
  promptPayId?: string;
  promptPayName?: string;
  buyMeCoffeeUrl?: string;
  localAuthor?: LocalAuthor;
}

interface KOLSpotlightProps {
  writer: Writer;
}

export function KOLSpotlight({ writer }: KOLSpotlightProps) {
  const province = writer.localAuthor?.hometownNameTh || writer.localAuthor?.province || "ภาคอีสาน";

  return (
    <div 
      className="relative overflow-hidden rounded-lg border border-isaander-gold/20 p-6 sm:p-8 backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-background/95 to-surface/90"
    >
      {/* Decorative Premium Glow */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-isaander-yellow/10 flex items-center justify-center text-isaander-orange animate-pulse">
        <Sparkles className="w-4 h-4" />
      </div>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
        
        {/* Avatar Area */}
        <div className="relative shrink-0">
          {writer.avatar ? (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-3 border-isaander-gold/30 shadow-md">
              <Image
                src={writer.avatar}
                alt={writer.name}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary/10 border-3 border-isaander-gold/30 flex items-center justify-center text-primary shadow-md">
              <User className="w-10 h-10 text-primary" />
            </div>
          )}
          
          {/* Provincial Badge overlay */}
          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-accent text-text-main font-prompt font-bold text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs whitespace-nowrap">
            📍 {province}
          </span>
        </div>

        {/* Content Area */}
        <div className="flex-1 text-center md:text-left min-w-0">
          <div className="flex items-center justify-center md:justify-start gap-1.5 text-text-muted mb-1">
            <Award className="w-4 h-4 text-isaander-gold" />
            <span className="font-prompt text-[10px] font-bold uppercase tracking-wider text-isaander-gold">
              นักเขียนเด่นประจำสัปดาห์
            </span>
          </div>

          <Link
            href={`/author/${writer.slug}`}
            className="inline-block font-prompt font-black text-text-main text-xl sm:text-2xl hover:text-accent transition-colors leading-tight"
          >
            {writer.name}
          </Link>
          
          <p className="font-sarabun text-text-muted text-xs sm:text-sm mt-0.5 mb-3">{writer.title}</p>
          
          {writer.bio && (
            <p className="font-sarabun text-text-main text-sm leading-relaxed mb-5 line-clamp-3 italic text-stone-600">
              "{writer.bio}"
            </p>
          )}

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6 border-y border-black/5 py-3">
            <div className="flex items-center gap-1.5 text-xs font-sarabun text-text-muted">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>{writer.postCount} บทความ</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-sarabun text-text-muted">
              <Eye className="w-3.5 h-3.5 text-stone-400" />
              <span>ยอดชม {writer.totalViews.toLocaleString()} ครั้ง</span>
            </div>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <FollowButton
              writer={{
                name: writer.name,
                slug: writer.slug,
                avatar: writer.avatar,
                title: writer.title,
              }}
            />

            <TipButton
              writerSlug={writer.slug}
              writerName={writer.name}
              promptPayId={writer.promptPayId}
              promptPayName={writer.promptPayName}
              variant="primary"
            />

            <Link
              href={`/author/${writer.slug}`}
              className="inline-flex items-center justify-center bg-white hover:bg-stone-50 text-text-main font-prompt font-bold text-xs px-4 py-2.5 rounded-full border border-black/10 transition-all duration-200"
            >
              ดูผลงานทั้งหมด →
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
