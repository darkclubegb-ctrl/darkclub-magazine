import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { redirectToCheckout, PRICES } from '../lib/stripe';

export default function SalesPage() {
    const auth = useAuth?.() || {};
    const navigate = useNavigate();
    const [heroBtnHover, setHeroBtnHover] = useState(false);
    const [hoveredPlan, setHoveredPlan] = useState(null);
    const [showAgeGate, setShowAgeGate] = useState(true);
    const [activeSlide, setActiveSlide] = useState(0);

    const isVerified = auth?.darkclubVerified && auth?.profile?.darkclub_url;

    // Protection: Block right click on images
    useEffect(() => {
        const handleContextMenu = (e) => {
            if (e.target.tagName === 'IMG') e.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);
        return () => document.removeEventListener('contextmenu', handleContextMenu);
    }, []);

    const handleCheckout = (plan) => {
        // Navigate to register — after account creation, checkout is triggered
        navigate('/login?mode=register');
    };

    if (showAgeGate) {
        return (
            <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="max-w-md w-full">
                    <h2 className="font-display text-4xl mb-8 tracking-tighter uppercase font-light">Darkclub</h2>
                    <p className="font-body text-black mb-12 uppercase tracking-[0.3em] text-[10px]">Acesso restrito a maiores de 18 anos</p>
                    <button
                        onClick={() => setShowAgeGate(false)}
                        className="w-full border border-black py-4 font-body uppercase text-[9px] tracking-[0.5em] hover:bg-black hover:text-white transition-all duration-500"
                    >
                        Entrar no Clube
                    </button>
                    <p className="mt-8 font-body text-black/30 text-[8px] uppercase tracking-widest">Ao entrar, você confirma que possui idade legal para acessar este conteúdo.</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-white overflow-x-hidden">

            {/* ═══════════════════════════════════════════════════════
                HERO — Vogue Noir · Brasil 2026
            ═══════════════════════════════════════════════════════ */}
            <section
                className="relative flex flex-col items-center justify-center overflow-hidden"
                style={{ height: '100vh', minHeight: '650px' }}
            >

                {/* ── Background Image — High Contrast B&W Noir ───────── */}
                <div
                    className="absolute inset-0 z-0 bg-black"
                    style={{
                        backgroundImage: 'url("/hero-noir.png")',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        filter: 'grayscale(100%) contrast(1.1)',
                    }}
                />

                {/* ── 20% Black Overlay for Readability ────────────────── */}
                <div className="absolute inset-0 z-[1] bg-black/20" />

                {/* ── Subtle film-grain texture overlay ────────────────── */}
                <div className="absolute inset-0 z-[2] opacity-[0.05] pointer-events-none" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
                }} />

                {/* ── Center content — Typographic Masthead + Title ────── */}
                <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">

                    {/* Logo — frosted glass névoa, image bleeds through */}
                    <div
                        className="flex flex-col items-center justify-center mb-12 sm:mb-16"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            padding: 'clamp(30px, 6vw, 60px) clamp(40px, 10vw, 100px)',
                            border: '1px solid rgba(255,255,255,0.25)',
                        }}
                    >
                        <h2
                            className="leading-none text-white"
                            style={{
                                fontFamily: '"Playfair Display", "Didot", serif',
                                fontWeight: 300,
                                fontSize: 'clamp(2rem, 8vw, 4.5rem)',
                                letterSpacing: '5px',
                                textTransform: 'uppercase',
                                marginBottom: '15px',
                                textShadow: '0 1px 16px rgba(0,0,0,0.55)',
                            }}
                        >
                            Darkclub
                        </h2>
                        <p
                            className="text-white/80"
                            style={{
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 300,
                                fontSize: 'clamp(8px, 1.5vw, 12px)',
                                letterSpacing: '8px',
                                textTransform: 'uppercase',
                                textShadow: '0 1px 10px rgba(0,0,0,0.4)',
                            }}
                        >
                            Digital Magazine
                        </p>
                    </div>

                    <div className="space-y-6">
                        <h1
                            className="text-white leading-tight"
                            style={{
                                fontFamily: '"Playfair Display", serif',
                                fontWeight: 300,
                                fontStyle: 'italic',
                                fontSize: 'clamp(1.5rem, 5vw, 3.5rem)',
                                textShadow: '0 4px 30px rgba(0,0,0,0.3)',
                            }}
                        >
                            Luxo, Arte &amp; Identidade
                        </h1>

                        <p
                            className="uppercase text-white tracking-[5px] text-[9px] sm:text-[11px] font-light"
                            style={{ fontFamily: '"Inter", sans-serif' }}
                        >
                            Brasil • 2026
                        </p>

                        {/* ── CTA Hero Button ─────────────────────────── */}
                        <button
                            onClick={() => navigate('/edicao-zero')}
                            onMouseEnter={() => setHeroBtnHover(true)}
                            onMouseLeave={() => setHeroBtnHover(false)}
                            style={{
                                fontFamily: '"Inter", sans-serif',
                                fontWeight: 300,
                                fontSize: '8px',
                                letterSpacing: '5px',
                                textTransform: 'uppercase',
                                padding: '14px 36px',
                                border: '1px solid rgba(255,255,255,0.6)',
                                background: heroBtnHover ? 'rgba(255,255,255,0.95)' : 'transparent',
                                color: heroBtnHover ? '#000' : 'rgba(255,255,255,0.85)',
                                cursor: 'pointer',
                                transition: 'all 0.4s ease',
                                marginTop: '8px',
                                backdropFilter: 'blur(4px)',
                            }}
                        >
                            Explorar Edição de Colecionador
                        </button>
                    </div>
                </div>

                {/* ── Static Scroll hint ──────────────────────────────── */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-4">
                    <a href="#preview" className="flex flex-col items-center gap-3 no-underline">
                        <div className="w-px h-12 bg-white/30" />
                        <p className="font-body uppercase text-white/40 tracking-[0.4em] text-[7px]">Explorar</p>
                    </a>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                MAGAZINE EDITION PREVIEW — Interactive Carousel
            ═══════════════════════════════════════════════════════ */}
            <section id="preview" className="bg-white overflow-hidden" style={{ padding: 'clamp(80px, 12vw, 140px) 0' }}>

                {/* Section Header */}
                <div className="px-[clamp(24px,8vw,100px)] mb-16">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-8 h-px bg-black" />
                        <p className="font-body uppercase text-[#666666] tracking-[0.6em] text-[8px]">Edição Demo</p>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                        <h2 className="font-display text-[#000000] uppercase leading-[0.9]" style={{
                            fontWeight: 300,
                            fontSize: 'clamp(2rem, 7vw, 4.5rem)',
                            letterSpacing: '-2px',
                        }}>
                            Visualizar<br />Sua Edição
                        </h2>
                        <p className="font-body text-[#333333] font-normal max-w-sm" style={{ fontSize: '0.875rem', lineHeight: '1.85' }}>
                            Assim ficará a sua revista exclusiva. Uma experiência editorial de alta-costura, gerada a partir das suas fotos.
                        </p>
                    </div>
                </div>

                {/* ── Carousel Tabs ─────────────────────────────────── */}
                <div className="px-[clamp(24px,8vw,100px)] mb-10 flex items-center gap-8">
                    {[{ label: 'Capa', idx: 0 }, { label: 'Living Portrait', idx: 1 }, { label: 'Galeria', idx: 2 }].map(({ label, idx }) => (
                        <button
                            key={idx}
                            onClick={() => setActiveSlide(idx)}
                            className="font-body uppercase text-[9px] tracking-[4px] pb-2 transition-all"
                            style={{
                                color: activeSlide === idx ? '#000000' : '#999999',
                                borderBottom: activeSlide === idx ? '1px solid #000' : '1px solid transparent',
                                background: 'none',
                                border: 'none',
                                borderBottom: activeSlide === idx ? '1px solid #000' : '1px solid transparent',
                                cursor: 'pointer',
                                padding: '0 0 8px 0',
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── Slide 0: Capa ─────────────────────────────────── */}
                {activeSlide === 0 && (
                    <div className="px-[clamp(24px,8vw,100px)]">
                        {/* Asymmetric grid: large + narrow columns */}
                        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-8 items-start">

                            {/* Main cover — full bleed magazine page */}
                            <div className="relative overflow-hidden" style={{ aspectRatio: '3/4', maxHeight: '80vh' }}>
                                <img
                                    src="/demo-cover.png"
                                    alt="Demo — Capa Editorial"
                                    className="w-full h-full object-cover object-top select-none"
                                    style={{ filter: 'grayscale(100%) contrast(1.05)' }}
                                    draggable={false}
                                />
                                {/* Frosted masthead overlay — 15% white */}
                                <div className="absolute top-[12%] left-1/2 -translate-x-1/2 w-[75%] flex flex-col items-center py-6 px-8"
                                    style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(10px)',
                                        WebkitBackdropFilter: 'blur(10px)',
                                        border: '0.5px solid rgba(255,255,255,0.3)',
                                    }}
                                >
                                    <p className="font-display text-white leading-none mb-2"
                                        style={{ fontWeight: 300, fontSize: 'clamp(1.2rem,4vw,2.8rem)', letterSpacing: '5px', textTransform: 'uppercase', textShadow: '0 1px 12px rgba(0,0,0,0.5)' }}>
                                        Darkclub
                                    </p>
                                    <p className="text-white/75 uppercase"
                                        style={{ fontFamily: '"Inter",sans-serif', fontWeight: 300, fontSize: 'clamp(6px,1vw,9px)', letterSpacing: '6px', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
                                        Digital Magazine
                                    </p>
                                </div>
                                {/* Brasil 2026 bottom label */}
                                <div className="absolute bottom-8 left-0 right-0 flex justify-center">
                                    <p className="text-white uppercase tracking-[5px] text-[9px]" style={{ fontFamily: '"Inter",sans-serif', fontWeight: 300, textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                                        Brasil • 2026
                                    </p>
                                </div>
                                {/* D-M Signature watermark */}
                                <div className="absolute bottom-4 right-4">
                                    <p className="text-white/30 uppercase tracking-[3px]" style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px' }}>D-M Signature ✦</p>
                                </div>
                            </div>

                            {/* Editorial sidebar — asymmetric breathing room */}
                            <div className="hidden md:flex flex-col justify-between h-full py-4">
                                <div>
                                    <p className="font-body uppercase text-[#666666] tracking-[0.5em] text-[7px] mb-8">Edição Exclusiva</p>
                                    <div className="w-px h-32 bg-[#eeeeee] mx-auto mb-8" />
                                    <p className="font-display text-[#000000] text-center" style={{ fontWeight: 300, fontSize: '0.65rem', letterSpacing: '3px', textTransform: 'uppercase' }}>
                                        Sua<br />Foto<br />Aqui
                                    </p>
                                </div>
                                <div className="space-y-4 text-center">
                                    <p className="text-[#999] text-[7px] uppercase tracking-[3px]">Grid</p>
                                    <p className="text-[#999] text-[7px] uppercase tracking-[3px]">Assimétrico</p>
                                    <p className="text-[#999] text-[7px] uppercase tracking-[3px]">Exclusivo</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Slide 1: Living Portrait ───────────────────────── */}
                {activeSlide === 1 && (
                    <div className="px-[clamp(24px,8vw,100px)]">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-8 items-start">

                            {/* Left spacer — editorial breathing room */}
                            <div className="hidden md:block">
                                <p className="font-body text-[#333333] font-normal mt-16" style={{ fontSize: '0.8rem', lineHeight: '2', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                    Living Portrait · Sua Identidade em Movimento
                                </p>
                            </div>

                            {/* Video portrait — looping editorial video */}
                            <div className="relative overflow-hidden" style={{ aspectRatio: '9/16', maxHeight: '75vh' }}>
                                {/* Simulated looping video frame using portrait image */}
                                <img
                                    src="/demo-portrait.png"
                                    alt="Living Portrait Demo"
                                    className="w-full h-full object-cover object-center select-none"
                                    style={{ filter: 'grayscale(100%) contrast(1.1)' }}
                                    draggable={false}
                                />
                                {/* Video play icon overlay */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                                        style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                                        <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                                            <path d="M1 1L15 9L1 17V1Z" fill="white" fillOpacity="0.9" />
                                        </svg>
                                    </div>
                                    <p className="text-white/60 uppercase tracking-[4px] text-[8px]" style={{ fontFamily: '"Inter",sans-serif' }}>Em Loop</p>
                                </div>
                                {/* D-M Signature */}
                                <div className="absolute bottom-4 right-4">
                                    <p className="text-white/30 uppercase tracking-[3px]" style={{ fontFamily: '"Inter",sans-serif', fontSize: '7px' }}>D-M Signature ✦</p>
                                </div>
                            </div>

                            {/* Right sidebar */}
                            <div className="hidden md:flex flex-col justify-end h-full pb-8 gap-4">
                                <div className="w-8 h-px bg-black/20" />
                                <p className="font-body text-[#000000] font-medium uppercase tracking-[3px] text-[9px]">Vídeo</p>
                                <p className="font-body text-[#333333] font-normal text-[11px] leading-relaxed">
                                    Um vídeo em loop curto que dá vida à sua identidade visual.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Slide 2: Galeria ───────────────────────────────── */}
                {activeSlide === 2 && (
                    <div className="px-[clamp(24px,8vw,100px)]">
                        {/* Asymmetric masonry-style grid */}
                        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1.5fr] gap-4 md:gap-6 items-start">

                            {/* Large — cover photo */}
                            <div className="relative overflow-hidden col-span-2 md:col-span-1" style={{ aspectRatio: '3/4' }}>
                                <img src="/demo-cover.png" alt="Galeria 1"
                                    className="w-full h-full object-cover object-top select-none"
                                    style={{ filter: 'grayscale(100%) contrast(1.05)' }} draggable={false} />
                                <div className="absolute bottom-3 right-3">
                                    <p className="text-white/25 uppercase tracking-[3px]" style={{ fontFamily: '"Inter",sans-serif', fontSize: '6px' }}>D-M Signature ✦</p>
                                </div>
                            </div>

                            {/* Medium — portrait */}
                            <div className="relative overflow-hidden" style={{ aspectRatio: '2/3' }}>
                                <img src="/demo-portrait.png" alt="Galeria 2"
                                    className="w-full h-full object-cover object-top select-none"
                                    style={{ filter: 'grayscale(100%) contrast(1.1)' }} draggable={false} />
                                <div className="absolute bottom-3 right-3">
                                    <p className="text-white/25 uppercase tracking-[3px]" style={{ fontFamily: '"Inter",sans-serif', fontSize: '6px' }}>D-M Signature ✦</p>
                                </div>
                            </div>

                            {/* Tall — dynamic shot */}
                            <div className="relative overflow-hidden hidden md:block" style={{ aspectRatio: '3/4' }}>
                                <img src="/demo-gallery.png" alt="Galeria 3"
                                    className="w-full h-full object-cover object-top select-none"
                                    style={{ filter: 'grayscale(100%) contrast(1.05)' }} draggable={false} />
                                <div className="absolute bottom-3 right-3">
                                    <p className="text-white/25 uppercase tracking-[3px]" style={{ fontFamily: '"Inter",sans-serif', fontSize: '6px' }}>D-M Signature ✦</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Slide Dots ─────────────────────────────────────── */}
                <div className="flex items-center justify-center gap-3 mt-12">
                    {[0, 1, 2].map(i => (
                        <button key={i} onClick={() => setActiveSlide(i)}
                            className="transition-all duration-500"
                            style={{ width: activeSlide === i ? '24px' : '6px', height: '2px', background: activeSlide === i ? '#000' : '#ccc', border: 'none', cursor: 'pointer', padding: 0 }}
                        />
                    ))}
                </div>

                {/* ── CTA Block ──────────────────────────────────────── */}
                <div className="mt-24 mx-[clamp(24px,8vw,100px)] border-t border-[#eeeeee] pt-20">
                    <div className="max-w-3xl">
                        <p className="font-body uppercase text-[#666666] tracking-[0.6em] text-[8px] mb-8">Comece Agora</p>
                        <h3 className="font-display text-[#000000] leading-[0.9] mb-10" style={{
                            fontWeight: 300,
                            fontSize: 'clamp(1.8rem, 5vw, 3.5rem)',
                            letterSpacing: '-1px',
                        }}>
                            Sua imagem merece<br />este cenário.
                        </h3>
                        <p className="font-body text-[#333333] font-normal mb-14" style={{ fontSize: '1rem', lineHeight: '1.85', maxWidth: '480px' }}>
                            Comece sua edição. Escolha o plano que se encaixa na sua realidade — ou acesse com desconto exclusivo para membros Darkclub.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5">
                            <button
                                onClick={() => handleCheckout('standard')}
                                className="font-body uppercase bg-black text-white px-12 py-5 tracking-[5px] text-[9px] hover:bg-[#222] transition-colors"
                            >
                                R$ 19,90 / mês
                            </button>
                            <button
                                onClick={() => isVerified ? handleCheckout('member') : null}
                                disabled={!isVerified}
                                className={`font-body uppercase px-12 py-5 tracking-[5px] text-[9px] border transition-colors ${isVerified ? 'border-black text-black hover:bg-black hover:text-white' : 'border-[#ccc] text-[#ccc] cursor-not-allowed'
                                    }`}
                            >
                                {isVerified ? 'R$ 10,90 — Membro Darkclub' : 'R$ 10,90 (Darkclub Verificado)'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                EDITORIAL CONCEPT — High Contrast Layout
            ═══════════════════════════════════════════════════════ */}
            <section id="editorial" className="bg-white" style={{ padding: 'clamp(80px, 15vw, 160px) clamp(24px, 8vw, 100px)' }}>
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-16 items-start">
                    <div className="flex-1">
                        <div className="flex items-center gap-6 mb-16">
                            <div className="w-8 h-px bg-black" />
                            <p className="font-body uppercase text-[#666666] tracking-[0.6em] text-[8px]">O Conceito</p>
                        </div>

                        <h2 className="font-display text-[#000000] uppercase leading-[0.9] mb-12" style={{
                            fontWeight: 300,
                            fontSize: 'clamp(2.5rem, 8vw, 5rem)',
                            letterSpacing: '-2px',
                        }}>
                            Sua Revista.<br />Sua Identidade.
                        </h2>

                        <p className="font-body text-[#333333] font-normal max-w-lg mb-12" style={{ fontSize: '1rem', lineHeight: '2' }}>
                            Cada modelo recebe uma revista digital exclusiva com design editorial de alta-costura.
                            Fotos em grid assimétrico, Living Portraits em vídeo, selo de autenticidade e link personalizado
                            para compartilhar com o mundo.
                        </p>
                    </div>

                    {/* Visual spacer for asymmetry */}
                    <div className="hidden md:block w-32 shrink-0 h-px" />
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FEATURES GRID — Accessible & Sharp
            ═══════════════════════════════════════════════════════ */}
            <section className="bg-white pb-32 px-[clamp(24px,8vw,100px)]">
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-20">
                    {[
                        { icon: '◆', title: 'Grid Assimétrico', desc: 'Fotos em layout editorial de luxo com tamanhos variados e respiros generosos.' },
                        { icon: '◈', title: 'Living Portraits', desc: 'Vídeos em loop curto que dão vida à sua identidade visual.' },
                        { icon: '✦', title: 'Selo D-M Signature', desc: 'Marca d\'água digital exclusiva em todas as suas fotos.' },
                    ].map(f => (
                        <div key={f.title} className="text-left md:text-center group">
                            <p className="font-display text-[#666666] text-4xl mb-8 transition-transform group-hover:scale-110 duration-700">{f.icon}</p>
                            <h3 className="font-body uppercase text-[#000000] mb-6 font-medium" style={{ fontSize: '11px', letterSpacing: '5px' }}>
                                {f.title}
                            </h3>
                            <p className="font-body text-[#333333] font-normal leading-relaxed" style={{ fontSize: '13px' }}>
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                PRICING — Refined Luxury
            ═══════════════════════════════════════════════════════ */}
            <section className="bg-[#fcfcfc] border-y border-[#eeeeee]" style={{ padding: 'clamp(80px, 12vw, 150px) clamp(24px, 8vw, 100px)' }}>
                <div className="max-w-4xl mx-auto text-center">
                    <p className="font-body uppercase text-[#666666] mb-8 tracking-[0.7em] text-[8px]">Elegance Tier</p>
                    <h2 className="font-display text-[#000000] uppercase leading-none mb-20" style={{
                        fontWeight: 300,
                        fontSize: 'clamp(2rem, 6vw, 4rem)',
                        letterSpacing: '-1px',
                    }}>
                        Investimento em Identidade
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-3xl mx-auto items-center">
                        {/* Standard */}
                        <div className="bg-white p-12 border border-[#eeeeee] transition-all duration-700 hover:border-black/20">
                            <p className="font-body uppercase text-black/40 mb-10 tracking-[0.4em] text-[9px]">Standard</p>
                            <div className="mb-12">
                                <span className="font-display text-4xl text-black">R$ 19</span>
                                <span className="text-black/30 font-display text-xl">,90</span>
                            </div>
                            <ul className="space-y-4 mb-12 text-left">
                                {['Revista digital exclusiva', 'Grid assimétrico', 'Living Portrait', 'Selo D-M Signature', 'Link personalizado'].map(f => (
                                    <li key={f} className="font-body text-[#333333] font-normal flex items-center gap-3 text-[12px]">
                                        <span className="text-black/20 text-[10px]">■</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => handleCheckout('standard')}
                                className="w-full bg-black text-white font-body uppercase py-5 text-[9px] tracking-[5px] hover:bg-[#222] transition-colors"
                            >
                                Assinar
                            </button>
                        </div>

                        {/* Member */}
                        <div className="bg-black p-12 border border-black shadow-2xl scale-105">
                            <p className="font-body uppercase text-white/50 mb-4 tracking-[0.4em] text-[9px]">Membro Darkclub</p>
                            <p className="text-white/30 text-[8px] uppercase tracking-[0.3em] mb-10 italic">Verificado</p>
                            <div className="mb-12">
                                <span className="font-display text-4xl text-white">R$ 10</span>
                                <span className="text-white/40 font-display text-xl">,90</span>
                            </div>
                            <ul className="space-y-4 mb-12 text-left">
                                {['Tudo do Standard', 'Selo Darkclub Verified', 'Prioridade no suporte', 'Badge exclusivo na revista', 'Desconto de 45%'].map(f => (
                                    <li key={f} className="font-body text-white/60 font-normal flex items-center gap-3 text-[12px]">
                                        <span className="text-white/20 text-[10px]">■</span> {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => isVerified ? handleCheckout('member') : null}
                                disabled={!isVerified}
                                className={`w-full font-body uppercase py-5 text-[9px] tracking-[5px] transition-all ${isVerified ? 'bg-white text-black hover:bg-[#eee]' : 'bg-white/10 text-white/20 cursor-not-allowed'}`}
                            >
                                {isVerified ? 'Ativar Vantagens' : 'Verificação Necessária'}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════
                FOOTER — Authority & Security
            ═══════════════════════════════════════════════════════ */}
            <footer className="bg-black py-32 px-6 flex flex-col items-center">
                <div className="max-w-2xl w-full text-center">
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-24">
                        <Link to="/login" className="bg-white text-black font-body uppercase text-[9px] tracking-[5px] py-5 px-12 hover:bg-[#ddd] transition-colors">
                            Criar Revista
                        </Link>
                        <Link to="/login" className="border border-white/30 text-white/60 font-body uppercase text-[9px] tracking-[5px] py-5 px-12 hover:border-white transition-colors">
                            Entrar
                        </Link>
                    </div>

                    <div className="border border-white/10 py-6 px-10 mb-10 opacity-70">
                        <p className="font-body uppercase text-white tracking-[0.4em] text-[8px] leading-relaxed">
                            Identidade Verificada por Curadoria Darkclub – Autenticidade Garantida.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="font-body uppercase text-white/20 tracking-[0.3em] text-[7px]">
                            © 2026 Darkclub Digital Magazine – Todos os direitos reservados.
                        </p>
                        <p className="font-body uppercase text-white/10 tracking-[0.1em] text-[6px]">
                            Conteúdo Protegido por Direitos Autorais e Marca Registrada.
                        </p>
                    </div>
                </div>
            </footer>
        </main>
    );
}
