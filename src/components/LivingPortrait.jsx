export default function LivingPortrait({ videoUrl }) {
    if (!videoUrl) return null;

    return (
        <section className="w-full bg-brand-black overflow-hidden" style={{ paddingTop: '4rem', paddingBottom: '5rem' }}>

            {/*
              Layout:
              - Mobile: full-width video with small padding
              - Desktop: offset to the right with intentional void on left
            */}
            <div className="relative max-w-none px-0">

                {/* Section eyebrow */}
                <div className="px-6 md:px-20 mb-8 md:mb-10 flex items-center gap-5">
                    <div className="w-5 h-px bg-white/15" />
                    <p
                        className="font-body uppercase text-white/20"
                        style={{ fontSize: '7px', letterSpacing: '0.65em' }}
                    >
                        Living Portrait
                    </p>
                </div>

                {/* Video row: mobile = full width, desktop = offset */}
                <div className="flex items-start">

                    {/* Left whitespace — desktop only */}
                    <div className="hidden md:block" style={{ flex: '0 0 28%' }} />

                    {/* Video — full width on mobile, constrained on desktop */}
                    <div className="w-full md:flex-1" style={{ maxWidth: '100%' }}>
                        <div className="px-4 md:px-0">
                            <div
                                className="relative overflow-hidden"
                                style={{
                                    border: '4px solid #0f0f0f',
                                    background: '#000',
                                }}
                            >
                                <video
                                    src={videoUrl}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full block"
                                    style={{
                                        maxHeight: '75vh',
                                        minHeight: '240px',
                                        objectFit: 'cover',
                                    }}
                                />
                                {/* Vignette */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Technical caption — desktop only, beside the video */}
                    <div
                        className="hidden md:flex flex-col items-center justify-end"
                        style={{ flex: '0 0 80px', alignSelf: 'stretch', paddingBottom: '12px', paddingLeft: '16px' }}
                    >
                        <div className="w-px flex-1 bg-white/10" style={{ minHeight: '80px' }} />
                        <p
                            className="font-body uppercase text-white/15 mt-4"
                            style={{
                                fontSize: '7px',
                                letterSpacing: '0.45em',
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                transform: 'rotate(180deg)',
                            }}
                        >
                            Moving image · Loop contínuo · Dark Editorial 2026
                        </p>
                    </div>
                </div>

                {/* Mobile caption */}
                <p
                    className="md:hidden font-body uppercase text-white/15 mt-4 text-right px-6"
                    style={{ fontSize: '7px', letterSpacing: '0.4em' }}
                >
                    Moving image · Dark Editorial 2026
                </p>
            </div>
        </section>
    );
}
