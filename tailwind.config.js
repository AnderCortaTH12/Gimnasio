/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fondo y superficies (tema oscuro)
        bg: '#0B0B0F', // fondo base de la app
        surface: '#1A1A22', // tarjetas y paneles
        border: '#26262F', // bordes y separadores
        // Texto
        text: '#F5F5F7', // texto principal
        // Acento primario
        lime: '#C6FF3D', // acento / call-to-action
        // Estados semánticos
        pr: '#4ADE80', // récord personal (verde)
        regress: '#F87171', // retroceso (rojo)
        warn: '#FBBF24', // aviso (ámbar)
      },
      fontFamily: {
        // Inter para toda la UI
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        // Los números destacados van en extrabold
        number: '800',
      },
      keyframes: {
        // Entrada suave de pantallas al cambiar de pestaña
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        confetti: {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(110vh) rotate(540deg)', opacity: '0' },
        },
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        confetti: 'confetti 2.2s ease-in forwards',
      },
    },
  },
  plugins: [],
}
