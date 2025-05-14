import { useEffect, useState } from "react";

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
    <>
      <div className="columns-2 m-4 justify-items-center">
        <div className="flex flex-col items-start justify-center h-screen bg-white text-gray-900">
          <div className="text-6xl font-semibold mb-4">Hello, I'm Mayank</div>
          <div className="text-2xl font-mono mb-4 flex items-center h-7 uppercase">
            A passionate&nbsp;
            <span className="relative overflow-hidden h-6 w-70 inline-block align-middle">
              <div
                className="transition-transform duration-500 ease-in-out"
                style={{
                  transform: `translateY(-${index * 1.5}rem)`,
                }}
              >
                {roles.map((role, i) => (
                  <div
                    key={i}
                    className="h-6 leading-6 bg-blue-500 text-white px-4"
                  >
                    {role}
                  </div>
                ))}
              </div>
            </span>
          </div>
        </div>
        <div>
          <img src="src\assets\hero.png" className="w-98 object-cover" />
        </div>
      </div>
    </>
  );
};
