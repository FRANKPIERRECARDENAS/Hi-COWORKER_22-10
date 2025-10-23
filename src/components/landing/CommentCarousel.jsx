import Image from "next/image";
import { useState, useEffect } from "react";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi"; // Para los iconos de navegación

// Comentarios de ejemplo
const comments = [
    {
        id: 1,
        text: "¡Este chat es increíble! Me encanta cómo puedo conectar con otros emprendedores y los retos me mantienen motivado.",
        author: "Juan Pérez",
        role: "Emprendedor",
    },
    {
        id: 2,
        text: "Los retos interactivos realmente me ayudaron a mejorar mis habilidades y aprender cosas nuevas. ¡Recomendado!",
        author: "María López",
        role: "Fundadora de Startup",
    },
    {
        id: 3,
        text: "La comunidad de emprendedores aquí es fantástica, siempre aprendiendo y compartiendo experiencias.",
        author: "Carlos García",
        role: "Mentor de Negocios",
    },
    {
        id: 4,
        text: "Me gusta la variedad de retos y cómo se adaptan a diferentes niveles. ¡Es una excelente forma de crecer profesionalmente!",
        author: "Sofía Rodríguez",
        role: "Desarrolladora Freelance",
    },
    {
        id: 5,
        text: "Me gusta la variedad de retos y cómo se adaptan a diferentes niveles. ¡Es una excelente forma de crecer profesionalmente!",
        author: "Sofía Rodríguez",
        role: "Desarrolladora Freelance",
    },
];

const CommentCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Cambiar al siguiente comentario
    const nextComment = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === comments.length - 1 ? 0 : prevIndex + 1
        );
    };

    // Cambiar al comentario anterior
    const prevComment = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? comments.length - 1 : prevIndex - 1
        );
    };

    return (
        <div className="relative max-w-4xl mx-auto my-12 p-6 rounded-lg ">
            <div className="absolute top-[50%] -translate-y-[100%] left-0 right-0 flex justify-between px-4 py-2">
                <button
                    onClick={prevComment}
                    className="text-xl text-gray-700 hover:text-primary transition-all duration-300"
                >
                    <FiArrowLeft className="text-white" />
                </button>
                <button
                    onClick={nextComment}
                    className="text-xl text-gray-700 hover:text-primary transition-all duration-300"
                >
                    <FiArrowRight className="text-white" />
                </button>
            </div>

            <div className="flex justify-center items-center">
                {/* Carrusel de comentarios */}
                <div className="w-full overflow-hidden">
                    <div
                        className="transition-transform duration-500 ease-in-out flex"
                        style={{
                            transform: `translateX(-${currentIndex * 100/comments.length}%)`, // Desplazamiento correcto
                            width: `${comments.length * 100}%`, // Establece el ancho total basado en el número de comentarios
                        }}
                    >
                        {comments.map((comment) => (
                            <div
                                key={comment.id}
                                className="flex-shrink-0 flex items-start justify-center px-8 py-4 max-w-lg mx-auto backdrop-blur-sm rounded-lg shadow-md mb-8"
                            >
                                <div className="flex flex-col items-start justify-center">
                                <p className="text-lg text-white italic">"{comment.text}"</p>
                                <div className="mt-4 text-center">
                                    <p className="text-xl font-semibold text-gray-100">
                                        {comment.author}
                                    </p>
                                    <p className="text-sm text-gray-200">{comment.role}</p>
                                </div>
                                </div>
                                
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default CommentCarousel;
