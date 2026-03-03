import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMagazine } from '../context/MagazineContext';
import { uploadMedia, saveDossier } from '../lib/storage';
import { publishAndCheckout } from '../lib/checkout';

/*
  DashboardPage — Dossiê Digital — Painel da Modelo
  MVP: acesso com user.id ativo. Sem barreira de email.
  Upload real via Supabase Storage com progress bar.
  Thumbnails instantâneos ao concluir upload.
  D-M Signature overlay em cada preview.
*/

// ─────────────────────────────────────────────
// ATOMS
// ─────────────────────────────────────────────

function FABPreview({ slug }) {
    const [hover, setHover] = useState(false);
    if (!slug) return null;
    return (
        <a
            href={`/modelo/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: 'fixed', bottom: '28px', right: '28px', zIndex: 100,
                fontFamily: '"Inter", sans-serif', fontWeight: 400,
                fontSize: '7px', letterSpacing: '3px', textTransform: 'uppercase',
                padding: '13px 20px',
                background: hover ? '#fff' : '#000',
                color: hover ? '#000' : '#fff',
                border: hover ? '1px solid #000' : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.3s ease',
                boxShadow: hover ? '0 6px 24px rgba(0,0,0,0.10)' : '0 4px 20px rgba(0,0,0,0.35)',
                textDecoration: 'none', whiteSpace: 'nowrap',
            }}
        >
            ✦ Visualizar Minha Revista
        </a>
    );
}

function SectionLabel({ children }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '14px', height: '1px', background: 'rgba(0,0,0,0.15)' }} />
            <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '7px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#666' }}>
                {children}
            </p>
        </div>
    );
}

function Field({ label, placeholder, value, onChange, rows }) {
    const base = {
        width: '100%', border: '1px solid rgba(0,0,0,0.12)', background: '#fff',
        fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '13px',
        color: '#000', padding: '12px 14px', outline: 'none',
        transition: 'border-color 0.25s', resize: rows ? 'vertical' : undefined,
    };
    const focus = e => e.target.style.borderColor = 'rgba(0,0,0,0.5)';
    const blur = e => e.target.style.borderColor = 'rgba(0,0,0,0.12)';
    return (
        <div>
            <label style={{ display: 'block', fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '7px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)', marginBottom: '6px' }}>
                {label}
            </label>
            {rows
                ? <textarea rows={rows} placeholder={placeholder} value={value} onChange={onChange} style={base} onFocus={focus} onBlur={blur} />
                : <input type="text" placeholder={placeholder} value={value} onChange={onChange} style={base} onFocus={focus} onBlur={blur} />
            }
        </div>
    );
}

// ─────────────────────────────────────────────
// UPLOAD SLOT — Photo
// ─────────────────────────────────────────────
function PhotoSlot({ index, userId, onUploaded }) {
    const [preview, setPreview] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Instant local preview
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setUploading(true);
        setProgress(0);
        setError('');

        const { url, error: err } = await uploadMedia(file, 'photos', userId || 'demo', (p) => setProgress(p));
        setUploading(false);

        if (err) {
            setError(err);
        } else if (url) {
            onUploaded?.(index, url);
        }
    };

    return (
        <div
            onClick={() => inputRef.current?.click()}
            style={{
                position: 'relative', aspectRatio: '3/4', cursor: 'pointer',
                background: preview ? 'transparent' : '#f8f8f8',
                border: `1px ${preview ? 'solid rgba(0,0,0,0.08)' : 'dashed rgba(0,0,0,0.15)'}`,
                overflow: 'hidden', transition: 'border-color 0.25s',
            }}
            onMouseEnter={e => !preview && (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.4)')}
            onMouseLeave={e => !preview && (e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)')}
        >
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

            {preview ? (
                <>
                    <img src={preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(20%)' }} draggable={false} />

                    {/* D-M Signature overlay */}
                    <div style={{ position: 'absolute', bottom: '8px', right: '10px', pointerEvents: 'none' }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '5px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            D-M Signature ✦
                        </p>
                    </div>

                    {/* Upload progress bar */}
                    {uploading && (
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'rgba(0,0,0,0.15)' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: '#000', transition: 'width 0.2s ease' }} />
                        </div>
                    )}

                    {/* Done checkmark */}
                    {!uploading && progress === 100 && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <p style={{ color: '#fff', fontSize: '8px', lineHeight: 1 }}>✓</p>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '22px', color: 'rgba(0,0,0,0.1)', lineHeight: 1 }}>+</p>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '6px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.2)' }}>
                        Foto {index + 1}
                    </p>
                </div>
            )}

            {error && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px' }}>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '8px', color: '#c00', textAlign: 'center' }}>{error}</p>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// UPLOAD SLOT — Video
// ─────────────────────────────────────────────
function VideoSlot({ index, folder, label, aspect, userId, autoplay, onUploaded }) {
    const [preview, setPreview] = useState(null);
    const [progress, setProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setUploading(true);
        setProgress(0);
        setError('');

        const { url, error: err } = await uploadMedia(file, folder, userId || 'demo', (p) => setProgress(p));
        setUploading(false);

        if (err) {
            setError(err);
        } else if (url) {
            onUploaded?.(index, url);
        }
    };

    return (
        <div
            onClick={() => !preview && inputRef.current?.click()}
            style={{
                position: 'relative', aspectRatio: aspect, cursor: preview ? 'default' : 'pointer',
                background: '#0a0a0a', border: '1px dashed rgba(255,255,255,0.08)',
                overflow: 'hidden',
            }}
        >
            <input ref={inputRef} type="file" accept="video/mp4,video/mov,video/quicktime,video/*" style={{ display: 'none' }} onChange={handleFile} />

            {preview ? (
                <>
                    {/* Living Portrait: autoplay loop muted */}
                    <video
                        src={preview}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        autoPlay={autoplay}
                        muted={autoplay}
                        loop={autoplay}
                        playsInline
                        controls={!autoplay}
                        draggable={false}
                    />

                    {/* D-M Signature */}
                    <div style={{ position: 'absolute', bottom: '8px', right: '10px', pointerEvents: 'none', zIndex: 5 }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '5px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)', userSelect: 'none', whiteSpace: 'nowrap' }}>
                            D-M Signature ✦
                        </p>
                    </div>

                    {/* Progress bar */}
                    {uploading && (
                        <>
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', zIndex: 10 }}>
                                <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '7px', letterSpacing: '4px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
                                    Processando... {progress}%
                                </p>
                                <div style={{ width: '120px', height: '2px', background: 'rgba(255,255,255,0.1)' }}>
                                    <div style={{ height: '100%', width: `${progress}%`, background: '#fff', transition: 'width 0.2s ease' }} />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Done badge */}
                    {!uploading && progress === 100 && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 5 }}>
                            <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '6px', letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
                                ✓ Enviado
                            </p>
                        </div>
                    )}
                </>
            ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p style={{ color: 'rgba(255,255,255,0.12)', fontSize: '12px' }}>▶</p>
                    </div>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '6px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)' }}>
                        {label}
                    </p>
                </div>
            )}

            {error && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px', zIndex: 20 }}>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '8px', color: '#f88', textAlign: 'center' }}>{error}</p>
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────
export default function DashboardPage() {
    const { user, profile, signOut } = useAuth();
    const { models } = useMagazine();

    const myModel = useMemo(() => {
        if (!models.length) return null;
        return models.find(m => m.owner_id === user?.id) || null;
    }, [models, user]);

    const [form, setForm] = useState({
        editionTitle: '',
        bio: '',
        st0: '', st1: '', st2: '',
        t0: '', t1: '', t2: '', t3: '', t4: '',
    });

    // Uploaded URLs
    const [photos, setPhotos] = useState(Array(9).fill(null));
    const [portraits, setPortraits] = useState(Array(3).fill(null));
    const [films, setFilms] = useState(Array(2).fill(null));

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [checkoutMsg, setCheckoutMsg] = useState(null); // luxury loading state
    const [checkoutDone, setCheckoutDone] = useState(false);

    // Detect ?checkout=success return from Stripe
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('checkout') === 'success') {
            setCheckoutDone(true);
            window.history.replaceState({}, '', '/dashboard');
        }
    }, []);

    useEffect(() => {
        if (!myModel) return;
        setForm(prev => ({
            ...prev,
            editionTitle: myModel.editionTitle || '',
            bio: myModel.bio || '',
            st0: myModel.storytelling?.[0]?.text || '',
            st1: myModel.storytelling?.[1]?.text || '',
            st2: myModel.storytelling?.[2]?.text || '',
        }));
    }, [myModel]);

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    // Minimum quality gate: editionTitle + bio + at least 1 photo
    const canSave = form.editionTitle.trim().length > 3
        && form.bio.trim().length > 10
        && photos.some(Boolean);

    const handlePublish = async (e) => {
        e.preventDefault();
        setSaveError('');

        const payload = {
            edition_title: form.editionTitle,
            bio: form.bio,
            owner_id: user?.id,
            storytelling: [
                { eyebrow: 'O Manifesto', heading: '', text: form.st0 },
                { eyebrow: 'O Ensaio', heading: '', text: form.st1 },
                { eyebrow: 'O Encerramento', heading: '', text: form.st2 },
            ].filter(s => s.text),
            testimonials: [form.t0, form.t1, form.t2, form.t3, form.t4]
                .filter(Boolean)
                .map(q => ({ quote: q, author: '' })),
            gallery_photos: photos
                .map((url, i) => url ? { url, size: i % 3 === 0 ? 'large' : i % 2 === 0 ? 'medium' : 'small', alignment: 'center', sort_order: i } : null)
                .filter(Boolean),
            cinema_videos: [
                ...portraits.map((url, i) => url ? { type: 'living-portrait', url, label: `Portrait ${i + 1}` } : null),
                ...films.map((url, i) => url ? { type: 'short-film', url, label: `Short Film ${i + 1}`, duration: '' } : null),
            ].filter(Boolean),
        };

        const { error } = await publishAndCheckout({
            slug: myModel?.slug || 'nova-modelo',
            payload,
            user,
            onLoading: (msg) => setCheckoutMsg(msg),
        });

        if (error) {
            setCheckoutMsg(null);
            setSaveError(error);
        }
        // If no error, Stripe redirect happened️
    };

    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Modelo';

    return (
        <main className="min-h-screen bg-white" style={{ overflowX: 'hidden', paddingBottom: '100px' }}>

            {/* ── Luxury Checkout Loading Overlay ───────────────────────────── */}
            {checkoutMsg && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 200,
                    background: '#000',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '32px',
                    padding: '40px',
                }}>
                    {/* Animated ring */}
                    <div style={{
                        width: '56px', height: '56px', borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderTop: '1px solid rgba(255,255,255,0.6)',
                        animation: 'spin 1.8s linear infinite',
                    }} />
                    <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>

                    <div style={{ textAlign: 'center', maxWidth: '380px' }}>
                        <p style={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 300, fontStyle: 'italic',
                            fontSize: 'clamp(1.1rem, 3vw, 1.5rem)',
                            color: 'rgba(255,255,255,0.85)',
                            lineHeight: '1.5', marginBottom: '16px',
                        }}>
                            {checkoutMsg}
                        </p>
                        <p style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 300, fontSize: '7px',
                            letterSpacing: '4px', textTransform: 'uppercase',
                            color: 'rgba(255,255,255,0.2)',
                        }}>
                            D-M Signature ✦ Darkclub Brasil 2026
                        </p>
                    </div>
                </div>
            )}

            {/* ── Post-payment success banner ────────────────────────────── */}
            {checkoutDone && (
                <div style={{
                    background: '#000', color: '#fff', padding: '14px 24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                }}>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '9px', letterSpacing: '4px', textTransform: 'uppercase' }}>
                        ✦ Pagamento confirmado. Sua revista está sendo ativada.
                    </p>
                    <button onClick={() => setCheckoutDone(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: '14px' }}>✕</button>
                </div>
            )}

            {/* ── Sticky Header ──────────────────────────────── */}
            <header style={{
                borderBottom: '1px solid rgba(0,0,0,0.07)',
                padding: 'clamp(14px,2.5vw,22px) clamp(20px,5vw,56px)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                position: 'sticky', top: 0,
                background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(12px)', zIndex: 40,
            }}>
                <div>
                    <p style={{ fontFamily: '"Playfair Display", serif', fontWeight: 300, fontSize: 'clamp(14px,2.5vw,18px)', letterSpacing: '4px', textTransform: 'uppercase', color: '#000' }}>
                        Darkclub
                    </p>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '7px', letterSpacing: '3px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.25)', marginTop: '2px' }}>
                        Minha Revista
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '10px', color: 'rgba(0,0,0,0.3)' }}>
                        {displayName}
                    </p>
                    <button onClick={signOut} style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '7px', letterSpacing: '3px', textTransform: 'uppercase', border: '1px solid rgba(0,0,0,0.15)', background: 'transparent', color: 'rgba(0,0,0,0.4)', padding: '6px 14px', cursor: 'pointer' }}>
                        Sair
                    </button>
                </div>
            </header>

            {/* ── Welcome ────────────────────────────────────── */}
            <section style={{ padding: 'clamp(48px,8vw,80px) clamp(24px,8vw,100px)', maxWidth: '900px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
                    <div style={{ width: '20px', height: '1px', background: 'rgba(0,0,0,0.12)' }} />
                    <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '7px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#888' }}>
                        Edição Brasil · 2026
                    </p>
                </div>
                <h1 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 300, fontStyle: 'italic', fontSize: 'clamp(1.6rem,4.5vw,3rem)', color: '#000', lineHeight: '1.25', letterSpacing: '-0.02em', marginBottom: '16px' }}>
                    Sua vaga na edição Brasil&nbsp;•&nbsp;2026<br />está garantida.
                </h1>
                <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: 'clamp(0.9rem,1.5vw,1.05rem)', color: '#333', lineHeight: '1.85', maxWidth: '560px' }}>
                    Vamos começar a sua narrativa? Preencha as informações abaixo para montar o seu Dossiê Digital.
                </p>
                {myModel && (
                    <div style={{ marginTop: '32px', display: 'inline-flex', flexDirection: 'column', gap: '10px' }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '8px', letterSpacing: '3px', color: '#888', textTransform: 'uppercase' }}>
                            Seu Link Exclusivo (Publicado após conclusão)
                        </p>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            background: '#FDFBF7',
                            border: '1px solid #E8DBCE',
                            padding: '12px 16px',
                        }}>
                            <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '11px', color: '#B89060', letterSpacing: '1px' }}>
                                darkclub.com/modelo/{myModel.slug}
                            </p>
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(`https://darkclub.com/modelo/${myModel.slug}`);
                                    const btn = e.currentTarget;
                                    const oldText = btn.innerText;
                                    btn.innerText = 'Copiado!';
                                    setTimeout(() => btn.innerText = oldText, 2000);
                                }}
                                style={{
                                    fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '8px',
                                    letterSpacing: '2px', textTransform: 'uppercase',
                                    background: '#B89060', color: '#fff', border: 'none',
                                    padding: '8px 14px', cursor: 'pointer', transition: 'background 0.3s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#000'}
                                onMouseLeave={e => e.currentTarget.style.background = '#B89060'}
                            >
                                Copiar
                            </button>
                        </div>
                    </div>
                )}
            </section>

            {/* ── Form ───────────────────────────────────────── */}
            <form onSubmit={handlePublish} style={{ padding: '0 clamp(24px,8vw,100px)', maxWidth: '900px' }}>

                {/* 01 Identidade */}
                <div style={{ marginBottom: '56px' }}>
                    <SectionLabel>01 · Identidade da Edição</SectionLabel>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <Field label="Título da Edição" placeholder="Ex: A Força da Natureza" value={form.editionTitle} onChange={set('editionTitle')} />
                        <Field label="Bio — sua história em 3 linhas" placeholder="Nascida em..." value={form.bio} onChange={set('bio')} rows={4} />
                    </div>
                </div>

                {/* 02 Storytelling */}
                <div style={{ marginBottom: '56px' }}>
                    <SectionLabel>02 · Storytelling — 3 Crônicas</SectionLabel>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        <Field label="Crônica 1 — O Manifesto" placeholder="Como tudo começou..." value={form.st0} onChange={set('st0')} rows={5} />
                        <Field label="Crônica 2 — O Ensaio" placeholder="Como foi o dia das fotos..." value={form.st1} onChange={set('st1')} rows={5} />
                        <Field label="Crônica 3 — O Encerramento" placeholder="Uma reflexão final..." value={form.st2} onChange={set('st2')} rows={5} />
                    </div>
                </div>

                {/* 03 Galeria — 9 fotos */}
                <div style={{ marginBottom: '56px' }}>
                    <SectionLabel>03 · Galeria Assimétrica — 9 Fotos</SectionLabel>

                    {/* ── Art Direction Banner ──────────────────────── */}
                    <div style={{
                        borderLeft: '2px solid rgba(0,0,0,0.06)',
                        paddingLeft: '16px',
                        marginBottom: '20px',
                    }}>
                        <p style={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 300,
                            fontStyle: 'italic',
                            fontSize: '13px',
                            color: '#333',
                            lineHeight: '1.7',
                        }}>
                            Direção de Arte: Busque o equilíbrio entre o minimalismo e a expressão.
                        </p>
                        <p style={{
                            fontFamily: '"Inter", sans-serif',
                            fontWeight: 300,
                            fontSize: '9px',
                            letterSpacing: '2px',
                            color: '#aaa',
                            marginTop: '6px',
                        }}>
                            Fotos verticais 9:16 · Mín. 1080×1920px · Sem filtros pesados
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                        {Array.from({ length: 9 }, (_, i) => (
                            <PhotoSlot
                                key={i}
                                index={i}
                                userId={user?.id}
                                onUploaded={(idx, url) => setPhotos(prev => { const n = [...prev]; n[idx] = url; return n; })}
                            />
                        ))}
                    </div>
                </div>

                {/* 04 Living Portraits */}
                <div style={{ marginBottom: '40px' }}>
                    <SectionLabel>04 · Living Portraits — 3 Vídeos em Loop (autoplay, sem áudio)</SectionLabel>

                    {/* Instruction note */}
                    <div style={{ borderLeft: '2px solid rgba(0,0,0,0.06)', paddingLeft: '16px', marginBottom: '16px' }}>
                        <p style={{ fontFamily: '"Playfair Display", serif', fontWeight: 300, fontStyle: 'italic', fontSize: '13px', color: '#333', lineHeight: '1.7' }}>
                            Grave 10s em modo Retrato. Movimentos lentos geram mais impacto.
                        </p>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '9px', letterSpacing: '2px', color: '#aaa', marginTop: '6px' }}>
                            Formato .mp4 ou .mov · Vertical · Sem áudio · Máx. 30s
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginBottom: '28px' }}>
                        {Array.from({ length: 3 }, (_, i) => (
                            <VideoSlot
                                key={i}
                                index={i}
                                folder="portraits"
                                label={`Portrait ${i + 1} · Loop`}
                                aspect="9/16"
                                userId={user?.id}
                                autoplay={true}
                                onUploaded={(idx, url) => setPortraits(prev => { const n = [...prev]; n[idx] = url; return n; })}
                            />
                        ))}
                    </div>
                </div>

                {/* 04b Short Films */}
                <div style={{ marginBottom: '56px' }}>
                    <SectionLabel>Short Films — 2 Vídeos de 3-5 min (com áudio e player)</SectionLabel>

                    {/* Instruction note */}
                    <div style={{ borderLeft: '2px solid rgba(0,0,0,0.06)', paddingLeft: '16px', marginBottom: '16px' }}>
                        <p style={{ fontFamily: '"Playfair Display", serif', fontWeight: 300, fontStyle: 'italic', fontSize: '13px', color: '#333', lineHeight: '1.7' }}>
                            O cinema da sua identidade. Vídeos de 3 a 5 minutos com estética documental.
                        </p>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '9px', letterSpacing: '2px', color: '#aaa', marginTop: '6px' }}>
                            Formato .mp4 · Horizontal 16:9 · Com áudio é bem-vindo
                        </p>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '10px' }}>
                        {Array.from({ length: 2 }, (_, i) => (
                            <VideoSlot
                                key={i}
                                index={i}
                                folder="films"
                                label={`Short Film ${i + 1} · 3-5 min`}
                                aspect="16/9"
                                userId={user?.id}
                                autoplay={false}
                                onUploaded={(idx, url) => setFilms(prev => { const n = [...prev]; n[idx] = url; return n; })}
                            />
                        ))}
                    </div>
                </div>

                {/* 05 Depoimentos */}
                <div style={{ marginBottom: '56px' }}>
                    <SectionLabel>05 · Depoimentos de Elite — 5 Citações</SectionLabel>
                    <div style={{ display: 'grid', gap: '14px' }}>
                        {[
                            'O que dizem sobre sua imagem na moda...',
                            'Uma frase que define sua aura no set...',
                            'Como um diretor descreve seu trabalho...',
                            'Uma crítica de blog ou revista especializada...',
                            'Uma palavra de quem viveu esse momento com você...',
                        ].map((ph, i) => (
                            <Field key={i} label={`Depoimento ${i + 1}`} placeholder={ph} value={form[`t${i}`]} onChange={set(`t${i}`)} rows={2} />
                        ))}
                    </div>
                </div>

                {/* Publish → Stripe */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap', paddingBottom: '40px' }}>
                    <div>
                        <button
                            type="submit"
                            disabled={!!checkoutMsg || !canSave}
                            style={{
                                fontFamily: '"Inter", sans-serif', fontWeight: 400, fontSize: '8px',
                                letterSpacing: '4px', textTransform: 'uppercase',
                                background: checkoutMsg ? '#333' : !canSave ? '#ccc' : '#000',
                                color: '#fff',
                                border: 'none', padding: '18px 40px',
                                cursor: checkoutMsg ? 'wait' : !canSave ? 'not-allowed' : 'pointer',
                                transition: 'background 0.3s',
                                opacity: !canSave && !checkoutMsg ? 0.45 : 1,
                                display: 'flex', alignItems: 'center', gap: '10px',
                            }}
                        >
                            {checkoutMsg ? 'Redirecionando...' : 'Finalizar e Publicar Edição →'}
                        </button>

                        {!canSave && !checkoutMsg && (
                            <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '7px', letterSpacing: '2px', textTransform: 'uppercase', color: '#bbb', marginTop: '10px', lineHeight: '1.7' }}>
                                Preencha título, bio e envie ao menos 1 foto
                            </p>
                        )}
                    </div>

                    <div style={{ paddingTop: '6px' }}>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '8px', letterSpacing: '2px', color: '#aaa', lineHeight: '1.8' }}>
                            Após o pagamento, sua revista será ativada automaticamente<br />
                            em <span style={{ color: '#000' }}>darkclub.com/modelo/{myModel?.slug || '...'}</span>
                        </p>
                        <p style={{ fontFamily: '"Inter", sans-serif', fontWeight: 300, fontSize: '7px', letterSpacing: '1px', color: '#ccc', marginTop: '6px' }}>
                            🔒 Checkout seguro via Stripe
                        </p>
                    </div>

                    {saveError && (
                        <p style={{ fontFamily: '"Inter", sans-serif', fontSize: '10px', color: '#c00', alignSelf: 'center' }}>
                            {saveError}
                        </p>
                    )}
                </div>
            </form>

            <FABPreview slug={myModel?.slug} />
        </main>
    );
}
