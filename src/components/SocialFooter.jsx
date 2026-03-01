// Minimal SVG icons
const InstagramIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
);

const TikTokIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.95a8.16 8.16 0 004.78 1.52V7.03a4.85 4.85 0 01-1.01-.34z" />
    </svg>
);

const WhatsAppIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
);

export default function SocialFooter({ model }) {
    const hasAny = model.instaLink || model.tiktokLink || model.whatsappLink;

    return (
        <section className="w-full bg-brand-black" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>
            <div
                className="mx-auto text-center"
                style={{ maxWidth: '560px', paddingLeft: 'clamp(32px, 8vw, 80px)', paddingRight: 'clamp(32px, 8vw, 80px)' }}
            >
                {/* Decorative vertical line */}
                <div className="w-px bg-white/10 mx-auto mb-12" style={{ height: '64px' }} />

                {/* Connect label */}
                <p className="font-body uppercase text-white/20 mb-10" style={{ fontSize: '7px', letterSpacing: '0.65em' }}>
                    Connect
                </p>

                {/* Social icons — ghost style */}
                {hasAny && (
                    <div className="flex items-center justify-center gap-10 mb-14">
                        {model.instaLink && (
                            <a
                                href={model.instaLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/30 hover:text-white transition-colors duration-400"
                                aria-label="Instagram"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <InstagramIcon />
                            </a>
                        )}
                        {model.tiktokLink && (
                            <a
                                href={model.tiktokLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/30 hover:text-white transition-colors duration-400"
                                aria-label="TikTok"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <TikTokIcon />
                            </a>
                        )}
                        {model.whatsappLink && (
                            <a
                                href={model.whatsappLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-white/30 hover:text-white transition-colors duration-400"
                                aria-label="WhatsApp"
                                style={{ pointerEvents: 'auto' }}
                            >
                                <WhatsAppIcon />
                            </a>
                        )}
                    </div>
                )}

                {/* Model name watermark */}
                <h3
                    className="font-display uppercase text-white/6 leading-none mb-12"
                    style={{
                        fontWeight: 300,
                        fontSize: 'clamp(2rem, 8vw, 5rem)',
                        letterSpacing: '-0.03em',
                    }}
                >
                    {model.name}
                </h3>

                {/* Authentication seal */}
                <div className="border border-white/8 py-4 px-6 mb-8 inline-block">
                    <p className="font-body uppercase text-white/20" style={{ fontSize: '7px', letterSpacing: '0.35em' }}>
                        ✦ Zero Fake · Identidade Verificada por Curadoria Darkclub – Autenticidade Garantida ✦
                    </p>
                </div>

                {/* Copyright */}
                <p className="font-body uppercase text-white/10" style={{ fontSize: '7px', letterSpacing: '0.3em' }}>
                    © 2026 Darkclub – All rights reserved.
                </p>

                {/* Bottom space */}
                <div style={{ height: '24px' }} />
            </div>
        </section>
    );
}
