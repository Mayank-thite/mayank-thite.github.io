import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import HeroImage from "../../assets/hero.png";

export const Home = () => {
  const roles = [
    "Data Analyst",
    "Software Developer",
    "ETL Developer",
    "UI/UX Designer",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % roles.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col md:flex-row justify-center items-center min-h-screen p-4">
      <div className="flex flex-col items-start justify-center text-gray-900 md:mr-8 mb-8 md:mb-0">
        <div className="text-4xl md:text-6xl font-semibold mb-4">
          Hello, I'm Mayank
        </div>
        <div className="text-xl md:text-2xl font-mono mb-4 flex items-center h-7 uppercase">
          A passionate&nbsp;
          <span className="relative overflow-hidden h-6 w-full md:w-[18rem] inline-block align-middle">
            <motion.div
              className="transition-transform duration-500 ease-in-out"
              animate={{ translateY: `-${index * 1.5}rem` }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {roles.map((role, i) => (
                <div
                  key={i}
                  className="h-6 leading-6 bg-blue-500 text-white px-4 py-0 whitespace-nowrap"
                >
                  {role}
                </div>
              ))}
            </motion.div>
          </span>
        </div>
      </div>
      <div className="w-full md:w-auto max-w-md">
        <img
          src={HeroImage}
          className="w-full object-cover rounded-lg"
          alt="Portrait"
        />
      </div>
    </div>
  );
};
