export default function EditorialText({ model }) {
    const paragraphs = model.bio?.split('\n\n').filter(Boolean) ?? [];

    return (
        <section className="w-full bg-brand-white" style={{ paddingTop: '8rem', paddingBottom: '8rem' }}>

            {/* ── OUTER MARGINS — magazine-style generous padding ── */}
            <div className="max-w-5xl mx-auto" style={{ paddingLeft: 'clamp(32px, 8vw, 120px)', paddingRight: 'clamp(32px, 8vw, 120px)' }}>

                {/* Section eyebrow */}
                <div className="flex items-center gap-5 mb-16">
                    <div className="w-5 h-px bg-black/20" />
                    <p className="font-body uppercase text-black/25" style={{ fontSize: '7px', letterSpacing: '0.6em' }}>
                        Perfil Editorial
                    </p>
                </div>

                {/*
                  Issue title — Cormorant weight 300, ultra-low tracking.
                  Behaves like a masthead logotype, not a heading.
                */}
                <h2
                    className="font-display text-black uppercase leading-none mb-4"
                    style={{
                        fontWeight: 300,
                        fontSize: 'clamp(2.8rem, 7vw, 6rem)',
                        letterSpacing: '-0.04em',
                    }}
                >
                    {model.name}
                </h2>

                {/* Subtitle — italic, small, breathing room below */}
                <p
                    className="font-display italic text-black/35 mb-16"
                    style={{ fontWeight: 300, fontSize: 'clamp(0.85rem, 1.5vw, 1rem)', letterSpacing: '0.02em' }}
                >
                    {model.subtitle}
                </p>

                {/* Thin rule — like a magazine baseline divider */}
                <div className="h-px bg-black/8 mb-14" />

                {/*
                  Two-column bio — editorial magazine layout.
                  First paragraph has drop-cap (ultra-thin Cormorant initial).
                */}
                <div className="md:columns-2 md:gap-20">
                    {paragraphs.map((para, i) => (
                        <p
                            key={i}
                            className={`font-body leading-[1.85] text-black/70 mb-7 break-inside-avoid ${i === 0 ? 'drop-cap' : ''}`}
                            style={{ fontSize: '0.875rem' }}
                        >
                            {para}
                        </p>
                    ))}
                </div>

                {/* Bottom decoration */}
                <div className="mt-20 flex items-center gap-6">
                    <div className="flex-1 h-px bg-black/8" />
                    <p className="font-body uppercase text-black/15" style={{ fontSize: '7px', letterSpacing: '0.5em' }}>
                        Darkclub Editorial · 2026
                    </p>
                    <div className="flex-1 h-px bg-black/8" />
                </div>

            </div>
        </section>
    );
}
