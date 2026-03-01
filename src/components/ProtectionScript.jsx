/*
  ProtectionScript — Segurança de conteúdo visual
  ─────────────────────────────────────────────────
  - Bloqueia clique direito em imagens e vídeos
  - Bloqueia arrastar imagens
  - Bloqueia atalhos de print screen comuns
  - Bloqueia seleção de texto sobre imagens
  Roda como componente React sem renderizar nada visível.
*/
import { useEffect } from 'react';

export default function ProtectionScript() {
    useEffect(() => {
        // ── Bloquear clique direito globalmente ──────────────────────────
        const blockContextMenu = (e) => {
            const tag = e.target.tagName?.toLowerCase();
            if (tag === 'img' || tag === 'video') {
                e.preventDefault();
                return false;
            }
        };

        // ── Bloquear arrastar imagens ────────────────────────────────────
        const blockDragStart = (e) => {
            const tag = e.target.tagName?.toLowerCase();
            if (tag === 'img' || tag === 'video') {
                e.preventDefault();
                return false;
            }
        };

        // ── Bloquear atalhos de save/print ──────────────────────────────
        const blockKeyShortcuts = (e) => {
            // Ctrl+S, Ctrl+P, Ctrl+Shift+I (devtools), F12
            if (
                (e.ctrlKey && (e.key === 's' || e.key === 'S')) ||
                (e.ctrlKey && (e.key === 'p' || e.key === 'P')) ||
                (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'I')) ||
                e.key === 'F12'
            ) {
                e.preventDefault();
            }
        };

        // ── CSS: reforço global via style injection ──────────────────────
        const style = document.createElement('style');
        style.id = 'darkclub-protection';
        style.innerHTML = `
            img, video {
                -webkit-user-drag: none;
                user-drag: none;
                -webkit-user-select: none;
                user-select: none;
                -khtml-user-drag: none;
                -moz-user-drag: none;
                -o-user-drag: none;
            }
        `;
        if (!document.getElementById('darkclub-protection')) {
            document.head.appendChild(style);
        }

        document.addEventListener('contextmenu', blockContextMenu);
        document.addEventListener('dragstart', blockDragStart);
        document.addEventListener('keydown', blockKeyShortcuts);

        return () => {
            document.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('dragstart', blockDragStart);
            document.removeEventListener('keydown', blockKeyShortcuts);
            document.getElementById('darkclub-protection')?.remove();
        };
    }, []);

    return null;
}
