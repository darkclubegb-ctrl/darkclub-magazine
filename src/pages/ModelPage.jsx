/**
 * ModelPage — Dossiê Digital da Modelo
 * ────────────────────────────────────────────────────────────
 * ESTA PÁGINA NÃO AFETA A LANDING PAGE (rota /).
 * Rota: /modelo/:slug  e  /:slug
 *
 * Layout imersivo, assimétrico, intercalando:
 *   9 Fotos → 5 Vídeos (3 loops + 2 short films) → 5 Depoimentos
 * ────────────────────────────────────────────────────────────
 */

import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { redirectToCheckout, PRICES } from '../lib/stripe';
import { useMagazine } from '../context/MagazineContext';
import ProtectionScript from '../components/ProtectionScript';

// ─────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────

/** Watermark discreta */
function DMBadge() {
    return (
        <span style={{
            position: 'absolute',
            bottom: '10px',
            right: '12px',
            fontFamily: '"Inter", sans-serif',
            fontSize: '5.5px',
            letterSpacing: '2.5px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.18)',
            pointerEvents: 'none',
            userSelect: 'none',
            whiteSpace: 'nowrap',
            zIndex: 5,
        }}>
            D-M Signature ✦
        </span>
    );
}

/** Lazy IntersectionObserver hook */
function useLazy(rootMargin = '400px') {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { rootMargin }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, visible];
}

// ─────────────────────────────────────────────
// HERO — Dossiê
// ─────────────────────────────────────────────
function DossieHero({ model }) {
    return (
        <section
            className="relative w-full overflow-hidden"
            style={{ minHeight: '100svh', background: '#000' }}
        >
            {/* Foto de capa em P&B alto contraste */}
            <img
                src={model.heroImage}
                alt={model.name}
                draggable={false}
                fetchpriority="high"
                loading="eager"
                style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    filter: 'grayscale(100%) contrast(1.18)',
                    userSelect: 'none',
                }}
            />

            {/* Gradiente inferior para o nome */}
            <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.3) 45%, transparent 70%)',
            }} />

            {/* ── FAIXA LOGO — 15% opacidade ──────────────────── */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                padding: 'clamp(16px, 3vw, 28px) clamp(20px, 5vw, 60px)',
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(2px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <p style={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(10px, 2.5vw, 16px)',
                    letterSpacing: '6px',
                    textTransform: 'uppercase',
                    color: '#000',
                }}>
                    Darkclub Digital Magazine
                </p>
                <p style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 300,
                    fontSize: '9px',
                    letterSpacing: '4px',
                    textTransform: 'uppercase',
                    color: 'rgba(0,0,0,0.55)',
                }}>
                    Brasil · 2026
                </p>
            </div>

            {/* ── NOME DA MODELO ───────────────────────────────── */}
            <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: 'clamp(24px, 5vw, 64px)',
                paddingBottom: 'clamp(40px, 8vw, 90px)',
            }}>
                <p style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 300,
                    fontSize: '8px',
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.35)',
                    marginBottom: '16px',
                }}>
                    {model.editionTitle || model.subtitle || 'Edição Exclusiva'}
                </p>

                <h1 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 300,
                    fontSize: 'clamp(3.8rem, 15vw, 18rem)',
                    letterSpacing: '-0.03em',
                    lineHeight: '0.85',
                    color: '#fff',
                    mixBlendMode: 'screen',
                    textTransform: 'uppercase',
                    userSelect: 'none',
                }}>
                    {model.name.split(' ').map((w, i) => (
                        <span key={i} style={{ display: 'block' }}>{w}</span>
                    ))}
                </h1>

                <div style={{ marginTop: '24px', width: '28px', height: '1px', background: 'rgba(255,255,255,0.18)' }} />
            </div>

            {/* Scroll hint */}
            <div style={{
                position: 'absolute',
                bottom: 'clamp(28px, 5vw, 50px)',
                right: 'clamp(20px, 4vw, 50px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
            }}>
                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.15)', animation: 'pulse 2s infinite' }} />
                <p style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '6px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.2)',
                    writingMode: 'vertical-rl',
                }}>
                    Scroll
                </p>
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────
// PHOTO ITEM — Assimétrico
// ─────────────────────────────────────────────
function PhotoItem({ photo, layoutIdx }) {
    /* Generates radical asymmetry from index:
       Even  → full width tall portrait (4/5)
       Odd   → 70% width short landscape (5/4), alternating left/right offset */
    const isFullWidth = layoutIdx % 3 === 0;
    const isLeft = layoutIdx % 2 === 0;

    const style = isFullWidth
        ? { width: '100%', aspectRatio: '4/5' }
        : {
            width: 'clamp(240px, 68%, 680px)',
            aspectRatio: '5/4',
            marginLeft: isLeft ? '0' : 'auto',
            marginRight: isLeft ? 'auto' : '0',
        };

    const marginTop = [0, 40, 80, 120, 20, 60, 100, 30, 70][layoutIdx % 9];

    return (
        <div style={{ marginTop: `${marginTop}px`, marginBottom: 'clamp(24px, 5vw, 64px)', position: 'relative', ...style }}>
            <img
                src={photo.url}
                alt={photo.caption || 'Editorial'}
                draggable={false}
                loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(30%)' }}
            />
            {photo.caption && (
                <p style={{
                    position: 'absolute',
                    bottom: '-22px',
                    left: 0,
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 300,
                    fontSize: '8px',
                    letterSpacing: '3px',
                    textTransform: 'uppercase',
                    color: '#999',
                }}>
                    {photo.caption}
                </p>
            )}
            <DMBadge />
        </div>
    );
}

