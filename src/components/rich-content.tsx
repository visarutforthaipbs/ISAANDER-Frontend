import { media } from "@wix/sdk";
import { ImageLightbox } from "@/components/image-lightbox";

/* eslint-disable @next/next/no-img-element */

// ---- Types (mirrors Wix RichContent node structure) ----

interface RichContentNode {
  type?: string;
  id?: string;
  nodes?: RichContentNode[];
  // data variants
  textData?: { text?: string; decorations?: Decoration[] };
  headingData?: { level?: number };
  paragraphData?: { indentation?: number | null };
  imageData?: {
    image?: { src?: { url?: string } | null; width?: number | null; height?: number | null };
    altText?: string | null;
    caption?: string | null;
  };
  videoData?: {
    video?: { src?: { url?: string } | null };
    thumbnail?: { src?: { url?: string } | null };
  };
  dividerData?: Record<string, unknown>;
  blockquoteData?: Record<string, unknown>;
  codeBlockData?: Record<string, unknown>;
  linkPreviewData?: {
    link?: { url?: string };
    title?: string | null;
    description?: string | null;
    thumbnailUrl?: string | null;
  };
  bulletedListData?: Record<string, unknown>;
  orderedListData?: Record<string, unknown>;
}

interface Decoration {
  type?: string;
  fontWeightValue?: number | null;
  italicData?: boolean | null;
  underlineData?: boolean | null;
  strikethroughData?: boolean | null;
  linkData?: { link?: { url?: string } };
  colorData?: { foreground?: string | null; background?: string | null };
  anchorData?: { anchor?: string };
}

// ---- Helpers ----

/** Extract plain text from a node tree (for heading text, slug generation) */
function getPlainText(node: RichContentNode): string {
  if (node.type === "TEXT") return node.textData?.text ?? "";
  return (node.nodes ?? []).map(getPlainText).join("");
}

/** Generate a URL-safe slug from text */
function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

/** Heading info for TOC */
export interface TocHeading {
  id: string;
  text: string;
  level: number; // rendered level (after shift): 2, 3, etc.
}

/** Walk RichContent nodes and extract headings for table of contents */
export function extractHeadings(
  content: { nodes?: RichContentNode[] } | null | undefined
): TocHeading[] {
  if (!content?.nodes) return [];
  const headings: TocHeading[] = [];
  const slugCount = new Map<string, number>();

  for (const node of content.nodes) {
    if (node.type !== "HEADING") continue;
    const rawLevel = node.headingData?.level ?? 2;
    const level = Math.min(rawLevel + 1, 6); // same shift as renderer
    const text = getPlainText(node).trim();
    if (!text) continue;

    let slug = slugify(text) || `heading-${headings.length}`;
    const count = slugCount.get(slug) ?? 0;
    slugCount.set(slug, count + 1);
    if (count > 0) slug = `${slug}-${count}`;

    headings.push({ id: slug, text, level });
  }
  return headings;
}

function getWixImageUrl(src: { url?: string } | null | undefined, w: number, h: number): string | null {
  if (!src?.url) return null;
  try {
    return media.getScaledToFillImageUrl(src.url, w, h, {});
  } catch {
    // If it's already a full URL, return as-is
    if (src.url.startsWith("http")) return src.url;
    return null;
  }
}

// ---- Decoration Renderer ----

