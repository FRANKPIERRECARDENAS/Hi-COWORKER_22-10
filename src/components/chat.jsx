"use client";
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { IoSend } from 'react-icons/io5';
import MyMessage from './team/MyMessage';
import PartnerMessage from './team/PartnerMessage';
import { useState, useEffect, useRef } from 'react';

export default function Chat({ idTeam }) {
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(null);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const messagesPerPage = 10;

    const textareaRef = useRef(null);
    const chatContainerRef = useRef(null);
    const supabase = createClientComponentClient();

    const scrollToBottom = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    };

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
        }
    };

    const handleMessageChange = (e) => {
        setMessage(e.target.value);
        adjustTextareaHeight();
    };

    const fetchMessages = async (pageNumber) => {
        setIsLoading(true);
        try {
            const start = pageNumber * messagesPerPage;

            // Fetch messages with pagination
            const { data: messagesData, error: messagesError, count } = await supabase
                .from('mensajes')
                .select('*', { count: 'exact' })
                .eq('id_equipo', idTeam)
                .order('fecha_envio', { ascending: false }) // Get newest first
                .range(start, start + messagesPerPage - 1);

            if (messagesError) {
                console.error('Error fetching messages:', messagesError);
                return;
            }

            // If we got fewer messages than requested, there are no more to load
            if (messagesData.length < messagesPerPage) {
                setHasMore(false);
            }

            const messagesWithUserInfo = await Promise.all(
                messagesData.map(async (msg) => {
                    const { data: userInfo, error: userInfoError } = await supabase
                        .from('usuarios')
                        .select('nombre, apellido, imagen_url')
                        .eq('id_usuario', msg.id_usuario)
                        .single();

                    return {
                        ...msg,
                        nombre: userInfoError ? 'Usuario desconocido' : `${userInfo.nombre} ${userInfo.apellido}`,
                        imagen_url: userInfo?.imagen_url || null
                    };
                })
            );

            // Add new messages to the existing ones

            setMessages(prev => {
                const newMessages = [...prev];
                messagesWithUserInfo.forEach(msg => {
                    if (!newMessages.some(existing => existing.id_mensaje === msg.id_mensaje)) {
                        newMessages.push(msg);
                    }
                });
                const sortedMessages = newMessages.sort((a, b) =>
                    new Date(a.fecha_envio) - new Date(b.fecha_envio)
                );

                // Scroll to bottom after setting messages
                setTimeout(scrollToBottom, 0);

                return sortedMessages;
            });

        } catch (error) {
            console.error('Error in fetchMessages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial data fetch
    useEffect(() => {
        const fetchInitialData = async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user) {
                const { data: profileData, error: profileError } = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('id_usuario', userData.user.id)
                    .single();

                if (!profileError && profileData) {
                    setUser({ ...userData.user, ...profileData });
                }
            }

            // Fetch first page of messages
            await fetchMessages(0);
        };

        fetchInitialData();
    }, [idTeam]);

    // Handle scroll for infinite loading
    const handleScroll = () => {
        if (!chatContainerRef.current) return;

        const { scrollTop } = chatContainerRef.current;

        // If we're near the top and not currently loading and there are more messages
        if (scrollTop < 100 && !isLoading && hasMore) {
            setPage(prev => prev + 1);
            fetchMessages(page + 1);
        }
    };

    useEffect(() => {
        const container = chatContainerRef.current;
        if (container) {
            container.addEventListener('scroll', handleScroll);
            return () => container.removeEventListener('scroll', handleScroll);
        }
    }, [isLoading, hasMore, page]);

    // Real-time updates
    useEffect(() => {
        const channelUpdate = supabase
            .channel("mensajes")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "mensajes" },
                async (payload) => {
                    try {
                        if (payload.new.id_equipo !== idTeam) return;

                        const { data: userInfo, error: userInfoError } = await supabase
                            .from("usuarios")
                            .select("nombre, apellido, imagen_url")
                            .eq("id_usuario", payload.new.id_usuario)
                            .single();

                        const newMessage = {
                            ...payload.new,
                            nombre: userInfoError ? "Usuario desconocido" : `${userInfo.nombre} ${userInfo.apellido}`,
                            imagen_url: userInfo?.imagen_url || null
                        };

                    

                        // Scroll to bottom for new messages
                        if (chatContainerRef.current) {
                            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
                        }
                        setMessages((prevMessages) => {
                            const updatedMessages = [...prevMessages, newMessage];

                            // Scroll to bottom after adding new message
                            setTimeout(scrollToBottom, 0);

                            return updatedMessages;
                        });
                    } catch (error) {
                        console.error("Error handling new message:", error);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channelUpdate);
        };
    }, [idTeam]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const sendMessage = async () => {
        if (!message.trim()) return;
        if (!user) {
            console.error('El usuario no está autenticado.');
            return;
        }

        const { error } = await supabase
            .from('mensajes')
            .insert({
                id_usuario: user.id,
                id_equipo: idTeam,
                contenido: message,
                fecha_envio: new Date().toISOString(),
            });

        if (error) {
            console.error('Error enviando el mensaje:', error);
        } else {
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
    };

    return (
        <div className="w-10/12 px-5 flex flex-col justify-between relative">
            <div
                ref={chatContainerRef}
                className="flex flex-col mt-5 overflow-y-auto max-h-[55vh] p-4 rounded-lg [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-gray-400 dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
            >
                {isLoading && <div className="text-center py-2">Cargando mensajes...</div>}
                {messages.map((msg) =>
                    msg.id_usuario === user?.id ? (
                        <MyMessage
                            key={msg.id_mensaje}
                            message={msg.contenido}
                            user={msg.imagen_url || user?.imagen_url}
                        />
                    ) : (
                        <PartnerMessage
                            key={msg.id_mensaje}
                            message={msg.contenido}
                            userName={msg.nombre}
                            date={msg.fecha_envio}
                            userImage={msg.imagen_url}
                        />
                    )
                )}
            </div>
            <div className="fixed bottom-0 w-9/12 flex items-center my-4 px-4 bg-transparent">
                <div className="w-11/12 relative">
                    <textarea
                        ref={textareaRef}
                        className="w-full text-black placeholder:text-gray-400 bg-gray-400 bg-opacity-25 py-2 px-3 rounded-xl focus:outline-none focus:border-white focus:ring-2 focus:ring-white resize-none min-h-[40px] max-h-[150px] overflow-y-auto"
                        placeholder="Mensaje"
                        value={message}
                        onChange={handleMessageChange}
                        onKeyDown={handleKeyPress}
                        rows={1}
                    />
                </div>
                <button
                    className="w-1/12 flex items-center justify-center"
                    onClick={sendMessage}
                >
                    <IoSend className="text-3xl" />
                </button>
            </div>
        </div>
    );
}