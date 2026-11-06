import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

let pending: Promise<Session> | null = null;

export function ensureSession(): Promise<Session>{
    if(!pending){
        const setSession = async () => {
            //Use saved session
            const {data, error} = await supabase.auth.getSession();
            if(error){
                throw error;
            }
            if(data.session){
                return data.session;
            }

            //Create new session for new anonymous user
            const {data: signIn, error: signInError } = await supabase.auth.signInAnonymously();
            if(signInError){
                throw signInError;
            }
            if(!signIn.session){
                throw new Error('Faield ot create new user session');
            }
            return signIn.session;
        }

        pending = setSession();
        pending.catch(() => {pending = null;});
    }
    return pending;
}