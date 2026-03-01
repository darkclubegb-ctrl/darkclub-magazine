// ============================================================
// MODEL DATA — Dossiê Digital Completo
//
// gallery items: { url, size, alignment, caption }
//   size:      'large' | 'medium' | 'small'
//   alignment: 'left'  | 'center' | 'right'
//
// storytelling: [ { eyebrow, heading, text } ]  — max 3 entries
//
// cinemaVideos: [ { type, url, label, duration } ]
//   type: 'living-portrait' | 'short-film'
//   url:  video URL (living-portrait = loop/muted; short-film = full audio)
// ============================================================
export const models = [
    {
        slug: "sofia-laurent",
        name: "Sofia Laurent",
        subtitle: "Paris · Model & Art Director",
        editionTitle: "A Força da Natureza",

        bio: `Sofia Laurent começou sua trajetória nas passarelas de Paris aos dezesseis anos, quando foi descoberta por um dos maiores agentes da moda europeia durante uma vernissage no Marais. Sua presença magnética e olhar calculado a tornaram presença obrigatória nas editoriais das maiores revistas do continente.`,

        heroImage: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=900&q=90&fit=crop",

        // ── 3 Storytelling entries ──────────────────────────────
        storytelling: [
            {
                eyebrow: "O Manifesto",
                heading: "Eu não escolhi a moda.\nA moda me escolheu.",
                text: `Tinha 14 anos quando me vi parada na frente de um espelho de corpo inteiro num estúdio improvável no bairro do Marais. O fotógrafo disse apenas: "Olha pra câmera como se o mundo devesse a você uma explicação." Nunca mais me senti pequena desde então. Esse dossiê é um mapa do que aconteceu depois daquele momento.`,
            },
            {
                eyebrow: "O Ensaio",
                heading: "Cada foto é uma declaração.",
                text: `O ensaio que você vê aqui foi feito em três dias. Três dias de silêncio, concreto e luz natural. Sem retoques excessivos. Sem filtros que escondam a textura da pele ou a sombra nos olhos. Acredito que autenticidade é o único luxo que não se copia. Cada imagem aqui conta uma parte da história que ainda estou escrevendo.`,
            },
            {
                eyebrow: "O Encerramento",
                heading: "O silêncio também é uma pose.",
                text: `Quando o set se esvazia e as luzes se apagam, o que sobra é o que você carrega consigo. Essa é a fase que nenhuma câmera captura — mas que define tudo o que aparece na frente dela. Obrigada por entrar nesse universo comigo. Há mais páginas sendo escritas.`,
            },
        ],

        // ── 9-photo asymmetric gallery ──────────────────────────
        gallery: [
            // Act I — Abertura (fotos 1–3)
            { url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1400&q=90&fit=crop", size: "large", alignment: "center", caption: "Paris, Printemps 2025" },
            { url: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800&q=90&fit=crop", size: "small", alignment: "right", caption: "" },
            { url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=90&fit=crop", size: "medium", alignment: "left", caption: "Maison Marais" },

            // Act II — O Ensaio (fotos 4–6)
            { url: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=1400&q=90&fit=crop", size: "large", alignment: "center", caption: "" },
            { url: "https://images.unsplash.com/photo-1519742866993-66d3cfef4bbd?w=800&q=90&fit=crop", size: "small", alignment: "left", caption: "Automne 2025" },
            { url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=900&q=90&fit=crop", size: "medium", alignment: "right", caption: "Studio Session" },

            // Act III — Encerramento (fotos 7–9)
            { url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1400&q=90&fit=crop", size: "large", alignment: "center", caption: "Le Finale" },
            { url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800&q=90&fit=crop", size: "medium", alignment: "left", caption: "" },
            { url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=90&fit=crop", size: "small", alignment: "right", caption: "Regard Final" },
        ],

        // ── Cinema: 3 Living Portraits + 2 Short Films ─────────
        cinemaVideos: [
            { type: "living-portrait", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Living Portrait I" },
            { type: "living-portrait", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Living Portrait II" },
            { type: "living-portrait", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Living Portrait III" },
            { type: "short-film", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Bastidores — O Ensaio", duration: "3:42" },
            { type: "short-film", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Uma Tarde em Paris", duration: "4:15" },
        ],

        darkclubLink: "https://darkclub.com",
        instaLink: "https://instagram.com",
        tiktokLink: "https://tiktok.com",
        whatsappLink: "https://wa.me/5511999999999",
        published: true,
    },

    {
        slug: "isabella-voss",
        name: "Isabella Voss",
        subtitle: "Berlin · Visual Artist & Model",
        editionTitle: "Minimalismo Urbano",

        bio: `Isabella Voss cresceu entre os galpões industriais de Berlim-Mitte, onde a arte e a noite se fundem em algo impossível de classificar. Filha de arquiteta e músico, desenvolveu desde cedo um olhar clínico para a estética do espaço vazio, do silêncio entre formas.`,

        heroImage: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=900&q=90&fit=crop",

        storytelling: [
            {
                eyebrow: "A Origem",
                heading: "O vazio também é uma forma de arte.",
                text: `Cresci entre concreto e silêncio. Minha mãe é arquiteta — ela me ensinou que o espaço vazio dentro de um projeto não é ausência, é intenção. Aprendi a aplicar isso ao corpo, ao olhar, ao enquadramento. Cada foto minha é uma arquitetura de silêncio.`,
            },
            {
                eyebrow: "A Matéria",
                heading: "Berlim é o estúdio mais honesto do mundo.",
                text: `Não preciso de cenários. A cidade é o cenário. As paredes descascadas de Mitte, o reflexo do asfalto molhado depois da chuva, a luz fria de janeiro que não perdoa imperfeições — essa é a iluminação que escolho. Porque a imperfeição é onde a beleza mora, escondida.`,
            },
            {
                eyebrow: "O Legado",
                heading: "Raridade é a forma mais pura de luxo.",
                text: `Acredito que presença online é uma moeda que se deprecia quando gasta em excesso. Este dossiê existe para os que sabem olhar. Para quem entende que o silêncio entre as palavras é tão importante quanto as palavras em si. Obrigada por fazer parte desse seleto grupo.`,
            },
        ],

        gallery: [
            // Act I
            { url: "https://images.unsplash.com/photo-1496440737103-cd596325d314?w=1400&q=90&fit=crop", size: "large", alignment: "center", caption: "Berlin, Winter 2025" },
            { url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=90&fit=crop", size: "medium", alignment: "right", caption: "" },
            { url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=90&fit=crop", size: "small", alignment: "left", caption: "Mitte Studio" },

            // Act II
            { url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1400&q=90&fit=crop", size: "large", alignment: "center", caption: "" },
            { url: "https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=800&q=90&fit=crop", size: "small", alignment: "right", caption: "Herbst 2025" },
            { url: "https://images.unsplash.com/photo-1542740348-39501cd6e2b4?w=900&q=90&fit=crop", size: "medium", alignment: "left", caption: "" },

            // Act III
            { url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1400&q=90&fit=crop", size: "large", alignment: "center", caption: "Letzte Tage" },
            { url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=90&fit=crop", size: "medium", alignment: "right", caption: "" },
            { url: "https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=800&q=90&fit=crop", size: "small", alignment: "left", caption: "Finales Bild" },
        ],

        cinemaVideos: [
            { type: "living-portrait", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Living Portrait I" },
            { type: "living-portrait", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Living Portrait II" },
            { type: "living-portrait", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Living Portrait III" },
            { type: "short-film", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Noite em Mitte", duration: "4:02" },
            { type: "short-film", url: "https://www.w3schools.com/html/mov_bbb.mp4", label: "Silêncio Urbano", duration: "3:28" },
        ],

        darkclubLink: "https://darkclub.com",
        instaLink: "https://instagram.com",
        tiktokLink: null,
        whatsappLink: "https://wa.me/5511999999999",
        published: true,
    },
];
