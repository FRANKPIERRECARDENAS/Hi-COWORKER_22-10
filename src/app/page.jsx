"use client"
import React from "react";
import ThemeToggle from "@/components/ThemeToggle";
import Animation from "./../../public/assets/Animation.json";
import Lottie from "lottie-react";
import Image from "next/image";
import Logo from "./../../public/assets/logo.png";
import HiCoworker from "./../../public/assets/hi-coworker.png";
import IconMessage from "./../../public/assets/chat.svg";
import IconChallenge from "./../../public/assets/challenge.svg";
import IconFeedback from "./../../public/assets/feedback.svg";
import whatsapp from "./../../public/assets/whatsapp.svg";
import linkedin from "./../../public/assets/linkedin.svg";
import youtube from "./../../public/assets/youtube.svg";
import facebook from "./../../public/assets/facebook.svg";
import nave from "./../../public/assets/nave.svg";
import { Card } from "@/components/landing/Card";
import CommentCarousel from "@/components/landing/CommentCarousel";
import BrandSlider from "@/components/landing/BrandSlider";


export default function LandingPage() {
  return (
    <div className="min-h-screen  light bg-fixed  text-white ">
      {/* Navbar */}
      <header className="w-full ">
        <nav className="container mx-auto flex items-center justify-between py-4 px-6">
          <a href="/"><Image src={Logo} height={40} alt="aaw" /></a>

          <div className="hidden md:flex space-x-4">
            <a href="/login" className="pointer border-white px-4 py-2 rounded-md text-white hover:bg-gray-200">Ingresar</a>
            <a href="/register" className=" pointer px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">Crear cuenta</a>
          </div>
        </nav>
      </header>
      
      {/* Hero Section */}
      <section className="flex justify-center items-center container mx-auto  pb-20 px-6">
        <div className="flex flex-col items-start max-w-[600px]">
          <h1 className="text-5xl font-bold mb-6 leading-[120%]">¡Conecta, emprende y triunfa con Hi COWORKER!</h1>
          <p className="text-white  text-lg mb-8">
            Una comunidad dinámica para emprendedores que buscan aprender, colaborar y superar desafíos mientras interactúan en tiempo real.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/login" className="´pointer shadow-md  transition-all duration-300 transform hover:scale-105 px-6 py-3 bg-black text-white border-gray-300 rounded-md hover:bg-gray-800">Ingresar</a>
            <a href="https://www.youtube.com/watch?v=PE7ZaN85I_0" target="_blank" className="pointer shadow-md  transition-all duration-300 transform hover:scale-105 px-6 py-3  text-white hover:text-gray-400 hover:bg-gray-800px-6 border border-gray-300 rounded-md hover:bg-gray-200">Conoce más</a>
          </div>
        </div>
        <Lottie className="w-1/3" animationData={Animation} loop={true} />
      </section>

      <div className="w-full aspect-video p-4">
        <iframe
          className="w-full h-full px-4"
          src="https://www.youtube.com/embed/PE7ZaN85I_0?si=K-n-cR3qNySMc24k"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>

      <section className="container mx-auto py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-[80px]">Todo lo que necesitas para empezar a crecer</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          <div className="text-center flex flex-col items-center">

            <Image src={IconFeedback} height={40} alt="feedback" className="pb-10" />
            <h3 className="text-lg font-semibold mb-2">Aprende a Emprender</h3>
            <p className="text-white ">Con el uso del método Learn StartUp haz crrecer tus ideas y evoluciona constantemente.</p>
          </div>

          <div className="text-center flex flex-col items-center">
            <Image src={IconMessage} height={40} alt="message" className="pb-10 text-red-600" />
            <h3 className="text-lg font-semibold mb-2">Chat en Tiempo Real</h3>
            <p className="text-white ">Conecta con emprendedores de todo el mundo y comparte ideas instantáneamente.</p>
          </div>

          <div className="text-center flex flex-col items-center">
            <Image src={IconChallenge} height={40} alt="challenge" className="pb-10" />
            <h3 className="text-lg font-semibold mb-2">Retos Personalizados</h3>
            <p className="text-white ">Supera desafíos únicos diseñados para potenciar tu creatividad y habilidades.</p>
          </div>

        </div>
      </section>
      <a href="https://chat.whatsapp.com/KKsqGPs3NwCDFWSyH53yzC" className="my-[100px] community flex flex-col items-center">
        <div className="group mb-10">
          <Image
            src={nave}
            alt="Animated Image"
            className="w-20 h-20 transition-transform duration-3000 ease-linear animate-diagonal"
          />
        </div>
        <div className="pointer shadow-md  transition-all duration-300 transform hover:scale-105 px-6 py-3  text-white hover:text-gray-400 hover:bg-gray-800px-6 border border-gray-300 rounded-md hover:bg-gray-200">Únete a la Comunidad</div>
      </a>
      <div className="text-center text-2xl font-semibold m-[80px]">Mira todo lo que tenemos que ofrecer</div>
      <div className="flex justify-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 gap-x-16 mb-[40px]">
          <Card
            title="Emprende tu futuro"
            description="Conéctate con otros emprendedores y supera retos mientras avanzas en tu camino."
          />
          <Card
            title="Desafíos creativos"
            description="Únete a nuestra comunidad y demuestra tu creatividad con desafíos divertidos."
          />
          <Card
            title="Crecimiento profesional"
            description="Desarrolla tus habilidades mientras interactúas con profesionales del sector."
          />
          <Card
            title="Reta tus límites"
            description="Participa en retos dinámicos y lleva tu mente al siguiente nivel."
          />
        </div>
      </div>

      <CommentCarousel />
      <BrandSlider />
      {/* Footer */}
      <footer className="bg-opacity-70 bg-black text-gray-200 pb-4">
        <div className=" container mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            {/* Logo y descripción */}
            <div className="flex flex-col items-center max-w-60">
              <Image
                src={HiCoworker}
                alt="Logo"
                className="h-8 w-auto mb-4"
              />

            </div>
            {/* Redes sociales */}
            <div>

              <div className="flex space-x-8">
                <a
                  href="https://www.youtube.com/@HiCOWORKER"
                  className="text-gray-400 hover:text-white transition-colors duration-300"

                >
                  <Image className="" src={youtube} height={40} alt="youtube" />
                </a>
                <a
                  href="https://www.linkedin.com/company/104418684/admin/dashboard/ "
                  className="text-gray-400 hover:text-white transition-colors duration-300"

                >
                  <Image className="text-white rounded-md overflow-hidden" src={linkedin} height={40} alt="linkedin" />
                </a>
                <a
                  href="https://chat.whatsapp.com/KKsqGPs3NwCDFWSyH53yzC"
                  className="text-gray-400 hover:text-white transition-colors duration-300"

                >
                  <Image className="text-white" src={whatsapp} height={40} alt="whatsapp" />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=61565529833095&locale=es_LA "
                  className="text-gray-400 hover:text-white transition-colors duration-300"

                >
                  <Image className="text-white" src={facebook} height={40} alt="facebook" />
                </a>
              </div>
            </div>
          </div>


        </div>
        <div className="text-center mb-12 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Hi Coworker. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