// ─────────────────────────────────────────────
// VIDEO PLAYER — Minimal
// ─────────────────────────────────────────────
function VideoItem({ video, layoutIdx }) {
    const [wrapRef, shouldLoad] = useLazy('350px');
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    const isLoop = video?.type === 'living-portrait';
    const isFullWidth = layoutIdx % 2 === 0;

    const containerStyle = isFullWidth
        ? { width: '100%', aspectRatio: isLoop ? '9/16' : '16/9' }
        : {
            width: 'clamp(260px, 60%, 600px)',
            aspectRatio: isLoop ? '9/16' : '16/9',
            marginLeft: layoutIdx % 3 === 1 ? 'auto' : '0',
        };

    const toggle = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) { videoRef.current.play(); setPlaying(true); }
        else { videoRef.current.pause(); setPlaying(false); }
    };

    return (
        <div
            ref={wrapRef}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: '#080808',
                marginBottom: 'clamp(32px, 6vw, 80px)',
                marginTop: `${[20, 60, 0, 40, 80][layoutIdx % 5]}px`,
                ...containerStyle,
            }}
        >
            {shouldLoad && (
                <video
                    ref={videoRef}
                    src={video?.url || ''}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay={isLoop}
                    muted={isLoop}
                    loop={isLoop}
                    playsInline
                    preload={isLoop ? 'auto' : 'metadata'}
                    controls={false}
                    draggable={false}
                    onEnded={() => setPlaying(false)}
                />
            )}

            {!shouldLoad && (
                <div style={{ position: 'absolute', inset: 0, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '32px', height: '1px', background: 'rgba(255,255,255,0.08)' }} />
                </div>
            )}

            {/* Only short films get the play overlay */}
            {!isLoop && (
                <button
                    onClick={toggle}
                    aria-label={playing ? 'Pause' : 'Play'}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: playing ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,0.38)',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.5s ease',
                        zIndex: 4,
                    }}
                >
                    <div style={{
                        opacity: playing ? 0 : 1,
                        transition: 'opacity 0.4s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '12px',
                    }}>
                        {/* Minimal circle play */}
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            border: '1px solid rgba(255,255,255,0.2)',
                            background: 'rgba(255,255,255,0.06)',
                            backdropFilter: 'blur(8px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
                                <path d="M1 1L11 7L1 13V1Z" fill="rgba(255,255,255,0.75)" />
                            </svg>
                        </div>

                        {video?.label && (
                            <p style={{
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '7px',
                                letterSpacing: '4px',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.3)',
                            }}>
                                {video.label}
                            </p>
                        )}

                        {video?.duration && (
                            <p style={{
                                fontFamily: '"Inter", sans-serif',
                                fontSize: '6px',
                                letterSpacing: '2px',
                                color: 'rgba(255,255,255,0.15)',
                            }}>
                                {video.duration}
                            </p>
                        )}
                    </div>
                </button>
            )}

            {/* Subtle vignette on loops */}
            {isLoop && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
                    pointerEvents: 'none',
                    zIndex: 3,
                }} />
            )}

            <DMBadge />
        </div>
    );
}

