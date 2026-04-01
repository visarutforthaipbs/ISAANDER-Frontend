"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";

interface PromptPayQRProps {
  promptPayId: string;
  promptPayName?: string;
}

const PRESET_AMOUNTS = [20, 50, 100];

export function PromptPayQR({ promptPayId, promptPayName }: PromptPayQRProps) {
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
      {/* QR Code */}
      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrDataUrl}
          alt="PromptPay QR Code"
          className="w-48 h-48 rounded-lg border border-black/10"
        />
      ) : (
        <div className="w-48 h-48 rounded-lg border border-black/10 bg-stone-100 flex items-center justify-center text-text-muted text-sm">
          กำลังสร้าง QR...
        </div>
      )}

      {/* Label */}
      <p className="text-sm text-text-muted font-sarabun">
        สแกนจ่ายผ่าน PromptPay
      </p>
      {promptPayName && (
        <p className="text-xs text-text-muted font-sarabun">
          ชื่อบัญชี: {promptPayName}
        </p>
      )}

      {/* Preset amount buttons */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={() => setSelectedAmount(null)}
          className={`px-3 py-1.5 text-sm font-sarabun rounded-full border transition-colors ${
            selectedAmount === null
              ? "bg-primary text-white border-primary"
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
                ? "bg-primary text-white border-primary"
                : "bg-white text-text-main border-black/15 hover:border-primary/50"
            }`}
          >
            ฿{amount}
          </button>
        ))}
      </div>
    </div>
  );
}
