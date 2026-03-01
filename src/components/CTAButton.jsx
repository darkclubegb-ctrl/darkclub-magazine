/*
  CTA — Final element of the scroll.
  Black solid rectangle — full width — white typography.
  Mobile-first responsive padding.
*/
export default function CTAButton({ darkclubLink }) {
    if (!darkclubLink) return null;

    return (
        <section
            className="w-full bg-brand-white"
            style={{ padding: 'clamp(40px, 8vw, 80px) clamp(16px, 5vw, 120px) 0' }}
        >
            {/* Thin line above */}
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.08)', marginBottom: 'clamp(32px, 5vw, 60px)' }} />

            {/* Label above button */}
            <p
                className="font-body uppercase text-black/25 text-center mb-5"
                style={{ fontSize: '7px', letterSpacing: '0.6em' }}
            >
                Acesso Exclusivo
            </p>

            {/* THE BUTTON — black solid rectangle, full width */}
            <a
                href={darkclubLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-black text-white text-center"
                style={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '10px',
                    fontWeight: 500,
                    letterSpacing: '0.55em',
                    textTransform: 'uppercase',
                    padding: '22px 0',
                    textDecoration: 'none',
                    transition: 'background 0.35s ease',
                    cursor: 'pointer',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#111'}
                onMouseLeave={e => e.currentTarget.style.background = '#000'}
            >
                Acessar Darkclub
            </a>

            {/* Bottom spacer */}
            <div style={{ height: 'clamp(40px, 6vw, 80px)' }} />
        </section>
    );
}
