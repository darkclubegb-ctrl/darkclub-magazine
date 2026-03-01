import { Link } from 'react-router-dom';
import { useMagazine } from '../context/MagazineContext';

export default function IndexPage() {
    const { models } = useMagazine();

    return (
        <main className="min-h-screen bg-brand-white">

            {/* ── HEADER ─────────────────────────────────────────────────── */}
            <header className="px-8 md:px-16 pt-14 pb-10 border-b border-black/8">
                <div className="max-w-6xl mx-auto flex items-baseline justify-between">
                    <div>
                        <p
                            className="font-body uppercase text-black/25 mb-2"
                            style={{ fontSize: '8px', letterSpacing: '0.55em' }}
                        >
                            Dark Editorial
                        </p>
                        <h1
                            className="font-display font-black uppercase leading-none"
                            style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}
                        >
                            The Models
                        </h1>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <p
                            className="font-body uppercase text-black/25 hidden md:block"
                            style={{ fontSize: '8px', letterSpacing: '0.35em' }}
                        >
                            No. 001 · 2026
                        </p>
                        <Link
                            to="/admin/edit"
                            className="font-body text-[9px] tracking-[0.35em] uppercase text-black/30 border border-black/15 px-3 py-1.5 hover:bg-black hover:text-white transition-colors duration-200"
                        >
                            Admin ↗
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── MODEL GRID ─────────────────────────────────────────────── */}
            <div className="max-w-6xl mx-auto px-8 md:px-16 py-16">
                {models.length === 0 ? (
                    <div className="text-center py-24">
                        <p className="font-display italic text-black/20 text-2xl mb-4">Nenhuma modelo publicada ainda.</p>
                        <Link
                            to="/admin/edit"
                            className="inline-block font-body text-[10px] tracking-[0.4em] uppercase bg-black text-white px-6 py-3 hover:bg-black/80 transition-colors"
                        >
                            Ir para o Admin
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-10">
                        {models.map((model, i) => (
                            <Link
                                key={model.slug}
                                to={`/modelo/${model.slug}`}
                                className="group block"
                            >
                                {/* Image with passepartout */}
                                <div
                                    className="overflow-hidden mb-6 passepartout"
                                    style={{ aspectRatio: '3 / 4' }}
                                >
                                    <img
                                        src={model.heroImage}
                                        alt={model.name}
                                        className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                                        draggable="false"
                                    />
                                </div>

                                {/* Metadata */}
                                <div className="flex items-start justify-between px-1">
                                    <div>
                                        <p
                                            className="font-body uppercase text-black/25 mb-2"
                                            style={{ fontSize: '8px', letterSpacing: '0.45em' }}
                                        >
                                            {String(i + 1).padStart(2, '0')}
                                        </p>
                                        <h2 className="font-display font-bold text-2xl md:text-3xl uppercase leading-tight group-hover:italic transition-all duration-300">
                                            {model.name}
                                        </h2>
                                        <p
                                            className="font-body text-black/35 mt-1"
                                            style={{ fontSize: '11px' }}
                                        >
                                            {model.subtitle}
                                        </p>
                                    </div>
                                    <p
                                        className="font-body uppercase text-black/20 mt-1 group-hover:text-black/60 transition-colors duration-300"
                                        style={{ fontSize: '9px', letterSpacing: '0.3em' }}
                                    >
                                        Ver →
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* ── FOOTER ─────────────────────────────────────────────────── */}
            <footer className="border-t border-black/8 px-8 md:px-16 py-10 mt-10">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
                    <p
                        className="font-body uppercase text-black/20"
                        style={{ fontSize: '8px', letterSpacing: '0.35em' }}
                    >
                        © 2026 Darkclub Digital Magazine
                    </p>
                    <p className="font-display italic text-black/15 text-sm">
                        Luxury · Exclusive · Editorial
                    </p>
                    <p
                        className="font-body uppercase text-black/15"
                        style={{ fontSize: '7px', letterSpacing: '0.35em' }}
                    >
                        ✦ Identidade Verificada por Curadoria Darkclub – Autenticidade Garantida ✦
                    </p>
                </div>
            </footer>
        </main>
    );
}
