import { useRef, useEffect, useState } from 'react';

// ── Lazy video observer ───────────────────────────────────────
function useLazyVideo() {
    const ref = useRef(null);
    const [shouldLoad, setShouldLoad] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setShouldLoad(true); obs.disconnect(); } },
            { rootMargin: '200px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    return [ref, shouldLoad];
}

// ── DM Signature badge ────────────────────────────────────────
function DMBadge() {
    return (
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <p style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '6px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
                userSelect: 'none',
                whiteSpace: 'nowrap',
            }}>
                D-M Signature ✦
            </p>
        </div>
    );
}

// ── Living Portrait (loop, muted, autoplay) ───────────────────
function LivingPortraitSlot({ video, index }) {
    const [wrapRef, shouldLoad] = useLazyVideo();

    if (!video?.url) {
        // Placeholder slot
        return (
            <div
                className="relative overflow-hidden flex flex-col items-center justify-center"
                style={{ aspectRatio: '9/16', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center mb-3">
                    <svg width="10" height="12" viewBox="0 0 10 12" fill="none">
                        <path d="M1 1L9 6L1 11V1Z" fill="rgba(255,255,255,0.15)" />
                    </svg>
                </div>
                <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px', letterSpacing: '4px', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase' }}>
                    Living Portrait {index + 1}
                </p>
                <DMBadge />
            </div>
        );
    }

    return (
        <div ref={wrapRef} className="relative overflow-hidden" style={{ aspectRatio: '9/16' }}>
            {shouldLoad ? (
                <video
                    src={video.url}
                    autoPlay muted loop playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ willChange: 'transform' }}
                />
            ) : (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                    <div className="w-8 h-px bg-white/10 animate-pulse" />
                </div>
            )}
            {/* Vignette */}
            <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />
            {/* Label */}
            {video.label && (
                <div className="absolute top-4 left-4">
                    <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px', letterSpacing: '4px', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                        {video.label}
                    </p>
                </div>
            )}
            <DMBadge />
        </div>
    );
}

// ── Short Film (full controls, lazy) ─────────────────────────
function ShortFilmSlot({ video, index }) {
    const [wrapRef, shouldLoad] = useLazyVideo();
    const [playing, setPlaying] = useState(false);
    const videoRef = useRef(null);

    const handlePlay = () => {
        if (videoRef.current) {
            videoRef.current.play();
            setPlaying(true);
        }
    };

    if (!video?.url) {
        return (
            <div
                className="relative overflow-hidden flex flex-col items-center justify-center"
                style={{ aspectRatio: '16/9', background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)' }}
            >
                <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center mb-4">
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                        <path d="M1 1L15 9L1 17V1Z" fill="rgba(255,255,255,0.1)" />
                    </svg>
                </div>
                <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px', letterSpacing: '4px', color: 'rgba(255,255,255,0.08)', textTransform: 'uppercase' }}>
                    Short Film {index + 1}
                </p>
                <DMBadge />
            </div>
        );
    }

    return (
        <div ref={wrapRef} className="relative overflow-hidden group" style={{ aspectRatio: '16/9', background: '#000' }}>
            {shouldLoad ? (
                <video
                    ref={videoRef}
                    src={video.url}
                    playsInline
                    preload="metadata"
                    controls={playing}
                    className="absolute inset-0 w-full h-full object-cover"
                />
            ) : (
                <div className="absolute inset-0 bg-black" />
            )}

            {/* Custom play overlay — shows until user clicks */}
            {!playing && (
                <div
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer z-10"
                    style={{ background: 'rgba(0,0,0,0.45)' }}
                    onClick={handlePlay}
                >
                    <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300"
                        style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}
                    >
                        <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                            <path d="M1 1L15 9L1 17V1Z" fill="white" fillOpacity="0.9" />
                        </svg>
                    </div>
                    {video.label && (
                        <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '8px', letterSpacing: '4px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>
                            {video.label}
                        </p>
                    )}
                    {video.duration && (
                        <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px', letterSpacing: '2px', color: 'rgba(255,255,255,0.2)', marginTop: '6px' }}>
                            {video.duration}
                        </p>
                    )}
                </div>
            )}
            <DMBadge />
        </div>
    );
}

// ── Main CinemaSection ────────────────────────────────────────
export default function CinemaSection({ cinemaVideos = [] }) {
    const livingPortraits = cinemaVideos.filter(v => v.type === 'living-portrait').slice(0, 3);
    const shortFilms = cinemaVideos.filter(v => v.type === 'short-film').slice(0, 2);

    // Pad arrays to always show 3 LP slots + 2 SF slots
    while (livingPortraits.length < 3) livingPortraits.push(null);
    while (shortFilms.length < 2) shortFilms.push(null);

    return (
        <section className="w-full bg-black overflow-hidden" style={{ padding: 'clamp(60px, 10vw, 100px) 0' }}>

            {/* ── Section header ─────────────────────────────── */}
            <div className="px-6 md:px-16 mb-16">
                <div className="flex items-center gap-5 mb-10">
                    <div style={{ width: '20px', height: '1px', background: 'rgba(255,255,255,0.12)' }} />
                    <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px', letterSpacing: '0.7em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
                        The Cinema Experience
                    </p>
                </div>
                <h2 style={{
                    fontFamily: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
                    fontWeight: 300,
                    fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
                    color: '#ffffff',
                    letterSpacing: '-1px',
                    lineHeight: '0.9',
                }}>
                    Cada frame,<br />um universo.
                </h2>
            </div>

            {/* ── Living Portraits — 3 vertical slots ─────────── */}
            <div className="px-6 md:px-16 mb-6">
                <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px', letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginBottom: '16px' }}>
                    Living Portraits · Loop contínuo
                </p>
            </div>

            {/* Portrait grid: 1 col mobile / 3 cols desktop — alternating sizes */}
            <div className="px-6 md:px-16 grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-16"
                style={{ gridTemplateRows: 'auto' }}>
                {livingPortraits.map((v, i) => (
                    <div key={i} style={{ marginTop: i === 1 ? 'clamp(0px, 3vw, 48px)' : '0' }}>
                        <LivingPortraitSlot video={v} index={i} />
                    </div>
                ))}
            </div>

            {/* Thin divider */}
            <div className="mx-6 md:mx-16 mb-16" style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />

            {/* ── Short Films — 2 horizontal slots ─────────────── */}
            <div className="px-6 md:px-16 mb-6">
                <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px', letterSpacing: '5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)', marginBottom: '16px' }}>
                    Short Films · Curta-metragem da sua vida
                </p>
            </div>

            <div className="px-6 md:px-16 grid grid-cols-1 md:grid-cols-2 gap-4">
                {shortFilms.map((v, i) => (
                    <ShortFilmSlot key={i} video={v} index={i} />
                ))}
            </div>

            {/* Bottom label */}
            <div className="px-6 md:px-16 mt-10 text-right">
                <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '6px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.08)' }}>
                    D-M SIGNATURE · Darkclub Digital Magazine · Brasil 2026
                </p>
            </div>
        </section>
    );
}
