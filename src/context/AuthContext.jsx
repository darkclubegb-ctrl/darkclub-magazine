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
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();
        return data;
    }

    // ── Listen to auth state ─────────────────────────────────
    useEffect(() => {
        if (!isSupabaseConfigured()) {
            setLoading(false);
            return;
        }

        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const u = session?.user ?? null;
            setUser(u);
            if (u) {
                fetchProfile(u.id).then(p => { setProfile(p); setLoading(false); });
            } else {
                setLoading(false);
            }
        });

        // Subscribe to changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                const u = session?.user ?? null;
                setUser(u);
                if (u) {
                    const p = await fetchProfile(u.id);
                    setProfile(p);
                } else {
                    setProfile(null);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // ── Auth actions ─────────────────────────────────────────

    async function signIn(email, password) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) {
            const p = await fetchProfile(data.user.id);
            setProfile(p);
        }
        return { data, error };
    }

    async function signUp(email, password, displayName, magazineName, slug) {
        if (!supabase) return { error: { message: 'Supabase not configured' } };
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName } },
        });
        // MVP: set session immediately — no email confirmation gate
        if (!error && data.user) {
            setUser(data.user);

            // Wait for profile to be created via trigger before inserting model, or insert the model immediately
            // Insert model into models table to reserve the slug
            const { error: modelError } = await supabase.from('models').insert({
                slug: slug,
                name: magazineName,
                owner_id: data.user.id,
                published: false
            });

            if (modelError) {
                console.error('Error inserting initial model:', modelError);
            }

            const p = await fetchProfile(data.user.id);
            setProfile(p);
        }
        return { data, error };
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
