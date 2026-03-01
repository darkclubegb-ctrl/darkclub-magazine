import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { models as seedModels } from '../data/models';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// ─────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────
const MagazineContext = createContext(null);

// ─────────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────────
function reducer(state, action) {
    switch (action.type) {
        case 'SET_MODELS':
            return { ...state, models: action.payload, loading: false };
        case 'UPDATE_MODEL':
            return {
                ...state,
                models: state.models.map((m) =>
                    m.slug === action.payload.slug ? { ...m, ...action.payload } : m
                ),
            };
        case 'ADD_MODEL':
            return { ...state, models: [...state.models, action.payload] };
        case 'DELETE_MODEL':
            return {
                ...state,
                models: state.models.filter((m) => m.slug !== action.payload),
            };
        default:
            return state;
    }
}

// ─────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────
export function MagazineProvider({ children }) {
    const [state, dispatch] = useReducer(reducer, { models: seedModels, loading: true });

    // ── Fetch from Supabase ─────────────────────────────────
    const fetchModels = useCallback(async () => {
        if (!isSupabaseConfigured()) {
            dispatch({ type: 'SET_MODELS', payload: seedModels });
            return;
        }

        const { data, error } = await supabase
            .from('models')
            .select('*, gallery_photos(*)')
            .order('created_at', { ascending: false });

        if (error || !data?.length) {
            // Fallback to seed data if Supabase has no models yet
            dispatch({ type: 'SET_MODELS', payload: seedModels });
            return;
        }

        // Transform Supabase format → app format
        const transformed = data.map(m => ({
            slug: m.slug,
            name: m.name,
            subtitle: m.subtitle || '',
            editionTitle: m.edition_title || '',
            bio: m.bio || '',
            heroImage: m.hero_image || '',
            videoUrl: m.video_url || '',
            darkclubLink: m.darkclub_link || '',
            instaLink: m.insta_link || '',
            tiktokLink: m.tiktok_link || '',
            whatsappLink: m.whatsapp_link || '',
            published: m.published,
            owner_id: m.owner_id,
            // Storytelling: stored as JSONB array in Supabase
            storytelling: Array.isArray(m.storytelling) ? m.storytelling
                : (typeof m.storytelling === 'string' ? JSON.parse(m.storytelling || '[]') : []),
            // CinemaVideos: stored as JSONB array in Supabase
            cinemaVideos: Array.isArray(m.cinema_videos) ? m.cinema_videos
                : (typeof m.cinema_videos === 'string' ? JSON.parse(m.cinema_videos || '[]') : []),
            gallery: (m.gallery_photos || [])
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(p => ({
                    url: p.url,
                    size: p.size || 'medium',
                    alignment: p.alignment || 'center',
                    caption: p.caption || '',
                })),
        }));

        dispatch({ type: 'SET_MODELS', payload: transformed });
    }, []);

    useEffect(() => { fetchModels(); }, [fetchModels]);

    // ── Actions ─────────────────────────────────────────────

    const updateModel = async (modelData) => {
        dispatch({ type: 'UPDATE_MODEL', payload: modelData });

        if (isSupabaseConfigured()) {
            const { slug, gallery, ...rest } = modelData;
            // Map camelCase → snake_case for Supabase
            await supabase.from('models').update({
                name: rest.name,
                subtitle: rest.subtitle,
                bio: rest.bio,
                hero_image: rest.heroImage,
                video_url: rest.videoUrl,
                darkclub_link: rest.darkclubLink,
                insta_link: rest.instaLink,
                tiktok_link: rest.tiktokLink,
                whatsapp_link: rest.whatsappLink,
                published: rest.published,
                updated_at: new Date().toISOString(),
            }).eq('slug', slug);
        }
    };

    const addModel = (modelData) =>
        dispatch({ type: 'ADD_MODEL', payload: modelData });

    const deleteModel = async (slug) => {
        dispatch({ type: 'DELETE_MODEL', payload: slug });

        if (isSupabaseConfigured()) {
            await supabase.from('models').delete().eq('slug', slug);
        }
    };

    return (
        <MagazineContext.Provider value={{
            models: state.models,
            loading: state.loading,
            updateModel,
            addModel,
            deleteModel,
            refreshModels: fetchModels,
        }}>
            {children}
        </MagazineContext.Provider>
    );
}

// ─────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────
export function useMagazine() {
    const ctx = useContext(MagazineContext);
    if (!ctx) throw new Error('useMagazine must be used inside MagazineProvider');
    return ctx;
}
