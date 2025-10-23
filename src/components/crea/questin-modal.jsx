import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, ChevronRight, ChevronLeft } from "lucide-react";

const HELP_CONTENT = {
    1: {
        title: "Nivel 1: Explorador de Problemas",
        content: `La importancia de identificar problemas reales es el primer paso hacia la creación de un negocio sostenible. 

Puntos clave:
• Habla con las personas y escucha sus experiencias
• Observa cómo resuelven sus problemas
• Evita suposiciones
• Desarrolla empatía para comprender mejor
• Evalúa el impacto del problema en la comunidad

Recuerda: El éxito en los negocios comienza con la capacidad de identificar problemas que merecen una solución y tienen un impacto real en la comunidad.`
    },
    2: {
        title: "Nivel 2: Diseñador de Propuestas",
        content: `Una propuesta de valor es la esencia de lo que tu idea de negocio ofrecerá de manera única.

Elementos clave:
• Define una propuesta de valor única
• Enfócate en la solución, no en el producto
• Evita replicar ideas existentes
• Explica tu propuesta con claridad

Tu propuesta debe responder: "¿Por qué alguien debería elegir mi solución en lugar de otra?"`
    },
    3: {
        title: "Nivel 3: Validador de Ideas",
        content: `La validación de ideas confirma que tu propuesta tiene potencial antes de invertir demasiado.

Pasos importantes:
• Crea un MVP (Producto Mínimo Viable)
• Obtén retroalimentación inicial
• Mejora y ajusta según los comentarios

La validación te ayuda a reducir riesgos y construir una propuesta más fuerte.`
    },
    4: {
        title: "Nivel 4: Constructor de Modelos de Negocio",
        content: `Un modelo de negocio describe cómo tu propuesta generará y capturará valor.

Aspectos clave:
• Define tu cliente objetivo
• Estructura tu propuesta de valor
• Establece canales de conexión y venta
• Estima la estructura de costos
• Define la fuente de ingresos

Un modelo sólido asegura que tu idea sea económicamente viable.`
    },
    5: {
        title: "Nivel 5: Estratega de Crecimiento y Escalabilidad",
        content: `Escalar significa hacer crecer tu negocio manteniendo la calidad.

Elementos importantes:
• Identifica y entiende tu mercado objetivo
• Mejora y adapta tu propuesta de valor
• Asegura la escalabilidad del modelo
• Fortalece canales y relaciones
• Considera alianzas estratégicas
• Monitorea métricas de crecimiento
• Planifica para la sostenibilidad

El crecimiento debe ser controlado y sostenible.`
    }
};


