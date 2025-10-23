'use client'

import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'

export default function Register() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  // Form states
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [selectedDay, setSelectedDay] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [genero, setGenero] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // Options states
  const [skillsList, setSkillsList] = useState([])
  const [competenciesList, setCompetenciesList] = useState([])
  const [interestsList, setInterestsList] = useState([])

  // Selected options states
  const [selectedSkills, setSelectedSkills] = useState(['', ''])
  const [selectedCompetencies, setSelectedCompetencies] = useState(['', ''])
  const [selectedInterests, setSelectedInterests] = useState(['', ''])

  const [error, setError] = useState(null)
  const [isFormComplete, setIsFormComplete] = useState(false)

  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    const isStep1Complete = nombre && apellido && selectedDay && selectedMonth && selectedYear && genero && email && password
    const isStep2Complete = selectedSkills.every(skill => skill) &&
      selectedCompetencies.every(comp => comp) &&
      selectedInterests.every(interest => interest)

    setIsFormComplete(step === 1 ? isStep1Complete : isStep2Complete)
  }, [nombre, apellido, selectedDay, selectedMonth, selectedYear, genero, email, password, selectedSkills, selectedCompetencies, selectedInterests, step])

  const fetchOptions = async () => {
    try {
      const { data: habilidadesBlandas, error: skillsError } = await supabase
        .from('habilidades')
        .select('nombre_habilidad')

      if (skillsError) throw skillsError
      if (habilidadesBlandas) {
        setSkillsList(habilidadesBlandas.map(s => s.nombre_habilidad))
      }

      const { data: competencias, error: compError } = await supabase
        .from('competencias')
        .select('nombre_competencia')

      if (compError) throw compError
      if (competencias) {
        setCompetenciesList(competencias.map(c => c.nombre_competencia))
      }

      const { data: intereses, error: intError } = await supabase
        .from('intereses')
        .select('nombre_interes')

      if (intError) throw intError
      if (intereses) {
        setInterestsList(intereses.map(i => i.nombre_interes))
      }
    } catch (error) {
      console.error("Error detallado en fetchOptions:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las opciones: " + error.message,
        variant: "destructive",
      })
    }
  }

  const getAvailableOptions = (array, selected, currentIndex) => {
    if (!Array.isArray(array)) return []
    return array.filter((item) =>
      !selected.includes(item) || selected[currentIndex] === item
    )
  }

  const handleSignUp = async () => {
    if (!isFormComplete) {
      toast({
        title: "Error",
        description: "Por favor, complete todos los campos obligatorios.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: `${location.origin}/(auth)/callback`,
        }
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('No user data returned')

      const userId = authData.user.id

      const fechaNacimiento = new Date(selectedYear,
        ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
          "agosto", "septiembre", "octubre", "noviembre", "diciembre"]
          .indexOf(selectedMonth), selectedDay)

      const { data: userData, error: userError } = await supabase.from('usuarios')
        .insert([{
          id_usuario: userId,
          nombre,
          apellido,
          genero,
          correo: email,
          fecha_nacimiento: fechaNacimiento,
          rol: 'usuario',
          estrellas: 0,
        }])
        .select()
        .single()

      if (userError) throw userError

      const insertRelations = async (table, column, selectedItems) => {
        const promises = selectedItems
          .filter(item => item)
          .map(async (item) => {
            const { data, error } = await supabase
              .from(table)
              .select(`id_${column}`)
              .eq(`nombre_${column}`, item)
              .single()

            if (error) throw error

            return supabase
              .from(`usuarios_${table}`)
              .insert([
                {
                  id_usuario: userId,
                  [`id_${column}`]: data[`id_${column}`]
                }
              ])
          })

        await Promise.all(promises)
      }

      await insertRelations('competencias', 'competencia', selectedCompetencies)
      await insertRelations('intereses', 'interes', selectedInterests)
      await insertRelations('habilidades', 'habilidad', selectedSkills)

      toast({
        title: "¡Registro exitoso!",
        description: "Usuario creado satisfactoriamente.",
        duration: 3000,
      })

      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (error) {
      console.error('Error en el registro:', error)
      toast({
        title: "Error",
        description: error.message || "Hubo un error durante el registro",
        variant: "destructive",
      })
    }
  }

  const handleSkillChange = (value, index) => {
    const newSkills = [...selectedSkills]
    newSkills[index] = value
    setSelectedSkills(newSkills)
  }

  const handleCompetencyChange = (value, index) => {
    const newCompetencies = [...selectedCompetencies]
    newCompetencies[index] = value
    setSelectedCompetencies(newCompetencies)
  }

  const handleInterestChange = (value, index) => {
    const newInterests = [...selectedInterests]
    newInterests[index] = value
    setSelectedInterests(newInterests)
  }

  return (
    <div className="min-h-screen px-4 pt-1 flex flex-col items-center justify-center relative">
      <div className="w-full max-w-xl space-y-3">
        <div className="flex flex-col items-center mb-4">
          <div className="flex items-center justify-between w-full md:w-32 lg:w-32">
            <img
              alt="logo"
              src="/assets/logo.png"
              className="w-auto h-auto flex-grow"
            />
            <div>
              <ThemeToggle />
            </div>
          </div>
        </div>



        <Card className="bg-white/20 backdrop-blur-lg border-0">
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-white text-center">Información Personal</h3>
              <p className="text-yellow-300 text-center font-medium">
                Paso {step} de 2
              </p>
            </div>

            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      className="bg-white/30 border-0 text-white placeholder:text-white/70 h-12"
                      placeholder="Nombres"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      className="bg-white/30 border-0 text-white placeholder:text-white/70 h-12"
                      placeholder="Apellidos"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Date of birth section remains the same but with taller inputs */}
                <div className="space-y-2">
                  <Label className="text-white">Fecha de nacimiento</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Select value={selectedDay} onValueChange={setSelectedDay}>
                      <SelectTrigger className="bg-white/30 border-0 text-white h-12">
                        <SelectValue placeholder="Día" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => (
                          <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="bg-white/30 border-0 text-white h-12">
                        <SelectValue placeholder="Mes" />
                      </SelectTrigger>
                      <SelectContent>
                        {["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
                          "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
                          .map((month) => (
                            <SelectItem key={month} value={month.toLowerCase()}>{month}</SelectItem>
                          ))}
                      </SelectContent>
                    </Select>

                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="bg-white/30 border-0 text-white h-12">
                        <SelectValue placeholder="Año" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 100 }, (_, i) => (
                          <SelectItem key={i} value={String(2024 - i)}>{2024 - i}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Gender section remains the same */}
                <div className="space-y-2">
                  <Label className="text-white">Género</Label>
                  <RadioGroup value={genero} onValueChange={setGenero} className="flex gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="masculino" id="masculino" className="border-white" />
                      <Label htmlFor="masculino" className="text-white">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="femenino" id="femenino" className="border-white" />
                      <Label htmlFor="femenino" className="text-white">Femenino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="otro" id="otro" className="border-white" />
                      <Label htmlFor="otro" className="text-white">Otro</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Input
                  className="bg-white/30 border-0 text-white placeholder:text-white/70 h-12"
                  placeholder="Correo electrónico"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <div className="relative">
                  <Input
                    className="bg-white/30 border-0 text-white placeholder:text-white/70 h-12 pr-12"
                    placeholder="Contraseña nueva"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>

                <div className="space-y-4">
                  <Button
                    className={`w-full rounded-full h-12 text-white border border-white/50 
                      ${isFormComplete
                        ? 'bg-white text-purple-600 hover:bg-white/90'
                        : 'bg-white/20 hover:bg-white/30'}`}
                    onClick={() => setStep(2)}
                    disabled={!isFormComplete}
                  >
                    Continuar
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-white hover:underline"
                    >
                      ¿Ya tienes una cuenta? Inicia sesión
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Step 2 content remains the same but with taller inputs */}
                <div className="space-y-4">
                  <Label className="text-white">Habilidades</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((index) => (
                      <Select
                        key={`skill-${index}`}
                        value={selectedSkills[index]}
                        onValueChange={(value) => handleSkillChange(value, index)}
                      >
                        <SelectTrigger className="bg-white/30 border-0 text-white h-12">
                          <SelectValue placeholder={`Seleccione su habilidad ${index + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableOptions(skillsList, selectedSkills, index).map((skill) => (
                            <SelectItem key={skill} value={skill}>{skill}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-white">Competencias</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((index) => (
                      <Select
                        key={`competency-${index}`}
                        value={selectedCompetencies[index]}
                        onValueChange={(value) => handleCompetencyChange(value, index)}
                      >
                        <SelectTrigger className="bg-white/30 border-0 text-white h-12">
                          <SelectValue placeholder={`Seleccione su competencia ${index + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableOptions(competenciesList, selectedCompetencies, index).map((competency) => (
                            <SelectItem key={competency} value={competency}>{competency}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-white">Intereses</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {[0, 1].map((index) => (
                      <Select
                        key={`interest-${index}`}
                        value={selectedInterests[index]}
                        onValueChange={(value) => handleInterestChange(value, index)}
                      >
                        <SelectTrigger className="bg-white/30 border-0 text-white h-12">
                          <SelectValue placeholder={`Seleccione su interes ${index + 1}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableOptions(interestsList, selectedInterests, index).map((interest) => (
                            <SelectItem key={interest} value={interest}>{interest}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-full rounded-full h-12 bg-white/20 hover:bg-white/30 text-white border border-white/50"
                  >
                    Atrás
                  </Button>
                  <Button
                    className={`w-full rounded-full h-12 text-white border border-white/50 
                      ${isFormComplete
                        ? 'bg-white text-purple-600 hover:bg-white/90'
                        : 'bg-white/20 hover:bg-white/30'}`}
                    onClick={handleSignUp}
                    disabled={!isFormComplete}
                  >
                    Finalizar registro
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

      </div>
    </div>
  );
}