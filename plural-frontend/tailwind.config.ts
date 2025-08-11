import type { Config } from "tailwindcss";
import typography from '@tailwindcss/typography';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lora: ['Lora', 'serif'],
        manrope: ['Manrope', 'sans-serif'],
      },
      // --- ADICIONE ESTA SEÇÃO ---
      // Aqui, customizamos os estilos aplicados pela classe 'prose'
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.gray[800]'),
            '--tw-prose-headings': theme('colors.gray[900]'),
            'h1, h2, h3, h4, h5, h6': {
              fontFamily: theme('fontFamily.lora'), // Aplica Lora a todos os títulos
            },
            p: {
              fontFamily: theme('fontFamily.manrope'), // Garante Manrope para parágrafos
            },
            // Adicione outras customizações se desejar
          },
        },
      }),
    },
  },
  plugins: [
    typography,
  ],
};
export default config;