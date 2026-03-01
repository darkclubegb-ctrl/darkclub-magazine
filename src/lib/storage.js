/**
 * storage.js — Darkclub Media Upload Layer
 * ─────────────────────────────────────────
 * Wraps Supabase Storage for photo + video uploads.
 * Bucket: 'media'  (create in Supabase Storage dashboard)
 *
 * RLS Policies required (see supabase-rls.sql):
 *   - authenticated users: INSERT + SELECT on bucket 'media'
 */
import { supabase } from './supabase';

const BUCKET = 'media';

/**
 * Upload a file to Supabase Storage.
 * Returns { url, error }.
 * @param {File}     file       - The File object from <input>
 * @param {string}   folder     - e.g. 'photos', 'portraits', 'films'
 * @param {string}   userId     - supabase user.id (path prefix)
 * @param {Function} onProgress - callback(percent: 0-100)
 */
export async function uploadMedia(file, folder, userId, onProgress) {
    if (!supabase) return { url: null, error: 'Supabase não configurado.' };

    const ext = file.name.split('.').pop();
    const filename = `${userId}/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Supabase JS v2 does not expose upload progress natively via the SDK.
    // We use XMLHttpRequest for real progress reporting.
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const arrayBuffer = ev.target.result;

            // Use XHR for progress
            const xhr = new XMLHttpRequest();
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            if (!token) {
                resolve({ url: null, error: 'Sessão expirada. Faça login novamente.' });
                return;
            }

            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const uploadUrl = `${supabaseUrl}/storage/v1/object/${BUCKET}/${filename}`;

            xhr.open('POST', uploadUrl);
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            xhr.setRequestHeader('Content-Type', file.type);
            xhr.setRequestHeader('x-upsert', 'true');

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    onProgress(Math.round((e.loaded / e.total) * 100));
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Build public URL
                    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
                    resolve({ url: data.publicUrl, error: null });
                } else {
                    resolve({ url: null, error: `Erro ${xhr.status}: ${xhr.responseText}` });
                }
            };

            xhr.onerror = () => resolve({ url: null, error: 'Falha de rede durante o upload.' });
            xhr.send(arrayBuffer);
        };
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Save dossier data to the 'models' table (upsert by slug).
 */
export async function saveDossier(slug, payload) {
    if (!supabase) return { error: 'Supabase não configurado.' };
    const { error } = await supabase
        .from('models')
        .upsert({ slug, ...payload }, { onConflict: 'slug' });
    return { error };
}
