import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMagazine } from '../context/MagazineContext';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function validateUrl(val) {
    if (!val) return true; // optional fields are OK empty
    try { new URL(val); return true; } catch { return false; }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StyleGuideCard({ emoji, title, text }) {
    return (
        <div className="border border-black/10 p-4 rounded-sm bg-white/60 backdrop-blur-sm">
            <p className="text-lg mb-1">{emoji}</p>
            <p className="font-semibold text-[11px] tracking-[0.3em] uppercase text-black/60 mb-1">{title}</p>
            <p className="font-body text-xs text-black/50 leading-relaxed">{title === 'Obrigatório' ? '' : text}</p>
            {title !== 'Obrigatório' && null}
            <p className="font-body text-xs text-black/50 leading-relaxed">{text}</p>
        </div>
    );
}

function FieldLabel({ children, required }) {
    return (
        <label className="block font-body text-[10px] tracking-[0.35em] uppercase text-black/50 mb-1">
            {children}
            {required && <span className="ml-1 text-red-500">*</span>}
        </label>
    );
}

function TextInput({ id, value, onChange, placeholder, error, type = 'text' }) {
    return (
        <>
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full border ${error ? 'border-red-400' : 'border-black/20'} bg-white font-body text-sm text-black placeholder-black/25 px-4 py-3 focus:outline-none focus:border-black transition-colors duration-200`}
            />
            {error && <p className="text-red-500 text-[10px] mt-1">{error}</p>}
        </>
    );
}

function TextArea({ id, value, onChange, placeholder, rows = 6 }) {
    return (
        <textarea
            id={id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            className="w-full border border-black/20 bg-white font-body text-sm text-black placeholder-black/25 px-4 py-3 focus:outline-none focus:border-black transition-colors duration-200 resize-none leading-relaxed"
        />
    );
}

// ─── EMPTY FORM STATE ──────────────────────────────────────────────────────────

const EMPTY_GALLERY = Array.from({ length: 6 }, () => ({ url: '', size: 'medium', alignment: 'center', caption: '' }));

function normaliseGallery(raw = []) {
    const base = raw.map(item =>
        typeof item === 'string'
            ? { url: item, size: 'medium', alignment: 'center', caption: '' }
            : { url: item?.url ?? '', size: item?.size ?? 'medium', alignment: item?.alignment ?? 'center', caption: item?.caption ?? '' }
    );
    while (base.length < 6) base.push({ url: '', size: 'medium', alignment: 'center', caption: '' });
    return base.slice(0, 6);
}

const EMPTY = {
    slug: '',
    name: '',
    subtitle: '',
    bio: '',
    heroImage: '',
    videoUrl: '',
    gallery: EMPTY_GALLERY,
    darkclubLink: '',
    instaLink: '',
    tiktokLink: '',
    whatsappLink: '',
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AdminPage() {
    const { models, updateModel, addModel, deleteModel } = useMagazine();
    const navigate = useNavigate();

    // Which model is being edited (null = creating new)
    const [selectedSlug, setSelectedSlug] = useState(models[0]?.slug ?? null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [saved, setSaved] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [isNew, setIsNew] = useState(false);

    // Load form when selection changes
    useEffect(() => {
        if (isNew) {
            setForm(EMPTY);
            setErrors({});
            return;
        }
        const m = models.find((m) => m.slug === selectedSlug);
        if (m) {
            setForm({
                ...m,
                gallery: normaliseGallery(m.gallery),
                instaLink: m.instaLink ?? '',
                tiktokLink: m.tiktokLink ?? '',
                whatsappLink: m.whatsappLink ?? '',
            });
            setErrors({});
        }
    }, [selectedSlug, isNew, models]);

    // ── Field helpers ──────────────────────────────────────────────────────────
    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
    const setGalleryField = (i, field) => (e) => {
        const g = form.gallery.map((item, idx) =>
            idx === i ? { ...item, [field]: e.target.value } : item
        );
        setForm((f) => ({ ...f, gallery: g }));
    };

    // ── Validation ─────────────────────────────────────────────────────────────
    function validate() {
        const e = {};
        if (!form.name.trim()) e.name = 'Nome é obrigatório';
        if (!form.darkclubLink.trim()) e.darkclubLink = 'Link do Darkclub é obrigatório';
        if (!validateUrl(form.darkclubLink)) e.darkclubLink = 'URL inválida';
        if (!validateUrl(form.heroImage)) e.heroImage = 'URL inválida';
        if (!validateUrl(form.videoUrl)) e.videoUrl = 'URL inválida';
        if (!validateUrl(form.instaLink)) e.instaLink = 'URL inválida';
        if (!validateUrl(form.tiktokLink)) e.tiktokLink = 'URL inválida';
        if (!validateUrl(form.whatsappLink)) e.whatsappLink = 'URL inválida';
        return e;
    }

    // ── Save ───────────────────────────────────────────────────────────────────
    function handleSave() {
        const e = validate();
        if (Object.keys(e).length) { setErrors(e); return; }

        const slug = isNew ? slugify(form.name) : selectedSlug;
        const payload = {
            ...form,
            slug,
            gallery: form.gallery.filter(item => item.url?.trim()),
            instaLink: form.instaLink || null,
            tiktokLink: form.tiktokLink || null,
            whatsappLink: form.whatsappLink || null,
        };

        if (isNew) {
            addModel(payload);
            setIsNew(false);
            setSelectedSlug(slug);
        } else {
            updateModel(payload);
        }

        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    }

    // ── Delete ─────────────────────────────────────────────────────────────────
    function handleDelete() {
        deleteModel(selectedSlug);
        const remaining = models.filter((m) => m.slug !== selectedSlug);
        if (remaining.length) {
            setSelectedSlug(remaining[0].slug);
        } else {
            setIsNew(true);
            setSelectedSlug(null);
        }
        setConfirmDelete(false);
    }

    return (
        <div className="min-h-screen bg-[#F7F6F3]">

            {/* ── TOP BAR ─────────────────────────────────────────────────── */}
            <header className="bg-black text-white px-6 md:px-10 py-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link to="/" className="font-body text-[10px] tracking-[0.4em] uppercase text-white/40 hover:text-white/70 transition-colors">
                        ← Revista
                    </Link>
                    <span className="text-white/20">|</span>
                    <p className="font-display font-black text-base tracking-wide uppercase">
                        Admin <span className="text-white/30">· Darkclub</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Preview link */}
                    {selectedSlug && !isNew && (
                        <Link
                            to={`/modelo/${selectedSlug}`}
                            target="_blank"
                            className="font-body text-[10px] tracking-[0.35em] uppercase text-white/50 border border-white/20 px-3 py-2 hover:border-white/50 hover:text-white/80 transition-colors"
                        >
                            Ver página ↗
                        </Link>
                    )}
                    {/* Save */}
                    <button
                        onClick={handleSave}
                        className={`font-body text-[10px] tracking-[0.35em] uppercase px-5 py-2 transition-all duration-300 ${saved
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-black hover:bg-white/80'
                            }`}
                    >
                        {saved ? '✓ Salvo!' : 'Publicar'}
                    </button>
                </div>
            </header>

            <div className="flex min-h-[calc(100vh-57px)]">

                {/* ── SIDEBAR ──────────────────────────────────────────────── */}
                <aside className="hidden md:flex flex-col w-64 bg-white border-r border-black/10 shrink-0">
                    <div className="px-5 pt-6 pb-3">
                        <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30">Modelos</p>
                    </div>
                    <nav className="flex-1 overflow-y-auto">
                        {models.map((m) => (
                            <button
                                key={m.slug}
                                onClick={() => { setSelectedSlug(m.slug); setIsNew(false); }}
                                className={`w-full text-left px-5 py-4 border-b border-black/5 transition-colors hover:bg-black/5 ${selectedSlug === m.slug && !isNew ? 'bg-black text-white' : 'text-black'}`}
                            >
                                <p className={`font-display font-bold text-sm truncate ${selectedSlug === m.slug && !isNew ? 'text-white' : 'text-black'}`}>
                                    {m.name}
                                </p>
                                <p className={`font-body text-[10px] truncate mt-0.5 ${selectedSlug === m.slug && !isNew ? 'text-white/50' : 'text-black/35'}`}>
                                    {m.subtitle || 'Sem subtítulo'}
                                </p>
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-black/10">
                        <button
                            onClick={() => { setIsNew(true); setSelectedSlug(null); setConfirmDelete(false); }}
                            className="w-full border border-black/20 text-black font-body text-[10px] tracking-[0.3em] uppercase py-3 hover:bg-black hover:text-white transition-colors duration-200"
                        >
                            + Nova Modelo
                        </button>
                    </div>
                </aside>

                {/* ── MAIN FORM ─────────────────────────────────────────────── */}
                <main className="flex-1 overflow-y-auto">
                    <div className="max-w-3xl mx-auto px-6 md:px-10 py-10">

                        {/* Section title */}
                        <div className="mb-8 flex items-center justify-between">
                            <div>
                                <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-1">
                                    {isNew ? 'Nova Modelo' : 'Editando'}
                                </p>
                                <h1 className="font-display font-black text-3xl uppercase leading-none">
                                    {isNew ? '—' : (form.name || '—')}
                                </h1>
                            </div>
                            {!isNew && (
                                <button
                                    onClick={() => setConfirmDelete(true)}
                                    className="font-body text-[10px] tracking-[0.3em] uppercase text-red-400 hover:text-red-600 transition-colors"
                                >
                                    Excluir
                                </button>
                            )}
                        </div>

                        {/* ── GUIA DE ESTILO ──────────────────────────────────── */}
                        <section className="mb-10">
                            <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-4">
                                ✦ Guia de Curadoria
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="border border-amber-200 bg-amber-50 p-4 rounded-sm">
                                    <p className="text-base mb-1">📸</p>
                                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-amber-800 font-semibold mb-1">Fotos</p>
                                    <p className="font-body text-xs text-amber-700 leading-relaxed">
                                        Use apenas fotos verticais (9:16) em alta resolução. Evite filtros excessivos e fundos poluídos para manter a estética de luxo.
                                    </p>
                                </div>
                                <div className="border border-blue-200 bg-blue-50 p-4 rounded-sm">
                                    <p className="text-base mb-1">🎬</p>
                                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-blue-800 font-semibold mb-1">Vídeo · Living Portrait</p>
                                    <p className="font-body text-xs text-blue-700 leading-relaxed">
                                        Envie vídeos curtos (5–10s) sem áudio. O foco deve ser o movimento natural, simulando um retrato vivo.
                                    </p>
                                </div>
                                <div className="border border-purple-200 bg-purple-50 p-4 rounded-sm">
                                    <p className="text-base mb-1">✍️</p>
                                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-purple-800 font-semibold mb-1">Bio Editorial</p>
                                    <p className="font-body text-xs text-purple-700 leading-relaxed">
                                        Escreva em terceira pessoa. Conte uma história, não uma lista de características. Dois parágrafos ideais.
                                    </p>
                                </div>
                                <div className="border border-red-200 bg-red-50 p-4 rounded-sm">
                                    <p className="text-base mb-1">🔗</p>
                                    <p className="font-body text-[10px] tracking-[0.3em] uppercase text-red-800 font-semibold mb-1">Obrigatório</p>
                                    <p className="font-body text-xs text-red-700 leading-relaxed">
                                        O link do Darkclub é o único campo obrigatório para publicação. Redes sociais são opcionais — se vazias, os ícones somem.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* ─── IDENTIDADE ─────────────────────────────────────── */}
                        <section className="mb-8">
                            <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-5 flex items-center gap-3">
                                <span className="flex-1 h-px bg-black/10" />
                                Identidade
                                <span className="flex-1 h-px bg-black/10" />
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <FieldLabel required>Nome da Modelo</FieldLabel>
                                    <TextInput
                                        id="name"
                                        value={form.name}
                                        onChange={set('name')}
                                        placeholder="Ex: Sofia Laurent"
                                        error={errors.name}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>Subtítulo / Cidade · Nicho</FieldLabel>
                                    <TextInput
                                        id="subtitle"
                                        value={form.subtitle}
                                        onChange={set('subtitle')}
                                        placeholder="Ex: Paris · Model & Art Director"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ─── BIO ────────────────────────────────────────────── */}
                        <section className="mb-8">
                            <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-5 flex items-center gap-3">
                                <span className="flex-1 h-px bg-black/10" />
                                Bio Editorial
                                <span className="flex-1 h-px bg-black/10" />
                            </p>
                            <FieldLabel>Texto</FieldLabel>
                            <TextArea
                                id="bio"
                                value={form.bio}
                                onChange={set('bio')}
                                placeholder="Escreva em terceira pessoa. Separe parágrafos com uma linha em branco."
                                rows={8}
                            />
                            <p className="font-body text-[9px] text-black/30 mt-1">
                                Dica: separe parágrafos com uma linha em branco para o layout editorial.
                            </p>
                        </section>

                        {/* ─── MÍDIA ──────────────────────────────────────────── */}
                        <section className="mb-8">
                            <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-5 flex items-center gap-3">
                                <span className="flex-1 h-px bg-black/10" />
                                Mídia
                                <span className="flex-1 h-px bg-black/10" />
                            </p>
                            <div className="space-y-5">
                                <div>
                                    <FieldLabel>Foto Capa (9:16 — URL)</FieldLabel>
                                    <TextInput
                                        id="heroImage"
                                        value={form.heroImage}
                                        onChange={set('heroImage')}
                                        placeholder="https://..."
                                        error={errors.heroImage}
                                    />
                                    {form.heroImage && !errors.heroImage && (
                                        <div className="mt-2 w-20 border border-black/10 overflow-hidden" style={{ aspectRatio: '9/16' }}>
                                            <img src={form.heroImage} alt="preview" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <FieldLabel>Vídeo Living Portrait (URL .mp4)</FieldLabel>
                                    <TextInput
                                        id="videoUrl"
                                        value={form.videoUrl}
                                        onChange={set('videoUrl')}
                                        placeholder="https://..."
                                        error={errors.videoUrl}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* ─── GALERIA ────────────────────────────────────────── */}
                        <section className="mb-8">
                            <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-2 flex items-center gap-3">
                                <span className="flex-1 h-px bg-black/10" />
                                Galeria Editorial (até 6 fotos)
                                <span className="flex-1 h-px bg-black/10" />
                            </p>
                            <p className="font-body text-[9px] text-black/30 mb-5">
                                Defina tamanho, alinhamento e legenda para controlar o ritmo assimétrico.
                            </p>

                            {/* Legend */}
                            <div className="flex flex-wrap gap-4 mb-6">
                                {[['Grande', 'Sangrada 100%', 'bg-black'], ['Média', 'Offset assim.', 'bg-black/40'], ['Pequena', 'Quadrado disc.', 'bg-black/15']].map(([l, d, bg]) => (
                                    <div key={l} className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-sm ${bg}`} />
                                        <div><p className="font-body text-[9px] tracking-[0.2em] uppercase text-black/60">{l}</p><p className="font-body text-[8px] text-black/30">{d}</p></div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {form.gallery.map((item, i) => (
                                    <div key={i} className="border border-black/8 p-4 bg-white space-y-3">
                                        {/* Size */}
                                        <div className="flex items-center justify-between">
                                            <p className="font-body text-[9px] tracking-[0.35em] uppercase text-black/40">Foto {i + 1}</p>
                                            <div className="flex gap-1">
                                                {['large', 'medium', 'small'].map(sz => (
                                                    <button key={sz} type="button"
                                                        onClick={() => setGalleryField(i, 'size')({ target: { value: sz } })}
                                                        className={`font-body text-[8px] tracking-[0.15em] uppercase px-2 py-1 border transition-colors ${item.size === sz ? 'bg-black text-white border-black' : 'bg-white text-black/35 border-black/15 hover:border-black/50'}`}>
                                                        {sz === 'large' ? 'G' : sz === 'medium' ? 'M' : 'P'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* URL */}
                                        <TextInput id={`gallery-url-${i}`} value={item.url} onChange={setGalleryField(i, 'url')} placeholder="https://..." />
                                        {/* Alignment */}
                                        <div>
                                            <p className="font-body text-[8px] tracking-[0.3em] uppercase text-black/30 mb-1">Alinhamento</p>
                                            <div className="flex gap-1">
                                                {[['left', '← Esq.'], ['center', '■ Ctr'], ['right', 'Dir. →']].map(([al, lbl]) => (
                                                    <button key={al} type="button"
                                                        onClick={() => setGalleryField(i, 'alignment')({ target: { value: al } })}
                                                        className={`flex-1 font-body text-[8px] tracking-[0.1em] uppercase py-1 border transition-colors ${item.alignment === al ? 'bg-black text-white border-black' : 'bg-white text-black/35 border-black/15 hover:border-black/40'}`}>
                                                        {lbl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Caption */}
                                        <div>
                                            <p className="font-body text-[8px] tracking-[0.3em] uppercase text-black/30 mb-1">Legenda Editorial</p>
                                            <input type="text" value={item.caption ?? ''}
                                                onChange={setGalleryField(i, 'caption')}
                                                placeholder="Ex: Paris, Outono de 2025"
                                                className="w-full border border-black/15 bg-white font-display italic text-sm text-black/70 placeholder-black/20 px-3 py-2 focus:outline-none focus:border-black transition-colors" />
                                        </div>
                                        {/* Thumbnail */}
                                        {item.url && (
                                            <div className="border border-black/8 overflow-hidden" style={{ width: '48px', aspectRatio: item.size === 'small' ? '1/1' : item.size === 'large' ? '16/9' : '3/4' }}>
                                                <img src={item.url} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* ─── LINKS ──────────────────────────────────────────── */}
                        <section className="mb-8">
                            <p className="font-body text-[9px] tracking-[0.5em] uppercase text-black/30 mb-5 flex items-center gap-3">
                                <span className="flex-1 h-px bg-black/10" />
                                Links & Redes
                                <span className="flex-1 h-px bg-black/10" />
                            </p>
                            <div className="space-y-5">
                                <div>
                                    <FieldLabel required>Link Darkclub (obrigatório para publicar)</FieldLabel>
                                    <TextInput
                                        id="darkclubLink"
                                        value={form.darkclubLink}
                                        onChange={set('darkclubLink')}
                                        placeholder="https://darkclub.com/..."
                                        error={errors.darkclubLink}
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <FieldLabel>Instagram</FieldLabel>
                                        <TextInput
                                            id="instaLink"
                                            value={form.instaLink}
                                            onChange={set('instaLink')}
                                            placeholder="https://instagram.com/..."
                                            error={errors.instaLink}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>TikTok</FieldLabel>
                                        <TextInput
                                            id="tiktokLink"
                                            value={form.tiktokLink}
                                            onChange={set('tiktokLink')}
                                            placeholder="https://tiktok.com/..."
                                            error={errors.tiktokLink}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>WhatsApp</FieldLabel>
                                        <TextInput
                                            id="whatsappLink"
                                            value={form.whatsappLink}
                                            onChange={set('whatsappLink')}
                                            placeholder="https://wa.me/55..."
                                            error={errors.whatsappLink}
                                        />
                                    </div>
                                </div>
                                <p className="font-body text-[9px] text-black/30">
                                    Redes opcionais — se vazias, os ícones somem automaticamente na página da modelo.
                                </p>
                            </div>
                        </section>

                        {/* ─── AÇÃO FINAL ─────────────────────────────────────── */}
                        <div className="flex items-center gap-4 pt-6 border-t border-black/10">
                            <button
                                onClick={handleSave}
                                className={`flex-1 font-body text-[11px] tracking-[0.4em] uppercase py-4 transition-all duration-300 font-semibold ${saved
                                    ? 'bg-green-600 text-white'
                                    : 'bg-black text-white hover:bg-black/80'
                                    }`}
                            >
                                {saved ? '✓ Publicado com sucesso!' : isNew ? 'Publicar Nova Modelo' : 'Salvar Alterações'}
                            </button>
                            {selectedSlug && !isNew && (
                                <Link
                                    to={`/modelo/${selectedSlug}`}
                                    target="_blank"
                                    className="border border-black/20 text-black font-body text-[10px] tracking-[0.35em] uppercase px-5 py-4 hover:bg-black hover:text-white transition-colors duration-200 whitespace-nowrap"
                                >
                                    Visualizar ↗
                                </Link>
                            )}
                        </div>

                        {/* ─── RODAPÉ DE AUTENTICIDADE ───────────────────────── */}
                        <div className="mt-10 border-t border-black/5 pt-6 text-center">
                            <p className="font-body text-[9px] tracking-[0.35em] uppercase text-black/20">
                                ✦ Identidade Verificada por Curadoria Darkclub – Autenticidade Garantida ✦
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* ── CONFIRM DELETE MODAL ─────────────────────────────────────── */}
            {confirmDelete && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center px-4">
                    <div className="bg-white max-w-sm w-full p-8 text-center">
                        <h2 className="font-display font-black text-2xl uppercase mb-2">Excluir?</h2>
                        <p className="font-body text-sm text-black/50 mb-6 leading-relaxed">
                            Tem certeza que deseja excluir <strong>{form.name}</strong>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmDelete(false)}
                                className="flex-1 border border-black/20 font-body text-[10px] tracking-[0.3em] uppercase py-3 hover:bg-black/5 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 text-white font-body text-[10px] tracking-[0.3em] uppercase py-3 hover:bg-red-700 transition-colors"
                            >
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MOBILE SIDEBAR (select) ──────────────────────────────────── */}
            <div className="md:hidden fixed bottom-16 left-0 right-0 bg-white border-t border-black/10 px-4 py-3 z-40 flex items-center gap-3">
                <select
                    className="flex-1 border border-black/20 bg-white font-body text-sm text-black px-3 py-2 focus:outline-none"
                    value={isNew ? '__new__' : selectedSlug ?? ''}
                    onChange={(e) => {
                        if (e.target.value === '__new__') { setIsNew(true); setSelectedSlug(null); }
                        else { setSelectedSlug(e.target.value); setIsNew(false); }
                    }}
                >
                    {models.map((m) => (
                        <option key={m.slug} value={m.slug}>{m.name}</option>
                    ))}
                    <option value="__new__">+ Nova Modelo</option>
                </select>
                <button
                    onClick={handleSave}
                    className="bg-black text-white font-body text-[10px] tracking-[0.3em] uppercase px-4 py-2"
                >
                    Salvar
                </button>
            </div>
        </div>
    );
}
