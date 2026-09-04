import InfinityMark from "@/components/InfinityMark";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-24 text-center">
      <div className="relative flex items-center justify-center">
        <div
          className="absolute h-56 w-56 rounded-full blur-2xl"
          style={{ background: "radial-gradient(circle, rgba(216,181,113,0.20) 0%, transparent 70%)" }}
        />
        <InfinityMark className="relative w-40 text-accent" />
      </div>

      <h1 className="mt-6 font-display text-5xl tracking-[0.08em] text-ink">
        STEAD
      </h1>

      <p className="mt-4 max-w-md font-display italic text-xl text-inkdim">
        Un système de progression pour devenir l&apos;homme que tu veux être.
      </p>

      <div className="mt-14 rounded-2xl border border-line bg-surface px-6 py-3 font-mono text-xs uppercase tracking-widest text-inkdim">
        En construction
      </div>
    </main>
  );
}
