"use client";

import { useState, useCallback, FormEvent } from "react";
import DealCard from "@/app/components/DealCard";
import { Deal, SearchResponse } from "@/app/types";

const SUGGESTED_SEARCHES = [
  "Nintendo Switch",
  "PlayStation 5",
  "iPhone",
  "Zapatillas Nike",
  "Smart TV 55",
  "AirPods",
  "MacBook",
  "Ropa deportiva",
  "Microondas",
  "Cafetera",
];

const MAX_PRICE_OPTIONS = [
  { label: "Cualquier precio", value: "" },
  { label: "Hasta $1.000", value: "1000" },
  { label: "Hasta $5.000", value: "5000" },
  { label: "Hasta $10.000", value: "10000" },
  { label: "Hasta $50.000", value: "50000" },
  { label: "Hasta $100.000", value: "100000" },
  { label: "Hasta $200.000", value: "200000" },
  { label: "Hasta $500.000", value: "500000" },
];

const MIN_DISCOUNT_OPTIONS = [
  { label: "Cualquier descuento", value: "0" },
  { label: "Desde 20% OFF", value: "20" },
  { label: "Desde 40% OFF", value: "40" },
  { label: "Desde 60% OFF", value: "60" },
  { label: "Desde 80% OFF (bugs)", value: "80" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minDiscount, setMinDiscount] = useState("0");
  const [results, setResults] = useState<Deal[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");

  const doSearch = useCallback(
    async (q: string, mp?: string, md?: string) => {
      const trimmedQ = q.trim();
      if (!trimmedQ) return;

      setLoading(true);
      setError(null);
      setSearched(true);
      setCurrentQuery(trimmedQ);

      try {
        const params = new URLSearchParams({ q: trimmedQ, limit: "30" });
        if (mp) params.set("maxPrice", mp);
        if (md && md !== "0") params.set("minDiscount", md);

        const res = await fetch(`/api/search?${params.toString()}`);
        const data: SearchResponse = await res.json();

        if (!res.ok || data.error) {
          setError(data.error ?? "Error al buscar. Intenta de nuevo.");
          setResults([]);
          setTotal(0);
        } else {
          setResults(data.results);
          setTotal(data.total);
        }
      } catch {
        setError("Error de conexión. Intenta de nuevo.");
        setResults([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    doSearch(query, maxPrice, minDiscount);
  };

  const handleSuggestion = (suggestion: string) => {
    setQuery(suggestion);
    doSearch(suggestion, maxPrice, minDiscount);
  };

  const bugCount = results.filter((r) => r.dealScore === "bug").length;
  const incredibleCount = results.filter(
    (r) => r.dealScore === "incredible"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-3">
          <span className="text-3xl">🇨🇱</span>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">
              Deal AI Finder
            </h1>
            <p className="text-xs text-blue-300">
              Buscador de ofertas imperdibles en Chile
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        {!searched && (
          <div className="text-center mb-10">
            <h2 className="text-4xl sm:text-5xl font-extrabold mb-3 bg-gradient-to-r from-white via-blue-200 to-red-300 bg-clip-text text-transparent">
              Ofertas Imposibles 🔥
            </h2>
            <p className="text-lg text-blue-200 max-w-xl mx-auto">
              Encuentra bugs de precio, descuentos extremos y ofertas de 1 en un
              millón en tiendas chilenas. Todo en <strong>pesos chilenos</strong>.
            </p>
          </div>
        )}

        {/* Search form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 shadow-xl"
        >
          <div className="flex gap-2">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Nintendo Switch, iPhone, ropa deportiva…"
              className="flex-1 bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-xl font-bold text-white transition-colors whitespace-nowrap"
            >
              {loading ? "Buscando…" : "🔍 Buscar"}
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-3">
            {/* Max price filter */}
            <select
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              {MAX_PRICE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-800">
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Min discount filter */}
            <select
              value={minDiscount}
              onChange={(e) => setMinDiscount(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              {MIN_DISCOUNT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-800">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Suggested searches */}
          {!searched && (
            <div className="mt-4">
              <p className="text-xs text-white/50 mb-2 uppercase tracking-wider font-semibold">
                Búsquedas populares
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_SEARCHES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSuggestion(s)}
                    className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-full px-3 py-1.5 text-white/80 hover:text-white transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        {/* Results area */}
        {loading && (
          <div className="mt-12 flex flex-col items-center gap-4 text-blue-200">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg">Buscando las mejores ofertas…</p>
          </div>
        )}

        {error && (
          <div className="mt-8 p-4 bg-red-900/40 border border-red-500 rounded-xl text-red-200 text-center">
            ⚠️ {error}
          </div>
        )}

        {searched && !loading && !error && (
          <>
            {/* Stats bar */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <p className="text-white/70 text-sm">
                <span className="font-bold text-white">{results.length}</span>{" "}
                resultados para{" "}
                <span className="font-bold text-blue-300">
                  &ldquo;{currentQuery}&rdquo;
                </span>
                {total > 30 && (
                  <span className="text-white/40 ml-1">
                    (de {total.toLocaleString("es-CL")} totales)
                  </span>
                )}
              </p>
              {bugCount > 0 && (
                <span className="text-xs font-bold bg-red-600 text-white px-2 py-1 rounded-full animate-pulse">
                  🚨 {bugCount} bug{bugCount !== 1 ? "s" : ""} de precio
                </span>
              )}
              {incredibleCount > 0 && (
                <span className="text-xs font-bold bg-orange-500 text-white px-2 py-1 rounded-full">
                  🔥 {incredibleCount} oferta{incredibleCount !== 1 ? "s" : ""} increíble
                  {incredibleCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            {results.length === 0 ? (
              <div className="mt-12 text-center text-white/50">
                <p className="text-5xl mb-4">😢</p>
                <p className="text-xl font-semibold">
                  No se encontraron resultados
                </p>
                <p className="text-sm mt-2">
                  Intenta con otros términos o amplía los filtros de precio y
                  descuento.
                </p>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((deal) => (
                  <DealCard key={deal.id} deal={deal} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Info section */}
        {!searched && (
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {[
              {
                icon: "🚨",
                title: "Bugs de Precio",
                desc: "Detecta productos con descuentos del 80%+ — probablemente errores de precio.",
              },
              {
                icon: "🔥",
                title: "Ofertas Increíbles",
                desc: "Descuentos de 60%+ en tiendas chilenas. Compra antes que se acaben.",
              },
              {
                icon: "🇨🇱",
                title: "Solo Chile",
                desc: "Resultados de MercadoLibre Chile. Precios en pesos chilenos (CLP).",
              },
            ].map(({ icon, title, desc }) => (
              <div
                key={title}
                className="bg-white/5 border border-white/10 rounded-xl p-5"
              >
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="font-bold text-white mb-1">{title}</h3>
                <p className="text-sm text-white/60">{desc}</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="mt-16 border-t border-white/10 py-6 text-center text-xs text-white/30">
        Deal AI Finder — Precios en pesos chilenos (CLP) — Resultados de
        MercadoLibre Chile
      </footer>
    </div>
  );
}
