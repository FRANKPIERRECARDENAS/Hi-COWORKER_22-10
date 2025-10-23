'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { IoMdOptions } from "react-icons/io"
import { FaUserShield, FaHandsHelping, FaUser } from "react-icons/fa"
import { AiOutlineStar, AiFillStar } from "react-icons/ai"
import { Loader2Icon } from 'lucide-react'
import { RiTeamFill } from 'react-icons/ri';
import Chat from '@/components/chat';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RiEditLine } from 'react-icons/ri'

export default function Team() {
    const getImageSrc = (imageUrl) => {
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            return imageUrl;
        }
        return null;
    };

    const params = useParams()
    const router = useRouter()
    const [team, setTeam] = useState(null)
    const [members, setMembers] = useState([])
    const [user, setUser] = useState(null)
    const [currentUserId, setCurrentUserId] = useState(null)
    const [starredMembers, setStarredMembers] = useState(new Set())
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editedTeamName, setEditedTeamName] = useState('')
    const [selectedImage, setSelectedImage] = useState(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const supabase = createClientComponentClient()

    const fetchCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setCurrentUserId(user.id)
            const { data, error } = await supabase.from('usuarios')
                .select()
                .eq('id_usuario', user.id)
            if (data) {
                setUser(data[0]);
            }
        } else {
            router.push('/login')
        }
    }

    useEffect(() => {
        fetchCurrentUser()
    }, [supabase, router])

    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                const { data: teamData, error: teamError } = await supabase
                    .from('equipos')
                    .select('*')
                    .eq('id_equipo', params.id)
                    .single()

                if (teamError) throw teamError
                setTeam(teamData)
                setEditedTeamName(teamData.nombre_equipo)
                const { data: membersData, error: membersError } = await supabase
                    .from('usuarios')
                    .select(`
                        id_usuario,
                        nombre,
                        apellido,
                        imagen_url,
                        estrellas,
                        usuarios_equipos!inner (
                            rol_en_equipo,
                            id_equipo
                        )
                    `)
                    .eq('usuarios_equipos.id_equipo', params.id)

                if (membersError) throw membersError

                const formattedMembers = membersData.map(user => ({
                    id_usuario: user.id_usuario,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    image_url: user.imagen_url,
                    estrellas: user.estrellas,
                    rol: user.usuarios_equipos[0]?.rol_en_equipo
                }))
                    .sort((a, b) => {
                        // Sort with leader first, then support roles
                        if (a.rol === 'lider') return -1
                        if (b.rol === 'lider') return 1
                        return 0
                    })

                setMembers(formattedMembers)

            } catch (error) {
                console.error('Error fetching data:', error)
            }
        }

        if (params.id) {
            fetchTeamData()
        }
    }, [params.id, supabase])
    const handleUpdateTeam = async () => {
        if (isUpdating) return;
        setIsUpdating(true);
        try {
            const updates = { nombre_equipo: editedTeamName }

            if (selectedImage) {
                const fileExt = selectedImage.name.split('.').pop()
                const fileName = `team-images/${Math.random()}.${fileExt}`
                const { error: uploadError } = await supabase.storage
                    .from('images')
                    .upload(fileName, selectedImage)

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(fileName)
                updates.imagen_url = publicUrl
            }

            const { error } = await supabase
                .from('equipos')
                .update(updates)
                .eq('id_equipo', params.id)

            if (error) throw error
            setTeam(prevTeam => ({ ...prevTeam, ...updates }))
            setIsModalOpen(false)
        } catch (error) {
            console.error('Error updating team:', error)
        } finally {
            setIsUpdating(false)
        }
    }
    const getRoleIcon = (rol) => {
        switch (rol) {
            case 'lider':
                return <FaUserShield className="text-2xl text-blue-500" title="Lider" />
            case 'apoyo':
                return <FaHandsHelping className="text-2xl text-green-500" title="Apoyo" />
            default:
                return null
        }
    }

    const toggleStar = async (member) => {
        const condition = (new Date() - new Date(user.hora_ultima_estrella)) >= 2 * 1000 * 60 * 60;
        if (condition) {
            try {
                const starsCurrent = member.estrellas;
                const { data, error: updateStarsError } = await supabase
                    .from('usuarios')
                    .update({ estrellas: starsCurrent + 1 })
                    .eq('id_usuario', member.id_usuario);
                if (updateStarsError) {
                    console.error('Error al actualizar las estrellas:', updateStarsError);
                    return;
                }
                const { error: updateTimeError } = await supabase
                    .from('usuarios')
                    .update({ hora_ultima_estrella: new Date() })
                    .eq('id_usuario', currentUserId);
                if (updateTimeError) {
                    console.error('Error al actualizar la hora de la última estrella:', updateTimeError);
                    return;
                }
                setStarredMembers(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(member.id_usuario)) {
                        newSet.delete(member.id_usuario);
                    } else {
                        newSet.add(member.id_usuario);
                    }
                    return newSet;
                });

            } catch (error) {
                console.error('Error al manejar la estrella:', error);
            } finally {
                await fetchCurrentUser();
            }
        }
    }

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    }
    const isUserLeader = members.find(m => m.id_usuario === currentUserId)?.rol === 'lider'
    if (!team) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2Icon className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex flex-col md:flex-row max-h-96">
            <div className={`flex-grow ${isSidebarOpen ? 'md:w-9/12' : 'w-full'}`}>
                <Chat idTeam={params.id} />
            </div>

            <button
                onClick={toggleSidebar}
                className="md:hidden fixed right-4 top-4 z-50 bg-gray-700 p-2 rounded-full"
            >
                <IoMdOptions className="text-white text-xl" />
            </button>

            <div className={`
                ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
                transform transition-transform duration-300 ease-in-out
                fixed md:static right-0 top-0 h-full
                w-full md:w-3/12 
                ark:bg-zinc-900 
                z-40 md:z-0
                md:transform-none
                overflow-y-auto max-h-[55vh] scrollbar-hide
            `}>
                <div className="p-4">
                    <div className="rounded-xl bg-gray-500 bg-opacity-25 p-4">
                        <div className="flex flex-col space-y-4">
                            {/* Header Row */}
                            <div className="flex items-center space-x-4">
                                {/* Team Image */}
                                <div className="relative w-12 h-12 flex-shrink-0">
                                    {team.imagen_url ? (
                                        <Image
                                            src={team.imagen_url}
                                            alt={team.nombre_equipo}
                                            className="rounded-full object-cover"
                                            layout="fill"
                                        />
                                    ) : (
                                        <RiTeamFill className="w-full h-full text-gray-400" />
                                    )}
                                </div>

                                {/* Team Name */}
                                <h3 className="text-2xl font-bold flex-grow">{team.nombre_equipo}</h3>

                                {/* Edit Button - Only visible for leader */}
                                {isUserLeader && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="p-2 hover:bg-gray-600 rounded-full transition-colors"
                                    >
                                        <RiEditLine className="text-xl" />
                                    </button>
                                )}
                            </div>

                            {/* Team Description */}
                            <p className="text-sm text-gray-300">{team.descripcion}</p>

                            {/* Members List */}
                            <ul className="space-y-3 mt-2">
                                {members.map(member => (

                                    <li key={member.id_usuario} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="relative w-10 h-10">
                                                {getImageSrc(member.image_url) ? (
                                                    <Image
                                                        src={getImageSrc(member.image_url)}
                                                        alt="member Image"
                                                        layout="fill"
                                                        objectFit="cover"
                                                        className="rounded-full"
                                                    />
                                                ) : (
                                                    <FaUser className="w-full h-full text-gray-400" />
                                                )}
                                            </div>
                                            <span className="font-medium">{member.nombre} {member.apellido}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {getRoleIcon(member.rol)}
                                            {member.id_usuario !== currentUserId && (
                                                <button
                                                    onClick={() => toggleStar(member)}
                                                    className="hover:scale-110 transition-transform"
                                                >
                                                    {starredMembers.has(member.id_usuario) ? (
                                                        <AiFillStar className="text-yellow-400 text-xl" />
                                                    ) : (
                                                        <AiOutlineStar className="text-gray-400 text-xl" />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="bg-gradient-to-b from-blue-600 to-purple-700 dark:bg-gradient-to-b dark:from-zinc-800 dark:to-zinc-900 text-white p-6 rounded-xl shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold">Editar Equipo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre del Equipo</label>
                            <Input
                                value={editedTeamName}
                                onChange={(e) => setEditedTeamName(e.target.value)}
                                placeholder="Nombre del equipo"
                                className="w-full p-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Imagen del Equipo</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setSelectedImage(e.target.files[0])}
                                className="w-full p-2 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsModalOpen(false)}
                                className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                                disabled={isUpdating}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleUpdateTeam}
                                className="bg-blue-600 text-white hover:bg-blue-700"
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Guardando...' : 'Guardar'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}