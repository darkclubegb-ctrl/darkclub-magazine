import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { signIn, signUp, isConfigured } = useAuth();
    const navigate = useNavigate();

    const [mode, setMode] = useState(() => {
        // Allow ?mode=register from buy buttons
        const params = new URLSearchParams(window.location.search);
        return params.get('mode') === 'register' ? 'register' : 'login';
    });
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [magazineName, setMagazineName] = useState(''); // New field for slug
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const slugify = (text) => {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (!isConfigured) {
            setError('Supabase não configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY ao .env');
            setLoading(false);
            return;
        }

        try {
            if (mode === 'login') {
                const { data, error: err } = await signIn(email, password);
                if (err) {
                    setError(err.message);
                    return; // setLoading is done in finally
                }
                // Redirect based on role — profile is already loaded by AuthContext
                // Small delay to let profile load
                setTimeout(() => navigate('/dashboard'), 300);
            } else {
                if (!acceptedTerms) {
                    setError('Você precisa marcar o aceite dos Termos de Uso e Autorização de Imagem.');
                    return;
                }

                const generatedSlug = slugify(magazineName);
                if (!generatedSlug) {
                    setError('Nome da revista inválido.');
                    return;
                }

                const { data, error: err } = await signUp(email, password, displayName, magazineName, generatedSlug);
                if (err) {
                    setError(err.message);
                    return;
                }
                setSuccess('Bem-vinda ao Darkclub! ✦ Preparando sua revista...');
                // MVP: redirect immediately — no email confirmation required
                setTimeout(() => navigate('/dashboard'), 900);
            }
        } catch (err) {
            console.error('Unexpected error during auth:', err);
            setError('Ocorreu um erro inesperado.');
        } finally {
            // Ensures button does not stay locked in 'loading' state
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-white flex items-center justify-center px-6">
            <div className="w-full" style={{ maxWidth: '360px' }}>

                {/* Brand */}
                <div className="text-center mb-12">
                    <p
                        className="font-display uppercase text-black"
                        style={{ fontWeight: 300, fontSize: '1.2rem', letterSpacing: '0.5em', marginBottom: '0.5rem' }}
                    >
                        Darkclub
                    </p>
                    <p
                        className="font-body uppercase text-black/25"
                        style={{ fontSize: '7px', letterSpacing: '0.45em' }}
                    >
                        Digital Magazine
                    </p>
                </div>

                {/* Thin rule */}
                <div className="h-px bg-black/10 mb-10" />

                {/* Mode toggle */}
                <div className="flex mb-8">
                    {['login', 'register'].map(m => (
                        <button
                            key={m}
                            onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                            className={`flex-1 font-body text-center uppercase py-2 border-b-2 transition-colors ${mode === m ? 'text-black border-black' : 'text-black/25 border-transparent'
                                }`}
                            style={{ fontSize: '9px', letterSpacing: '0.4em' }}
                        >
                            {m === 'login' ? 'Entrar' : 'Criar Conta'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">

                    {mode === 'register' && (
                        <>
                            <div>
                                <label className="font-body uppercase text-black/30 block mb-1" style={{ fontSize: '8px', letterSpacing: '0.35em' }}>
                                    Nome
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={e => setDisplayName(e.target.value)}
                                    required
                                    className="w-full border border-black/15 bg-white font-body text-sm text-black px-3 py-3 focus:outline-none focus:border-black transition-colors"
                                    placeholder="Seu nome artístico"
                                />
                            </div>
                            <div>
                                <label className="font-body uppercase text-black/30 block mb-1 mt-4" style={{ fontSize: '8px', letterSpacing: '0.35em' }}>
                                    Nome da sua Revista (Obrigatório)
                                </label>
                                <input
                                    type="text"
                                    value={magazineName}
                                    onChange={e => setMagazineName(e.target.value)}
                                    required
                                    className="w-full border border-black/15 bg-white font-body text-sm text-black px-3 py-3 focus:outline-none focus:border-black transition-colors"
                                    placeholder="Ex: @seunome"
                                />
                                {magazineName && (
                                    <p className="font-body text-black/40 mt-1" style={{ fontSize: '10px' }}>
                                        Link: darkclub.com/modelo/<span className="text-black font-medium">{slugify(magazineName)}</span>
                                    </p>
                                )}
                            </div>
                        </>
                    )}

                    <div>
                        <label className="font-body uppercase text-black/30 block mb-1" style={{ fontSize: '8px', letterSpacing: '0.35em' }}>
                            E-mail
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="w-full border border-black/15 bg-white font-body text-sm text-black px-3 py-3 focus:outline-none focus:border-black transition-colors"
                            placeholder="exemplo@email.com"
                        />
                    </div>

                    <div>
                        <label className="font-body uppercase text-black/30 block mb-1" style={{ fontSize: '8px', letterSpacing: '0.35em' }}>
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full border border-black/15 bg-white font-body text-sm text-black px-3 py-3 focus:outline-none focus:border-black transition-colors"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Error / Success */}
                    {error && (
                        <p className="font-body text-red-600 text-xs">{error}</p>
                    )}
                    {success && (
                        <p className="font-body text-green-700 text-xs">{success}</p>
                    )}

                    {/* Terms Checkbox */}
                    {mode === 'register' && (
                        <label className="flex items-start gap-3 mt-4 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={acceptedTerms}
                                onChange={(e) => setAcceptedTerms(e.target.checked)}
                                className="mt-1 flex-shrink-0"
                                required
                            />
                            <span className="font-body text-black/60" style={{ fontSize: '9px', lineHeight: '1.6', letterSpacing: '0.05em' }}>
                                (Obrigatório) Aceito os <span style={{ textDecoration: 'underline' }}>Termos de Uso</span>, a <span style={{ textDecoration: 'underline' }}>Autorização de Imagem</span> e compreendo a Política Zero Fake do Darkclub.
                            </span>
                        </label>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white font-body uppercase text-center py-3 transition-colors hover:bg-black/85 disabled:opacity-40"
                        style={{ fontSize: '9px', letterSpacing: '0.5em' }}
                    >
                        {loading ? '...' : mode === 'login' ? 'Entrar' : 'Criar Conta'}
                    </button>
                </form>

                {/* Bottom seal */}
                <p
                    className="text-center mt-12 font-body uppercase text-black/15"
                    style={{ fontSize: '7px', letterSpacing: '0.4em' }}
                >
                    ✦ Darkclub · Paris · 2026 ✦
                </p>
            </div>
        </main>
    );
}
