'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "@/hooks/use-toast"
import confetti from 'canvas-confetti'
import LevelMap from '@/components/crea/level-map'
import QuestionModal from '@/components/crea/questin-modal'
import ResultsDialog from '@/components/crea/results'
import { Loader2Icon } from 'lucide-react'
export default function TeamChallenge() {
    const [team, setTeam] = useState(null)
    const [teamReto, setTeamReto] = useState(null)
    const [levels, setLevels] = useState([])
    const [currentLevel, setCurrentLevel] = useState(null)
    const [questions, setQuestions] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedAnswers, setSelectedAnswers] = useState({})
    const [userId, setUserId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showResults, setShowResults] = useState(false)
    const [results, setResults] = useState([])
    const [levelInfo, setLevelInfo] = useState(null)
    const [selectedLevelForResults, setSelectedLevelForResults] = useState(null)
    const [completedLevelResponses, setCompletedLevelResponses] = useState({})
    const router = useRouter()
    const params = useParams()
    const supabase = createClientComponentClient()
    const initializeData = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const { data: { user }, error: authError } = await supabase.auth.getUser()
            if (authError) throw authError
            if (!user) {
                toast({
                    title: "Sesión no iniciada",
                    description: "Debes iniciar sesión para acceder al juego.",
                    variant: "destructive",
                })
                router.push('/login')
                return
            }
            setUserId(user.id)
            const { data: teamData, error: teamError } = await supabase
                .from('equipos')
                .select(`
                    *,
                    equipos_retos (*)
                `)
                .eq('id_equipo', params.id)
                .single()
            if (teamError) throw teamError
            if (!teamData) {
                throw new Error('No se encontró el equipo')
            }
            setTeam(teamData)
            setCurrentLevel(teamData.nivel_actual || 1)
            const { data: levelsData, error: levelsError } = await supabase
                .from('niveles')
                .select('*')
                .order('numero_nivel')
            if (levelsError) throw levelsError
            if (!levelsData || levelsData.length === 0) {
                throw new Error('No se encontraron niveles')
            }
            if (teamData.equipos_retos && teamData.equipos_retos[0]) {
                setTeamReto(teamData.equipos_retos[0])
                const allLevelsCompleted = levelsData.every(level => level.numero_nivel <= teamData.nivel_actual)
                if (allLevelsCompleted) {
                    setLevels(levelsData.map(level => ({ ...level, completed: true })))
                } else {
                    setLevels(levelsData.map(level => ({ ...level, completed: level.numero_nivel < teamData.nivel_actual })))
                }
            } else {
                console.warn('El equipo no tiene reto asociado')
                setLevels(levelsData)
            }
            // Fetch completed level responses
            const { data: responsesData, error: responsesError } = await supabase
                .from('respuestas')
                .select(`
                    id_pregunta,
                    id_opcion,
                    ruta_archivo_texto,
                    id_nivel,
                    preguntas (
                        texto_pregunta,
                        tipo_respuesta,
                        opciones (
                            id_opcion,
                            texto_opcion,
                            es_correcto
                        )
                    )
                `)
                .eq('id_usuario', user.id)
                .eq('id_equipo', params.id)
            if (responsesError) throw responsesError
            const formattedResponses = responsesData.reduce((acc, response) => {
                if (response.preguntas && response.id_nivel) {
                    const levelNumber = response.id_nivel
                    if (!acc[levelNumber]) {
                        acc[levelNumber] = []
                    }
                    acc[levelNumber].push({
                        question: response.preguntas.texto_pregunta,
                        selectedAnswer: response.preguntas.tipo_respuesta === 'opcion'
                            ? response.preguntas.opciones.find(o => o.id_opcion === response.id_opcion)?.texto_opcion
                            : response.ruta_archivo_texto,
                        isCorrect: response.preguntas.tipo_respuesta === 'opcion'
                            ? response.preguntas.opciones.find(o => o.id_opcion === response.id_opcion)?.es_correcto
                            : true,
                        correctAnswer: response.preguntas.tipo_respuesta === 'opcion'
                            ? response.preguntas.opciones.find(o => o.es_correcto)?.texto_opcion
                            : null,
                        tipo: response.preguntas.tipo_respuesta
                    })
                }
                return acc
            }, {})
            setCompletedLevelResponses(formattedResponses)
        } catch (error) {
            console.error('Error al inicializar datos:', error)
            setError(error.message)
            toast({
                title: "Error",
                description: "No se pudieron cargar los datos del juego. Por favor, intenta de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [supabase, params.id, router])
    useEffect(() => {
        initializeData()
    }, [initializeData])
    const fetchLevelResponses = async (levelId) => {
        try {
            setLoading(true)
            const { data: levelResponses, error: responsesError } = await supabase
                .from('respuestas')
                .select(`
                    id_pregunta,
                    id_opcion,
                    ruta_archivo_texto,
                    fecha_respuesta,
                    preguntas (
                        texto_pregunta,
                        tipo_respuesta,
                        opciones (
                            id_opcion,
                            texto_opcion,
                            es_correcto
                        )
                    )
                `)
                .eq('id_nivel', levelId)
                .eq('id_equipo', team.id_equipo)
            if (responsesError) throw responsesError
            if (!levelResponses || levelResponses.length === 0) {
                toast({
                    title: "Sin respuestas",
                    description: "No se encontraron respuestas para este nivel.",
                    variant: "warning",
                })
                return []
            }
            return levelResponses.map(response => ({
                question: response.preguntas.texto_pregunta,
                selectedAnswer: response.preguntas.tipo_respuesta === 'opcion'
                    ? response.preguntas.opciones.find(o => o.id_opcion === response.id_opcion)?.texto_opcion || 'Respuesta no encontrada'
                    : response.ruta_archivo_texto || 'Archivo no encontrado',
                isCorrect: response.preguntas.tipo_respuesta === 'opcion'
                    ? response.preguntas.opciones.find(o => o.id_opcion === response.id_opcion)?.es_correcto || false
                    : true,
                correctAnswer: response.preguntas.tipo_respuesta === 'opcion'
                    ? response.preguntas.opciones.find(o => o.es_correcto)?.texto_opcion || 'Respuesta correcta no encontrada'
                    : null,
                tipo: response.preguntas.tipo_respuesta,
                fecha_respuesta: response.fecha_respuesta
            }))
        } catch (error) {
            console.error('Error al cargar las respuestas del nivel:', error)
            toast({
                title: "Error",
                description: "No se pudieron cargar las respuestas. Por favor, intenta de nuevo.",
                variant: "destructive",
            })
            return []
        } finally {
            setLoading(false)
        }
    }
    const handleLevelClick = async (level) => {
        try {
            if (!teamReto) {
                toast({
                    title: "Error",
                    description: "El equipo no tiene un reto activo.",
                    variant: "destructive",
                })
                return
            }

            const allLevelsCompleted = levels.every(l => l.numero_nivel <= currentLevel);

            if (allLevelsCompleted) {
                // If all levels are completed, always show results
                const formattedResponses = await fetchLevelResponses(level.id_nivel)
                setResults(formattedResponses)
                setSelectedLevelForResults(level.numero_nivel)
                setShowResults(true)
            } else if (level.numero_nivel <= currentLevel) {
                // If the level is completed or it's the current level
                if (level.numero_nivel === currentLevel) {
                    // Verify if the logged-in user matches the team's user for the current level
                    const { data: { user }, error: authError } = await supabase.auth.getUser()
                    if (authError) throw authError
                    if (!user || user.id !== team.id_usuario) {
                        toast({
                            title: "Acceso denegado",
                            description: "No tienes permiso para acceder a este nivel.",
                            variant: "destructive",
                        })
                        return
                    }
                    // Load questions for current level
                    setLoading(true)
                    setError(null)
                    const { data: questionsData, error: questionsError } = await supabase
                        .from('preguntas')
                        .select(`
                            *,
                            opciones (*)
                        `)
                        .eq('id_nivel', level.id_nivel)
                    if (questionsError) throw questionsError
                    if (!questionsData || questionsData.length === 0) {
                        throw new Error('No hay preguntas disponibles para este nivel')
                    }
                    setQuestions(questionsData)
                    setIsModalOpen(true)
                    const currentLevelInfo = levels.find(l => l.numero_nivel === currentLevel)
                    setLevelInfo(currentLevelInfo)
                } else {
                    // For completed levels, show results
                    const formattedResponses = await fetchLevelResponses(level.id_nivel)
                    setResults(formattedResponses)
                    setSelectedLevelForResults(level.numero_nivel)
                    setShowResults(true)
                }
            } else {
                toast({
                    title: "Nivel bloqueado",
                    description: "Debes completar los niveles anteriores primero.",
                    variant: "destructive",
                })
            }
        } catch (error) {
            console.error('Error al cargar el nivel:', error)
            setError(error.message)
            toast({
                title: "Error",
                description: error.message || "Hubo un problema al cargar el nivel.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }
    const handleCompleteLevel = async () => {
        if (!team?.id_equipo || !teamReto) {
            toast({
                title: "Error",
                description: "No se encontró información del equipo o reto.",
                variant: "destructive",
            })
            return
        }
        if (Object.keys(selectedAnswers).length !== questions.length) {
            toast({
                title: "Respuestas incompletas",
                description: "Debes responder todas las preguntas antes de continuar.",
                variant: "destructive",
            })
            return
        }
        try {
            setLoading(true)
            setError(null)
            const answersToSave = questions.map(question => {
                const answer = selectedAnswers[question.id_pregunta]
                return {
                    id_pregunta: question.id_pregunta,
                    id_opcion: question.tipo_respuesta === 'opcion' ? answer : null,
                    id_usuario: userId,
                    id_nivel: question.id_nivel,
                    fecha_respuesta: new Date().toISOString(),
                    tipo_respuesta: question.tipo_respuesta,
                    ruta_archivo_texto: question.tipo_respuesta !== 'opcion' ? answer : null,
                    id_equipo: team.id_equipo
                }
            })
            const { error: saveAnswersError } = await supabase
                .from('respuestas')
                .insert(answersToSave)
            if (saveAnswersError) throw saveAnswersError
            const resultsData = questions.map(question => {
                const selectedAnswer = selectedAnswers[question.id_pregunta]
                let isCorrect = false
                let correctAnswer = ''
                if (question.tipo_respuesta === 'opcion') {
                    const selectedOption = question.opciones.find(option => option.id_opcion === selectedAnswer)
                    const correctOption = question.opciones.find(option => option.es_correcto)
                    isCorrect = selectedOption && selectedOption.es_correcto
                    correctAnswer = correctOption ? correctOption.texto_opcion : ''
                } else {
                    // For non-multiple choice questions, we consider them correct
                    isCorrect = true
                }
                return {
                    question: question.texto_pregunta,
                    selectedAnswer: question.tipo_respuesta === 'opcion'
                        ? question.opciones.find(option => option.id_opcion === selectedAnswer)?.texto_opcion
                        : selectedAnswer,
                    isCorrect,
                    correctAnswer,
                    tipo: question.tipo_respuesta
                }
            })
            setResults(resultsData)
            setShowResults(true)
            const correctAnswers = resultsData.filter(result => result.isCorrect).length
            if (correctAnswers >= 6) {
                const nextLevel = currentLevel + 1
                const pointsToAdd = 20
                const nextLevelExists = levels.some(level => level.numero_nivel === nextLevel)
                const { error: updateTeamError } = await supabase
                    .from('equipos')
                    .update({
                        nivel_actual: nextLevelExists ? nextLevel : currentLevel,
                        puntos_acumulados: team.puntos_acumulados + pointsToAdd,
                    })
                    .eq('id_equipo', team.id_equipo)
                if (updateTeamError) throw updateTeamError
                const { error: updateTeamRetoError } = await supabase
                    .from('equipos_retos')
                    .update({
                        puntos_totales: teamReto.puntos_totales + pointsToAdd,
                        estado: nextLevelExists ? 'incompleto' : 'completado'
                    })
                    .eq('id_equipo_reto', teamReto.id_equipo_reto)
                if (updateTeamRetoError) throw updateTeamRetoError
                if (nextLevelExists) {
                    const nextLevelId = levels.find(l => l.numero_nivel === nextLevel)?.id_nivel
                    if (nextLevelId) {
                        const { error: createNextLevelError } = await supabase
                            .from('equipos_retos_niveles')
                            .insert({
                                id_equipo_reto: teamReto.id_equipo_reto,
                                id_nivel: nextLevelId,
                                puntos_por_nivel: 20
                            })
                        if (createNextLevelError) throw createNextLevelError
                    }
                }
                const { data: updatedTeam, error: fetchError } = await supabase
                    .from('equipos')
                    .select('*')
                    .eq('id_equipo', team.id_equipo)
                    .single()
                if (fetchError) throw fetchError
                setTeam(updatedTeam)
                setCurrentLevel(nextLevelExists ? nextLevel : currentLevel)
                setIsModalOpen(false)
                setSelectedAnswers({})
                if (!nextLevelExists) {
                    setLevels(levels.map(level => ({ ...level, completed: true })))
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    })
                }
                toast({
                    title: nextLevelExists ? "¡Nivel completado!" : "¡Juego completado!",
                    description: nextLevelExists
                        ? `¡Felicitaciones! Has avanzado al nivel ${nextLevel} y ganado ${pointsToAdd} puntos.`
                        : `¡Felicitaciones! Has completado todos los niveles y ganado ${pointsToAdd} puntos.`,
                    variant: "success"
                })
            } else {
                toast({
                    title: "Intenta de nuevo",
                    description: `Necesitas al menos 6 respuestas correctas para avanzar. Obtuviste ${correctAnswers} /10.`,
                    variant: "destructive",
                })
            }
            setIsModalOpen(false)
            setSelectedAnswers({})
        } catch (error) {
            console.error('Error al completar el nivel:', error)
            setError(error.message)
            toast({
                title: "Error",
                description: "Hubo un problema al completar el nivel. Por favor, intenta de nuevo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }
    const handleFileUpload = async (file, questionId) => {
        try {
            const { data, error } = await supabase.storage
                .from('file')
                .upload(`${team.id_equipo}/${questionId}_${file.name}`, file)
            if (error) throw error
            const { data: { publicUrl }, error: urlError } = supabase.storage
                .from('file')
                .getPublicUrl(data.path)
            if (urlError) throw urlError
            setSelectedAnswers(prev => ({
                ...prev,
                [questionId]: publicUrl
            }))
        } catch (error) {
            console.error('Error al subir el archivo:', error)
            toast({
                title: "Error",
                description: "No se pudo subir el archivo. Por favor, intenta de nuevo.",
                variant: "destructive",
            })
        }
    }
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2Icon className="w-8 h-8 animate-spin" />
            </div>
        )
    }
    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-red-500">{error}</p>
            </div>
        )
    }
    return (
        <div className="container mx-auto px-4 py-2">
            <LevelMap
                levels={levels}
                currentLevel={currentLevel}
                teamReto={teamReto}
                onLevelClick={handleLevelClick}
                puntos_acumulados={team.puntos_acumulados}
            />
            <QuestionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                questions={questions}
                selectedAnswers={selectedAnswers}
                setSelectedAnswers={setSelectedAnswers}
                onComplete={handleCompleteLevel}
                onFileUpload={handleFileUpload}
                currentLevel={currentLevel}
                levelInfo={levelInfo}
            />
            <ResultsDialog
                showResults={showResults}
                setShowResults={setShowResults}
                results={results}
                levelNumber={selectedLevelForResults}
            />
        </div>
    )
}