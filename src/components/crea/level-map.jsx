'use client'

import React, { useState, useEffect } from 'react';
import { SearchIcon, LightbulbIcon, ClipboardCheckIcon, HandshakeIcon, TrophyIcon } from 'lucide-react';
import Image from 'next/image';
import { BsRocket } from "react-icons/bs";

function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const media = window.matchMedia(query);
        setMatches(media.matches);
        const listener = () => setMatches(media.matches);
        media.addEventListener('change', listener);
        return () => media.removeEventListener('change', listener);
    }, [query]);
    return matches;
}

const levelIcons = [
    <SearchIcon key={1} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />,
    <LightbulbIcon key={2} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />,
    <ClipboardCheckIcon key={3} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />,
    <HandshakeIcon key={4} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />,
    <TrophyIcon key={5} className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 xl:w-16 xl:h-16" />,
];

const circlePositions = [
    {
        xs: { top: '10%', left: '20%' },
        sm: { top: '10%', left: '20%' },
        md: { top: '15%', left: '10%' },
        lg: { top: '15%', left: '10%' },
        xl: { top: '10%', left: '10%' }
    },
    {
        xs: { top: '30%', left: '80%' },
        sm: { top: '30%', left: '80%' },
        md: { top: '80%', left: '30%' },
        lg: { top: '80%', left: '30%' },
        xl: { top: '84%', left: '30%' }
    },
    {
        xs: { top: '50%', left: '20%' },
        sm: { top: '50%', left: '20%' },
        md: { top: '15%', left: '50%' },
        lg: { top: '15%', left: '50%' },
        xl: { top: '10%', left: '50%' }
    },
    {
        xs: { top: '70%', left: '80%' },
        sm: { top: '70%', left: '80%' },
        md: { top: '80%', left: '70%' },
        lg: { top: '80%', left: '70%' },
        xl: { top: '84%', left: '70%' }
    },
    {
        xs: { top: '90%', left: '20%' },
        sm: { top: '90%', left: '20%' },
        md: { top: '15%', left: '90%' },
        lg: { top: '15%', left: '90%' },
        xl: { top: '10%', left: '90%' }
    }
];

const iconPositions = [
    {
        xs: { top: '5%', left: '85%' },
        sm: { top: '5%', left: '80%' },
        md: { top: '70%', left: '5%' },
        lg: { top: '70%', left: '5%' },
        xl: { top: '70%', left: '5%' }
    },
    {
        xs: { top: '30%', left: '10%' },
        sm: { top: '30%', left: '15%' },
        md: { top: '8%', left: '30%' },
        lg: { top: '8%', left: '30%' },
        xl: { top: '8%', left: '30%' }
    },
    {
        xs: { top: '50%', left: '85%' },
        sm: { top: '50%', left: '80%' },
        md: { top: '65%', left: '50%' },
        lg: { top: '65%', left: '50%' },
        xl: { top: '65%', left: '50%' }
    },
    {
        xs: { top: '70%', left: '10%' },
        sm: { top: '70%', left: '15%' },
        md: { top: '8%', left: '70%' },
        lg: { top: '8%', left: '70%' },
        xl: { top: '8%', left: '70%' }
    },
    {
        xs: { top: '92%', left: '85%' },
        sm: { top: '92%', left: '80%' },
        md: { top: '70%', left: '92%' },
        lg: { top: '70%', left: '92%' },
        xl: { top: '70%', left: '92%' }
    }
];

