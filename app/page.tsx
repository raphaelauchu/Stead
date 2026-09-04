import InfinityMark from "@/components/InfinityMark";
import ProgressRing from "@/components/ProgressRing";

const categories = [
  { label: "Corps", percent: 80 },
  { label: "Esprit", percent: 45 },
  { label: "Cœur", percent: 100 },
  { label: "Âme", percent: 60 },
];

const bundleCorps = [
  { label: "Séance complétée", done: true },
  { label: "Repas maison cuisiné", done: true },
  { label: "Routine du soir", done: false },
];

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16">
      <div className="flex items-center gap-3">
        <InfinityMark className="w-8 text-accent" />
        <span className="font-display text-lg tracking-[0.15em] text-ink">
          STEAD
        </span>
      </div>

      <div className="mt-10 w-full max-w-sm rounded-[22px] border border-line bg-surface p-8">
        <div className="flex justify-between font-mono text-[11px] uppercase tracking-widest text-inkdim">
          <span>Aujourd&apos;hui</span>
          <span>4 sept.</span>
        </div>

        <div className="relative mt-6 flex justify-center">
          <div
            className="pointer-events-none absolute h-56 w-56 rounded-full blur-2xl"
            style={{
              background:
                "radial-gradient(circle, rgba(216,181,113,0.20) 0%, transparent 70%)",
            }}
          />
          <ProgressRing percent={71} size={180} strokeWidth={10}>
            <span className="font-mono text-[11px] uppercase tracking-widest text-inkdim">
              Niveau
            </span>
            <span className="font-display text-4xl text-ink">12</span>
            <span className="mt-1 font-mono text-xs text-inkdim">
              640 / 900 XP
            </span>
          </ProgressRing>
        </div>

        <div className="mt-4 flex justify-center gap-6">
          {categories.map((c) => (
            <div key={c.label} className="flex flex-col items-center gap-2">
              <ProgressRing percent={c.percent} size={60} strokeWidth={6}>
                <span className="font-mono text-[11px] font-semibold text-ink">
                  {c.percent}%
                </span>
              </ProgressRing>
              <span className="font-mono text-[11px] uppercase tracking-wide text-inkdim">
                {c.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-7 border-t border-line pt-5">
          <div className="font-mono text-xs uppercase tracking-widest text-inkdim">
            Bundle du jour — Corps
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {bundleCorps.map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-3 text-sm ${
                  item.done ? "text-ink" : "text-inkdim"
                }`}
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] ${
                    item.done ? "border-accent bg-accent" : "border-line"
                  }`}
                >
                  {item.done && (
                    <span className="h-1.5 w-1.5 rounded-full bg-surface" />
                  )}
                </span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-5 font-mono text-[11px] text-inkdim">
        Aperçu — données d&apos;exemple
      </p>
    </main>
  );
}