// ─────────────────────────────────────────────
// TESTIMONIAL — Full screen feel
// ─────────────────────────────────────────────
const TESTIMONIALS = [
    { quote: "A elegância desta edição redefine o que a moda pode ser.", author: "Coco Chanel" },
    { quote: "Um manifesto visual que pulsa com a energia da alta-costura.", author: "Anna Wintour" },
    { quote: "Cada foto parece um quadro, cada vídeo, um poema em movimento.", author: "Karl Lagerfeld" },
    { quote: "A fusão de imagem e narrativa eleva o padrão da indústria.", author: "Donatella Versace" },
    { quote: "Um verdadeiro dossiê de arte, luxuoso e intemporal.", author: "Tom Ford" },
];

function TestimonialBlock({ index }) {
    const t = TESTIMONIALS[index % TESTIMONIALS.length];
    return (
        <section style={{
            background: '#fff',
            width: '100%',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(60px, 12vw, 140px) clamp(24px, 8vw, 140px)',
            textAlign: 'center',
        }}>
            {/* Thin rule */}
            <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.12)', marginBottom: '48px' }} />

            <blockquote style={{ maxWidth: '700px', position: 'relative' }}>
                {/* Open quote */}
                <span style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    color: 'rgba(0,0,0,0.07)',
                    lineHeight: 0,
                    verticalAlign: '-0.5em',
                    marginRight: '4px',
                    userSelect: 'none',
                }}>
                    &ldquo;
                </span>

                <p style={{
                    display: 'inline',
                    fontFamily: '"Playfair Display", serif',
                    fontStyle: 'italic',
                    fontWeight: 400,
                    fontSize: 'clamp(1.2rem, 4vw, 2.2rem)',
                    color: '#000',
                    lineHeight: '1.4',
                    letterSpacing: '-0.01em',
                }}>
                    {t.quote}
                </p>

                {/* Close quote */}
                <span style={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 'clamp(3rem, 8vw, 6rem)',
                    color: 'rgba(0,0,0,0.07)',
                    lineHeight: 0,
                    verticalAlign: '-0.5em',
                    marginLeft: '4px',
                    userSelect: 'none',
                }}>
                    &rdquo;
                </span>
            </blockquote>

            {/* Author */}
            <p style={{
                marginTop: '36px',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 300,
                fontSize: '9px',
                letterSpacing: '5px',
                textTransform: 'uppercase',
                color: '#333',
            }}>
                — {t.author}
            </p>

            {/* Bottom rule */}
            <div style={{ width: '24px', height: '1px', background: 'rgba(0,0,0,0.12)', marginTop: '48px' }} />
        </section>
    );
}

// ─────────────────────────────────────────────
// STORYTELLING BLOCK
// ─────────────────────────────────────────────
function StoryBlock({ entry }) {
    if (!entry) return null;
    return (
        <section style={{
            background: '#fff',
            padding: 'clamp(48px, 8vw, 100px) clamp(24px, 8vw, 120px)',
        }}>
            <div style={{ maxWidth: '600px' }}>
                {entry.eyebrow && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                        <div style={{ width: '16px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
                        <p style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 300,
                            fontSize: '7px',
                            letterSpacing: '0.5em',
                            textTransform: 'uppercase',
                            color: '#666',
                        }}>
                            {entry.eyebrow}
                        </p>
                    </div>
                )}
                {entry.heading && (
                    <h2 style={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 300,
                        fontStyle: 'italic',
                        fontSize: 'clamp(1.5rem, 4vw, 2.8rem)',
                        color: '#000',
                        lineHeight: '1.2',
                        letterSpacing: '-0.02em',
                        marginBottom: '20px',
                        whiteSpace: 'pre-line',
                    }}>
                        {entry.heading}
                    </h2>
                )}
                {entry.text && (
                    <p style={{
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 300,
                        fontSize: 'clamp(0.9rem, 1.5vw, 1.05rem)',
                        color: '#333',
                        lineHeight: '1.9',
                        letterSpacing: '0.01em',
                    }}>
                        {entry.text}
                    </p>
                )}
            </div>
        </section>
    );
}

