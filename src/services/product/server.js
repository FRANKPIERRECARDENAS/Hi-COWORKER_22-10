"use server";

import { supabase } from "@/config/supabase";
import { revalidatePath } from "next/cache";

export async function revalidateProduct() {
    revalidatePath("/team", "page");
}

export async function addProductServer() {
    const { data, error } = await supabase
        .from("usuarios")
        .insert([{
            nombre: "uno",
            apellido: "uno",
            genero: "uno",
            correo: "uno@uno.com",
            rol: "123456789",

        }])
        .select();

    const errorMessage = error?.message;

    return { data, errorMessage };

}

// // router.refresh();
// // setEmail('');
// // setPassword('');
// //lógica de registro de usuario en la base de datos en la tabla usuarios
// const fechaNacimiento = `${selectedDay}-${selectedMonth}-${selectedYear}`;
// await supabase.from('usuarios')
//     .insert([
//         {
//             nombre: "uno",
//             apellido: "uno",
//             fecha_nacimiento: Date.now(),
//             genero: "uno",
//             correo: "uno@uno.com",
//             rol: "123456789",
//             intereses: selectedInterests,
//         },
//     ])
//     .select()
export async function editProductServer(id, categoryId, name, description) {
    const { data, error } = await supabase
        .from("products")
        .update([{ id_category: categoryId, name, description }])
        .eq("id", id)
        .select();

    const errorMessage = error?.message;

    return { data, errorMessage };
}

export async function deleteProductServer(id) {
    const { error } = await supabase.from("products").delete().eq("id", id);

    const errorMessage = error?.message;

    return { errorMessage };
}

export async function getCountProductServer(query, rows) {
    const { count } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .ilike("name", `%${query}%`);

    return count == null ? 0 : Math.ceil(count / rows);
}

export async function getAllProductByRangeServer(currentPage, query, rows) {
    const initialPosition = rows * (currentPage - 1);
    const lastPosition = rows * currentPage - 1;

    const { data: products } = await supabase
        .rpc("get_all_products_categories_stock")
        .ilike("name", `%${query}%`)
        .select("*")
        .range(initialPosition, lastPosition)
        .order("name");

    return products;
}

export async function getAllProductServer() {
    const { data: products } = await supabase
        .from("products")
        .select("*")
        .order("name");
    return products;
}

export async function getUniqueProductServer(id) {
    const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

    return data;
}

export async function getAllProductCountQuantityServer() {
    const { data: products } = await supabase
        .rpc("get_all_products_categories_stock")
        .select("*")
        .order("name");

    return products;
}
