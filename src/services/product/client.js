import { FormProductSchema } from "@/models/zod_schema";
import {
    addProductServer,
    deleteProductServer,
    editProductServer,
    revalidateProduct,
} from "./server";
// import { showToast } from "@/components/toast";
// import { TypeToast } from "@/models/enum_models";
import { redirect } from "next/navigation";

export async function addProduct(prevState, formData) {
    const categoryId = formData.get("categoryId");
    const name = formData.get("name");
    const description = formData.get("description");

    const validatedFields = FormProductSchema.safeParse({
        categoryId,
        name,
        description,
    });

    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { data, errorMessage } = await addProductServer(
        categoryId,
        name,
        description
    );

    if (!data || errorMessage) {
        return { message: errorMessage || "An error occurred" };
    }

    // showToast("Added Product", TypeToast.SUCCESS);

    await revalidateProduct();
    redirect("/team");
}

// export async function editProduct(prevState, formData) {
//     const id = formData.get("id");
//     const categoryId = formData.get("categoryId");
//     const name = formData.get("name");
//     const description = formData.get("description");

//     const validatedFields = FormProductSchema.safeParse({
//         categoryId,
//         name,
//         description,
//     });

//     if (!validatedFields.success) {
//         return {
//             errors: validatedFields.error.flatten().fieldErrors,
//         };
//     }

//     const { data, errorMessage } = await editProductServer(
//         id,
//         categoryId,
//         name,
//         description
//     );

//     if (!data || errorMessage) {
//         return { message: errorMessage || "An error occurred" };
//     }

//     showToast("Edited Product", TypeToast.SUCCESS);

//     await revalidateProduct();
//     redirect("/products");
// }

// export async function deleteProduct(prevState, formData) {
//     const id = formData.get("id");

//     const { errorMessage } = await deleteProductServer(id);

//     if (errorMessage) {
//         return { message: errorMessage || "An error occurred" };
//     }

//     showToast("Deleted Product", TypeToast.ERROR);

//     await revalidateProduct();
//     redirect("/products");
// }
