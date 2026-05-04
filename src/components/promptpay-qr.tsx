"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";

interface PromptPayQRProps {
  promptPayId: string;
  promptPayName?: string;
  goldenTheme?: boolean;
}

const PRESET_AMOUNTS = [20, 50, 100];

export function PromptPayQR({ promptPayId, promptPayName, goldenTheme }: PromptPayQRProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    async function generate() {
      try {
        const payload = generatePayload(promptPayId, { amount: selectedAmount ?? undefined });
        const url = await QRCode.toDataURL(payload, {
          width: 280,
          margin: 2,
          color: { dark: "#2D2D2D", light: "#FFFFFF" },
        });
        setQrDataUrl(url);
      } catch {
        setQrDataUrl(null);
      }
    }
    generate();
  }, [promptPayId, selectedAmount]);

  return (
    <div className="flex flex-col items-center gap-3">
      {qrDataUrl ? (
        <div className="bg-white rounded-xl p-3 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrDataUrl}
            alt="PromptPay QR Code"
            className="w-52 h-52 rounded-md"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl p-3 shadow-sm">
          <div className="w-52 h-52 rounded-md bg-stone-100 flex items-center justify-center text-text-muted text-sm">
            กำลังสร้าง QR...
          </div>
        </div>
      )}

      <p className={`text-sm font-sarabun ${goldenTheme ? "text-stone-900" : "text-text-muted"}`}>
        สแกนจ่ายผ่าน PromptPay
      </p>
      {promptPayName && !goldenTheme && (
        <p className="text-xs text-text-muted font-sarabun">
          ชื่อบัญชี: {promptPayName}
        </p>
      )}

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => setSelectedAmount(null)}
          className={`px-3 py-1.5 text-sm font-sarabun rounded-full border transition-colors ${
            selectedAmount === null
              ? goldenTheme
                ? "bg-stone-900 text-white border-stone-900"
                : "bg-primary text-white border-primary"
              : goldenTheme
                ? "bg-white/80 text-stone-900 border-white/50 hover:bg-white"
                : "bg-white text-text-main border-black/15 hover:border-primary/50"
          }`}
        >
          ไม่ระบุ
        </button>
        {PRESET_AMOUNTS.map((amount) => (
          <button
            key={amount}
            onClick={() => setSelectedAmount(amount)}
            className={`px-3 py-1.5 text-sm font-sarabun rounded-full border transition-colors ${
              selectedAmount === amount
                ? goldenTheme
                  ? "bg-stone-900 text-white border-stone-900"
                  : "bg-primary text-white border-primary"
                : goldenTheme
                  ? "bg-white/80 text-stone-900 border-white/50 hover:bg-white"
                  : "bg-white text-text-main border-black/15 hover:border-primary/50"
            }`}
          >
            {goldenTheme ? `${amount}B` : `฿${amount}`}
          </button>
        ))}
      </div>
    </div>
  );
}
