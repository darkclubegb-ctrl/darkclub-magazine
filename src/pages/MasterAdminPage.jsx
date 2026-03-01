import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useMagazine } from '../context/MagazineContext';

export default function MasterAdminPage() {
    const { user, isAdmin, signOut } = useAuth();
    const { models, deleteModel } = useMagazine();
    const [confirmDelete, setConfirmDelete] = useState(null);

    return (
        <main className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-black/8" style={{ padding: 'clamp(16px, 3vw, 24px) clamp(16px, 4vw, 40px)' }}>
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div>
                        <p className="font-display uppercase text-black" style={{ fontWeight: 300, fontSize: '1rem', letterSpacing: '0.4em' }}>
                            Darkclub
                        </p>
                        <p className="font-body uppercase text-black/25" style={{ fontSize: '7px', letterSpacing: '0.35em' }}>
                            Master Admin
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="font-body text-black/30 hidden md:block" style={{ fontSize: '10px' }}>
                            {user?.email}
                        </p>
                        <button
                            onClick={signOut}
                            className="font-body uppercase text-black/30 border border-black/15 px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                            style={{ fontSize: '8px', letterSpacing: '0.3em' }}
                        >
                            Sair
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto" style={{ padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4vw, 40px)' }}>

                {/* Stats bar */}
                <div className="flex flex-wrap gap-8 mb-10">
                    {[
                        { label: 'Total Modelos', value: models.length },
                        { label: 'Publicadas', value: models.filter(m => m.published !== false).length },
                        { label: 'Rascunho', value: models.filter(m => m.published === false).length },
                    ].map(s => (
                        <div key={s.label}>
                            <p className="font-display text-black" style={{ fontWeight: 300, fontSize: '2rem', letterSpacing: '-0.02em' }}>
                                {s.value}
                            </p>
                            <p className="font-body uppercase text-black/25" style={{ fontSize: '8px', letterSpacing: '0.4em' }}>
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        to="/admin/edit"
                        className="bg-black text-white font-body uppercase px-5 py-2.5 transition-colors hover:bg-black/85"
                        style={{ fontSize: '9px', letterSpacing: '0.4em' }}
                    >
                        + Nova Modelo
                    </Link>
                </div>

                {/* Model list */}
                <div className="space-y-4">
                    {models.map(model => (
                        <div
                            key={model.slug}
                            className="border border-black/8 bg-white flex flex-col md:flex-row items-start md:items-center gap-4 p-4"
                        >
                            {/* Thumbnail */}
                            {model.heroImage && (
                                <div className="w-12 h-16 overflow-hidden flex-shrink-0 border border-black/8">
                                    <img src={model.heroImage} alt="" className="w-full h-full object-cover" />
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className="font-display uppercase text-black text-lg" style={{ fontWeight: 600 }}>
                                    {model.name}
                                </h3>
                                <p className="font-body text-black/35" style={{ fontSize: '11px' }}>
                                    /{model.slug} · {model.subtitle}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                                <span className={`inline-block w-2 h-2 rounded-full ${model.published !== false ? 'bg-green-500' : 'bg-black/15'}`} />
                                <p className="font-body uppercase text-black/30" style={{ fontSize: '8px', letterSpacing: '0.3em' }}>
                                    {model.published !== false ? 'Publicada' : 'Rascunho'}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <Link
                                    to={`/modelo/${model.slug}`}
                                    className="font-body uppercase text-black/30 border border-black/15 px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                                    style={{ fontSize: '8px', letterSpacing: '0.2em' }}
                                >
                                    Ver
                                </Link>
                                <Link
                                    to={`/admin/edit?slug=${model.slug}`}
                                    className="font-body uppercase text-black/30 border border-black/15 px-3 py-1.5 hover:bg-black hover:text-white transition-colors"
                                    style={{ fontSize: '8px', letterSpacing: '0.2em' }}
                                >
                                    Editar
                                </Link>
                                {confirmDelete === model.slug ? (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => { deleteModel(model.slug); setConfirmDelete(null); }}
                                            className="font-body uppercase text-white bg-red-600 px-3 py-1.5 hover:bg-red-700 transition-colors"
                                            style={{ fontSize: '8px', letterSpacing: '0.2em' }}
                                        >
                                            Confirmar
                                        </button>
                                        <button
                                            onClick={() => setConfirmDelete(null)}
                                            className="font-body uppercase text-black/30 border border-black/15 px-2 py-1.5"
                                            style={{ fontSize: '8px' }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setConfirmDelete(model.slug)}
                                        className="font-body uppercase text-red-400 border border-red-200 px-3 py-1.5 hover:bg-red-600 hover:text-white hover:border-red-600 transition-colors"
                                        style={{ fontSize: '8px', letterSpacing: '0.2em' }}
                                    >
                                        Excluir
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {models.length === 0 && (
                    <div className="text-center py-20">
                        <p className="font-display italic text-black/20 text-xl mb-4">Nenhuma modelo ainda.</p>
                        <Link to="/admin/edit" className="font-body uppercase text-black/40 border border-black/15 px-5 py-2 hover:bg-black hover:text-white transition-colors" style={{ fontSize: '9px', letterSpacing: '0.3em' }}>
                            Criar Primeira
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
