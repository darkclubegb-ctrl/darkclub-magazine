import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMagazine } from '../context/MagazineContext';
import { uploadMedia, saveDossier } from '../lib/storage';
import { publishAndCheckout } from '../lib/checkout';

/*
  DashboardPage — Painel da Modelo (Refatorado)
  ──────────────────────────────────────────────
  Admin-style dashboard para a modelo logada.
  ✓ Edição direta de Título, Bio e Storytelling
  ✓ Upload de fotos com barra de progresso
  ✓ Botão "Copiar Link" para cada foto enviada
  ✓ Seção de dicas visuais
  ✓ Salvamento assíncrono direto no Supabase
  ✓ Checkout Stripe para publicação (com desconto Darkclub)
*/

// ─────────────────────────────────────────────
// ATOMS — Reusable UI Components
// ─────────────────────────────────────────────

function SectionDivider({ children }) {
    return (
        <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-5 flex items-center gap-3">
            <span className="flex-1 h-px bg-black/10" />
            {children}
            <span className="flex-1 h-px bg-black/10" />
        </p>
    );
}

function FieldLabel({ children, hint }) {
    return (
        <div className="mb-1.5">
            <label className="block font-body text-[10px] tracking-[0.35em] uppercase text-black/50">
                {children}
            </label>
            {hint && (
                <p className="font-body text-[9px] text-black/25 mt-0.5">{hint}</p>
            )}
        </div>
    );
}

function TextInput({ id, value, onChange, placeholder }) {
    return (
        <input
            id={id}
            type="text"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full border border-black/15 bg-white font-body text-sm text-black placeholder-black/20 px-4 py-3 focus:outline-none focus:border-black/60 transition-colors duration-200"
        />
    );
}

function TextArea({ id, value, onChange, placeholder, rows = 5 }) {
    return (
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full border border-black/15 bg-white font-body text-sm text-black placeholder-black/20 px-4 py-3 focus:outline-none focus:border-black/60 transition-colors duration-200 resize-none leading-relaxed"
        />
    );
}

// ─────────────────────────────────────────────
// TOAST — Feedback visual elegante
// ─────────────────────────────────────────────

