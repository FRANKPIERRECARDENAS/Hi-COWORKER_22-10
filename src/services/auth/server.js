"use server";

import { supabase } from "@/config/supabase";
// Función para iniciar sesión
export async function signInWithPassword(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    return error?.message;
}
// Función para registrar un usuario
export async function signUp(email, password) {

    if (!email || !password) {
        setError('Email and password are required');
        return;
    }

    await supabase.auth.signUp({
        email: email,
        password: password,
    })
    router.refresh();
    setEmail('');
    setPassword('');
}
// Función para cerrar sesión
export async function signOut() {
    const { error } = await supabase.auth.signOut();

    return error?.message;
}