// ─────────────────────────────────────────────
// STICKY HEADER
// ─────────────────────────────────────────────
function StickyHeader({ model }) {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 80);
        window.addEventListener('scroll', fn, { passive: true });
        return () => window.removeEventListener('scroll', fn);
    }, []);

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'clamp(10px, 1.8vw, 18px) clamp(20px, 5vw, 60px)',
            background: scrolled ? 'rgba(255,255,255,0.96)' : 'transparent',
            backdropFilter: scrolled ? 'blur(16px)' : 'none',
            borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.45s ease',
        }}>
            <p style={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 300,
                fontSize: 'clamp(9px, 1.8vw, 13px)',
                letterSpacing: '5px',
                textTransform: 'uppercase',
                color: scrolled ? '#000' : 'rgba(255,255,255,0.6)',
                transition: 'color 0.45s',
            }}>
                Darkclub
            </p>

            <p style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 300,
                fontSize: '7px',
                letterSpacing: '4px',
                textTransform: 'uppercase',
                color: scrolled ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.25)',
                transition: 'color 0.45s',
            }}>
                {model.editionTitle || 'Edição Digital'}
            </p>

            <p style={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 300,
                fontSize: '7px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: scrolled ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)',
                transition: 'color 0.45s',
            }}>
                Digital Magazine
            </p>
        </header>
    );
}

// ─────────────────────────────────────────────
// FAB — Criar Minha Revista Agora
// ─────────────────────────────────────────────
function FABCreateNow({ onCheckout }) {
    const [hover, setHover] = useState(false);
    return (
        <button
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            onClick={onCheckout}
            style={{
                position: 'fixed',
                bottom: '28px',
                right: '28px',
                zIndex: 100,
                fontFamily: '"Inter", sans-serif',
                fontWeight: 400,
                fontSize: '7px',
                letterSpacing: '3.5px',
                textTransform: 'uppercase',
                padding: '14px 22px',
                background: hover ? '#fff' : '#000',
                color: hover ? '#000' : '#fff',
                border: hover ? '1px solid #000' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.35s ease',
                boxShadow: hover
                    ? '0 8px 32px rgba(0,0,0,0.12)'
                    : '0 4px 20px rgba(0,0,0,0.4)',
                whiteSpace: 'nowrap',
            }}
            aria-label="Criar minha revista agora"
        >
            ✦ Criar Minha Revista Agora
        </button>
    );
}

