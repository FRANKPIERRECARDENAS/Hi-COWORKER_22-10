import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const toCapitalCase = (text) =>
  text
      .toLowerCase() // Asegura que todo esté en minúscula
      .split(' ')    // Divide en palabras
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitaliza cada palabra
      .join(' ');    // Une las palabras