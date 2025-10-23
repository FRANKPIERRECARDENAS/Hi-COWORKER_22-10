"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Help() {
    const [activeTab, setActiveTab] = useState('video')

    return (
        <>
            <section className="w-full min-h-screen px-4 py-2">
                <div className="flex gap-4 mb-6">
                    <Button
                        variant="ghost"
                        className={cn(
                            "rounded-xl py-2 px-4",
                            activeTab === 'video' && "bg-white/30"
                        )}
                        onClick={() => setActiveTab('video')}
                    >
                        Temática o explicación
                    </Button>
                    <Button
                        variant="ghost"
                        className={cn(
                            "rounded-xl py-2 px-4",
                            activeTab === 'faq' && "bg-white/30"
                        )}
                        onClick={() => setActiveTab('faq')}
                    >
                        Preguntas frecuentes
                    </Button>
                </div>

                {activeTab === 'video' ? (
                    <div className="w-full aspect-video">
                        <iframe
                            className="w-full h-full px-4"
                            src="https://www.youtube.com/embed/PE7ZaN85I_0?si=K-n-cR3qNySMc24k"
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-2">
                        <h2 className="text-xl mb-6">Preguntas frecuentes</h2>
                        <div className="flex flex-col space-y-2">
                            <div className="flex rounded-xl py-4 px-4 bg-white/30 items-center justify-between">
                                <div className="flex items-center w-full">
                                    <h3 className="mx-4 w-full">¿Cuantos grupos puedo crear como máximo?</h3>
                                </div>
                                <span className="text-sm w-1/2">Solo puedes crear 4 equipos como máximo.
                                </span>
                            </div>

                            <div className="flex rounded-xl py-4 px-4 bg-white/30 items-center justify-between">
                                <div className="flex items-center w-full">
                                    <h3 className="mx-4 w-full">¿Porque no puedo rellenar los niveles de CREA?</h3>
                                </div>
                                <span className="text-sm w-1/2">
                                    Los niveles de CREA asi como otras funciones del grupo solo pueden ser rellenadas por el líder
                                </span>
                            </div>

                            <div className="flex rounded-xl py-4 px-4 bg-white/30 items-center justify-between">
                                <div className="flex items-center w-full">
                                    <h3 className="mx-4 w-full">¿Como se quien es el lider de mi equipo?</h3>
                                </div>
                                <span className="text-sm w-1/2">
                                    Tiene un icono diferenciador en su imagen de perfil en la pestaña Equipo.
                                </span>
                            </div>

                            <div className="flex rounded-xl py-4 px-4 bg-white/30 items-center justify-between">
                                <div className="flex items-center w-full">
                                    <h3 className="mx-4 w-full">¿Como puedo saber quien me da estrellas de valor?</h3>
                                </div>
                                <span className="text-sm w-1/2">
                                    No puedes saber porque son designadas de forma anonima
                                </span>
                            </div>

                            <div className="flex rounded-xl py-4 px-4 bg-white/30 items-center justify-between">
                                <div className="flex items-center w-full">
                                    <h3 className="mx-4 w-full">¿Como se escoge al lider?</h3>
                                </div>
                                <span className="text-sm w-1/2">
                                    El líder es designado de forma automática para quien crea su equipo, sin embargo él después puede escoger su reemplazo.
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </>
    )
}

