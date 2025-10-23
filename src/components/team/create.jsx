'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Upload } from 'lucide-react'

export default function CreateTeam({ onCancel, onTeamCreated }) {
    const [teamName, setTeamName] = useState('')
    const [description, setDescription] = useState('')
    const [selectedInterest, setSelectedInterest] = useState('')
    const [selectedChallenge, setSelectedChallenge] = useState('')
    const [seekingMembers, setSeekingMembers] = useState(false)
    const [memberCount, setMemberCount] = useState(1)
    const [loading, setLoading] = useState(false)
    const [userInterests, setUserInterests] = useState([])
    const [relatedChallenges, setRelatedChallenges] = useState([])
    const [imageFile, setImageFile] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)

    const router = useRouter()
    const supabase = createClientComponentClient()

    useEffect(() => {
        fetchUserInterests()
    }, [])

    useEffect(() => {
        if (selectedInterest) {
            fetchRelatedChallenges(selectedInterest)
        } else {
            setRelatedChallenges([])
            setSelectedChallenge('')
        }
    }, [selectedInterest])

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const uploadImage = async (file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `team-images/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data } = supabase.storage
            .from('images')
            .getPublicUrl(filePath)

        return data.publicUrl
    }

    const fetchUserInterests = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast({
                    title: "Error de autenticación",
                    description: "Debes iniciar sesión para crear un equipo.",
                    variant: "destructive",
                })
                router.push('/login')
                return
            }

            const { data, error } = await supabase
                .from('usuarios_intereses')
                .select(`
                    intereses (
                        id_interes,
                        nombre_interes
                    )
                `)
                .eq('id_usuario', user.id)

            if (error) throw error

            const uniqueInterests = Array.from(
                new Set(data.map(item => JSON.stringify(item.intereses)))
            ).map(item => JSON.parse(item))

            setUserInterests(uniqueInterests)
        } catch (error) {
            console.error('Error fetching user interests:', error)
            toast({
                title: "Error al cargar intereses",
                description: "No se pudieron cargar tus intereses.",
                variant: "destructive",
            })
        }
    }

    const fetchRelatedChallenges = async (interestId) => {
        try {
            const { data, error } = await supabase
                .from('retos')
                .select('id_reto, titulo')
                .eq('reto_interes_ods', interestId)

            if (error) throw error

            setRelatedChallenges(data)
        } catch (error) {
            console.error('Error fetching related challenges:', error)
            toast({
                title: "Error al cargar desafíos",
                description: "No se pudieron cargar los desafíos relacionados.",
                variant: "destructive",
            })
        }
    }

    const handleCreateTeam = async (e) => {
        e.preventDefault()
        if (!selectedChallenge || !selectedInterest) {
            toast({
                title: "Campos requeridos",
                description: "Por favor selecciona un interés y un desafío.",
                variant: "destructive",
            })
            return
        }

        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('No user logged in')

            let imageUrl = null
            if (imageFile) {
                imageUrl = await uploadImage(imageFile)
            }

            const { data: team, error: teamError } = await supabase
                .from('equipos')
                .insert({
                    nombre_equipo: teamName,
                    descripcion: description,
                    fecha_creacion: new Date().toISOString(),
                    total_miembros: memberCount,
                    nivel_actual: 1,
                    puntos_acumulados: 0,
                    id_usuario: user.id,
                    imagen_url: imageUrl,
                    busca_miembros: seekingMembers
                })
                .select()
                .single()

            if (teamError) throw teamError

            const { error: memberError } = await supabase
                .from('usuarios_equipos')
                .insert({
                    id_usuario: user.id,
                    id_equipo: team.id_equipo,
                    rol_en_equipo: 'lider'
                })

            if (memberError) throw memberError

            const { error: challengeError } = await supabase
                .from('equipos_retos')
                .insert({
                    id_equipo: team.id_equipo,
                    id_reto: selectedChallenge,
                    puntos_totales: 0,
                    estado: 'activo',
                })

            if (challengeError) throw challengeError

            // Ensure we're passing the complete team object
            onTeamCreated(team)
        } catch (error) {
            console.error('Error creating team:', error)
            toast({
                title: "Error al crear el equipo",
                description: error.message || "Ocurrió un error al crear el equipo.",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }
    return (
        <form onSubmit={handleCreateTeam} className="space-y-6 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Crear Nuevo Equipo</h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-white/60 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="teamName" className="text-white">Nombre del equipo</Label>
                        <Input
                            id="teamName"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Ingresa el nombre de tu equipo"
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-white">Descripción del equipo</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe el propósito y objetivos de tu equipo"
                            required
                            className="bg-white/10 border-white/20 text-white placeholder:text-white/50 min-h-32"
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="interest" className="text-white">Área de interés</Label>
                            <Select
                                onValueChange={(value) => {
                                    setSelectedInterest(value)
                                    setSelectedChallenge('')
                                }}
                                required
                                value={selectedInterest}
                            >
                                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                    <SelectValue placeholder="Selecciona un área de interés" />
                                </SelectTrigger>
                                <SelectContent className="bg-purple-900 border-white/20 dark:bg-gray-500">
                                    {userInterests.map((interest) => (
                                        <SelectItem
                                            key={interest.id_interes}
                                            value={interest.id_interes}
                                            className="text-white hover:bg-white/10"
                                        >
                                            {interest.nombre_interes}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedInterest && (
                            <div className="space-y-2">
                                <Label htmlFor="challenge" className="text-white">Desafío</Label>
                                <Select
                                    onValueChange={setSelectedChallenge}
                                    required
                                    value={selectedChallenge}
                                >
                                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                                        <SelectValue placeholder="Selecciona un desafío" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-purple-900 dark:bg-gray-500 border-white/20">
                                        {relatedChallenges.map((challenge) => (
                                            <SelectItem
                                                key={challenge.id_reto}
                                                value={challenge.id_reto}
                                                className="text-white hover:bg-white/10"
                                            >
                                                {challenge.titulo}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label className="text-white">Imagen del equipo</Label>
                        <div className="relative h-48 border-2 border-dashed border-white/20 rounded-lg overflow-hidden">
                            {imagePreview ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={imagePreview}
                                        alt="Vista previa"
                                        className="object-cover w-full h-full"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImageFile(null)
                                            setImagePreview(null)
                                        }}
                                        className="absolute top-2 right-2 bg-red-500/80 text-white p-1 rounded-full hover:bg-red-600/80 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-white/5 transition-colors">
                                    <Upload className="w-8 h-8 text-white/60" />
                                    <span className="mt-2 text-sm text-white/60">
                                        Sube una imagen para tu equipo
                                    </span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="seekingMembers"
                                checked={seekingMembers}
                                onChange={(e) => setSeekingMembers(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/10"
                            />
                            <Label htmlFor="seekingMembers" className="text-white cursor-pointer">
                                Estoy buscando miembros
                            </Label>
                        </div>

                        {seekingMembers && (
                            <div className="space-y-2">
                                <Label htmlFor="memberCount" className="text-white">
                                    Número de miembros buscados
                                </Label>
                                <Input
                                    id="memberCount"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={memberCount}
                                    onChange={(e) => setMemberCount(parseInt(e.target.value))}
                                    className="bg-white/10 border-white/20 text-white"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4 mt-8">
                <Button
                    type="button"
                    onClick={onCancel}
                    variant="outline"
                    className="border-white/20 bg-slate-700 text-white hover:bg-white/10"
                >
                    Cancelar
                </Button>
                <Button
                    type="submit"
                    disabled={loading || !selectedInterest || !selectedChallenge}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
                >
                    {loading ? 'Creando equipo...' : 'Crear Equipo'}
                </Button>
            </div>
        </form>
    )
}