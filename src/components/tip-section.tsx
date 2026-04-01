import Link from "next/link";
import { Heart, ExternalLink } from "lucide-react";
import type { Author } from "@/data/authors";
import { PromptPayQR } from "@/components/promptpay-qr";

interface TipSectionProps {
  author: Author;
}

export function TipSection({ author }: TipSectionProps) {
  const hasPromptPay = !!author.promptPayId;
  const hasBuyMeCoffee = !!author.buyMeCoffeeUrl;

  if (!hasPromptPay && !hasBuyMeCoffee) return null;

  return (
    <div className="bg-surface rounded-xl border border-black/5 shadow-sm p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-prompt font-semibold text-text-main">
            สนับสนุนผู้เขียน
          </h3>
          <p className="text-sm text-text-muted font-sarabun">
            ชอบบทความนี้? ให้กำลังใจ{author.name}
          </p>
        </div>
      </div>

      {/* Author mini profile */}
      <div className="flex items-center gap-3 mb-6 pb-5 border-b border-black/5">
        <Link href={`/author/${author.slug}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={author.avatar}
            alt={author.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <Link
            href={`/author/${author.slug}`}
            className="font-prompt font-semibold text-text-main hover:text-primary transition-colors"
          >
            {author.name}
          </Link>
          <p className="text-sm text-text-muted font-sarabun">{author.title}</p>
        </div>
        {author.expertise && author.expertise.length > 0 && (
          <div className="hidden sm:flex gap-1.5">
            {author.expertise.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="bg-secondary/10 text-secondary text-xs font-sarabun px-2 py-0.5 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tipping options */}
      <div
        className={`grid gap-6 ${
          hasPromptPay && hasBuyMeCoffee ? "sm:grid-cols-2" : ""
        }`}
      >
        {/* PromptPay QR */}
        {hasPromptPay && (
          <div className="flex flex-col items-center">
            <PromptPayQR
              promptPayId={author.promptPayId!}
              promptPayName={author.promptPayName}
            />
          </div>
        )}

        {/* Buy Me a Coffee */}
        {hasBuyMeCoffee && (
          <div className="flex flex-col items-center justify-center gap-3">
            <p className="font-sarabun text-sm text-text-muted text-center">
              หรือสนับสนุนผ่าน
            </p>
            <a
              href={author.buyMeCoffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-text-main font-prompt font-semibold px-6 py-3 rounded-full hover:brightness-95 transition-all shadow-sm"
            >
              <span>☕</span>
              Buy Me a Coffee
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
