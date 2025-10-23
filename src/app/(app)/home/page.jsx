"use client"

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { FaStar } from 'react-icons/fa';
import { FaUser } from 'react-icons/fa';
import { RiTeamFill } from 'react-icons/ri';
import { IoMdRocket } from 'react-icons/io';
import { FaMessage } from "react-icons/fa6";
import { FaBookOpen } from "react-icons/fa";
import { FaLightbulb } from "react-icons/fa6";
import { FaTrophy } from "react-icons/fa";
import { Loader2Icon } from 'lucide-react';

import ImageConcurse from '../../../../public/assets/concurso.jpg'

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState({})
    const [teams, setTeams] = useState({})
    const [userSkills, setUserSkills] = useState({});
    const [userCompetencies, setUserCompetencies] = useState({});
    const [userTeamCount, setUserTeamCount] = useState({});

    const supabase = createClientComponentClient();

    const getImageSrc = (imageUrl) => {
        if (typeof imageUrl === 'string' && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
            return imageUrl;
        }
        return null;
    }; 

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

    const fetchUserTeamCounts = async (usersData) => {
        const userIds = usersData.map(user => user.id_usuario);
        const teamCountsData = await Promise.all(userIds.map(id => fetchUserTeamCount(id)));

        setUserTeamCount(teamCountsData.reduce((acc, { userId, teamCount }) => {
            acc[userId] = teamCount;
            return acc;
        }, {}));
    };

    const fetchUsers = async () => {
        try {
            const { data, error } = await supabase.from('usuarios').select().order('estrellas', { ascending: false }).limit(10);
            if (error) throw error;
            console.log(data);
            setUsers(data || []);
            await fetchUserSkillsAndCompetencies(data);
            await fetchUserTeamCounts(data);
        } catch (error) {
            console.log('Error al obtener datos de los usuarios:', error);
        }
    }

    const fetchTeams = async () => {
        try {
            const { data, error } = await supabase.from('equipos').select().order('puntos_acumulados', { ascending: false }).limit(3);
            if (error) throw error;
            console.log(data);
            setTeams(data || []);
        } catch (error) {
            console.log('Error al obtener datos de los usuarios:', error);
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await fetchTeams();
                await fetchUsers();
            } catch (error) {
                console.log('Error al obtener datos del usuario:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <>
            <section className="flex flex-col xl:flex-row lg:flex-row w-full xl:h-full lg:h-full max-h-[68vh] px-4 py-2">
                <div className="flex flex-col w-full xl:w-1/3 lg:w-2/3 xl:h-full lg:h-full mr-2">
                    <ul className="rounded-xl mb-2 py-4 px-4 bg-opacity-25 bg-white text-center flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                        <h3 className='text-lg font-bold my-2'>TOP 10 USUARIOS DE LA SEMANA</h3>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2Icon className="w-8 h-8 animate-spin" />
                            </div>
                        ) : users.map((user, index) => (
                            <li className='mb-4 flex items-center w-10/12 justify-between' key={index}>
                                <div className='flex w-1/2 items-center'>
                                {user && getImageSrc(user.imagen_url) ? (
                                        <Image
                                            src={getImageSrc(user.imagen_url)}
                                            alt="User Image"
                                            width={40}
                                            height={40}
                                            className="rounded-full object-cover w-10 h-10 mx-2 flex-shrink-0"
                                        />
                                    ) : (
                                        <FaUser className="text-xs w-10 h-10 p-2 mx-2 flex-shrink-0" />
                                    )}
                                    <div className='flex flex-col'>
                                        <button onClick={() => { console.log(user.id_usuario); }} className='text-sm text-start font-bold hover:text-white'>
                                            {user.nombre} {user.apellido}
                                        </button>
                                        <span className='text-xs text-justify'>{userSkills[user.id_usuario]} | {userCompetencies[user.id_usuario]}</span>
                                    </div>
                                </div>
                                <div className='flex mx-10'>
                                    <FaStar className='mx-2' />
                                    <span>{user.estrellas}</span>
                                </div>
                                <div className='flex'>
                                    <RiTeamFill className='mx-2' />
                                    <span>{userTeamCount[user.id_usuario] || 0}</span> {/* Muestra el número de equipos */}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <ul className="rounded-xl py-4 px-4 bg-opacity-25 bg-white text-center flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
                        <h3 className='text-lg font-bold my-2 bg-opacity-15'>TOP 3 EQUIPOS DE LA SEMANA</h3>
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <Loader2Icon className="w-8 h-8 animate-spin" />
                            </div>
                        ) : teams.map((team, index) => (
                            <li className='mb-4 flex items-center w-10/12 justify-between' key={index}>
                                <div className='flex w-1/2 items-center'>
                                {team.imagen_url && team.imagen_url !== "null" ? (
                                            <Image
                                                src={getImageSrc(team.imagen_url)}
                                                alt="Team Image"
                                                width={40}
                                                height={40}
                                                className="rounded-full object-cover w-10 h-10 mx-2 flex-shrink-0"
                                            />
                                        ) : (
                                            <RiTeamFill className="text-xs w-10 h-10 p-2 mx-2 flex-shrink-0" />
                                        )}
                                    <div className='flex flex-col'>
                                        <button onClick={() => { console.log(team.id_equipo); }} className='text-sm text-start font-bold hover:text-white'>
                                            {team.nombre_equipo}
                                        </button>
                                        <span className='text-xs text-justify'>{team.descripcion}</span>
                                    </div>
                                </div>
                                <div className='flex mx-10'>
                                    <IoMdRocket className='mx-2' />
                                    <span>{team.puntos_acumulados}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="flex flex-col w-full xl:w-2/3 lg:w-2/3 xl:h-full lg:h-full my-2 xl:my-0">
                    <div className="flex rounded-xl py-4 px-4 mb-2 bg-opacity-25 bg-white items-center justify-between flex-1">
                        <div className="flex items-center w-full">
                            <FaMessage className="text-2xl w-1/3" />
                            <h3 className="font-bold mx-4 w-full">EL CONSEJO DE EMPRENDIMIENTO DEL DIA</h3>
                        </div>
                        <span className="text-sm w-5/12">
                            “No tengas miedo al fracaso, ya que los errores pueden ser una fuente de aprendizaje”
                        </span>
                    </div>
                    <div className="flex rounded-xl py-4 px-4 mb-2 bg-opacity-25 bg-white items-center justify-between flex-1">
                        <div className="flex items-center w-full">
                            <FaBookOpen className="text-2xl w-1/3" />
                            <h3 className="font-bold mx-4 w-full">LIBRO DEL DÍA</h3>
                        </div>
                        <span className="text-sm w-5/12">Los siete hábitos de la gente altamente efectiva</span>
                    </div>
                    <div className="flex rounded-xl py-4 px-4 mb-2 bg-opacity-25 bg-white items-center justify-between flex-1">
                        <div className="flex items-center w-full">
                            <FaLightbulb className="text-2xl w-1/3" />
                            <h3 className="font-bold mx-4 w-full">LA IDEA MAS INNOVADORA DEL DIA</h3>
                        </div>
                        <span className="text-sm w-5/12">
                            “Crear una propuesta para implementar soluciones de energía solar en comunidades rurales, asegurando que sean accesibles y asequibles”
                        </span>
                    </div>
                    <div className="flex h-full my-auto rounded-xl py-4 px-4 mb-2 bg-opacity-25 bg-white items-center justify-between flex-1">
                        <div className="flex items-center w-full">
                            <FaTrophy className="text-2xl w-1/3" />
                            <h3 className="font-bold mx-4 w-full">
                                PROXIMO CONCURSO DE EMPRENDIMIENTO EN PERÚ
                            </h3>
                        </div>
                        <a target='_blank' href="https://startup.proinnovate.gob.pe/concursos/emprendimientos-innovadores/">
                        <Image
                            src={ImageConcurse}
                            alt="Concurso"
                            className="h-10 w-auto object-contain"
                        />
                        </a>
                    </div>
                </div>
            </section>

        </>
    );
}