const connectionImages = [
    {
        image: '/assets/n1-n2.png',
        xs: { width: 190, height: 250, top: '20%', left: '52%', rotate: '-18deg' },
        sm: { width: 240, height: 250, top: '19%', left: '53%', rotate: '-18deg' },
        md: { width: 300, height: 155, top: '49%', left: '22%', rotate: '11deg' },
        lg: { width: 350, height: 180, top: '50%', left: '22%', rotate: '13deg' },
        xl: { width: 400, height: 210, top: '50%', left: '22%', rotate: '15deg' }
    },
    {
        image: '/assets/n2-n3.png',
        xs: { width: 140, height: 230, top: '42%', left: '53%', rotate: '210deg' },
        sm: { width: 215, height: 230, top: '44%', left: '53.5%', rotate: '210deg' },
        md: { width: 300, height: 155, top: '51%', left: '42%', rotate: '-6deg' },
        lg: { width: 350, height: 200, top: '50%', left: '41%', rotate: '-6deg' },
        xl: { width: 400, height: 245, top: '50%', left: '41%', rotate: '-6deg' }
    },
    {
        image: '/assets/n3-n4.png',
        xs: { width: 150, height: 220, top: '65%', left: '50%', rotate: '-18deg' },
        sm: { width: 215, height: 230, top: '64%', left: '52.5%', rotate: '-20deg' },
        md: { width: 300, height: 152, top: '51%', left: '63%', rotate: '7deg' },
        lg: { width: 350, height: 200, top: '50%', left: '63%', rotate: '5deg' },
        xl: { width: 400, height: 235, top: '48.5%', left: '63%', rotate: '10deg' }
    },
    {
        image: '/assets/n4-n5.png',
        xs: { width: 160, height: 230, top: '82%', left: '51%', rotate: '30deg' },
        sm: { width: 230, height: 235, top: '83%', left: '52.5%', rotate: '35deg' },
        md: { width: 300, height: 155, top: '52%', left: '82%', rotate: '-16deg' },
        lg: { width: 350, height: 200, top: '50%', left: '81%', rotate: '-16deg' },
        xl: { width: 400, height: 240, top: '52%', left: '82%', rotate: '-10deg' }
    }
];


