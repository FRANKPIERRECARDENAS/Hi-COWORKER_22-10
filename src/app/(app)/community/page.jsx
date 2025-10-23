"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaStar, FaUser, FaCircle, FaLightbulb } from "react-icons/fa";
import { RiTeamFill } from "react-icons/ri";
import { IoMdRocket } from 'react-icons/io';
import { Loader2Icon } from 'lucide-react';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Community() {

    const [userId, setUserId] = useState(null);
    const [showPeople, setShowPeople] = useState(true);
    const [showTeams, setShowTeams] = useState(false);
    const [showSelectTeams, setShowSelectTeams] = useState(false);
    const [users, setUsers] = useState(null);
    const [userTeams, setUserTeams] = useState([]);
    const [teams, setTeams] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedInfo, setSelectedInfo] = useState(null);
    const [userToAddToTeam, setUserToAddToTeam] = useState(null);
    const [isMember, setIsMember] = useState({});
    const [loading, setLoading] = useState(true);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [filteredTeams, setFilteredTeams] = useState([]);
    const [requests, setRequests] = useState({});
    const [requestsTeam, setRequestsTeam] = useState({});
    const [userSkills, setUserSkills] = useState({});
    const [userCompetencies, setUserCompetencies] = useState({});
    const [userTeamCount, setUserTeamCount] = useState({});
    const [teamUsers, setTeamUsers] = useState({});

    const supabase = createClientComponentClient();


    const getImageSrc = (imageUrl) => {
        if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            return imageUrl;
        }
        return null;
    };

    const checkIfMember = async () => {
        try {
            if (!userToAddToTeam || !userTeams) return;

            // Obtener IDs de los equipos actuales del usuario
            const userTeamIds = userTeams.map(team => team.id_equipo);

            if (userTeamIds.length === 0) {
                setIsMember({});
                return;
            }

            // Realizar la consulta para verificar si el usuario pertenece a esos equipos
            const { data, error } = await supabase
                .from('usuarios_equipos')
                .select('id_equipo')
                .eq('id_usuario', userToAddToTeam)
                .in('id_equipo', userTeamIds);

            if (error) {
                console.log('Error al verificar membresías:', error);
                return;
            }

            // Crear un objeto que indique si el usuario pertenece a cada equipo
            const memberStatus = userTeamIds.reduce((acc, id_equipo) => {
                acc[id_equipo] = data.some(item => item.id_equipo === id_equipo);
                return acc;
            }, {});
            setIsMember(memberStatus);
        } catch (error) {
            console.error('Error al verificar membresías:', error);
        }
    };

    console.log(teamUsers)
    const fetchUsers = async (userId) => {
        try {
            const { data, error } = await supabase.from('usuarios').select().neq('id_usuario', userId);
            if (error) throw error;
            setUsers(data || []);
            await setFilteredUsers(data || []);
            await fetchUserSkillsAndCompetencies(data);
            await fetchUserTeamCounts(data);
        } catch (error) {
            console.log('Error al obtener datos de los usuarios:', error);
        }
    }

    const fetchCommunityTeams = async (userId) => {
        try {
            // Paso 1: Obtener todos los id_equipo en los que el usuario está asociado
            const { data: associatedTeams, error: associatedTeamsError } = await supabase
                .from('usuarios_equipos')
                .select('id_equipo')
                .eq('id_usuario', userId);

            if (associatedTeamsError) throw associatedTeamsError;

            // Extraer los ids de los equipos asociados al usuario
            const associatedTeamIds = associatedTeams.map(team => team.id_equipo);

            // Paso 2: Consultar la tabla equipos excluyendo los equipos en los que el usuario está asociado
            const { data: teams, error: teamsError } = await supabase
                .from('equipos')
                .select()
                .not('id_equipo', 'in', `(${associatedTeamIds.join(',')})`); // Excluir equipos asociados al usuario

            if (teamsError) throw teamsError;

            // Actualizar el estado con los equipos obtenidos
            setTeams(teams || []);
            fetchTeamUsersCount();
        } catch (error) {
            console.log('Error al obtener datos de los equipos:', error);
        }
    };

    const fetchUserTeams = async (userId) => {
        try {
            // Paso 1: Obtener todos los id_equipo en los que el usuario está asociado
            const { data: associatedTeams, error: associatedTeamsError } = await supabase
                .from('equipos')
                .select()
                .eq('id_usuario', userId);

            if (associatedTeamsError) throw associatedTeamsError;
            setUserTeams(associatedTeams || [])
        } catch (error) {
            console.log('Error al obtener datos de los equipos:', error);
        }
    };


    useEffect(() => {
        const fetchData = async (userId) => {
            setLoading(true);
            try {
                await fetchUsers(userId);
                await fetchCommunityTeams(userId);
                await fetchUserTeams(userId);
            } catch (error) {
                console.log('Error al obtener datos del usuario:', error);
            } finally {
                setLoading(false);
            }
        };

        if (typeof window !== 'undefined') {
            const savedSession = JSON.parse(localStorage.getItem('session'));
            if (savedSession && savedSession.user) {
                setUserId(savedSession.user.id)
                fetchData(savedSession.user.id);
            }
        }
    }, []);

    const fetchUserSkillsAndCompetencies = async (usersData) => {
        const userIds = usersData.map(user => user.id_usuario);
        const skillsData = await Promise.all(userIds.map(id => fetchUserSkills(id)));
        const competenciesData = await Promise.all(userIds.map(id => fetchUserCompetencies(id)));

        setUserSkills(skillsData.reduce((acc, { userId, skills }) => {
            acc[userId] = skills;
            return acc;
        }, {}));

        setUserCompetencies(competenciesData.reduce((acc, { userId, competencies }) => {
            acc[userId] = competencies;
            return acc;
        }, {}));
    };

    const fetchUserSkills = async (userId) => {
        const { data, error } = await supabase
            .from('usuarios_habilidades')
            .select('id_habilidad')
            .eq('id_usuario', userId);

        if (error) {
            console.log('Error al obtener habilidades:', error);
            return { userId, skills: [] };
        }

        const skillsIds = data.map(item => item.id_habilidad);
        const { data: skillsData, error: skillsError } = await supabase
            .from('habilidades')
            .select('nombre_habilidad')
            .in('id_habilidad', skillsIds);

        if (skillsError) {
            console.log('Error al obtener datos de habilidades:', skillsError);
            return { userId, skills: [] };
        }

        return { userId, skills: skillsData.map(skill => skill.nombre_habilidad).join(', ') };
    };

    const fetchUserCompetencies = async (userId) => {
        const { data, error } = await supabase
            .from('usuarios_competencias')
            .select('id_competencia')
            .eq('id_usuario', userId);

        if (error) {
            console.log('Error al obtener competencias:', error);
            return { userId, competencies: [] };
        }

        const competenciesIds = data.map(item => item.id_competencia);
        const { data: competenciesData, error: competenciesError } = await supabase
            .from('competencias')
            .select('nombre_competencia')
            .in('id_competencia', competenciesIds);

        if (competenciesError) {
            console.log('Error al obtener datos de competencias:', competenciesError);
            return { userId, competencies: [] };
        }

        return { userId, competencies: competenciesData.map(competency => competency.nombre_competencia).join(', ') };
    };
    const fetchUserTeamCounts = async (usersData) => {
        const userIds = usersData.map(user => user.id_usuario);
        const teamCountsData = await Promise.all(userIds.map(id => fetchUserTeamCount(id)));

        setUserTeamCount(teamCountsData.reduce((acc, { userId, teamCount }) => {
            acc[userId] = teamCount;
            return acc;
        }, {}));
    };

    const fetchUserTeamCount = async (userId) => {
        const { count, error } = await supabase
            .from('usuarios_equipos')
            .select('id_usuario', { count: 'exact' })
            .eq('id_usuario', userId);

        if (error) {
            console.log('Error al contar equipos:', error);
            return { userId, teamCount: 0 };
        }

        return { userId, teamCount: count };
    };

    const fetchTeamUsersCount = async () => {
        // Paso 1: Obtener datos de la tabla 'usuarios_equipos'
        const { data: teamData, error } = await supabase
            .from('usuarios_equipos')
            .select('id_equipo');

        if (error) {
            console.log('Error al contar usuarios por equipo:', error);
            return {};
        }

        // Paso 2: Contar ocurrencias por 'id_equipo'
        const teamCounts = teamData.reduce((acc, { id_equipo }) => {
            acc[id_equipo] = (acc[id_equipo] || 0) + 1; // Incrementar el contador
            return acc;
        }, {});

        // Paso 3: Actualizar estado o devolver los datos
        setTeamUsers(teamCounts); // Guardamos como objeto para acceso por id_equipo
    };

    const fetchUserRequests = async () => {
        const { data, error } = await supabase
            .from('solicitudes')
            .select('id_equipo')
            .eq('id_usuario', userId);
        if (error) {
            console.log('Error al obtener solicitudes:', error);
            return [];
        }

        // Extraer los id_equipo de las solicitudes
        return data.map(request => request.id_equipo);
    };

    const fecthRequests = async () => {
        const teamRequests = await fetchUserRequests();

        // Creamos un objeto donde cada id_equipo es una clave, y el valor es true si existe solicitud
        const requestsObj = teamRequests.reduce((acc, id_equipo) => {
            acc[id_equipo] = true;
            return acc;
        }, {});
        setRequests(requestsObj);
    };

    const fetchUserRequestsTeams = async () => {
        const { data, error } = await supabase
            .from('solicitudes')
            .select('id_equipo')
            .eq('id_usuario', userToAddToTeam);
        if (error) {
            console.log('Error al obtener solicitudes:', error);
            return [];
        }

        // Extraer los id_equipo de las solicitudes
        return data.map(request => request.id_equipo);
    };

    const fecthRequestsTeams = async () => {
        const teamRequests = await fetchUserRequestsTeams();

        // Creamos un objeto donde cada id_equipo es una clave, y el valor es true si existe solicitud
        const requestsObj = teamRequests.reduce((acc, id_equipo) => {
            acc[id_equipo] = true;
            return acc;
        }, {});
        setRequestsTeam(requestsObj);
    };

    useEffect(() => {
        fecthRequests();
        fecthRequestsTeams();
    }, [userToAddToTeam]);

    useEffect(() => {
        checkIfMember();
        console.log(userToAddToTeam)
        console.log(userTeams)
    }, [userToAddToTeam, userTeams]);

    useEffect(() => {
        if (users) {
            setFilteredUsers(users.filter(user =>
                user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.apellido.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        }
        if (teams) {
            setFilteredTeams(teams.filter(team =>
                team.nombre_equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                team.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
            ));
        }
    }, [searchTerm, users, teams]);

    const toggleShowPeople = () => {
        setSelectedInfo(null);
        setShowTeams(false);
        setShowPeople(true);
    };

    const toggleShowTeams = () => {
        setSelectedInfo(null);
        setShowPeople(false);
        setShowTeams(true);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSelect = (item, isUser) => {
        fecthRequests();
        fecthRequestsTeams();
        setSelectedInfo(isUser ? { type: 'user', data: item } : { type: 'team', data: item });
    };

    const sendRequest = async (id_user, id_equipo, is_invitation) => {
        try {
            // Realizar la inserción en la base de datos
            const { data, error } = await supabase
                .from('solicitudes')
                .insert({
                    id_usuario: id_user,
                    id_equipo: id_equipo,
                    es_invitacion: is_invitation
                })
                .single(); // '.single()' se utiliza si solo esperamos un registro

            if (error) {
                // Si hay un error en la inserción, lanzamos una excepción
                throw new Error(error.message);
            }

            // Retornar datos exitosos de la solicitud
            return { success: true, data };
        } catch (error) {
            // Capturar y manejar cualquier error que ocurra
            console.log('Error al enviar la solicitud:', error.message);
            return { success: false, message: error.message };
        } finally {
            fecthRequests();
            fecthRequestsTeams();
        }
    };
    console.log(teamUsers)
    return (
        <>
            <section className="flex w-full h-full max-h-[68vh] px-4 py-2">
                <div className="h-80 flex flex-col mr-2">
                    {showPeople ? (
                        <>
                            <button className='h-1/2 mb-2 rounded-xl bg-opacity-40 bg-white hover:text-white'>
                                <FaUser className='text-2xl h-full mx-4' onClick={toggleShowPeople} />

                            </button>
                            <button className='h-1/2 rounded-xl bg-opacity-30 bg-white hover:text-white'>
                                <RiTeamFill className='text-2xl h-full mx-4' onClick={toggleShowTeams} />
                            </button>
                        </>
                    ) : (
                        <>
                            <button className='h-1/2 mb-2 rounded-xl bg-opacity-30 bg-white hover:text-white'>
                                <FaUser className='text-2xl h-full mx-4' onClick={toggleShowPeople} />
                            </button>
                            <button className='h-1/2 rounded-xl bg-opacity-20 bg-white hover:text-white'>
                                <RiTeamFill className='text-2xl h-full mx-4' onClick={toggleShowTeams} />
                            </button>
                        </>
                    )}
                </div>

                <div className="bg-opacity-30 bg-white p-4 rounded-md w-full mr-2 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                    <div className="w-full flex items-center my-4 px-4 bg-transparent">
                        <input
                            className="w-full bg-gray-400 placeholder:text-gray-300 bg-opacity-25 py-2 px-3 rounded-xl focus:outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-300"
                            type="text"
                            placeholder="Buscar"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <ul className='p-4 space-y-4'>
                        {loading ? (
                            <div className="flex items-center justify-center">
                                <Loader2Icon className="w-8 h-8 animate-spin" />
                            </div>
                        ) : showPeople && filteredUsers.map((user, index) => (
                            <li className='flex items-center justify-between' key={index}>
                                <div className='flex items-center space-x-3 flex-grow'>
                                    <div className="relative w-12 h-12 overflow-hidden rounded-full">
                                        {getImageSrc(user.imagen_url) ? (
                                            <Image
                                                src={getImageSrc(user.imagen_url)}
                                                alt="User Image"
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                        ) : (
                                            <FaUser className="w-full h-full text-gray-400" />
                                        )}
                                    </div>
                                    <div className='flex flex-col'>
                                        <button onClick={() => { handleSelect(user, true); setUserToAddToTeam(user.id_usuario) }} className='text-sm text-start font-bold hover:text-white'>
                                            {user.nombre} {user.apellido}
                                        </button>
                                        <span className='text-sm truncate max-w-[600px]'>{userSkills[user.id_usuario]} | {userCompetencies[user.id_usuario]}</span>
                                    </div>
                                </div>
                                <div className='flex items-center space-x-4'>
                                    <div className='flex items-center'>
                                        <FaStar className='mr-1' />
                                        <span>{user.estrellas}</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <RiTeamFill className='mr-1' />
                                        <span>{userTeamCount[user.id_usuario] || 0}</span>
                                    </div>
                                </div>
                            </li>
                        ))}
                        {showTeams && filteredTeams.map((team, index) => (
                            <li className='flex items-center justify-between' key={index}>
                                <button
                                    className='flex items-center space-x-3 flex-grow'
                                    onClick={() => handleSelect(team, false)}
                                    disabled={teamUsers[team["id_equipo"]] == team["total_miembros"]}
                                >
                                    <div className="relative w-12 h-12 overflow-hidden rounded-full">
                                        {getImageSrc(team.imagen_url) ? (
                                            <Image
                                                src={getImageSrc(team.imagen_url)}
                                                alt={`${team.nombre_equipo} image`}
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                        ) : (
                                            <RiTeamFill className="w-full h-full text-gray-400" />
                                        )}
                                    </div>
                                    <div className='flex flex-col items-start'>
                                        <span className='text-sm font-bold hover:text-white'>
                                            {team["nombre_equipo"]}
                                        </span>
                                        <span className='text-xs truncate max-w-[500px]'>{team["descripcion"]}</span>
                                    </div>
                                </button>
                                <div className='flex items-center space-x-4'>
                                    <div className='flex items-center'>
                                        <IoMdRocket className='mr-1' />
                                        <span>{team["puntos_acumulados"]}%</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <RiTeamFill className='mr-1' />
                                        <span>{teamUsers[team["id_equipo"]] || 0}/{team["total_miembros"]}</span>
                                    </div>
                                    <div className='flex items-center'>
                                        <FaCircle className={`mr-1 ${teamUsers[team["id_equipo"]] == team["total_miembros"] ? 'text-red-500' : 'text-green-500'}`} />
                                        <span className='text-xs'>
                                            {teamUsers[team["id_equipo"]] == team["total_miembros"] ? 'Sin vacantes' : `${team["total_miembros"] - (teamUsers[team["id_equipo"]] || 0)} vacante(s)`}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-opacity-30 bg-white p-4 rounded-md w-1/2">
                    {selectedInfo && (
                        <div className='p-4 bg-white bg-opacity-20 rounded-lg'>
                            {selectedInfo.type === 'user' ? (
                                <>
                                    <div className='flex justify-between items-center mb-4'>
                                        <div className="relative w-16 h-16 overflow-hidden rounded-full">
                                            {getImageSrc(selectedInfo.data.imagen_url) ? (
                                                <Image
                                                    src={getImageSrc(selectedInfo.data.imagen_url)}
                                                    alt="User Image"
                                                    layout="fill"
                                                    objectFit="cover"
                                                />
                                            ) : (
                                                <FaUser className="w-full h-full text-gray-400" />
                                            )}
                                        </div>
                                        <div className='flex space-x-4'>
                                            <div className='flex flex-col items-center'>
                                                <FaStar className='text-xl' />
                                                <span>{selectedInfo.data["estrellas"]}</span>
                                            </div>
                                            <div className='flex flex-col items-center'>
                                                <RiTeamFill className='text-xl' />
                                                <span>{userTeamCount[selectedInfo.data.id_usuario] || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='text-center'>
                                        <h3 className="text-lg font-bold mb-2">{selectedInfo.data.nombre} {selectedInfo.data.apellido}</h3>
                                        <p className="text-sm mb-4">{userSkills[selectedInfo.data.id_usuario]} | {userCompetencies[selectedInfo.data.id_usuario]}</p>
                                        <button
                                            onClick={() => setShowSelectTeams(true)}
                                            className='w-full bg-blue-500 hover:bg-blue-600 bg-opacity-50 p-2 rounded-xl transition-all duration-300'
                                        >
                                            Agregar a equipo
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className='flex justify-between items-center mb-4'>
                                        <div className="relative w-16 h-16 overflow-hidden rounded-full">
                                            {getImageSrc(selectedInfo.data.imagen_url) ? (
                                                <Image
                                                    src={getImageSrc(selectedInfo.data.imagen_url)}
                                                    alt="Team Image"
                                                    layout="fill"
                                                    objectFit="cover"
                                                />
                                            ) : (
                                                <RiTeamFill className="w-full h-full text-gray-400" />
                                            )}
                                        </div>
                                        <div className='flex items-center'>
                                            <IoMdRocket className='text-2xl mr-2' />
                                            <span>{selectedInfo.data["puntos_acumulados"]}%</span>
                                        </div>
                                    </div>
                                    <div className='text-center'>
                                        <h3 className="text-lg font-bold mb-2">{selectedInfo.data["nombre_equipo"]}</h3>
                                        <p className="text-sm mb-2">Miembros: {teamUsers[selectedInfo.data["id_equipo"]]} / {selectedInfo.data["total_miembros"]}</p>
                                        <div className='flex items-center justify-center mb-4'>
                                            <FaLightbulb className='text-xl mr-2' />
                                            <p className="text-sm ">{selectedInfo.data["descripcion"]}</p>
                                        </div>
                                        {requests[selectedInfo.data["id_equipo"]] ? (
                                            <button className='w-full bg-blue-500 bg-opacity-50 p-2 rounded-xl' disabled>Solicitud enviada</button>
                                        ) : (
                                            <button
                                                onClick={() => sendRequest(userId, selectedInfo.data["id_equipo"], false)}
                                                className='w-full bg-green-500 hover:bg-green-600 bg-opacity-50 p-2 rounded-xl transition-all duration-300'
                                            >
                                                Unirme
                                            </button>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
                {showSelectTeams && (
                    <div className="fixed inset-0 w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
                        <div className="w-6/12 bg-gradient-to-b from-purple-900/90 to-blue-900/90 backdrop-blur-md shadow-xl rounded-xl border border-white/10 p-6 z-50">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white">Equipos</h2>
                                <button
                                    type="button"
                                    onClick={() => { setShowSelectTeams(false) }}
                                    className="text-white/60 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                            <ul>
                                {userTeams.length > 0 ? (
                                    userTeams.map((userTeam, index) => (
                                        <li className="flex items-center justify-between mb-4" key={index}>
                                            <div className="flex items-center text-white">
                                                <RiTeamFill className="text-3xl mr-2" />
                                                <span>
                                                    {userTeam['nombre_equipo']}
                                                </span>
                                            </div>
                                            <div className="flex">
                                                {
                                                    teamUsers[userTeam["id_equipo"]] >= userTeam["total_miembros"] ? (
                                                        <button className="w-full mt-auto bg-gray-500 bg-opacity-50 p-2 rounded-xl transition-all duration-300" disabled>
                                                            Equipo completo
                                                        </button>
                                                    ) :
                                                        isMember[userTeam["id_equipo"]] ? (
                                                            <button className="w-full mt-auto bg-gray-500 bg-opacity-50 p-2 rounded-xl transition-all duration-300" disabled>
                                                                Ya es miembro
                                                            </button>
                                                        ) : requestsTeam[userTeam["id_equipo"]] ? (
                                                            <button className='w-full mt-auto bg-blue-500 hover:bg-blue-600 bg-opacity-50 p-2 rounded-xl transition-all duration-300' disabled>Solicitud enviada</button>
                                                        ) : (
                                                            <button
                                                                className="px-4 py-2 mx-2 bg-green-500 hover:bg-green-600 bg-opacity-60 hover:bg-opacity-100 rounded-xl text-white"
                                                                onClick={() => sendRequest(userToAddToTeam, userTeam["id_equipo"], true)}
                                                            >
                                                                Agregar
                                                            </button>
                                                        )}
                                            </div>
                                        </li>
                                    ))
                                ) : (
                                    <span>No haz creado ningún equipo todavía</span>
                                )}
                            </ul>

                        </div>
                    </div>
                )}
            </section>
        </>
    );
}