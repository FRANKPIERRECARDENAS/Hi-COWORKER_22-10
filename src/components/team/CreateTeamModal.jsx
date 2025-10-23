import { toast } from "@/hooks/use-toast"
import CreateTeam from "./create"

export default function CreateTeamModal({ onCancel, onTeamCreated }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="w-6/12 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900 bg-gradient-to-b from-purple-900/90 to-blue-900/90 backdrop-blur-md shadow-xl rounded-xl border border-white/10">
        <CreateTeam
          onCancel={onCancel}
          onTeamCreated={(newTeam) => {
            onTeamCreated(newTeam)
            toast({
              title: "¡Equipo creado exitosamente!",
              description: "El equipo ha sido creado correctamente.",
              variant: 'success'
            })
          }}
        />
      </div>
    </div>
  )
}