const LevelMap = ({ levels, currentLevel, teamReto, onLevelClick, puntos_acumulados }) => {
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [activeConnections, setActiveConnections] = useState([]);
    const [completedLevels, setCompletedLevels] = useState([]);
    const [rocketProgress, setRocketProgress] = useState(0);

    const xs = useMediaQuery('(max-width: 425px)');
    const sm = useMediaQuery('(min-width: 575px) and (max-width: 767px)');
    const md = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
    const lg = useMediaQuery('(min-width: 1024px) and (max-width: 1279px)');
    const xl = useMediaQuery('(min-width: 1280px)');

    const getResponsiveSize = (positions) => {
        if (xs) return positions.xs;
        if (sm) return positions.sm;
        if (md) return positions.md;
        if (lg) return positions.lg;
        if (xl) return positions.xl;
        return positions.xs;
    };

    const handleLevelClick = (level, event) => {
        event.preventDefault();
        event.stopPropagation();
        const isCompleted = level.numero_nivel <= currentLevel;
        const allLevelsCompleted = rocketProgress === 100;

        if (allLevelsCompleted || isCompleted) {
            onLevelClick(level);
        }
    };


    const allLevelsCompleted = rocketProgress === 100;



    const calculateSize = () => {
        if (typeof window !== 'undefined') {
            const width = window.innerWidth;
            if (width < 640) return 200;
            if (width < 768) return 200;
            if (width < 1024) return 180;
            return 220;
        }
        return 80;
    };

    const [size, setSize] = useState(calculateSize());

    useEffect(() => {
        const updateSize = () => {
            setSize(calculateSize());
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        const showResponsiveToast = () => {
            const message = "Las preguntas están basadas en el método Lean Startup";
            setToastMessage(message);
            setShowToast(true);
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 3000);
            return () => clearTimeout(timer);
        };

        showResponsiveToast();
        const newActiveConnections = connectionImages.filter((_, index) => index < currentLevel - 1);
        setActiveConnections(newActiveConnections);
        const newCompletedLevels = levels.filter(level => level.numero_nivel < currentLevel);
        setCompletedLevels(newCompletedLevels);
        const progress = Math.max(0, Math.min(100, puntos_acumulados));
        setRocketProgress(progress);
    }, [currentLevel, puntos_acumulados, levels]);

    const renderToast = () => {
        const isMobile = window.innerWidth <= 768;

        return showToast ? (
            <div
                className={`fixed z-50 ${isMobile
                    ? 'bottom-4 left-1/2 transform -translate-x-1/2'
                    : 'bottom-4 right-4'
                    } bg-white bg-opacity-90 p-4 rounded-lg shadow-xl border border-purple-300`}
                style={{
                    maxWidth: isMobile ? '80%' : '300px',
                    textAlign: 'center',
                    animation: 'fadeInOut 5s ease-in-out'
                }}
            >
                <p className="text-gray-700 font-medium">
                    Las preguntas están basadas en el método <span className="font-bold text-purple-600">Lean Startup</span>
                </p>
            </div>
        ) : null;
    };

    return (
        <div className="relative w-full max-w-6xl mx-auto h-[700px] md:h-[400px] lg:h-[520px] rounded-xl p-4">
            {connectionImages.map((connection, index) => {
                const styles = getResponsiveSize(connection);
                const isActive = activeConnections.includes(connection);
                return (
                    <div
                        key={`connection-${index}`}
                        className={`absolute pointer-events-none transition-all duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`}
                        style={{
                            top: styles.top,
                            left: styles.left,
                            width: styles.width,
                            height: styles.height,
                            transform: `translate(-50%, -50%) rotate(${styles.rotate})`,
                        }}
                    >
                        <Image
                            src={connection.image}
                            alt={`Conexión ${index + 1} a ${index + 2}`}
                            fill
                            className="object-contain select-none"
                            priority
                            draggable="false"
                        />
                    </div>
                );
            })}

            {levels.map((level, index) => {
                const position = getResponsiveSize(circlePositions[index]);
                const iconPosition = getResponsiveSize(iconPositions[index]);
                const isCompleted = level.numero_nivel <= currentLevel;
                const allLevelsCompleted = rocketProgress === 100;
                const shouldHideIcon = index === 2 && (md || lg || xl);

                return (
                    <div key={level.id_nivel} className="absolute w-full h-full">
                        <button
                            onClick={(e) => handleLevelClick(level, e)}
                            disabled={!allLevelsCompleted && level.numero_nivel > currentLevel}
                            className={`absolute z-10 cursor-pointer
                w-20 h-20
                sm:w-24 sm:h-24
                md:w-24 md:h-24
                lg:w-32 lg:h-32
                xl:w-32 xl:h-32 
                rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted || allLevelsCompleted ? 'bg-yellow-500' : 'bg-gray-300'}
                ${level.numero_nivel === currentLevel && teamReto ? 'ring-4 ring-yellow-400' : ''}
                ${!allLevelsCompleted && level.numero_nivel > currentLevel ? 'opacity-50' : ''}
              `}
                            style={{
                                top: position.top,
                                left: position.left,
                                transform: 'translate(-50%, -50%)'
                            }}
                        >
                            <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold select-none">
                                Nivel {level.numero_nivel}
                            </div>
                        </button>
                        {!shouldHideIcon && (
                            <div
                                className={`absolute text-white opacity-85 pointer-events-none transition-colors duration-300 ${isCompleted ? 'text-yellow-500' : ''}`}
                                style={{
                                    top: iconPosition.top,
                                    left: iconPosition.left,
                                    transform: 'translate(-50%, -50%)'
                                }}
                            >
                                {levelIcons[index]}
                            </div>
                        )}
                    </div>
                );
            })}
            <div className="absolute inset-0 flex items-center justify-center pt-40">
                <div className="flex flex-col items-center justify-center space-y-4 pl-8 sm:space-y-6 ">
                    <div className="relative w-40 sm:w-52 aspect-[3/4] rounded-lg overflow-hidden">
                        <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden">
                            <div className="relative">
                                <BsRocket
                                    className="text-yellow-500"
                                    size={size}
                                />
                                <div
                                    className="absolute top-0 left-0 w-full overflow-hidden"
                                    style={{
                                        height: `${100 - rocketProgress}%`,
                                        clipPath: 'inset(0 0 0 0)',
                                        color: 'rgb(209, 213, 219)'
                                    }}
                                >
                                    <BsRocket size={size} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <p className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
                        Progreso: {rocketProgress}%
                    </p>
                </div>
            </div>
            {renderToast()}
            <style jsx global>{`
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; }
                    10%, 90% { opacity: 1; }
                }
            `}</style>

            {allLevelsCompleted && (
                <div className="absolute bottom-1 left-5/6 bg-green-500 text-white px-4 py-2 rounded-md shadow-md animate-bounce z-10">
                    ¡Felicitaciones! Completaste todos los niveles.
                </div>
            )}
        </div>
    );
};

export default LevelMap;

