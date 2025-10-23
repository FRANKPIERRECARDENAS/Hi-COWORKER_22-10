'use client'

import { useState, useEffect, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { RiTeamFill } from "react-icons/ri"
import { IoMdRocket } from "react-icons/io"
import { BiSolidNetworkChart } from "react-icons/bi"
import { FaHome } from "react-icons/fa"
import { IoHelpCircle } from "react-icons/io5"
import { LogOutIcon } from 'lucide-react'

import TeamSelector from "./TeamSelector"
import CreateTeamModal from "../team/CreateTeamModal"
import NavButton from "./NavButton"

export default function Nav() {
  const [showCardTeams, setShowCardTeams] = useState(false)
  const [showCardAddTeam, setShowCardAddTeam] = useState(false)
  const [userTeams, setUserTeams] = useState([])
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [currentUserId, setCurrentUserId] = useState(null)
  const supabase = createClientComponentClient()
  const router = useRouter()
  const pathname = usePathname()

  // Función para obtener el ID del equipo de la URL
  const getTeamIdFromPath = useCallback(() => {
    const matches = pathname.match(/\/team\/(\d+)/)
    return matches ? matches[1] : null
  }, [pathname])

  // Función para cargar el equipo actual basado en el ID de la URL
  const loadCurrentTeam = useCallback(async (teamId) => {
    if (!teamId) return null

    try {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .eq('id_equipo', teamId)
        .single()

      if (error) {
        console.log('Error loading team:', error)
        return null
      }

      return data
    } catch (error) {
      console.log('Error loading team:', error)
      return null
    }
  }, [supabase])

  const toggleShowCardTeams = () => {
    setShowCardTeams(!showCardTeams)
    setShowCardAddTeam(false)
  }

  const toggleShowCardAddTeam = () => {
    setShowCardAddTeam(!showCardAddTeam)
    setShowCardTeams(false)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    localStorage.removeItem('session')
    router.push('/')
  }
  const handleDeleteTeam = async (teamId) => {
    try {
      // First, delete all team members
      const { error: membersError } = await supabase
        .from('usuarios_equipos')
        .delete()
        .eq('id_equipo', teamId)

      if (membersError) {
        console.log('Error deleting team members:', membersError)
        return
      }

      // Then, delete the team itself
      const { error: teamError } = await supabase
        .from('equipos')
        .delete()
        .eq('id_equipo', teamId)

      if (teamError) {
        console.log('Error deleting team:', teamError)
        return
      }

      // Update local state
      setUserTeams(userTeams.filter(team => team.id_equipo !== teamId))
      if (selectedTeam?.id_equipo === teamId) {
        setSelectedTeam(null)
        router.push('/home')
      }

      toast({
        title: "Éxito",
        description: "El equipo ha sido eliminado correctamente.",
        variant: "default"
      })
    } catch (error) {
      console.log('Error during team deletion:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el equipo. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }
  const fetchUserTeams = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('usuarios_equipos')
          .select(`
            id_equipo,
            equipos:id_equipo (
              id_equipo,
              nombre_equipo,
              descripcion,
              imagen_url,
              id_usuario
            )
          `)
          .eq('id_usuario', user.id)

        if (error) {
          console.log('Error fetching user teams:', error)
        } else {
          const teams = data
            .map(item => item.equipos)
            .filter(team => team !== null)
          setUserTeams(teams)
          setCurrentUserId(user.id)

          // Si hay un ID de equipo en la URL, seleccionar ese equipo
          const teamId = getTeamIdFromPath()
          if (teamId) {
            const currentTeam = teams.find(team => team.id_equipo.toString() === teamId)
            if (currentTeam) {
              setSelectedTeam(currentTeam)
            }
          }
        }
      }
    } catch (error) {
      console.log('Error during fetching user teams:', error)
    }
  }, [supabase, getTeamIdFromPath])

  // Efecto para mantener el equipo seleccionado al actualizar la página
  useEffect(() => {
    const initializeTeam = async () => {
      const teamId = getTeamIdFromPath()
      if (teamId) {
        const team = await loadCurrentTeam(teamId)
        if (team) {
          setSelectedTeam(team)
        }
      }
    }

    initializeTeam()
  }, [pathname, loadCurrentTeam, getTeamIdFromPath])

  useEffect(() => {
    fetchUserTeams()
  }, [fetchUserTeams])

  useEffect(() => {
    // Reset selected team only when navigating to community or home
    if (pathname === '/community' || pathname === '/home') {
      setSelectedTeam(null)
    }
  }, [pathname])

  const handleSelectTeam = (team) => {
    setSelectedTeam(team)
    setShowCardTeams(false)
    router.push(`/team/${team.id_equipo}`)
  }

  const handleLeaveTeam = async (teamId) => {
    try {
      const { error } = await supabase
        .from('usuarios_equipos')
        .delete()
        .match({
          id_usuario: (await supabase.auth.getUser()).data.user?.id,
          id_equipo: teamId
        })

      if (error) {
        console.log('Error leaving team:', error)
      } else {
        setUserTeams(userTeams.filter(team => team.id_equipo !== teamId))
        if (selectedTeam?.id_equipo === teamId) {
          setSelectedTeam(null)
        }
      }
    } catch (error) {
      console.log('Error during leaving team:', error)
    }
  }

  const handleTeamCreated = useCallback(async (newTeam) => {
    setShowCardAddTeam(false)
    if (newTeam && typeof newTeam === 'object' && 'id_equipo' in newTeam) {
      await fetchUserTeams()
      setSelectedTeam(newTeam)
      router.push(`/team/${newTeam.id_equipo}`)
    } else {
      console.log('Invalid team data received:', newTeam)
      toast({
        title: "Error",
        description: "No se pudo cargar el nuevo equipo. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      })
    }
  }, [fetchUserTeams, router])

  const showCreateButton = selectedTeam ||
    pathname.startsWith('/team/') ||
    pathname.startsWith('/crea/')

  return (
    <nav className="top-0 left-0 right-0 z-30">
      <div className="flex justify-between px-8 mx-4 rounded-xl">
        <div className="flex w-4/12 justify-between">
          <NavButton
            icon={<RiTeamFill className="text-2xl" />}
            text="Equipo"
            onClick={toggleShowCardTeams}
          />
          {showCreateButton && (
            <NavButton
              icon={<IoMdRocket className="text-2xl" />}
              text="Crea"
              href={selectedTeam ? `/crea/${selectedTeam.id_equipo}` : `/crea/${getTeamIdFromPath()}`}
            />
          )}
          <NavButton
            icon={<BiSolidNetworkChart className="text-2xl" />}
            text="Comunidad"
            href="/community"
          />
          <NavButton
            icon={<FaHome className="text-2xl" />}
            text="Inicio"
            href="/home"
          />
        </div>

        <div className="flex">
          <NavButton
            icon={<IoHelpCircle className="text-2xl" />}
            text="Ayuda"
            href="/help"
          />
          <NavButton
            icon={<LogOutIcon className="text-2xl" />}
            text="Salir"
            onClick={handleSignOut}
          />
        </div>

        {showCardTeams && (
          <TeamSelector
            userTeams={userTeams}
            onClose={() => setShowCardTeams(false)}
            currentUserId={currentUserId}
            onLeaveTeam={handleLeaveTeam}
            onDeleteTeam={handleDeleteTeam}
            onCreateTeam={toggleShowCardAddTeam}
            setSelectedTeam={handleSelectTeam}
          />
        )}

        {showCardAddTeam && (
          <CreateTeamModal
            onCancel={() => setShowCardAddTeam(false)}
            onTeamCreated={handleTeamCreated}
          />
        )}
      </div>
    </nav>
  )
}