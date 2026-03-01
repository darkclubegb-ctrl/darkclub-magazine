export default function HeroCover({ model }) {
    return (
        <section className="relative w-full bg-white overflow-hidden"
            style={{ minHeight: '100svh' }}
        >
            {/*
              ── THE PHYSICAL FRAME ──────────────────────────────────────
              A white border of 40px wraps the photo like a museum print.
              On mobile, reduced to 16px.
            */}
            <div
                className="absolute inset-0"
                style={{
                    padding: 'clamp(16px, 3vw, 40px)',
                }}
            >
                {/* The actual photo — framed */}
                <div className="relative w-full h-full overflow-hidden">
                    <img
                        src={model.heroImage}
                        alt={model.name}
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        draggable="false"
                        fetchpriority="high"
                        loading="eager"
                        decoding="async"
                    />

                    {/* Deep bottom gradient — where the name lives */}
                    <div
                        className="absolute inset-0"
                        style={{
                            background: 'linear-gradient(to top, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.35) 40%, transparent 70%)',
                        }}
                    />

                    {/* ── TOP META BAR ──────────────────────────────── */}
                    <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-6 md:p-10">
                        <p
                            className="font-body uppercase text-white/40"
                            style={{ fontSize: '7px', letterSpacing: '0.6em' }}
                        >
                            Darkclub · Editorial
                        </p>
                        <p
                            className="font-body uppercase text-white/25"
                            style={{ fontSize: '7px', letterSpacing: '0.4em' }}
                        >
                            No. 001 · 2026
                        </p>
                    </div>

                    {/*
                      ── MODEL NAME — BELOW THE IMAGE ─────────────────
                      Uses mix-blend-mode: screen to interact with the photo.
                      Letter-spacing extremo negativo = logo visual único.
                    */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 pb-8 md:pb-12">

                        {/* Eyebrow */}
                        <p
                            className="font-body uppercase text-white/40 mb-5"
                            style={{ fontSize: '7px', letterSpacing: '0.6em' }}
                        >
                            {model.subtitle}
                        </p>

                        {/*
                          Name — each word on its own line, gigantic.
                          mix-blend-mode: screen → text brightens/bleeds into photo.
                          ultra-tight tracking = editorial logo mark.
                        */}
                        <h1
                            className="font-display text-white uppercase leading-[0.82] select-none"
                            style={{
                                fontWeight: 300,
                                fontSize: 'clamp(4.5rem, 17vw, 20rem)',
                                letterSpacing: '-0.04em',
                                mixBlendMode: 'screen',
                            }}
                        >
                            {model.name.split(' ').map((word, i) => (
                                <span key={i} style={{ display: 'block' }}>{word}</span>
                            ))}
                        </h1>

                        {/* Thin rule */}
                        <div
                            className="mt-6 bg-white/20"
                            style={{ width: '32px', height: '1px' }}
                        />
                    </div>
                </div>
            </div>

            {/* ── SCROLL INDICATOR ─────────────────────────────────── */}
            <div
                className="absolute flex flex-col items-center gap-2 z-10"
                style={{ bottom: 'clamp(32px, 5vw, 60px)', right: 'clamp(24px, 4vw, 56px)' }}
            >
                <div className="w-px h-8 bg-white/20 animate-pulse" />
                <p
                    className="font-body uppercase text-white/30 rotate-90 origin-center translate-y-4"
                    style={{ fontSize: '7px', letterSpacing: '0.4em' }}
                >
                    Scroll
                </p>
            </div>
        </section>
    );
}
