export interface AuthorSocialLinks {
  facebook?: string;
  x?: string;
  instagram?: string;
  youtube?: string;
  tiktok?: string;
  website?: string;
}

export interface Author {
  slug: string;
  name: string;
  title: string; // expertise / beat
  bio: string;
  avatar: string; // local path or URL
  coverImage?: string;
  socialLinks: AuthorSocialLinks;
  promptPayId?: string; // phone number or national ID for PromptPay
  promptPayName?: string; // display name for QR label
  buyMeCoffeeUrl?: string;
  hireEmail?: string;
  wixMemberId?: string; // link to Wix Members for auto-matching posts
  expertise?: string[]; // badge tags
  // Auth & Revenue
  email?: string; // login email
  passwordHash?: string; // bcrypt hash for dashboard login
  revenueSharePercent?: number; // e.g. 60 means author gets 60%
}

// --- Seed Authors ---

const authors: Author[] = [
  {
    slug: "theisaander",
    name: "The Isaander",
    title: "กองบรรณาธิการ",
    bio: "สำนักข่าวเชิงสืบสวนและสารคดีเชิงวัฒนธรรมแห่งภาคอีสาน — ขุดลึก เล่าจริง เพื่อคนอีสาน",
    avatar: "/images/authors/theisaander.jpg",
    coverImage: "/images/authors/theisaander-cover.jpg",
    socialLinks: {
      facebook: "https://www.facebook.com/theisaander",
      x: "https://x.com/theisaander",
    },
    expertise: ["ข่าวสืบสวน", "วัฒนธรรมอีสาน"],
    email: "admin@theisaander.com",
    passwordHash:
      "$2b$10$6SwjFwuN4lmOs4Wu9GfKeOlk88et7CJmXVYTmA7qMmC8Ols35GM3C", // isaander2025
    revenueSharePercent: 60,
  },
  {
    slug: "thammaruja",
    name: "ธรรมรุจา ธรรมสโรช", // only used as fallback
    title: "นักเขียน",
    bio: "",
    avatar: "",
    socialLinks: {},
    wixMemberId: "503edaab-00c8-44b9-a757-e0239a78fb1774128",
    promptPayId: "0627283058",
    promptPayName: "ธรรมรุจา ธรรมสโรช",
  },
  // --- Template: copy and fill in for new authors ---
  // {
  //   slug: "somchai",
  //   name: "สมชาย ใจดี",
  //   title: "นักข่าวสืบสวน",
  //   bio: "ประสบการณ์ 10 ปีในการสืบสวนคดีทุจริตภาครัฐ",
  //   avatar: "/images/authors/somchai.jpg",
  //   coverImage: "/images/authors/somchai-cover.jpg",
  //   socialLinks: { facebook: "https://facebook.com/somchai" },
  //   promptPayId: "0812345678",
  //   promptPayName: "สมชาย ใจดี",
  //   buyMeCoffeeUrl: "https://buymeacoffee.com/somchai",
  //   hireEmail: "somchai@example.com",
  //   wixMemberId: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  //   expertise: ["ข่าวสืบสวน", "การเมืองท้องถิ่น"],
  // },
];

// --- Accessors ---

export function getAllAuthors(): Author[] {
  return authors;
}

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export function getAuthorByWixMemberId(memberId: string): Author | undefined {
  return authors.find((a) => a.wixMemberId === memberId);
}

export function getAuthorByEmail(email: string): Author | undefined {
  return authors.find((a) => a.email === email);
}

export function getDefaultAuthor(): Author {
  return authors[0];
}
