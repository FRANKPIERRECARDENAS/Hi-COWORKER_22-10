"use client";

import { IoInvertMode } from "react-icons/io5";
import { useState, useEffect } from "react";

export default function ThemeToggle() {
    const [theme, setTheme] = useState("light"); // Inicializar con 'light'

    // Cargar el tema desde localStorage al iniciar
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            setTheme(savedTheme);
            document.body.classList.add(savedTheme); // Aplicar tema guardado en el body
        } else {
            // Si no hay tema guardado, asegurarse de que sea 'light'
            setTheme("light");
            document.body.classList.add("light");
        }
    }, []);

    // Cambiar tema y guardarlo en localStorage
    const toggleTheme = () => {
        // Alternar entre los temas: light y dark
        const newTheme = theme === "dark" ? "light" : "dark";
        setTheme(newTheme);

        // Remover todas las clases de tema antes de agregar la nueva
        document.body.classList.remove("dark", "light");
        document.body.classList.add(newTheme);

        // Guardar el tema en localStorage
        localStorage.setItem("theme", newTheme);
    };

    return (
        <button className="items-center" onClick={toggleTheme}>
            <IoInvertMode className="text-3xl" />
        </button>
    );
}