function renderTextWithDecorations(text: string, decorations?: Decoration[]): React.ReactNode {
  if (!decorations || decorations.length === 0) return text;

  let node: React.ReactNode = text;

  for (const dec of decorations) {
    switch (dec.type) {
      case "BOLD":
        node = <strong>{node}</strong>;
        break;
      case "ITALIC":
        node = <em>{node}</em>;
        break;
      case "UNDERLINE":
        node = <u>{node}</u>;
        break;
      case "STRIKETHROUGH":
        node = <s>{node}</s>;
        break;
      case "LINK":
        if (dec.linkData?.link?.url) {
          node = (
            <a
              href={dec.linkData.link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              {node}
            </a>
          );
        }
        break;
      case "ANCHOR":
        if (dec.anchorData?.anchor) {
          node = <a id={dec.anchorData.anchor}>{node}</a>;
        }
        break;
      case "COLOR":
        if (dec.colorData?.foreground) {
          node = <span style={{ color: dec.colorData.foreground }}>{node}</span>;
        }
        break;
    }
  }

  return node;
}

// ---- Node Renderer ----

function RichContentNode({ node }: { node: RichContentNode }) {
  const children = node.nodes?.map((child, i) => (
    <RichContentNode key={child.id || i} node={child} />
  ));

  switch (node.type) {
    case "PARAGRAPH":
      return (
        <p className="font-sarabun text-base leading-[1.9] text-text-main mb-5">
          {children}
        </p>
      );

    case "HEADING": {
      const rawLevel = node.headingData?.level ?? 2;
      const sizes: Record<number, string> = {
        1: "text-2xl sm:text-3xl",
        2: "text-xl sm:text-2xl",
        3: "text-lg sm:text-xl",
        4: "text-base sm:text-lg",
        5: "text-sm sm:text-base",
        6: "text-sm",
      };
      // Prevent h1 inside article body — page already has its own h1.
      // Shift all heading levels down by 1 (h1→h2, h2→h3, …, capped at h6).
      const level = Math.min(rawLevel + 1, 6);
      const text = getPlainText(node).trim();
      const headingId = text ? slugify(text) : undefined;
      const className = `font-prompt font-bold text-text-main ${sizes[rawLevel] ?? sizes[2]} mt-8 mb-4`;
      if (level === 2) return <h2 id={headingId} className={className}>{children}</h2>;
      if (level === 3) return <h3 id={headingId} className={className}>{children}</h3>;
      if (level === 4) return <h4 id={headingId} className={className}>{children}</h4>;
      if (level === 5) return <h5 id={headingId} className={className}>{children}</h5>;
      return <h6 id={headingId} className={className}>{children}</h6>;
    }

    case "TEXT":
      return (
        <>{renderTextWithDecorations(node.textData?.text ?? "", node.textData?.decorations)}</>
      );

    case "IMAGE": {
      const imgUrl = getWixImageUrl(node.imageData?.image?.src, 800, 600);
      if (!imgUrl) return null;
      const highResUrl = getWixImageUrl(node.imageData?.image?.src, 1600, 1200) || imgUrl;
      return (
        <ImageLightbox src={highResUrl} alt={node.imageData?.altText ?? ""}>
          <figure className="my-6">
            <img
              src={imgUrl}
              alt={node.imageData?.altText ?? ""}
              className="w-full rounded-lg"
              loading="lazy"
            />
            {node.imageData?.caption && (
              <figcaption className="text-sm text-text-muted text-center mt-2 font-sarabun">
                {node.imageData.caption}
              </figcaption>
            )}
          </figure>
        </ImageLightbox>
      );
    }

    case "BLOCKQUOTE":
      return (
        <blockquote className="border-l-4 border-primary/30 pl-5 pr-2 my-8 py-2">
          <div className="font-sarabun text-lg leading-relaxed text-text-muted italic">
            {children}
          </div>
        </blockquote>
      );

    case "BULLETED_LIST":
      return (
        <ul className="list-disc list-inside space-y-1 mb-4 font-sarabun text-text-main">
          {children}
        </ul>
      );

    case "ORDERED_LIST":
      return (
        <ol className="list-decimal list-inside space-y-1 mb-4 font-sarabun text-text-main">
          {children}
        </ol>
      );

    case "LIST_ITEM":
      return <li className="leading-[1.8]">{children}</li>;

    case "CODE_BLOCK":
      return (
        <aside
          className="my-8 rounded-lg border border-accent/30 bg-accent/5 p-5"
          aria-label="ข้อมูลการสนับสนุน"
        >
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-accent mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="font-sarabun text-sm leading-relaxed text-text-main/80">
              {children}
            </div>
          </div>
        </aside>
      );

    case "DIVIDER":
      return <hr className="my-10 border-black/10" />;

    case "VIDEO": {
      const videoSrc = node.videoData?.video?.src?.url;
      const thumbUrl = getWixImageUrl(node.videoData?.thumbnail?.src, 800, 450);
      if (videoSrc) {
        return (
          <div className="my-6 aspect-video">
            <video
              src={videoSrc}
              poster={thumbUrl ?? undefined}
              controls
              className="w-full rounded-lg"
              aria-label="วิดีโอในบทความ"
            />
          </div>
        );
      }
      return null;
    }

    case "LINK_PREVIEW": {
      const url = node.linkPreviewData?.link?.url;
      if (!url) return null;
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block my-6 border border-black/10 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
        >
          {node.linkPreviewData?.thumbnailUrl && (
            <img
              src={node.linkPreviewData.thumbnailUrl}
              alt=""
              className="w-full h-40 object-cover"
            />
          )}
          <div className="p-4">
            <p className="font-prompt font-semibold text-text-main">
              {node.linkPreviewData?.title}
            </p>
            {node.linkPreviewData?.description && (
              <p className="text-sm text-text-muted mt-1 line-clamp-2">
                {node.linkPreviewData.description}
              </p>
            )}
          </div>
        </a>
      );
    }

    // Container types — just render children
    case "COLLAPSIBLE_LIST":
    case "COLLAPSIBLE_ITEM":
    case "COLLAPSIBLE_ITEM_TITLE":
    case "COLLAPSIBLE_ITEM_BODY":
    case "TABLE":
    case "TABLE_ROW":
    case "TABLE_CELL":
    case "CAPTION":
      return <>{children}</>;

    default:
      // Unknown node type → render children if any
      return children ? <>{children}</> : null;
  }
}

// ---- Main Component ----

export function RichContentRenderer({
  content,
}: {
  content: { nodes?: RichContentNode[] } | null | undefined;
}) {
  if (!content?.nodes) return null;

  return (
    <div className="rich-content">
      {content.nodes.map((node, i) => (
        <RichContentNode key={node.id || i} node={node} />
      ))}
    </div>
  );
}