// ─────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────
export default function ModelPage({ demoSlug }) {
    const { slug: paramSlug } = useParams();
    const slug = demoSlug || paramSlug;
    const { models } = useMagazine();
    const navigate = useNavigate();
    const auth = useAuth?.() || {};
    const isVerified = auth?.darkclubVerified && auth?.profile?.darkclub_url;

    const handleCheckout = (plan = 'standard') => {
        navigate('/login?mode=register');
    };

    const model = models.find(m => m.slug === slug);
    if (!model) return <Navigate to="/" replace />;

    const photos = (model.gallery || []).slice(0, 9);
    const videos = (model.cinemaVideos || []).slice(0, 5);
    const storytelling = model.storytelling || [];

    /**
     * SEQUENCE BUILDER
     * Creates a cinematic flow that interleaves:
     *   photo → story/testimonial → video → photo → testimonial → video …
     * Total items: 9 photos + up to 3 story blocks + 5 videos + 5 testimonials
     */
    const sequence = [];
    let pI = 0, vI = 0, sI = 0, tI = 0;
    let photoCount = 0, videoCount = 0;

    // Pattern repeats: P P T(story) V P T(quote) P V P T(story) V P T(quote) P V T(quote)
    const pattern = ['P', 'P', 'S', 'V', 'P', 'T', 'P', 'V', 'P', 'S', 'V', 'P', 'T', 'P', 'V', 'T'];

    for (const step of pattern) {
        if (step === 'P' && pI < photos.length) {
            sequence.push({ kind: 'photo', data: photos[pI], idx: pI++ });
        } else if (step === 'V' && vI < videos.length) {
            sequence.push({ kind: 'video', data: videos[vI], idx: vI++ });
        } else if (step === 'S') {
            if (sI < storytelling.length) sequence.push({ kind: 'story', data: storytelling[sI++] });
            else if (tI < TESTIMONIALS.length) sequence.push({ kind: 'testimonial', tIdx: tI++ });
        } else if (step === 'T') {
            sequence.push({ kind: 'testimonial', tIdx: tI++ });
        }
    }

    // Flush any remaining photos / videos
    while (pI < photos.length) sequence.push({ kind: 'photo', data: photos[pI], idx: pI++ });
    while (vI < videos.length) sequence.push({ kind: 'video', data: videos[vI], idx: vI++ });

    return (
        <main
            className="bg-white"
            style={{ minHeight: '100svh', overflowX: 'hidden' }}
        >
            <ProtectionScript />
            <StickyHeader model={model} />

            {/* ── HERO ─────────────────────────────────────── */}
            <DossieHero model={model} />

            {/* ── IMMERSIVE SCROLL FLOW ─────────────────────── */}
            <div style={{ padding: '0 clamp(20px, 6vw, 80px)', paddingTop: '60px' }}>
                {sequence.map((item, seqIdx) => {
                    if (item.kind === 'photo') return (
                        <PhotoItem key={`p-${item.idx}`} photo={item.data} layoutIdx={item.idx} />
                    );
                    if (item.kind === 'video') return (
                        <VideoItem key={`v-${item.idx}`} video={item.data} layoutIdx={item.idx} />
                    );
                    if (item.kind === 'testimonial') return (
                        <TestimonialBlock key={`t-${seqIdx}`} index={item.tIdx} />
                    );
                    if (item.kind === 'story') return (
                        <StoryBlock key={`s-${seqIdx}`} entry={item.data} />
                    );
                    return null;
                })}
            </div>

            {/* ── CTA FINAL ─────────────────────────────────── */}
            <section style={{
                background: '#fff',
                padding: 'clamp(60px, 10vw, 120px) clamp(24px, 8vw, 120px)',
                textAlign: 'center',
                borderTop: '1px solid rgba(0,0,0,0.06)',
            }}>
                <p style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 300,
                    fontSize: '7px',
                    letterSpacing: '5px',
                    textTransform: 'uppercase',
                    color: '#999',
                    marginBottom: '24px',
                }}>
                    Darkclub Digital Magazine · Brasil 2026
                </p>

                <h2 style={{
                    fontFamily: '"Playfair Display", serif',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    fontSize: 'clamp(1.6rem, 5vw, 3rem)',
                    color: '#000',
                    letterSpacing: '-0.02em',
                    lineHeight: '1.2',
                    marginBottom: '16px',
                }}>
                    Sua imagem merece este cenário.
                </h2>

                <p style={{
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 300,
                    fontSize: 'clamp(0.9rem, 1.4vw, 1rem)',
                    color: '#333',
                    maxWidth: '500px',
                    margin: '0 auto 40px',
                    lineHeight: '1.8',
                }}>
                    Comece sua edição. Escolha o plano que se encaixa na sua realidade.
                </p>

                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 400,
                            fontSize: '9px',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            background: '#000',
                            color: '#fff',
                            border: 'none',
                            padding: '16px 32px',
                            cursor: 'pointer',
                        }}
                        onClick={() => handleCheckout('standard')}
                    >
                        R$ 19,90 / mês
                    </button>

                    <button
                        style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 400,
                            fontSize: '9px',
                            letterSpacing: '3px',
                            textTransform: 'uppercase',
                            background: 'transparent',
                            color: isVerified ? '#000' : '#aaa',
                            border: isVerified ? '1px solid rgba(0,0,0,0.25)' : '1px solid rgba(0,0,0,0.1)',
                            padding: '16px 32px',
                            cursor: isVerified ? 'pointer' : 'not-allowed',
                        }}
                        onClick={() => handleCheckout('member')}
                        disabled={!isVerified}
                        title={!isVerified ? 'Acesse com link do Darkclub verificado para ativar este plano' : ''}
                    >
                        {isVerified ? 'R$ 10,90 — Membro Darkclub' : 'R$ 10,90 (Darkclub Verificado)'}
                    </button>
                </div>

                <p style={{
                    marginTop: '40px',
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '6px',
                    letterSpacing: '2px',
                    textTransform: 'uppercase',
                    color: 'rgba(0,0,0,0.15)',
                }}>
                    D-M Signature ✔ Todos os direitos reservados
                </p>
            </section>

            {/* ── FAB: Criar Minha Revista Agora (fixo no rodapé) ────── */}
            <FABCreateNow onCheckout={() => handleCheckout('standard')} />
        </main>
    );
}
