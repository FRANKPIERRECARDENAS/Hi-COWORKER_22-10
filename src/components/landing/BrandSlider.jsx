import styles from './style.module.css'; // Asegúrate de que la ruta sea correcta
import Image from 'next/image';

const BrandSlider = () => {
  const logos = [
    '/assets/logos/logo1.png',
    '/assets/logos/logo2.png',
    '/assets/logos/logo3.png',
    '/assets/logos/logo4.png',
    '/assets/logos/logo5.png',
  ];

  return (
    <div className={styles.slider}>
      <div className={styles.move}>
        {logos.map((logo, index) => (
          <div key={index} className={styles.box}>
            <Image
              width={100}
              height={90}
              src={logo}
              alt={`Logo ${index}`}
              className="object-contain"
            />
          </div>
        ))}
        {/* Duplicamos los logos para el efecto infinito */}
        {logos.map((logo, index) => (
          <div key={index + logos.length} className={styles.box}>
            <Image
              width={100}
              height={90}
              src={logo}
              alt={`Logo ${index}`}
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandSlider;



