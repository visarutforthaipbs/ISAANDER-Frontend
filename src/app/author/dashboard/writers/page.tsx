"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2,
  ArrowLeft,
  LogOut,
  QrCode,
  DollarSign,
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface WriterMeta {
  slug: string;
  wixMemberId?: string;
  promptPayId?: string;
  promptPayName?: string;
  hireEmail?: string;
  buyMeCoffeeUrl?: string;
  revenueSharePercent?: number;
  socialLinks?: {
    facebook?: string;
    x?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    website?: string;
  };
  expertise?: string[];
  notes?: string;
  isActive?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

interface UserInfo {
  slug: string;
  name: string;
  email: string;
}

const EMPTY_WRITER: WriterMeta = {
  slug: "",
  wixMemberId: "",
  promptPayId: "",
  promptPayName: "",
  hireEmail: "",
  buyMeCoffeeUrl: "",
  revenueSharePercent: 60,
  socialLinks: { facebook: "", x: "", instagram: "", youtube: "", tiktok: "", website: "" },
  expertise: [],
  notes: "",
  isActive: true,
};

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function WritersAdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [writers, setWriters] = useState<WriterMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<WriterMeta | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Auth check
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        return res.json();
      })
      .then((d) => {
        // Only admin (visarutsankham@gmail.com) can access
        if (d.user?.email !== "visarutsankham@gmail.com") {
          router.push("/author/dashboard");
          return;
        }
        setUser(d.user);
      })
      .catch(() => router.push("/author/dashboard/login"));
  }, [router]);

  const fetchWriters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/writers");
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      setWriters(d.writers ?? []);
    } catch {
      setWriters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchWriters();
  }, [user, fetchWriters]);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    if (!editing) return;
    if (!editing.slug.trim()) {
      showToast("error", "กรุณากรอก slug");
      return;
    }
    setSaving(true);
    try {
      const method = isNew ? "POST" : "PUT";
      const url = isNew
        ? "/api/admin/writers"
        : `/api/admin/writers/${editing.slug}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast("error", err.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      showToast("success", isNew ? "เพิ่มนักเขียนแล้ว" : "อัปเดตแล้ว");
      setEditing(null);
      setIsNew(false);
      fetchWriters();
    } catch {
      showToast("error", "เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(slug: string) {
    if (!confirm(`ลบนักเขียน "${slug}" จริงหรือ?`)) return;
    try {
      const res = await fetch(`/api/admin/writers/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      showToast("success", `ลบ ${slug} แล้ว`);
      fetchWriters();
    } catch {
      showToast("error", "ลบไม่สำเร็จ");
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/author/dashboard/login");
    router.refresh();
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-black/5 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <Link
              href="/author/dashboard"
              className="p-2 -ml-2 rounded-full text-text-muted hover:text-text-main hover:bg-black/5 transition-colors"
              aria-label="กลับ Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link href="/" className="font-prompt text-xl font-bold text-primary tracking-tight">
              The Isaander
            </Link>
            <span className="text-text-muted font-sarabun text-sm hidden sm:inline">
              / จัดการนักเขียน
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
            title="ออกจากระบบ"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {/* Title + Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-prompt text-2xl font-bold text-text-main flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              จัดการข้อมูลนักเขียน
            </h1>
            <p className="font-sarabun text-sm text-text-muted mt-1">
              เพิ่ม แก้ไข หรือลบข้อมูลเพิ่มเติมของนักเขียน (PromptPay, ส่วนแบ่ง, ช่องทางติดต่อ)
            </p>
          </div>
          <button
            onClick={() => {
              setEditing({ ...EMPTY_WRITER });
              setIsNew(true);
            }}
            className="inline-flex items-center gap-2 bg-primary text-white font-prompt font-semibold px-4 py-2.5 rounded-full hover:brightness-110 transition-all shadow-sm text-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มนักเขียน
          </button>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 font-sarabun text-sm ${
              toast.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {toast.msg}
          </div>
        )}

        {/* Writer Table */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : writers.length === 0 && !editing ? (
          <div className="bg-surface rounded-xl border border-black/5 shadow-sm p-10 text-center">
            <Users className="w-12 h-12 text-text-muted/30 mx-auto mb-4" />
            <p className="font-sarabun text-text-muted">
              ยังไม่มีข้อมูลนักเขียนใน Firestore — กด &quot;เพิ่มนักเขียน&quot; หรือรันสคริปต์ seed
            </p>
          </div>
        ) : (
          <div className="bg-surface rounded-xl border border-black/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-black/[0.02]">
                    <th className="text-left px-4 py-3 font-sarabun font-medium text-text-muted">
                      Slug
                    </th>
                    <th className="text-left px-4 py-3 font-sarabun font-medium text-text-muted hidden sm:table-cell">
                      Wix Member ID
                    </th>
                    <th className="text-left px-4 py-3 font-sarabun font-medium text-text-muted">
                      PromptPay
                    </th>
                    <th className="text-right px-4 py-3 font-sarabun font-medium text-text-muted">
                      ส่วนแบ่ง
                    </th>
                    <th className="text-right px-4 py-3 font-sarabun font-medium text-text-muted w-28">
                      จัดการ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {writers.map((w) => (
                    <tr key={w.slug} className="hover:bg-black/[0.01]">
                      <td className="px-4 py-3 font-sarabun text-text-main font-medium">
                        {w.slug}
                        {w.isActive === false && (
                          <span className="ml-2 text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                            ปิดใช้งาน
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-sarabun text-text-muted text-xs hidden sm:table-cell max-w-[180px] truncate">
                        {w.wixMemberId || "—"}
                      </td>
                      <td className="px-4 py-3 font-sarabun text-text-main">
                        {w.promptPayId ? (
                          <span className="inline-flex items-center gap-1">
                            <QrCode className="w-3.5 h-3.5 text-primary" />
                            {w.promptPayId}
                          </span>
                        ) : (
                          <span className="text-text-muted">—</span>
                        )}
                      </td>
                      <td className="text-right px-4 py-3 font-sarabun text-text-main">
                        {w.revenueSharePercent ?? 60}%
                      </td>
                      <td className="text-right px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditing({ ...EMPTY_WRITER, ...w });
                              setIsNew(false);
                            }}
                            className="p-1.5 rounded-full text-text-muted hover:text-primary hover:bg-primary/10 transition-colors"
                            title="แก้ไข"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(w.slug)}
                            className="p-1.5 rounded-full text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="ลบ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Edit / Create Panel */}
        {editing && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setIsNew(false);
                }}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 text-text-muted hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <h2 className="font-prompt font-bold text-xl text-text-main mb-5">
                {isNew ? "เพิ่มนักเขียนใหม่" : `แก้ไข: ${editing.slug}`}
              </h2>

              <div className="flex flex-col gap-4">
                {/* Slug */}
                <Field label="Slug (ภาษาอังกฤษ)" required>
                  <input
                    type="text"
                    value={editing.slug}
                    disabled={!isNew}
                    onChange={(e) =>
                      setEditing((prev) =>
                        prev ? { ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") } : prev
                      )
                    }
                    placeholder="somchai"
                    className="input-field disabled:opacity-50"
                  />
                </Field>

                {/* Wix Member ID */}
                <Field label="Wix Member ID">
                  <input
                    type="text"
                    value={editing.wixMemberId ?? ""}
                    onChange={(e) =>
                      setEditing((prev) => (prev ? { ...prev, wixMemberId: e.target.value } : prev))
                    }
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="input-field"
                  />
                </Field>

                <hr className="border-black/5" />

                {/* PromptPay */}
                <div className="flex items-center gap-2 text-primary">
                  <QrCode className="w-4 h-4" />
                  <span className="font-prompt font-semibold text-sm">PromptPay</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="เลขบัญชี (10-13 หลัก)">
                    <input
                      type="text"
                      value={editing.promptPayId ?? ""}
                      onChange={(e) =>
                        setEditing((prev) => (prev ? { ...prev, promptPayId: e.target.value.replace(/\D/g, "") } : prev))
                      }
                      placeholder="0812345678"
                      className="input-field"
                      maxLength={13}
                    />
                  </Field>
                  <Field label="ชื่อบัญชี">
                    <input
                      type="text"
                      value={editing.promptPayName ?? ""}
                      onChange={(e) =>
                        setEditing((prev) => (prev ? { ...prev, promptPayName: e.target.value } : prev))
                      }
                      placeholder="สมชาย ใจดี"
                      className="input-field"
                    />
                  </Field>
                </div>

                <hr className="border-black/5" />

                {/* Revenue */}
                <div className="flex items-center gap-2 text-primary">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-prompt font-semibold text-sm">รายได้</span>
                </div>

                <Field label="Revenue Share (%)">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editing.revenueSharePercent ?? 60}
                    onChange={(e) =>
                      setEditing((prev) =>
                        prev ? { ...prev, revenueSharePercent: parseInt(e.target.value) || 0 } : prev
                      )
                    }
                    className="input-field w-24"
                  />
                </Field>

                <hr className="border-black/5" />

                {/* Contact */}
                <div className="flex items-center gap-2 text-primary">
                  <Mail className="w-4 h-4" />
                  <span className="font-prompt font-semibold text-sm">ช่องทางติดต่อ</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="อีเมลจ้างงาน">
                    <input
                      type="email"
                      value={editing.hireEmail ?? ""}
                      onChange={(e) =>
                        setEditing((prev) => (prev ? { ...prev, hireEmail: e.target.value } : prev))
                      }
                      placeholder="somchai@email.com"
                      className="input-field"
                    />
                  </Field>
                  <Field label="Buy Me a Coffee URL">
                    <input
                      type="url"
                      value={editing.buyMeCoffeeUrl ?? ""}
                      onChange={(e) =>
                        setEditing((prev) => (prev ? { ...prev, buyMeCoffeeUrl: e.target.value } : prev))
                      }
                      placeholder="https://buymeacoffee.com/..."
                      className="input-field"
                    />
                  </Field>
                </div>

                <hr className="border-black/5" />

                {/* Social Links */}
                <div className="flex items-center gap-2 text-primary">
                  <Globe className="w-4 h-4" />
                  <span className="font-prompt font-semibold text-sm">โซเชียล</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {(["facebook", "x", "instagram", "youtube", "tiktok", "website"] as const).map(
                    (key) => (
                      <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                        <input
                          type="url"
                          value={editing.socialLinks?.[key] ?? ""}
                          onChange={(e) =>
                            setEditing((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    socialLinks: { ...prev.socialLinks, [key]: e.target.value },
                                  }
                                : prev
                            )
                          }
                          placeholder={`https://${key}.com/...`}
                          className="input-field"
                        />
                      </Field>
                    )
                  )}
                </div>

                <hr className="border-black/5" />

                {/* Expertise */}
                <Field label="Expertise (คั่นด้วยคอมม่า)">
                  <input
                    type="text"
                    value={editing.expertise?.join(", ") ?? ""}
                    onChange={(e) =>
                      setEditing((prev) =>
                        prev
                          ? {
                              ...prev,
                              expertise: e.target.value
                                .split(",")
                                .map((s) => s.trim())
                                .filter(Boolean),
                            }
                          : prev
                      )
                    }
                    placeholder="ข่าวสืบสวน, วัฒนธรรมอีสาน"
                    className="input-field"
                  />
                </Field>

                {/* Notes */}
                <Field label="Admin Notes">
                  <textarea
                    value={editing.notes ?? ""}
                    onChange={(e) =>
                      setEditing((prev) => (prev ? { ...prev, notes: e.target.value } : prev))
                    }
                    rows={2}
                    className="input-field resize-none"
                    placeholder="บันทึกเพิ่มเติม..."
                  />
                </Field>

                {/* Active toggle */}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editing.isActive !== false}
                    onChange={(e) =>
                      setEditing((prev) => (prev ? { ...prev, isActive: e.target.checked } : prev))
                    }
                    className="w-4 h-4 rounded border-black/20 text-primary"
                  />
                  <span className="font-sarabun text-sm text-text-main">เปิดใช้งาน</span>
                </label>

                {/* Save */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-2 inline-flex items-center justify-center gap-2 bg-primary text-white font-prompt font-semibold px-5 py-2.5 rounded-full hover:brightness-110 transition-all shadow-sm disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isNew ? "เพิ่มนักเขียน" : "บันทึกการเปลี่ยนแปลง"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .input-field {
          width: 100%;
          border: 1px solid rgba(0, 0, 0, 0.15);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          font-family: var(--font-sarabun), sans-serif;
          transition: all 0.15s;
        }
        .input-field:focus {
          outline: none;
          box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb, 139, 69, 19), 0.2);
          border-color: var(--color-primary, #8b4513);
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-sarabun text-xs text-text-muted mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
