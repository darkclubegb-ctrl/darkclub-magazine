import { useState, useEffect } from 'react';

const AGE_GATE_KEY = 'darkclub_age_confirmed';

export default function AgeGate({ children }) {
    const [confirmed, setConfirmed] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (localStorage.getItem(AGE_GATE_KEY) === 'true') {
            setConfirmed(true);
        }
        // Trigger fade after paint
        requestAnimationFrame(() => setMounted(true));
    }, []);

    const handleEnter = () => {
        localStorage.setItem(AGE_GATE_KEY, 'true');
        setConfirmed(true);
    };

    const handleLeave = () => {
        window.location.href = 'https://www.google.com';
    };

    if (confirmed) return children;

    return (
        <div
            className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center"
            style={{
                opacity: mounted ? 1 : 0,
                transition: 'opacity 1.2s ease',
            }}
        >
            {/*
              Pure white screen — "entering a private club in Paris"
              No modal, no card, no shadow. Just space, text, and a button.
            */}

            {/* Logo / brand */}
            <p
                className="font-display uppercase text-black"
                style={{
                    fontWeight: 300,
                    fontSize: 'clamp(1rem, 3vw, 1.4rem)',
                    letterSpacing: '0.55em',
                    marginBottom: '4rem',
                    opacity: 0.85,
                }}
            >
                Darkclub
            </p>

            {/* 18+ mark — ultra minimalist */}
            <p
                className="font-display text-black"
                style={{
                    fontWeight: 300,
                    fontSize: 'clamp(5rem, 16vw, 10rem)',
                    letterSpacing: '-0.05em',
                    lineHeight: 1,
                    marginBottom: '1.5rem',
                }}
            >
                18+
            </p>

            {/* Thin rule */}
            <div
                className="bg-black/15"
                style={{ width: '40px', height: '1px', marginBottom: '2.5rem' }}
            />

            {/* Subtitle */}
            <p
                className="font-body text-black/40 text-center"
                style={{
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    maxWidth: '280px',
                    lineHeight: '1.7',
                    marginBottom: '3.5rem',
                }}
            >
                Conteúdo para maiores de 18 anos.
                <br />Por favor confirme sua idade.
            </p>

            {/* Enter button — ghost style */}
            <button
                onClick={handleEnter}
                className="font-body uppercase text-black border border-black"
                style={{
                    fontSize: '9px',
                    letterSpacing: '0.5em',
                    padding: '16px 40px',
                    background: 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease, color 0.3s ease',
                    marginBottom: '1rem',
                }}
                onMouseEnter={e => { e.target.style.background = '#000'; e.target.style.color = '#fff'; }}
                onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = '#000'; }}
            >
                Enter the Club
            </button>

            {/* Leave link */}
            <button
                onClick={handleLeave}
                className="font-body text-black/25"
                style={{
                    fontSize: '9px',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    marginTop: '8px',
                }}
            >
                Sair
            </button>

            {/* Bottom seal */}
            <p
                className="absolute bottom-8 font-body uppercase text-black/15"
                style={{ fontSize: '7px', letterSpacing: '0.4em' }}
            >
                ✦ Darkclub · Paris · 2026 ✦
            </p>
        </div>
    );
}
