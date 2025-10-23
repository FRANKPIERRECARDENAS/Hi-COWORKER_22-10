import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  const res = NextResponse.next();

  // Rutas que requieren autenticación
  const authRequired = ["/home", "/team", "/crea", "/community"];

  // Rutas a las que no se debe acceder con sesión iniciada
  const noAuthRequired = ["/login", "/register"];

  const supabase = createMiddlewareClient({ req, res });

  // Obtiene la sesión actual
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const currentPath = `/${req.nextUrl.pathname.split("/")[1]}`;

  // Si no hay sesión y se está intentando acceder a una ruta protegida
  if (!session && authRequired.includes(currentPath)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Si hay sesión y se intenta acceder a una ruta de no autenticación
  if (session && noAuthRequired.includes(currentPath)) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  // Permitir acceso a "/" independientemente de la sesión
  if (currentPath === "/") {
    return res;
  }

  return res;
}