export default function QuestionModal({
    isOpen,
    onClose,
    currentLevel,
    questions,
    selectedAnswers,
    setSelectedAnswers,
    onComplete,
    onFileUpload,
    levelInfo,
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [shuffledQuestions, setShuffledQuestions] = useState([]);
    const [helpModalOpen, setHelpModalOpen] = useState(false);

    const [incompleteQuestions, setIncompleteQuestions] = useState([]);

    const currentHelpContent = HELP_CONTENT[currentLevel] || {
        title: "Ayuda",
        content: "Contenido no disponible para este nivel."
    };

    // Shuffle questions
    useEffect(() => {
        setShuffledQuestions(shuffleAndSortQuestions([...questions]));
    }, [questions]);

    // Shuffle array utility
    const shuffleAndSortQuestions = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Group and sort by tipo_respuesta
        const opcion = shuffled.filter((q) => q.tipo_respuesta === "opcion");
        const texto = shuffled.filter((q) => q.tipo_respuesta === "texto");
        const cargar = shuffled.filter((q) => q.tipo_respuesta === "cargar");

        return [...opcion, ...texto, ...cargar];
    };

    const currentQuestion = shuffledQuestions[currentQuestionIndex];

    const handleNext = () => {
        if (currentQuestionIndex < shuffledQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            handleComplete();
        }
    };

    const handleBack = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    const handleComplete = () => {
        const unanswered = shuffledQuestions.filter(
            (question) => !selectedAnswers[question.id_pregunta]
        );

        if (unanswered.length > 0) {
            setIncompleteQuestions(unanswered.map((q) => q.texto_pregunta));
            return;
        }

        onComplete();
    };

    const isOptionSelected = (questionId, optionId) => {
        return selectedAnswers[questionId] === optionId;
    };

    const countAnsweredQuestions = () => {
        return Object.keys(selectedAnswers).length;
    };
    console.log(currentLevel)

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-[800px] p-0 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-blue-600 dark:bg-zinc-900  text-white p-3 rounded-t-lg">
                            {levelInfo?.nombre_nivel || "NIVEL 1"}
                        </DialogTitle>
                        <p className="text-sm text-white bg-blue-500/80 dark:bg-zinc-500/80 p-1 px-3 ">
                            Para pasar al siguiente nivel necesitas contestar al menos <span className="font-semibold">6 respuestas correctas</span>.
                        </p>
                    </DialogHeader>


                    <div className="px-6 pb-6">
                        <div className="bg-gradient-to-br from-blue-600 via-blue-700  dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900  to-purple-800  p-6 rounded-lg text-white relative">
                            <div className="flex justify-end items-center gap-2 -mt-2 hover:text-blue-200 cursor-pointer mb-4" onClick={() => setHelpModalOpen(true)}>
                                <span className="text-sm font-medium">¿De qué trata el nivel?</span>
                                <BookOpen className="text-white" size={24} />
                            </div>




                            <div className="space-y-4">
                                {currentQuestion ? (
                                    <>
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-sm">
                                                Pregunta {currentQuestionIndex + 1} de {shuffledQuestions.length}

                                            </span>
                                            <span className="text-sm">
                                                Respondidas: {countAnsweredQuestions()}
                                            </span>
                                        </div>

                                        <p className="font-semibold mb-4">{currentQuestion.texto_pregunta}</p>

                                        <div className="space-y-3">
                                            {currentQuestion.tipo_respuesta === "opcion" && (
                                                <div className="space-y-2">
                                                    {currentQuestion.opciones?.map((option, idx) => (
                                                        <div
                                                            key={option.id_opcion}
                                                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors duration-200 ${isOptionSelected(
                                                                currentQuestion.id_pregunta,
                                                                option.id_opcion
                                                            )
                                                                ? "bg-blue-300 text-blue-900"
                                                                : "bg-white/10 hover:bg-white/20"
                                                                }`}
                                                            onClick={() =>
                                                                setSelectedAnswers({
                                                                    ...selectedAnswers,
                                                                    [currentQuestion.id_pregunta]: option.id_opcion,
                                                                })
                                                            }
                                                        >
                                                            <div
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${isOptionSelected(
                                                                    currentQuestion.id_pregunta,
                                                                    option.id_opcion
                                                                )
                                                                    ? "bg-blue-500 text-white"
                                                                    : "bg-white/20"
                                                                    }`}
                                                            >
                                                                {String.fromCharCode(65 + idx)}
                                                            </div>
                                                            <span>{option.texto_opcion}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {currentQuestion.tipo_respuesta === "texto" && (
                                                <Textarea
                                                    placeholder="Escribe tu respuesta aquí"
                                                    value={selectedAnswers[currentQuestion.id_pregunta] || ""}
                                                    onChange={(e) =>
                                                        setSelectedAnswers({
                                                            ...selectedAnswers,
                                                            [currentQuestion.id_pregunta]: e.target.value,
                                                        })
                                                    }
                                                    className="bg-white/10 border-0 text-white placeholder:text-white/70"
                                                />
                                            )}

                                            {currentQuestion.tipo_respuesta === "cargar" && (
                                                <div className="flex items-center justify-center bg-white/10 p-4 rounded-lg">
                                                    <label className="cursor-pointer">
                                                        <span>Subir archivo</span>
                                                        <Input
                                                            type="file"
                                                            onChange={(e) =>
                                                                onFileUpload(e.target.files[0], currentQuestion.id_pregunta)
                                                            }
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-red-500">No hay preguntas disponibles</p>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 mt-4">
                            <Button
                                onClick={handleBack}
                                disabled={currentQuestionIndex === 0}
                                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white disabled:opacity-50"
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Anterior
                            </Button>

                            <Button
                                onClick={handleNext}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {currentQuestionIndex < shuffledQuestions.length - 1 ? (
                                    <>
                                        Siguiente
                                        <ChevronRight className="ml-2 h-4 w-4" />
                                    </>
                                ) : (
                                    "Completar Nivel"
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Ayuda */}
            <Dialog open={helpModalOpen} onOpenChange={() => setHelpModalOpen(false)}>
                <DialogContent className="sm:max-w-[600px] p-0 bg-gradient-to-br dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 from-blue-600 via-blue-700 to-purple-800">
                    <DialogHeader className="p-6">
                        <DialogTitle className="text-2xl font-bold text-white mb-4">
                            {currentHelpContent.title}
                        </DialogTitle>
                        <DialogDescription className="text-base whitespace-pre-line text-white/90 bg-white/10 p-4 rounded-lg">
                            {currentHelpContent.content}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="p-6 pt-0">
                        <Button
                            onClick={() => setHelpModalOpen(false)}
                            className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/20"
                        >
                            Cerrar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Modal de Preguntas Incompletas */}
            {incompleteQuestions.length > 0 && (
                <Dialog open={true} onOpenChange={() => setIncompleteQuestions([])}>
                    <DialogContent className="bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 ">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-white">
                                Faltan Preguntas
                            </DialogTitle>
                            <DialogDescription className="text-white/90">
                                Aún no has respondido las siguientes preguntas:
                            </DialogDescription>
                        </DialogHeader>
                        {/* Lista fuera del DialogDescription */}
                        <div className="mt-4 bg-white/10 rounded-lg p-4">
                            <ul className="list-disc list-inside space-y-2 text-white">
                                {incompleteQuestions.map((q, idx) => (
                                    <li key={idx} className="text-sm">{q}</li>
                                ))}
                            </ul>
                        </div>
                        <Button
                            onClick={() => setIncompleteQuestions([])}
                            className="mt-4 bg-white/20 hover:bg-white/30 text-white border border-white/20 w-full"
                        >
                            Cerrar
                        </Button>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
}
