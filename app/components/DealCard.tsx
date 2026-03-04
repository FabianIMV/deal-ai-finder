"use client";

import Image from "next/image";
import { Deal } from "@/app/types";

const DEAL_CONFIG: Record<
  Deal["dealScore"],
  { label: string; badge: string; border: string; bg: string }
> = {
  bug: {
    label: "🚨 ¡BUG DE PRECIO!",
    badge: "bg-red-600 text-white animate-pulse",
    border: "border-red-500",
    bg: "bg-red-50 dark:bg-red-950/30",
  },
  incredible: {
    label: "🔥 ¡Oferta Increíble!",
    badge: "bg-orange-500 text-white",
    border: "border-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/30",
  },
  great: {
    label: "⚡ Gran Descuento",
    badge: "bg-yellow-500 text-black",
    border: "border-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
  },
  good: {
    label: "💰 Buen Precio",
    badge: "bg-green-600 text-white",
    border: "border-green-400",
    bg: "bg-green-50 dark:bg-green-950/20",
  },
  normal: {
    label: "",
    badge: "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    border: "border-gray-200 dark:border-gray-700",
    bg: "bg-white dark:bg-gray-900",
  },
};

function formatCLP(price: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

interface DealCardProps {
  deal: Deal;
}

export default function DealCard({ deal }: DealCardProps) {
  const config = DEAL_CONFIG[deal.dealScore];

  return (
    <a
      href={deal.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col rounded-xl border-2 ${config.border} ${config.bg} overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5`}
    >
      {/* Deal badge */}
      {config.label && (
        <div className={`px-3 py-1.5 text-xs font-bold text-center ${config.badge}`}>
          {config.label}
        </div>
      )}

      <div className="flex gap-3 p-4">
        {/* Thumbnail */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          {deal.thumbnail ? (
            <Image
              src={deal.thumbnail}
              alt={deal.title}
              fill
              className="object-contain p-1"
              sizes="96px"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
              📦
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {deal.title}
          </p>

          <div className="mt-2">
            {deal.originalPrice && deal.discount > 0 && (
              <p className="text-xs text-gray-400 line-through">
                {formatCLP(deal.originalPrice)}
              </p>
            )}
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCLP(deal.price)}
            </p>
            {deal.discount > 0 && (
              <span className="inline-block mt-0.5 text-xs font-semibold text-green-600 dark:text-green-400">
                -{deal.discount}% OFF
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {deal.freeShipping && (
              <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-2 py-0.5 rounded-full font-medium">
                🚚 Envío gratis
              </span>
            )}
            {deal.condition === "new" ? (
              <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full font-medium">
                Nuevo
              </span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">
                Usado
              </span>
            )}
            {deal.seller.nickname && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                @{deal.seller.nickname.toLowerCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
