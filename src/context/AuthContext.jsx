import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // ── Fetch profile from profiles table ────────────────────
    async function fetchProfile(userId) {
        if (!supabase) return null;
        console.log('[Auth] Fetching profile for user:', userId);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) console.error('[Auth] Fetch profile error:', error);
        else console.log('[Auth] Profile fetched:', data);
        return data;
    }

    // ── Listen to auth state ─────────────────────────────────
    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session }, error }) => {
            if (error) {
                console.error('[Auth] Initial session error:', error);
                setLoading(false);
                return;
            }
            const u = session?.user ?? null;
            setUser(u);
            if (u) {
                fetchProfile(u.id)
                    .then(p => { setProfile(p); setLoading(false); })
                    .catch(e => { console.error('[Auth] Initial profile fetch error:', e); setLoading(false); });
            } else {
                setLoading(false);
            }
        }).catch(err => {
            console.error('[Auth] Unexpected getSession error:', err);
            setLoading(false);
        });

        // Subscribe to changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const u = session?.user ?? null;
                setUser(u);
                if (u) {
                    try {
                        const p = await fetchProfile(u.id);
                        setProfile(p);
                    } catch (err) {
                        console.error('[Auth] Profile fetch error on AuthStateChange:', err);
                        setProfile(null);
                    }
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // ── Auth actions ─────────────────────────────────────────

    async function signIn(email, password) {
        console.log('[Auth] signIn called for email:', email);
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) {
                console.error('[Auth] signIn error:', error);
            } else if (data && data.user) {
                console.log('[Auth] signIn success, fetching profile...');
                const p = await fetchProfile(data.user.id);
                setProfile(p);
                console.log('[Auth] signIn complete.');
            }
            return { data, error };
        } catch (err) {
            console.error('[Auth] Unexpected signIn exception:', err);
            return { error: { message: 'Erro inesperado ao realizar login.' } };
        }
    }

    async function signUp(email, password, displayName, magazineName, slug) {
        console.log('[Auth] signUp called for email:', email);
        if (!supabase) return { error: { message: 'Supabase not configured' } };

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { display_name: displayName } },
            });

            if (error) {
                console.error('[Auth] signUp error:', error);
                return { data, error };
            }

            console.log('[Auth] signUp Supabase Auth success:', data.user?.id);
            // MVP: set session immediately — no email confirmation gate
            if (data.user) {
                setUser(data.user);

                // Wait for profile to be created via trigger before inserting model, or insert the model immediately
                // Insert model into models table to reserve the slug
                console.log('[Auth] Attempting to insert initial model with slug:', slug);
                const { error: modelError } = await supabase.from('models').insert({
                    slug: slug,
                    name: magazineName,
                    owner_id: data.user.id,
                    published: false
                });

                if (modelError) {
                    console.error('[Auth] Error inserting initial model:', modelError);
                } else {
                    console.log('[Auth] Initial model inserted successfully.');
                }

                console.log('[Auth] Fetching profile...');
                const p = await fetchProfile(data.user.id);
                setProfile(p);
                console.log('[Auth] signUpcomplete.');
            }
            return { data, error };
        } catch (err) {
            console.error('[Auth] Unexpected signUp exception:', err);
            return { error: { message: 'Erro inesperado ao criar conta.' } };
        }
    }

    async function signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
    }

    const role = profile?.role ?? null;
    const isAdmin = role === 'admin';
    const isModelo = role === 'modelo';
    const darkclubVerified = profile?.darkclub_verified ?? false;

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            role,
            isAdmin,
            isModelo,
            darkclubVerified,
            loading,
            signIn,
            signUp,
            signOut,
            isConfigured: isSupabaseConfigured(),
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
