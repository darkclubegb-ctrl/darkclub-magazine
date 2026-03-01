import { useEffect, useRef, useCallback } from 'react';

/*
  Darkclub Editorial Gallery — Mobile-First
  ──────────────────────────────────────────
  Supports: { url, size, alignment, caption }
  - large   → full-bleed sangrada, 100vw
  - medium  → offset assimétrico (desktop), full-width (mobile)
  - small   → quadrado deslocado por alignment

  Mobile optimizations:
  - Reduced margins (40px mobile vs 80px desktop)
  - Medium photos full-width on mobile
  - Small photos larger on mobile (50% vs 36%)
  - Parallax disabled on mobile (reduces jank)
*/

function normalise(p) {
    if (typeof p === 'string') return { url: p, size: 'medium', alignment: 'center', caption: '' };
    return {
        url: p?.url ?? '',
        size: p?.size ?? 'medium',
        alignment: p?.alignment ?? 'center',
        caption: p?.caption ?? '',
    };
}

// ── Detect mobile ────────────────────────────────────────────
const isMobile = () => typeof window !== 'undefined' && window.innerWidth < 768;

// ── Parallax hook (disabled on mobile for performance) ───────
function useParallax(strength = 0.07) {
    const ref = useRef(null);
    const raf = useRef(null);

    const tick = useCallback(() => {
        if (!ref.current || isMobile()) return;
        const rect = ref.current.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const offset = (center - window.innerHeight / 2) * strength;
        ref.current.style.transform = `translateY(${offset.toFixed(2)}px)`;
    }, [strength]);

    useEffect(() => {
        const onScroll = () => {
            cancelAnimationFrame(raf.current);
            raf.current = requestAnimationFrame(tick);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        tick();
        return () => {
            window.removeEventListener('scroll', onScroll);
            cancelAnimationFrame(raf.current);
        };
    }, [tick]);

    return ref;
}

// ── Scroll fade-in ───────────────────────────────────────────
function useFadeIn() {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.classList.add('visible'); obs.disconnect(); } },
            { threshold: 0.08 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

// ── Watermark overlay ────────────────────────────────────────
function Watermark({ modelName }) {
    return (
        <div
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 5,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                padding: '10px 12px',
            }}
        >
            <p
                style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontWeight: 300,
                    fontSize: '7px',
                    letterSpacing: '0.35em',
                    textTransform: 'uppercase',
                    color: '#fff',
                    opacity: 0.12,
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                }}
            >
                {modelName ? `${modelName} · ` : ''}D-M SIGNATURE © 2026
            </p>
        </div>
    );
}

// ── Caption beside photo (desktop only) ──────────────────────
function EditorialCaption({ text, side = 'right' }) {
    if (!text) return null;
    return (
        <div
            className="hidden md:flex flex-col items-center justify-end"
            style={{
                flex: '0 0 72px',
                alignSelf: 'stretch',
                paddingBottom: '8px',
                paddingLeft: side === 'right' ? '14px' : '0',
                paddingRight: side === 'left' ? '14px' : '0',
                order: side === 'left' ? -1 : 1,
            }}
        >
            <div className="w-px flex-1 bg-black/10" style={{ minHeight: '50px' }} />
            <p
                className="font-body text-black/30 mt-4"
                style={{
                    fontSize: '7px',
                    letterSpacing: '0.4em',
                    textTransform: 'uppercase',
                    writingMode: 'vertical-rl',
                    textOrientation: 'mixed',
                    transform: 'rotate(180deg)',
                    whiteSpace: 'nowrap',
                }}
            >
                {text}
            </p>
        </div>
    );
}

// ── Photo types ──────────────────────────────────────────────

function LargePhoto({ photo, modelName }) {
    const imgRef = useParallax(0.06);
    const wrapRef = useFadeIn();

    return (
        <div
            ref={wrapRef}
            className="scroll-reveal"
            style={{ margin: 'clamp(40px, 8vw, 80px) 0' }}
        >
            {/* Full bleed — 100vw */}
            <div
                className="bleed"
                style={{ height: 'min(80vh, 600px)', position: 'relative' }}
            >
                <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
                    <img
                        ref={imgRef}
                        src={photo.url}
                        alt="Editorial"
                        draggable="false"
                        loading="lazy"
                        decoding="async"
                        style={{
                            width: '100%',
                            height: '115%',
                            objectFit: 'cover',
                            objectPosition: 'center top',
                            display: 'block',
                            marginTop: '-8%',
                            willChange: 'transform',
                        }}
                    />
                    <Watermark modelName={modelName} />
                </div>
            </div>

            {/* Caption below bleed */}
            {photo.caption && (
                <p
                    className="font-body text-black/30"
                    style={{
                        fontSize: '7px',
                        letterSpacing: '0.45em',
                        textTransform: 'uppercase',
                        marginTop: '10px',
                        textAlign: photo.alignment === 'left' ? 'left' : 'right',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                    }}
                >
                    {photo.caption}
                </p>
            )}
        </div>
    );
}

