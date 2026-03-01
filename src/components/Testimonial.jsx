export default function Testimonial({ quote, author }) {
    return (
        <section className="max-w-2xl mx-auto my-12 px-6 md:px-12" style={{ textAlign: 'center' }}>
            <blockquote className="relative" style={{ fontFamily: '"Playfair Display", serif', fontStyle: 'italic', fontSize: 'clamp(1.2rem,4vw,2rem)', color: '#000', lineHeight: '1.4' }}>
                <span style={{ position: 'absolute', left: '-1.5rem', top: '-0.5rem', fontSize: '3rem', color: '#999' }}>&ldquo;</span>
                {quote}
                <span style={{ position: 'absolute', right: '-1.5rem', bottom: '-0.5rem', fontSize: '3rem', color: '#999' }}>&rdquo;</span>
            </blockquote>
            {author && (
                <p className="mt-4" style={{ fontFamily: '"Inter", sans-serif', fontSize: '0.875rem', color: '#333' }}>
                    — {author}
                </p>
            )}
        </section>
    );
}
