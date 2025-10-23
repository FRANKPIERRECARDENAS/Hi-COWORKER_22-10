/* "use server"; */

import { redirect } from "next/navigation";
import { signInWithPassword, signOut, signUp } from "./server";

export async function login(prevState, formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    const validatedFields = FormAuthSchema.safeParse({
        email,
        password,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const error = await signInWithPassword(email, password);

    if (error) {
        return { message: error };
    }

    redirect("/home");
}

export async function register(prevState, formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    // Validación de los campos
    const validatedFields = FormAuthSchema.safeParse({
        email,
        password,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    // Llama a la función signUp del servidor para registrar el usuario
    const error = await signUp(email, password);

    if (error) {
        return { message: error };
    }

    // Redirige a la página de inicio si el registro es exitoso
    redirect("/home");
}

export async function logout(prevState) {
    const error = await signOut();
    if (error) {
        return { message: error };
    }
    redirect("/login");
}