function MediumPhoto({ photo, modelName, flipDefault }) {
    const imgRef = useParallax(0.05);
    const wrapRef = useFadeIn();

    const align = photo.alignment || (flipDefault ? 'right' : 'left');
    const isRight = align === 'right';

    return (
        <div
            ref={wrapRef}
            className="scroll-reveal"
            style={{ margin: 'clamp(32px, 6vw, 70px) 0' }}
        >
            <div
                className="flex items-end"
                style={{ gap: '0', flexDirection: isRight ? 'row-reverse' : 'row' }}
            >
                {/* Wide margin spacer — desktop only */}
                <div className="hidden md:block" style={{ flex: '0 0 25%' }} />

                {/* Photo — full width on mobile, 58% on desktop */}
                <div className="w-full md:max-w-[58%] relative overflow-hidden" style={{ aspectRatio: '4/5' }}>
                    <img
                        ref={imgRef}
                        src={photo.url}
                        alt="Editorial"
                        draggable="false"
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover object-top"
                        style={{ willChange: 'transform' }}
                    />
                    <Watermark modelName={modelName} />
                </div>

                <EditorialCaption text={photo.caption} side={isRight ? 'left' : 'right'} />
            </div>

            {/* Mobile caption — below photo */}
            {photo.caption && (
                <p
                    className="md:hidden font-body text-black/30 mt-2 px-4"
                    style={{
                        fontSize: '7px',
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        textAlign: isRight ? 'right' : 'left',
                    }}
                >
                    {photo.caption}
                </p>
            )}
        </div>
    );
}

function SmallPhoto({ photo, modelName, flipDefault }) {
    const imgRef = useParallax(0.04);
    const wrapRef = useFadeIn();

    const align = photo.alignment || (flipDefault ? 'right' : 'left');

    const paddingMap = {
        left: { paddingLeft: 'clamp(16px, 6vw, 120px)', paddingRight: '0' },
        center: { paddingLeft: 'clamp(16px, 15vw, 220px)', paddingRight: 'clamp(16px, 15vw, 220px)' },
        right: { paddingLeft: '0', paddingRight: 'clamp(16px, 6vw, 120px)' },
    };

    return (
        <div
            ref={wrapRef}
            className="scroll-reveal"
            style={{ margin: 'clamp(24px, 5vw, 60px) 0', ...paddingMap[align] }}
        >
            <div
                className="relative overflow-hidden"
                style={{
                    width: 'clamp(140px, 50%, 280px)',
                    aspectRatio: '1/1',
                }}
            >
                <img
                    ref={imgRef}
                    src={photo.url}
                    alt="Editorial"
                    draggable="false"
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ willChange: 'transform' }}
                />
                <Watermark modelName={modelName} />
            </div>
            {photo.caption && (
                <p
                    className="font-body text-black/25 mt-2"
                    style={{
                        fontSize: '7px',
                        letterSpacing: '0.4em',
                        textTransform: 'uppercase',
                        textAlign: align,
                    }}
                >
                    {photo.caption}
                </p>
            )}
        </div>
    );
}

// ── Main Gallery ──────────────────────────────────────────────

export default function Gallery({ photos, modelName }) {
    if (!photos?.length) return null;

    const items = photos.map(normalise);
    let medFlip = 0;
    let smFlip = 0;

    return (
        <section
            className="w-full bg-brand-white overflow-x-hidden"
            style={{ paddingBottom: 'clamp(40px, 8vw, 80px)' }}
        >
            {/* Section label */}
            <div
                className="flex items-center gap-5"
                style={{ padding: 'clamp(40px, 8vw, 80px) clamp(16px, 4vw, 40px) 16px clamp(16px, 6vw, 80px)' }}
            >
                <div style={{ width: '20px', height: '1px', background: 'rgba(0,0,0,0.2)' }} />
                <p
                    className="font-body uppercase text-black/25"
                    style={{ fontSize: '7px', letterSpacing: '0.6em' }}
                >
                    Editorial Gallery
                </p>
            </div>

            {/* Photo sequence */}
            {items.map((photo, i) => {
                if (photo.size === 'large') {
                    return <LargePhoto key={i} photo={photo} modelName={modelName} />;
                }
                if (photo.size === 'medium') {
                    return <MediumPhoto key={i} photo={photo} modelName={modelName} flipDefault={(medFlip++ % 2) === 1} />;
                }
                return <SmallPhoto key={i} photo={photo} modelName={modelName} flipDefault={(smFlip++ % 2) === 0} />;
            })}
        </section>
    );
}
