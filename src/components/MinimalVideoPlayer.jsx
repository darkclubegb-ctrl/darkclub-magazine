import { useRef, useEffect, useState } from 'react';

// Lazy-load hook — only starts loading when element enters viewport
function useLazyLoad() {
    const ref = useRef(null);
    const [active, setActive] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect(); } },
            { rootMargin: '300px' }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return [ref, active];
}

export default function MinimalVideoPlayer({ video }) {
    const [wrapRef, shouldLoad] = useLazyLoad();
    const videoRef = useRef(null);
    const [playing, setPlaying] = useState(false);

    const isLoop = video?.type === 'living-portrait';

    const toggle = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
            setPlaying(true);
        } else {
            videoRef.current.pause();
            setPlaying(false);
        }
    };

    // Placeholder when no URL provided
    if (!video?.url) {
        return (
            <div
                ref={wrapRef}
                className="w-full h-full flex items-center justify-center"
                style={{ background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)', minHeight: '280px' }}
            >
                <p style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px', letterSpacing: '4px', color: 'rgba(255,255,255,0.1)', textTransform: 'uppercase' }}>
                    {isLoop ? 'Living Portrait' : 'Short Film'}
                </p>
            </div>
        );
    }

    return (
        <div ref={wrapRef} className="relative w-full h-full overflow-hidden" style={{ background: '#000' }}>

            {shouldLoad && (
                <video
                    ref={videoRef}
                    src={video.url}
                    className="absolute inset-0 w-full h-full object-cover"
                    autoPlay={isLoop}
                    muted={isLoop}
                    loop={isLoop}
                    playsInline
                    preload={isLoop ? 'auto' : 'metadata'}
                    controls={false}
                    onEnded={() => setPlaying(false)}
                    draggable={false}
                />
            )}

            {/* Discreet play/pause — only for short films */}
            {!isLoop && (
                <button
                    onClick={toggle}
                    aria-label={playing ? 'Pause' : 'Play'}
                    className="absolute inset-0 w-full h-full flex flex-col items-center justify-center group z-10"
                    style={{ background: playing ? 'transparent' : 'rgba(0,0,0,0.35)', border: 'none', cursor: 'pointer', transition: 'background 0.4s' }}
                >
                    {/* Icon only visible when paused or on hover */}
                    <div
                        className="transition-opacity duration-500"
                        style={{ opacity: playing ? 0 : 1 }}
                    >
                        <div
                            style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                backdropFilter: 'blur(8px)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            {/* Play triangle */}
                            <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                                <path d="M1 1L13 8L1 15V1Z" fill="rgba(255,255,255,0.8)" />
                            </svg>
                        </div>

                        {video.label && (
                            <p style={{
                                fontFamily: '"Inter",sans-serif',
                                fontSize: '7px',
                                letterSpacing: '4px',
                                textTransform: 'uppercase',
                                color: 'rgba(255,255,255,0.35)',
                                marginTop: '14px',
                                textAlign: 'center',
                            }}>
                                {video.label}
                            </p>
                        )}

                        {video.duration && (
                            <p style={{
                                fontFamily: '"Inter",sans-serif',
                                fontSize: '6px',
                                letterSpacing: '2px',
                                color: 'rgba(255,255,255,0.15)',
                                marginTop: '6px',
                                textAlign: 'center',
                            }}>
                                {video.duration}
                            </p>
                        )}
                    </div>
                </button>
            )}

            {/* Subtle vignette on living portraits */}
            {isLoop && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.5) 100%)' }}
                />
            )}
        </div>
    );
}
