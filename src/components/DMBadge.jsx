export default function DMBadge() {
    return (
        <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
            <p style={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '6px',
                letterSpacing: '3px',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.2)',
                userSelect: 'none',
                whiteSpace: 'nowrap',
            }}>
                D-M Signature ✦
            </p>
        </div>
    );
}
