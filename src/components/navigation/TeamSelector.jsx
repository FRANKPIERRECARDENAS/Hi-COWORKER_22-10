import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { RiTeamFill } from "react-icons/ri"
import { IoIosAddCircle } from "react-icons/io"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function TeamSelector({ userTeams, currentUserId, onClose, onLeaveTeam, onCreateTeam, setSelectedTeam, onDeleteTeam }) {
    const [showLeaveConfirmation, setShowLeaveConfirmation] = useState(false)
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
    const [teamToLeave, setTeamToLeave] = useState(null)
    const [teamToDelete, setTeamToDelete] = useState(null)

    const getImageSrc = (imageUrl) => {
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            return imageUrl;
        }
        return null;
    };

    const leaderTeams = userTeams.filter(team => team.id_usuario === currentUserId);
    const memberTeams = userTeams.filter(team => team.id_usuario !== currentUserId);

    const hasReachedLeaderLimit = leaderTeams.length >= 4;
    const handleCreateTeamClick = () => {
        if (hasReachedLeaderLimit) {
            toast({
                variant: "destructive",
                description: "Has alcanzado el límite de 4 equipos como líder",
                duration: 4000
            });
        } else {
            onCreateTeam();
        }
    };

    const handleLeaveTeamClick = (team) => {
        setTeamToLeave(team);
        setShowLeaveConfirmation(true);
    };

    const handleDeleteTeamClick = (team) => {
        setTeamToDelete(team);
        setShowDeleteConfirmation(true);
    };

    const confirmLeaveTeam = () => {
        onLeaveTeam(teamToLeave.id_equipo);
        setShowLeaveConfirmation(false);
    };

    const confirmDeleteTeam = () => {
        onDeleteTeam(teamToDelete.id_equipo);
        setShowDeleteConfirmation(false);
    };


    return (
        <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
            <div className="w-6/12 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 bg-gradient-to-b from-purple-900/90 to-blue-900/90 backdrop-blur-md shadow-xl rounded-xl p-6 z-50">
                <div className="flex justify-end mb-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Leader Teams Section */}
                {leaderTeams.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-6">Tus grupos donde eres líder</h2>
                        <ul className="space-y-3 mb-6">
                            {leaderTeams.map((team) => (
                                <li key={team.id_equipo} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all duration-300">
                                    <div className="flex items-center">
                                        {team.imagen_url ? (
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={getImageSrc(team.imagen_url)}
                                                    className="w-50 h-50 rounded-full"
                                                    width={40}
                                                    height={40}
                                                    alt={`Imagen del equipo ${team.nombre_equipo}`}
                                                />
                                            </div>
                                        ) : (
                                            <RiTeamFill className="text-center w-10 h-10" />
                                        )}
                                        <Link
                                            href={`/team/${team.id_equipo}`}
                                            className="text-sm text-white ml-3 hover:text-purple-200"
                                            onClick={() => setSelectedTeam(team)}
                                        >
                                            {team.nombre_equipo}
                                        </Link>
                                    </div>
                                    <button
                                        className="text-xs text-white bg-red-500/80 hover:bg-red-600/80 bg-opacity-50 rounded-xl px-3 py-2 transition-all duration-300"
                                        onClick={() => handleDeleteTeamClick(team)}
                                    >
                                        Eliminar
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* Member Teams Section */}
                {memberTeams.length > 0 && (
                    <>
                        <h2 className="text-2xl font-bold text-white mb-6">Otros grupos</h2>
                        <ul className="space-y-3 mb-6">
                            {memberTeams.map((team) => (
                                <li key={team.id_equipo} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-all duration-300">
                                    <div className="flex items-center">
                                        {team.imagen_url ? (
                                            <div className="relative w-10 h-10 rounded-full overflow-hidden">
                                                <Image
                                                    src={getImageSrc(team.imagen_url)}
                                                    className="w-50 h-50 rounded-full"
                                                    width={40}
                                                    height={40}
                                                    alt={`Imagen del equipo ${team.nombre_equipo}`}
                                                />
                                            </div>
                                        ) : (
                                            <RiTeamFill className="text-center w-10 h-10" />
                                        )}
                                        <Link
                                            href={`/team/${team.id_equipo}`}
                                            className="text-sm text-white ml-3 hover:text-purple-200"
                                            onClick={() => setSelectedTeam(team)}
                                        >
                                            {team.nombre_equipo}
                                        </Link>
                                    </div>
                                    <button
                                        className="text-xs text-white bg-red-500/80 hover:bg-red-600/80 bg-opacity-50 rounded-xl px-3 py-2 transition-all duration-300"
                                        onClick={() => handleLeaveTeamClick(team)}
                                    >
                                        Salir
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {/* No Teams Message and Create Team Option */}
                {userTeams.length === 0 && (
                    <div className="text-center text-white mb-6">
                        <p className="mb-4">Aún no tienes equipos</p>
                    </div>
                )}
                <Dialog open={showLeaveConfirmation} onOpenChange={setShowLeaveConfirmation}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>¿Estás seguro de abandonar el equipo?</DialogTitle>
                            <DialogDescription>
                                Esta acción no se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowLeaveConfirmation(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={confirmLeaveTeam}>Abandonar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
                    <DialogContent className="border-0 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 bg-gradient-to-b from-purple-900/90 to-blue-900/90 backdrop-blur-md shadow-xl rounded-xl p-6" >
                        <DialogHeader>
                            <DialogTitle>¿Estás seguro de eliminar el equipo?</DialogTitle>
                            <DialogDescription>
                                Esta acción eliminará el equipo y todos sus integrantes. No se puede deshacer.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button className='text-black' variant="outline" onClick={() => setShowDeleteConfirmation(false)}>Cancelar</Button>
                            <Button variant="destructive" onClick={confirmDeleteTeam}>Eliminar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                {/* Create Team Section - Always Visible */}
                <div className="flex justify-center mt-4 pt-4 border-t border-white/10">
                    <button
                        className="flex items-center space-x-2 text-white hover:text-purple-200 transition-colors duration-300"
                        onClick={handleCreateTeamClick}
                    >
                        <IoIosAddCircle className="text-xl" />
                        <span className="text-sm">Crear equipo</span>
                    </button>
                </div>
            </div>
        </div>
    )
}