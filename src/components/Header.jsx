"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { FaBell, FaStar, FaUser, FaEdit } from "react-icons/fa";
import { FaPeopleArrows } from "react-icons/fa";
import { RiTeamFill } from "react-icons/ri";
import { toCapitalCase } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function Header() {
    const [showRequests, setShowRequests] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [userId, setUserId] = useState(null);
    const [user, setUser] = useState(null);
    const [habilitiesId, setHabilitiesId] = useState([]);
    const [competenciasId, setCompetenciasId] = useState([]);
    const [habilitiesData, setHabilitiesData] = useState(null);
    const [competenciasData, setCompetenciasData] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        apellido: "",
        correo: "",
        imagen: null,
    });
    const [previewImage, setPreviewImage] = useState(null);
    const [requests, setRequests] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const supabase = createClientComponentClient();

    useEffect(() => {
        const channelUpdate = supabase
            .channel('usuarios')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'usuarios' }, (payload) => {
                if (payload.new.id_usuario === userId) {
                    setUser(prevUser => ({
                        ...prevUser,
                        ...payload.new
                    }));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channelUpdate);
        };
    }, [userId, supabase]);

    const getImageSrc = (imageUrl) => {
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            return imageUrl;
        }
        return null;
    };

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            if (typeof window !== 'undefined') {
                const savedSession = JSON.parse(localStorage.getItem('session'));
                if (savedSession && savedSession.user) {
                    setUserId(savedSession.user.id);
                    await fetchData(savedSession.user.id);
                }
            }
            setLoading(false);
        };

        fetchInitialData();
    }, []);

    useEffect(() => {
        if (habilitiesId.length > 0) {
            fetchHabilitiesData();
        }
    }, [habilitiesId]);

    useEffect(() => {
        if (competenciasId.length > 0) {
            fetchCompetenciasData();
        }
    }, [competenciasId]);

    const fetchUserData = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('usuarios')
                .select()
                .eq('id_usuario', userId)
                .single();

            if (error) throw error;

            setUser(data);
            setFormData({
                nombre: data.nombre || "",
                apellido: data.apellido || "",
                correo: data.correo || "",
                imagen: data.imagen_url || null,
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, imagen: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        let imageUrl = user.imagen_url;

        if (formData.imagen && formData.imagen instanceof File) {
            // Generar un número aleatorio
            const randomNumber = Math.floor(Math.random() * 1000000);

            // Obtener la extensión del archivo original
            const fileExtension = formData.imagen.name.split('.').pop();

            // Crear un nombre de archivo único
            const uniqueFileName = `${user.id_usuario}_${randomNumber}.${fileExtension}`;

            const { data, error } = await supabase.storage
                .from("images")
                .upload(`public/${user.id_usuario}/${uniqueFileName}`, formData.imagen);

            if (error) {
                console.error("Error uploading image:", error);
            } else {
                imageUrl = supabase.storage.from("images").getPublicUrl(data.path).data.publicUrl;
            }
        }

        const { error } = await supabase
            .from("usuarios")
            .update({
                nombre: formData.nombre,
                apellido: formData.apellido,
                correo: formData.correo,
                imagen_url: imageUrl,
            })
            .eq("id_usuario", user.id_usuario);

        if (error) {
            console.error("Error updating user data:", error);
        } else {
            setUser((prev) => ({
                ...prev,
                nombre: formData.nombre,
                apellido: formData.apellido,
                correo: formData.correo,
                imagen_url: imageUrl,
            }));
            setIsDialogOpen(false);
        }
        setLoading(false);
    };
    const fetchHabilitiesId = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('usuarios_habilidades')
                .select('id_habilidad')
                .eq('id_usuario', userId);
            if (error) throw error;
            setHabilitiesId(data);
        } catch (error) {
            console.log('Error al obtener datos de habilidades:', error);
        }
    };

    const fetchCompetenciasId = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('usuarios_competencias')
                .select('id_competencia')
                .eq('id_usuario', userId);
            if (error) throw error;
            setCompetenciasId(data);
        } catch (error) {
            console.log('Error al obtener datos de competencias:', error);
        }
    };

    const fetchHabilitiesData = async () => {
        try {
            const habilitiesIdArray = habilitiesId.map(item => item.id_habilidad);

            const { data, error } = await supabase
                .from('habilidades')
                .select('nombre_habilidad')
                .in('id_habilidad', habilitiesIdArray);

            if (error) throw error;
            setHabilitiesData(data.map(item => item.nombre_habilidad).join(', '));
        } catch (error) {
            console.log('Error al obtener datos de habilidades:', error);
        }
    };

    const fetchCompetenciasData = async () => {
        try {
            const competenciasIdArray = competenciasId.map(item => item.id_competencia);

            const { data, error } = await supabase
                .from('competencias')
                .select('nombre_competencia')
                .in('id_competencia', competenciasIdArray);

            if (error) throw error;
            setCompetenciasData(data.map(item => item.nombre_competencia).join(', '));
        } catch (error) {
            console.log('Error al obtener datos de competencias:', error);
        }
    };

    const fetchUserRequests = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('solicitudes')
                .select(`
                    id_equipo,
                    equipos (
                        nombre_equipo,
                        id_usuario,
                        usuarios (
                            nombre,
                            apellido
                        )
                    )
                `)
                .eq('id_usuario', userId)
                .eq('es_invitacion', true);

            if (error) throw error;

            const formattedRequests = data.map(request => ({
                idEquipo: request.id_equipo,
                nombre_equipo: request.equipos.nombre_equipo,
                nombre_lider: toCapitalCase(`${request.equipos.usuarios.nombre} ${request.equipos.usuarios.apellido}`),
            }));

            setRequests(formattedRequests);
        } catch (error) {
            console.log('Error al obtener datos de solicitudes de invitación:', error);
        }
    };

    const fetchUserNotifications = async (userId) => {
        try {
            const { data: equiposData, error: equiposError } = await supabase
                .from('equipos')
                .select('id_equipo')
                .eq('id_usuario', userId);

            if (equiposError) throw equiposError;

            if (!equiposData || equiposData.length === 0) {
                console.log('El usuario no lidera ningún equipo.');
                setNotifications([]);
                return;
            }

            const equiposIds = equiposData.map(equipo => equipo.id_equipo);

            const { data: solicitudesData, error: solicitudesError } = await supabase
                .from('solicitudes')
                .select(`
                    id_equipo,
                    equipos (
                        nombre_equipo
                    ),
                    usuarios (
                        id_usuario,
                        nombre,
                        apellido
                    )
                `)
                .in('id_equipo', equiposIds)
                .eq('es_invitacion', false);
            if (solicitudesError) throw solicitudesError;

            const formattedNotifications = solicitudesData.map(notification => ({
                idEquipo: notification.id_equipo,
                nombre_equipo: notification.equipos.nombre_equipo,
                idUsuario: notification.usuarios.id_usuario,
                nombre_usuario: toCapitalCase(`${notification.usuarios.nombre} ${notification.usuarios.apellido}`),
            }));

            setNotifications(formattedNotifications);

        } catch (error) {
            console.log('Error al obtener las notificaciones:', error);
        }
    };

    const fetchData = async (userId) => {
        try {
            await fetchUserData(userId);
            await fetchHabilitiesId(userId);
            await fetchCompetenciasId(userId);
            await fetchUserRequests(userId);
            await fetchUserNotifications(userId);
        } catch (error) {
            console.log('Error al obtener datos del usuario:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (idEquipo, userId) => {
        try {
            const { error: deleteError } = await supabase
                .from('solicitudes')
                .delete()
                .eq('id_usuario', userId)
                .eq('id_equipo', idEquipo);

            if (deleteError) throw deleteError;

            const { error: insertError } = await supabase
                .from('usuarios_equipos')
                .insert([
                    {
                        id_usuario: userId,
                        id_equipo: idEquipo,
                        rol_en_equipo: 'apoyo',
                    }
                ]);

            if (insertError) throw insertError;

            setRequests(prevRequests => prevRequests.filter(req => req.idEquipo !== idEquipo));

        } catch (error) {
            console.log('Error al aceptar la solicitud:', error);
        }
    };

    const handleRejectRequest = async (idEquipo, userId) => {
        try {
            const { error } = await supabase
                .from('solicitudes')
                .delete()
                .eq('id_usuario', userId)
                .eq('id_equipo', idEquipo);

            if (error) throw error;

            setRequests(prevRequests => prevRequests.filter(req => req.idEquipo !== idEquipo));

        } catch (error) {
            console.log('Error al rechazar la solicitud:', error);
        }
    };

    const handleAcceptNotification = async (idEquipo, idUsuario) => {
        try {
            console.log(idEquipo, idUsuario);
            const { error: insertError } = await supabase
                .from('usuarios_equipos')
                .insert([
                    {
                        id_usuario: idUsuario,
                        id_equipo: idEquipo,
                        rol_en_equipo: 'apoyo',
                    },
                ]);
            if (insertError) throw insertError;

            const { error: deleteError } = await supabase
                .from('solicitudes')
                .delete()
                .eq('id_usuario', idUsuario)
                .eq('id_equipo', idEquipo);

            if (deleteError) throw deleteError;

            setNotifications(prev => prev.filter(notification => notification.idEquipo !== idEquipo));

            console.log(`Solicitud aceptada para el equipo ${idEquipo}`);
        } catch (error) {
            console.log('Error al aceptar la solicitud:', error);
        }
    };

    const handleRejectNotification = async (idEquipo, idUsuario) => {
        try {
            const { error } = await supabase
                .from('solicitudes')
                .delete()
                .eq('id_usuario', idUsuario)
                .eq('id_equipo', idEquipo);

            if (error) throw error;

            setNotifications(prev => prev.filter(notification => notification.idEquipo !== idEquipo));

            console.log(`Solicitud rechazada para el equipo ${idEquipo}`);
        } catch (error) {
            console.log('Error al rechazar la solicitud:', error);
        }
    };

    const toggleShowRequests = () => {
        setShowRequests(!showRequests);
    };

    const toggleShowNotifications = () => {
        setShowNotifications(!showNotifications);
    };

    return (
        <header className="flex pt-4 pb-2 px-4 relative top-0 left-0 right-0 z-40">
            <div className="flex w-11/12 py-2 px-4 bg-opacity-15 bg-white rounded-xl justify-between">
                <div className="flex items-center ">
                    <div className="relative w-16 h-16 p-3">
                        {user && getImageSrc(user.imagen_url) ? (
                            <Image
                                src={getImageSrc(user.imagen_url)}
                                alt="User Image"
                                layout="fill"
                                objectFit="cover"
                                className="rounded-full"
                            />
                        ) : (
                            <FaUser className="w-full h-full " />
                        )}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <button
                                    className="absolute bottom-0 right-0  rounded-full p-1 bg-opacity-50 bg-gray-200"
                                    aria-label="Editar perfil"
                                >
                                    <FaEdit />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]  dark:bg-gradient-to-b dark:from-zinc-800 dark:to-zinc-900 bg-gradient-to-b from-blue-500 to-purple-500  dark:text-white text-white">
                                <DialogHeader>
                                    <DialogTitle className="dark:text-white">Editar perfil</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="nombre" className="dark:text-white">Nombres</Label>
                                        <Input
                                            id="nombre"
                                            name="nombre"
                                            value={formData.nombre}
                                            onChange={handleInputChange}
                                            placeholder="Nombre"
                                            className="dark:bg-zinc-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="apellido" className="dark:text-white">Apellidos</Label>
                                        <Input
                                            id="apellido"
                                            name="apellido"
                                            value={formData.apellido}
                                            onChange={handleInputChange}
                                            placeholder="Apellido"
                                            className="dark:bg-zinc-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="correo" className="dark:text-white">Correo</Label>
                                        <Input
                                            id="correo"
                                            name="correo"
                                            value={formData.correo}
                                            onChange={handleInputChange}
                                            placeholder="Correo"
                                            type="email"
                                            className="dark:bg-zinc-800 dark:text-white"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="imagen" className="dark:text-white">Imagen de perfil</Label>
                                        <Input
                                            id="imagen"
                                            name="imagen"
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                            className="dark:bg-zinc-800 dark:text-white"
                                        />
                                        {(previewImage || getImageSrc(formData.imagen)) && (
                                            <div className="mt-2">
                                                <div className="relative w-[150px] h-[150px]">
                                                    <Image
                                                        src={previewImage || getImageSrc(formData.imagen)}
                                                        alt="Preview"
                                                        fill
                                                        objectFit="cover"
                                                        className="rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-gradient-to-r from-purple-500 to-blue-500 text-white dark:bg-gradient-to-r dark:from-zinc-700 dark:to-zinc-800"
                                    >
                                        {loading ? "Actualizando..." : "Actualizar"}
                                    </Button>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="py-2 px-2">
                        {loading ? (
                            <div className="h-5 bg-gray-200 rounded-full bg-opacity-25 mb-2 w-24 animate-pulse"></div>
                        ) : (
                            <h3 className="text-md font-bold">
                                {user ? `${user.nombre} ${user.apellido}` : ''}
                            </h3>
                        )}
                        {loading ? (
                            <div className="h-4 bg-gray-200 rounded-full bg-opacity-25 w-48 animate-pulse"></div>
                        ) : (
                            <p className="text-xs">
                                {competenciasData && habilitiesData
                                    ? `${competenciasData} | ${habilitiesData}`
                                    : ''}
                            </p>
                        )}
                    </div>
                </div>
                <div className="flex items-center justify-around w-3/12">
                    <div>
                        <button>
                            <FaStar className="text-xl" />
                        </button>
                        {loading ? (
                            <div className="h-4 bg-gray-200 rounded-full bg-opacity-25 w-6 mx-auto mt-1 animate-pulse"></div>
                        ) : (
                            <p className="text-xs text-center">{user ? user.estrellas : ''}</p>
                        )}
                    </div>
                    <div>
                        <button>
                            <FaPeopleArrows className="text-xl" onClick={toggleShowRequests} />
                        </button>
                        {loading ? (
                            <div className="h-4 bg-gray-200 rounded-full bg-opacity-25 w-6 mx-auto mt-1 animate-pulse"></div>
                        ) : (
                            <p className="text-xs text-center">{requests.length}</p>
                        )}
                    </div>
                    <div>
                        <button>
                            <FaBell className="text-xl" onClick={toggleShowNotifications} />
                        </button>
                        {loading ? (
                            <div className="h-4 bg-gray-200 rounded-full bg-opacity-25 w-6 mx-auto mt-1 animate-pulse"></div>
                        ) : (
                            <p className="text-xs text-center">{notifications.length}</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex w-1/12 items-center justify-center">
                <ThemeToggle />
            </div>
            {showRequests && (
                <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="w-6/12 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900  bg-gradient-to-b from-purple-900/90 to-blue-900/90 backdrop-blur-md shadow-xl rounded-xl p-6 z-50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Solicitudes de Invitación</h2>
                            <button
                                type="button"
                                onClick={() => { setShowRequests(false) }}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <ul>
                            {requests.length > 0 ? (
                                requests.map((request, index) => (
                                    <li className="flex items-center justify-between mb-4" key={index}>
                                        <div className="flex items-center text-white">
                                            <RiTeamFill className="text-3xl mr-2" />
                                            <span>
                                                {request['nombre_lider']} te invitó a formar parte del equipo {request['nombre_equipo']}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <button
                                                className="px-4 py-2 mx-2 bg-green-500 bg-opacity-60 hover:bg-opacity-100 rounded-xl text-white"
                                                onClick={() => handleAcceptRequest(request.idEquipo, userId)}
                                            >
                                                Aceptar
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-red-500 bg-opacity-60 hover:bg-opacity-100 rounded-xl text-white"
                                                onClick={() => handleRejectRequest(request.idEquipo, userId)}
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <span>No hay solicitudes pendientes</span>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {showNotifications && (
                <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                    <div className="w-6/12 dark:bg-zinc-900 dark:from-zinc-900 dark:to-zinc-900  bg-gradient-to-b from-purple-900/90 to-blue-900/90 backdrop-blur-md shadow-xl rounded-xl p-6 z-50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Solicitudes de tus equipos</h2>
                            <button
                                type="button"
                                onClick={() => { setShowNotifications(false) }}
                                className="text-white/60 hover:text-white transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <ul>
                            {notifications.length > 0 ? (
                                notifications.map((notification, index) => (
                                    <li className="flex items-center justify-between mb-4" key={index}>
                                        <div className="flex items-center text-white">
                                            <RiTeamFill className="text-3xl mr-2" />
                                            <span>
                                                {notification['nombre_usuario']} solicita formar parte de tu equipo {notification['nombre_equipo']}
                                            </span>
                                        </div>
                                        <div className="flex">
                                            <button
                                                className="px-4 py-2 mx-2 bg-green-500 bg-opacity-60 hover:bg-opacity-100 rounded-xl text-white"
                                                onClick={() => handleAcceptNotification(notification.idEquipo, notification.idUsuario)}
                                            >
                                                Aceptar
                                            </button>
                                            <button
                                                className="px-4 py-2 bg-red-500 bg-opacity-60 hover:bg-opacity-100 rounded-xl text-white"
                                                onClick={() => handleRejectNotification(notification.idEquipo, notification.idUsuario)}
                                            >
                                                Rechazar
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <span>No hay notificaciones pendientes</span>
                            )}
                        </ul>
                    </div>
                </div>
            )}
        </header>
    );
}

