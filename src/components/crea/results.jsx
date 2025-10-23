import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle2Icon, XCircleIcon, FileIcon } from 'lucide-react'
import { useEffect, useState } from "react"

export default function ResultsDialog({ showResults, setShowResults, results, levelNumber }) {
    const [sortedResults, setSortedResults] = useState([])

    useEffect(() => {
        // Sort results by fecha_respuesta in descending order
        const sorted = [...results].sort((a, b) =>
            new Date(b.fecha_respuesta).getTime() - new Date(a.fecha_respuesta).getTime()
        )
        // Get only the latest result for each question
        const latestResults = sorted.reduce((acc, current) => {
            const x = acc.find(item => item.question === current.question)
            if (!x) {
                return acc.concat([current])
            } else {
                return acc
            }
        }, [])
        setSortedResults(latestResults)
    }, [results])
    return (
        <Dialog open={showResults} onOpenChange={setShowResults}>
            <DialogContent className="sm:max-w-[600px] overflow-hidden rounded-lg dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 bg-gradient-to-r from-purple-600 via-purple-400 to-blue-500 shadow-md">
                <DialogHeader>
                    <DialogTitle className="text-white text-lg font-bold">
                        Resultados del Nivel {levelNumber}
                    </DialogTitle>
                    <DialogDescription className="text-blue-100">
                        {'Revisa tus respuestas y las respuestas correctas.'}
                    </DialogDescription>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[60vh] px-4 py-6">
                    {sortedResults.map((result, index) => (
                        <div
                            key={index}
                            className={`mb-4 p-4 rounded-lg shadow-md ${result.isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                            <p className="font-semibold">{result.question}</p>
                            <div className="flex items-center mt-2">
                                {result.isCorrect ? (
                                    <CheckCircle2Icon className="w-5 h-5 mr-2 text-green-600" />
                                ) : (
                                    <XCircleIcon className="w-5 h-5 mr-2 text-red-600" />
                                )}
                                {result.tipo === 'cargar' ? (
                                    <div className="flex items-center">
                                        <FileIcon className="w-5 h-5 mr-2" />
                                        {result.selectedAnswer ? (
                                            <a
                                                href={result.selectedAnswer}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                Ver archivo
                                            </a>
                                        ) : (
                                            <span>No se cargó archivo</span>
                                        )}
                                    </div>
                                ) : (
                                    <p>Respuesta: {result.selectedAnswer}</p>
                                )}
                            </div>
                            {(!result.isCorrect) && result.tipo === 'opcion' && (
                                <p className="mt-2 text-sm text-gray-700">
                                    Respuesta correcta: {result.correctAnswer}
                                </p>
                            )}
                            <p className="mt-2 text-xs text-gray-500">
                                {/* Fecha: {new Date(result.fecha_respuesta).toLocaleString()} */}
                            </p>
                        </div>
                    ))}
                </div>
                <Button
                    onClick={() => setShowResults(false)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
                >
                    Cerrar resultados
                </Button>
            </DialogContent>
        </Dialog>
    )
}