function Toast({ message, type = 'success', visible, onClose }) {
    if (!visible) return null;
    const bg = type === 'success' ? 'bg-black' : type === 'error' ? 'bg-red-600' : 'bg-amber-600';
    return (
        <div
            className={`fixed top-6 right-6 z-[200] ${bg} text-white px-6 py-3.5 shadow-xl flex items-center gap-3`}
            style={{ animation: 'slideIn 0.35s ease-out', maxWidth: '420px' }}
        >
            <p className="font-body text-xs leading-relaxed">{message}</p>
            <button onClick={onClose} className="text-white/50 hover:text-white text-sm ml-2 flex-shrink-0">✕</button>
            <style>{`@keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
    );
}

// ─────────────────────────────────────────────
// COPY BUTTON — Botão copiar com feedback
// ─────────────────────────────────────────────

function CopyButton({ text, label = 'Copiar Link' }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for older browsers
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <button
            type="button"
            onClick={handleCopy}
            className={`font-body text-[8px] tracking-[0.2em] uppercase px-3 py-1.5 border transition-all duration-300 whitespace-nowrap ${copied
                ? 'bg-green-600 text-white border-green-600'
                : 'bg-white text-black/50 border-black/15 hover:border-black/40 hover:text-black'
                }`}
        >
            {copied ? '✓ Copiado!' : label}
        </button>
    );
}

// ─────────────────────────────────────────────
// PHOTO UPLOAD SLOT — Com progresso + copiar link
// ─────────────────────────────────────────────

function PhotoUploadSlot({ index, userId, existingUrl, onUploaded, onRemove }) {
    const [preview, setPreview] = useState(existingUrl || null);
    const [progress, setProgress] = useState(existingUrl ? 100 : 0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef(null);

    // Sync with external URL changes
    useEffect(() => {
        if (existingUrl && existingUrl !== preview) {
            setPreview(existingUrl);
            setProgress(100);
        }
    }, [existingUrl]);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setUploading(true);
        setProgress(0);
        setError('');

        const { url, error: err } = await uploadMedia(file, 'photos', userId || 'anon', (p) => setProgress(p));
        setUploading(false);

        if (err) {
            setError(err);
            // Keep the local preview so user can see what they tried to upload
        } else if (url) {
            setPreview(url);
            onUploaded?.(index, url);
        }
    };

    const hasUploadedUrl = preview && !uploading && !error && progress === 100;
    const publicUrl = existingUrl || (hasUploadedUrl ? preview : null);

    return (
        <div className="group relative border border-black/8 bg-white overflow-hidden transition-shadow hover:shadow-md">
            {/* Image area */}
            <div
                onClick={() => !uploading && inputRef.current?.click()}
                className="relative cursor-pointer"
                style={{ aspectRatio: '3/4' }}
            >
                <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />

                {preview ? (
                    <>
                        <img
                            src={preview}
                            alt={`Foto ${index + 1}`}
                            className="w-full h-full object-cover"
                            draggable={false}
                            style={{ filter: error ? 'grayscale(60%) brightness(0.7)' : 'none' }}
                        />
                        {/* D-M Signature watermark */}
                        <div className="absolute bottom-2 right-2.5 pointer-events-none">
                            <p className="font-body text-[5px] tracking-[2px] uppercase text-white/20 select-none whitespace-nowrap">
                                D-M Signature ✦
                            </p>
                        </div>

                        {/* Upload progress overlay */}
                        {uploading && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                                <p className="font-body text-[8px] tracking-[3px] uppercase text-white/70">
                                    Enviando... {progress}%
                                </p>
                                <div className="w-24 h-[2px] bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full bg-white transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                        )}

                        {/* Success badge */}
                        {!uploading && progress === 100 && !error && (
                            <div className="absolute top-2 right-2">
                                <div className="w-5 h-5 rounded-full bg-black/70 flex items-center justify-center">
                                    <span className="text-white text-[8px]">✓</span>
                                </div>
                            </div>
                        )}

                        {/* Hover overlay to re-upload */}
                        {!uploading && !error && (
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <p className="font-body text-[7px] tracking-[3px] uppercase text-white">
                                    Trocar Foto
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#FAFAF9] hover:bg-[#F5F5F3] transition-colors">
                        <div className="w-10 h-10 rounded-full border border-black/10 flex items-center justify-center">
                            <span className="text-black/15 text-lg">+</span>
                        </div>
                        <p className="font-body text-[7px] tracking-[3px] uppercase text-black/20">
                            Foto {index + 1}
                        </p>
                    </div>
                )}

                {/* Error overlay */}
                {error && (
                    <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center gap-3 px-3">
                        <p className="font-body text-[7px] tracking-[2px] uppercase text-red-200">
                            Erro no Upload
                        </p>
                        <p className="font-body text-[9px] text-white/80 text-center leading-relaxed max-w-[90%]">
                            {error}
                        </p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setError(''); setPreview(null); setProgress(0); }}
                            className="font-body text-[7px] tracking-[2px] uppercase border border-white/30 text-white/70 px-3 py-1.5 hover:bg-white/10 transition-colors mt-1"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                )}
            </div>

            {/* Action bar below image */}
            {publicUrl && (
                <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-t border-black/5 bg-[#FDFCFA]">
                    <p className="font-body text-[8px] tracking-[0.15em] uppercase text-black/30 truncate flex-1" title={publicUrl}>
                        Foto {index + 1}
                    </p>
                    <CopyButton text={publicUrl} label="Copiar Link" />
                </div>
            )}
        </div>
    );
}

// ─────────────────────────────────────────────
// TIPS SECTION — Dicas para a Modelo
// ─────────────────────────────────────────────

function TipsSection() {
    const tips = [
        {
            emoji: '📸',
            title: 'Escolha a Melhor Foto',
            text: 'Prefira fotos verticais (9:16), em alta resolução, com iluminação natural. Evite selfies e filtros pesados — imagens clean transmitem profissionalismo.',
            accent: 'border-l-amber-400',
            bg: 'bg-amber-50/60',
        },
        {
            emoji: '✍️',
            title: 'Bio que Encanta',
            text: 'Escreva na terceira pessoa. Conte sua trajetória em 3 a 5 linhas. Mencione cidades, marcas e projetos. O leitor quer sentir quem você é, não ler um currículo.',
            accent: 'border-l-blue-400',
            bg: 'bg-blue-50/60',
        },
        {
            emoji: '🎬',
            title: 'Living Portraits',
            text: 'Grave vídeos curtos (5-10s) em modo Retrato, sem áudio. Movimentos lentos e suaves — olhar para a câmera, virar devagar — criam impacto cinematográfico.',
            accent: 'border-l-purple-400',
            bg: 'bg-purple-50/60',
        },
        {
            emoji: '🔗',
            title: 'Divulgue Seu Link',
            text: 'Use o botão "Copiar Link" em cada foto para compartilhar nas redes sociais. Quanto mais visibilidade, mais chances de ser descoberta por curadoras e agências.',
            accent: 'border-l-emerald-400',
            bg: 'bg-emerald-50/60',
        },
        {
            emoji: '💎',
            title: 'Storytelling Editorial',
            text: 'A seção de crônicas é o que diferencia uma modelo profissional. Conte a história por trás do ensaio: o que te inspirou, como foi a preparação, a emoção do resultado.',
            accent: 'border-l-rose-400',
            bg: 'bg-rose-50/60',
        },
        {
            emoji: '⚡',
            title: 'Salve Sempre',
            text: 'Suas alterações só são enviadas quando você clica em "Salvar". Você pode voltar e editar quantas vezes quiser — tudo é armazenado em segurança no servidor.',
            accent: 'border-l-sky-400',
            bg: 'bg-sky-50/60',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tips.map((tip) => (
                <div
                    key={tip.title}
                    className={`border border-black/6 border-l-[3px] ${tip.accent} ${tip.bg} p-4 transition-all duration-200 hover:shadow-sm`}
                >
                    <p className="text-lg mb-1.5">{tip.emoji}</p>
                    <p className="font-body text-[10px] tracking-[0.25em] uppercase text-black/60 font-semibold mb-1.5">
                        {tip.title}
                    </p>
                    <p className="font-body text-xs text-black/45 leading-relaxed">
                        {tip.text}
                    </p>
                </div>
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────

export default function DashboardPage() {
    const { user, profile, signOut } = useAuth();
    const { models, refreshModels } = useMagazine();

    // Find the model owned by this user
    const myModel = useMemo(() => {
        if (!models.length || !user) return null;
        return models.find(m => m.owner_id === user.id) || null;
    }, [models, user]);

    // ── Form state ──────────────────────────────
    const [form, setForm] = useState({
        editionTitle: '',
        bio: '',
        st0: '',
        st1: '',
        st2: '',
        darkclubUrl: '',
    });

    const [photos, setPhotos] = useState(Array(9).fill(null));
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
    const [checkoutMsg, setCheckoutMsg] = useState(null);
    const [checkoutDone, setCheckoutDone] = useState(false);

    // ── Detect checkout return ───────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('checkout') === 'success') {
            setCheckoutDone(true);
            window.history.replaceState({}, '', '/dashboard');
        }
    }, []);

    // ── Load existing data ──────────────────────
    useEffect(() => {
        if (!myModel) return;
        setForm({
            editionTitle: myModel.editionTitle || '',
            bio: myModel.bio || '',
            st0: myModel.storytelling?.[0]?.text || '',
            st1: myModel.storytelling?.[1]?.text || '',
            st2: myModel.storytelling?.[2]?.text || '',
            darkclubUrl: myModel.darkclubLink || profile?.darkclub_url || '',
        });

        // Restore existing gallery photos
        if (myModel.gallery?.length) {
            const existing = Array(9).fill(null);
            myModel.gallery.forEach((p, i) => {
                if (i < 9 && p?.url) existing[i] = p.url;
            });
            setPhotos(existing);
        }
    }, [myModel]);

    const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

    // ── Show toast helper ───────────────────────
    const showToast = useCallback((message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
    }, []);

    // ── Save to Supabase ────────────────────────
    const handleSave = async () => {
        setSaving(true);

        const slug = myModel?.slug || 'nova-modelo';
        const payload = {
            edition_title: form.editionTitle,
            bio: form.bio,
            owner_id: user?.id,
            storytelling: [
                { eyebrow: 'O Manifesto', heading: '', text: form.st0 },
                { eyebrow: 'O Ensaio', heading: '', text: form.st1 },
                { eyebrow: 'O Encerramento', heading: '', text: form.st2 },
            ].filter(s => s.text),
            gallery_photos: photos
                .map((url, i) => url
                    ? { url, size: i % 3 === 0 ? 'large' : i % 2 === 0 ? 'medium' : 'small', alignment: 'center', sort_order: i }
                    : null
                )
                .filter(Boolean),
        };

        const { error } = await saveDossier(slug, payload);

        setSaving(false);

        if (error) {
            showToast(`Erro ao salvar: ${typeof error === 'string' ? error : error.message || JSON.stringify(error)}`, 'error');
        } else {
            showToast('Alterações salvas com sucesso!', 'success');
            refreshModels?.();
        }
    };

    // ── Publish via Stripe ───────────────────────
    const handlePublish = async () => {
        const slug = myModel?.slug || 'nova-modelo';
        const payload = {
            edition_title: form.editionTitle,
            bio: form.bio,
            owner_id: user?.id,
            darkclub_link: form.darkclubUrl,
            storytelling: [
                { eyebrow: 'O Manifesto', heading: '', text: form.st0 },
                { eyebrow: 'O Ensaio', heading: '', text: form.st1 },
                { eyebrow: 'O Encerramento', heading: '', text: form.st2 },
            ].filter(s => s.text),
            gallery_photos: photos
                .map((url, i) => url
                    ? { url, size: i % 3 === 0 ? 'large' : i % 2 === 0 ? 'medium' : 'small', alignment: 'center', sort_order: i }
                    : null
                )
                .filter(Boolean),
        };

        const { error } = await publishAndCheckout({
            slug,
            payload,
            user,
            onLoading: (msg) => setCheckoutMsg(msg),
        });

        if (error) {
            setCheckoutMsg(null);
            showToast(`Erro na publicação: ${error}`, 'error');
        }
    };

    const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Modelo';
    const photoCount = photos.filter(Boolean).length;
    const hasDarkclubUrl = form.darkclubUrl.trim().length > 5;
    const canPublish = form.editionTitle.trim().length > 3 && form.bio.trim().length > 10 && photoCount >= 1;

    return (
        <div className="min-h-screen bg-[#F7F6F3]">

            {/* ── Checkout Loading Overlay ─────────────────────── */}
            {checkoutMsg && (
                <div className="fixed inset-0 z-[200] bg-black flex flex-col items-center justify-center gap-8 px-10">
                    <div className="w-14 h-14 rounded-full border border-white/15 border-t-white/60" style={{ animation: 'dashSpin 1.8s linear infinite' }} />
                    <style>{`@keyframes dashSpin { to { transform: rotate(360deg); } }`}</style>
                    <div className="text-center max-w-sm">
                        <p className="font-display italic text-white/85" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', lineHeight: '1.5', marginBottom: '16px' }}>
                            {checkoutMsg}
                        </p>
                        <p className="font-body text-[7px] tracking-[4px] uppercase text-white/20">
                            D-M Signature ✦ Darkclub Brasil 2026
                        </p>
                    </div>
                </div>
            )}

            {/* ── Post-checkout Success Banner ─────────────────── */}
            {checkoutDone && (
                <div className="bg-black text-white px-6 py-3.5 flex items-center justify-center gap-3">
                    <p className="font-body text-[9px] tracking-[4px] uppercase">
                        ✦ Pagamento confirmado. Sua revista está sendo ativada.
                    </p>
                    <button onClick={() => setCheckoutDone(false)} className="text-white/35 hover:text-white text-sm">✕</button>
                </div>
            )}

            {/* ── Toast ─────────────────────────────────────────── */}
            <Toast
                message={toast.message}
                type={toast.type}
                visible={toast.visible}
                onClose={() => setToast(prev => ({ ...prev, visible: false }))}
            />

            {/* ── HEADER ────────────────────────────────────────── */}
            <header className="bg-black text-white px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link
                        to="/"
                        className="font-body text-[10px] tracking-[0.4em] uppercase text-white/40 hover:text-white/70 transition-colors"
                    >
                        ← Revista
                    </Link>
                    <span className="text-white/20">|</span>
                    <div>
                        <p className="font-display font-black text-base tracking-wide uppercase">
                            Meu Painel <span className="text-white/30">· Darkclub</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <p className="font-body text-[10px] text-white/40 hidden md:block">
                        {displayName}
                    </p>
                    {/* Preview link */}
                    {myModel?.slug && (
                        <Link
                            to={`/modelo/${myModel.slug}`}
                            target="_blank"
                            className="font-body text-[10px] tracking-[0.35em] uppercase text-white/50 border border-white/20 px-3 py-2 hover:border-white/50 hover:text-white/80 transition-colors hidden sm:block"
                        >
                            Ver Revista ↗
                        </Link>
                    )}
                    {/* Save */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`font-body text-[10px] tracking-[0.35em] uppercase px-5 py-2 transition-all duration-300 ${saving
                            ? 'bg-white/20 text-white/50 cursor-wait'
                            : 'bg-white text-black hover:bg-white/90'
                            }`}
                    >
                        {saving ? '⏳ Salvando...' : '✓ Salvar'}
                    </button>
                    {/* Sign out */}
                    <button
                        onClick={signOut}
                        className="font-body text-[10px] tracking-[0.3em] uppercase text-white/30 border border-white/15 px-3 py-2 hover:text-white/60 hover:border-white/30 transition-colors"
                    >
                        Sair
                    </button>
                </div>
            </header>

            {/* ── MAIN CONTENT ──────────────────────────────────── */}
            <main className="max-w-4xl mx-auto px-6 md:px-10 py-10">

                {/* ── Welcome + Stats ────────────────────────── */}
                <section className="mb-10">
                    <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                        <div>
                            <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-1">
                                Edição Brasil · 2026
                            </p>
                            <h1 className="font-display font-black text-3xl uppercase leading-none mb-3">
                                {myModel?.name || displayName}
                            </h1>
                            {myModel?.slug && (
                                <div className="flex items-center gap-3 flex-wrap">
                                    <p className="font-body text-[11px] text-black/35">
                                        darkclub.com/modelo/<span className="text-black/60 font-medium">{myModel.slug}</span>
                                    </p>
                                    <CopyButton
                                        text={`${window.location.origin}/modelo/${myModel.slug}`}
                                        label="Copiar URL"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Mini stats */}
                        <div className="flex gap-6">
                            <div className="text-center">
                                <p className="font-display text-2xl font-light text-black">{photoCount}</p>
                                <p className="font-body text-[7px] tracking-[0.4em] uppercase text-black/25">Fotos</p>
                            </div>
                            <div className="text-center">
                                <p className="font-display text-2xl font-light text-black">
                                    {[form.st0, form.st1, form.st2].filter(s => s.trim()).length}
                                </p>
                                <p className="font-body text-[7px] tracking-[0.4em] uppercase text-black/25">Crônicas</p>
                            </div>
                            <div className="text-center">
                                <p className="font-display text-2xl font-light">
                                    {myModel?.published !== false ? '🟢' : '⚪'}
                                </p>
                                <p className="font-body text-[7px] tracking-[0.4em] uppercase text-black/25">
                                    {myModel?.published !== false ? 'Ativa' : 'Rascunho'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 01. IDENTIDADE DA EDIÇÃO ───────────────── */}
                <section className="mb-10">
                    <SectionDivider>01 · Identidade da Edição</SectionDivider>
                    <div className="space-y-5 bg-white border border-black/8 p-6">
                        <div>
                            <FieldLabel hint="Ex: A Força da Natureza">Título da Edição</FieldLabel>
                            <TextInput
                                id="editionTitle"
                                value={form.editionTitle}
                                onChange={set('editionTitle')}
                                placeholder="Escolha um título impactante para sua edição"
                            />
                        </div>
                        <div>
                            <FieldLabel hint="Escreva em terceira pessoa. Conte sua história em 3-5 linhas.">Bio Editorial</FieldLabel>
                            <TextArea
                                id="bio"
                                value={form.bio}
                                onChange={set('bio')}
                                placeholder="Nascida em São Paulo, ela sempre soube que a moda seria seu meio de expressão..."
                                rows={6}
                            />
                        </div>
                        {/* Darkclub URL */}
                        <div>
                            <FieldLabel hint="Se você tem perfil no Darkclub, cole o link aqui para ganhar desconto na publicação.">Link do Darkclub (opcional)</FieldLabel>
                            <TextInput
                                id="darkclubUrl"
                                value={form.darkclubUrl}
                                onChange={set('darkclubUrl')}
                                placeholder="https://darkclub.com/seu-perfil"
                            />
                            {hasDarkclubUrl && (
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                                    <p className="font-body text-[9px] tracking-[0.2em] uppercase text-green-700">
                                        Membro Darkclub verificado — Desconto de R$9,00 aplicado na publicação
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* ── 02. STORYTELLING ────────────────────────── */}
                <section className="mb-10">
                    <SectionDivider>02 · Storytelling — Crônicas</SectionDivider>
                    <div className="space-y-4">
                        {[
                            { key: 'st0', label: 'Crônica 1 — O Manifesto', ph: 'Como tudo começou...' },
                            { key: 'st1', label: 'Crônica 2 — O Ensaio', ph: 'Como foi o dia das fotos...' },
                            { key: 'st2', label: 'Crônica 3 — O Encerramento', ph: 'Uma reflexão final...' },
                        ].map(({ key, label, ph }) => (
                            <div key={key} className="bg-white border border-black/8 p-5">
                                <FieldLabel>{label}</FieldLabel>
                                <TextArea
                                    id={key}
                                    value={form[key]}
                                    onChange={set(key)}
                                    placeholder={ph}
                                    rows={4}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── 03. GALERIA DE FOTOS ────────────────────── */}
                <section className="mb-10">
                    <SectionDivider>03 · Galeria de Fotos — Upload &amp; Compartilhar</SectionDivider>

                    {/* Direction banner */}
                    <div className="border-l-[3px] border-l-black/10 pl-4 mb-5">
                        <p className="font-display italic text-sm text-black/60 leading-relaxed">
                            Envie suas melhores fotos. Cada imagem ganha um link público para você compartilhar.
                        </p>
                        <p className="font-body text-[9px] tracking-[2px] text-black/25 uppercase mt-1.5">
                            Fotos verticais 9:16 · Mín. 1080×1920px · Sem filtros pesados · Máx. 9 fotos
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Array.from({ length: 9 }, (_, i) => (
                            <PhotoUploadSlot
                                key={i}
                                index={i}
                                userId={user?.id}
                                existingUrl={photos[i]}
                                onUploaded={(idx, url) => setPhotos(prev => {
                                    const next = [...prev];
                                    next[idx] = url;
                                    return next;
                                })}
                            />
                        ))}
                    </div>

                    {photoCount > 0 && (
                        <div className="mt-4 flex items-center gap-3 bg-white border border-black/8 px-4 py-3">
                            <span className="text-[10px] text-black/25 font-body tracking-[0.2em] uppercase">
                                {photoCount} foto{photoCount !== 1 ? 's' : ''} enviada{photoCount !== 1 ? 's' : ''}
                            </span>
                            <span className="flex-1" />
                            <p className="font-body text-[9px] text-black/30">
                                💡 Use os botões "Copiar Link" acima para divulgar cada foto
                            </p>
                        </div>
                    )}
                </section>

                {/* ── 04. DICAS PARA A MODELO ────────────────── */}
                <section className="mb-10">
                    <SectionDivider>✦ Dicas Para Você</SectionDivider>
                    <TipsSection />
                </section>

                {/* ── 05. PUBLICAR REVISTA ────────────────────── */}
                <section className="mb-10">
                    <SectionDivider>05 · Publicar Sua Revista</SectionDivider>

                    {/* Pricing cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {/* Standard */}
                        <div className={`border p-6 transition-all duration-300 ${!hasDarkclubUrl
                                ? 'border-black bg-black text-white'
                                : 'border-black/10 bg-white text-black/60'
                            }`}>
                            <p className="font-body text-[8px] tracking-[0.4em] uppercase mb-3 opacity-50">Plano Standard</p>
                            <p className="font-display text-3xl font-light mb-1">
                                R$ 19<span className="text-lg">,90</span>
                                <span className="font-body text-[9px] tracking-[0.2em] uppercase opacity-40">/mês</span>
                            </p>
                            <p className="font-body text-[9px] opacity-40 leading-relaxed mt-2">
                                Revista digital completa publicada com URL exclusiva.
                            </p>
                            {!hasDarkclubUrl && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/40" />
                                    <p className="font-body text-[8px] tracking-[0.15em] uppercase opacity-50">Seu plano atual</p>
                                </div>
                            )}
                        </div>

                        {/* Member */}
                        <div className={`border p-6 transition-all duration-300 ${hasDarkclubUrl
                                ? 'border-black bg-black text-white'
                                : 'border-black/10 bg-white text-black/60'
                            }`}>
                            <div className="flex items-center gap-2 mb-3">
                                <p className="font-body text-[8px] tracking-[0.4em] uppercase opacity-50">Membro Darkclub</p>
                                {hasDarkclubUrl && (
                                    <span className="bg-green-500 text-white font-body text-[6px] tracking-[0.2em] uppercase px-2 py-0.5">Ativo</span>
                                )}
                            </div>
                            <p className="font-display text-3xl font-light mb-1">
                                R$ 10<span className="text-lg">,90</span>
                                <span className="font-body text-[9px] tracking-[0.2em] uppercase opacity-40">/mês</span>
                            </p>
                            <p className="font-body text-[9px] opacity-40 leading-relaxed mt-2">
                                Desconto exclusivo para modelos com perfil ativo no Darkclub.
                            </p>
                            {!hasDarkclubUrl && (
                                <p className="font-body text-[8px] opacity-30 mt-3">
                                    ↑ Adicione seu link Darkclub acima para ativar
                                </p>
                            )}
                            {hasDarkclubUrl && (
                                <div className="mt-3 flex items-center gap-2">
                                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
                                    <p className="font-body text-[8px] tracking-[0.15em] uppercase opacity-60">Desconto aplicado ✓</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Publish action */}
                    <div className="bg-white border border-black/8 p-6">
                        {!canPublish && (
                            <p className="font-body text-[9px] tracking-[0.2em] uppercase text-amber-600 mb-4">
                                ⚠ Para publicar, preencha o título, a bio (mín. 10 caracteres) e envie ao menos 1 foto.
                            </p>
                        )}
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <button
                                onClick={handlePublish}
                                disabled={!canPublish || !!checkoutMsg}
                                className={`w-full sm:flex-1 font-body text-[11px] tracking-[0.4em] uppercase py-4 font-semibold transition-all duration-300 ${!canPublish
                                        ? 'bg-black/15 text-black/30 cursor-not-allowed'
                                        : checkoutMsg
                                            ? 'bg-black/30 text-white cursor-wait'
                                            : 'bg-black text-white hover:bg-black/85'
                                    }`}
                            >
                                {checkoutMsg ? 'Redirecionando...' : `Publicar Minha Revista → ${hasDarkclubUrl ? 'R$10,90/mês' : 'R$19,90/mês'}`}
                            </button>
                        </div>
                        <p className="font-body text-[8px] text-black/25 mt-3 text-center">
                            🔒 Checkout seguro via Stripe · Cancelamento a qualquer momento
                        </p>
                    </div>
                </section>

                {/* ── SAVE BAR (bottom) ──────────────────────── */}
                <section className="border-t border-black/10 pt-6 flex flex-col sm:flex-row items-center gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full sm:flex-1 font-body text-[11px] tracking-[0.4em] uppercase py-4 font-semibold transition-all duration-300 ${saving
                            ? 'bg-black/30 text-white cursor-wait'
                            : 'bg-black text-white hover:bg-black/85'
                            }`}
                    >
                        {saving ? '⏳ Salvando alterações...' : '✓ Salvar Rascunho (Sem Publicar)'}
                    </button>

                    {myModel?.slug && (
                        <Link
                            to={`/modelo/${myModel.slug}`}
                            target="_blank"
                            className="w-full sm:w-auto text-center border border-black/20 text-black font-body text-[10px] tracking-[0.35em] uppercase px-6 py-4 hover:bg-black hover:text-white transition-colors duration-200 whitespace-nowrap"
                        >
                            Visualizar Minha Revista ↗
                        </Link>
                    )}
                </section>

                {/* ── FOOTER ────────────────────────────────── */}
                <div className="mt-10 border-t border-black/5 pt-6 text-center">
                    <p className="font-body text-[9px] tracking-[0.35em] uppercase text-black/15">
                        ✦ Identidade Verificada por Curadoria Darkclub — Autenticidade Garantida ✦
                    </p>
                </div>
            </main>

            {/* ── MOBILE SAVE FAB ────────────────────────────── */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 px-4 py-3 z-40 flex items-center gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-black text-white font-body text-[10px] tracking-[0.3em] uppercase py-3"
                >
                    {saving ? '⏳ Salvando...' : '✓ Salvar'}
                </button>
                {myModel?.slug && (
                    <Link
                        to={`/modelo/${myModel.slug}`}
                        className="border border-black/20 text-black font-body text-[10px] tracking-[0.3em] uppercase px-4 py-3"
                    >
                        Ver ↗
                    </Link>
                )}
            </div>
        </div>
    );
}
