import { HOMI_MESSAGING } from "@homi/shared"

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--homi-navy)] text-white">
      <section className="mx-auto max-w-5xl px-6 py-20">
        <p className="text-sm tracking-[0.16em] text-[var(--homi-cyan)]">{HOMI_MESSAGING.brand.tagline}</p>
        <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
          {HOMI_MESSAGING.hero.headline}
        </h1>
        <p className="mt-6 max-w-3xl text-lg text-white/80">{HOMI_MESSAGING.hero.subhead}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button className="rounded-full bg-[var(--homi-cyan)] px-6 py-3 font-semibold text-[var(--homi-navy)]">
            {HOMI_MESSAGING.hero.ctaPrimary}
          </button>
          <button className="rounded-full border border-white/25 px-6 py-3 font-semibold text-white">
            {HOMI_MESSAGING.hero.ctaSecondary}
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20">
        <h2 className="text-2xl font-semibold">{HOMI_MESSAGING.model.headline}</h2>
        <p className="mt-3 max-w-3xl text-white/75">{HOMI_MESSAGING.model.body}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {HOMI_MESSAGING.model.dimensions.map((d) => (
            <article key={d.key} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-white/60">{Math.round(d.weight * 100)}%</p>
              <h3 className="mt-1 text-xl font-semibold">{d.name}</h3>
              <p className="mt-3 text-sm text-white/75">{d.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
