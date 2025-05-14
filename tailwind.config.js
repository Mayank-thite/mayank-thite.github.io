export default {
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      animation: {
        fade: "fadeInOut 2s ease-in-out",
      },
      keyframes: {
        fadeInOut: {
          "0%,100%": { opacity: 0, transform: "translateY(10px)" },
          "50%": { opacity: 1, transform: "translateY(0px)" },
        },
      },
    },
  },
};
