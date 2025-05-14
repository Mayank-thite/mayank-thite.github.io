import { useEffect } from "react";

export const Navbar = ({ menuOpen, setMenuOpen }) => {
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);
  return (
    <nav className="fixed top-0 w-full z-40 bg-[rgba(0, 0, 0, 0.8)] backdrop-blur-lg border-b border-white/10 shadow-lg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <a href="#home" className="font-sans text-l text-grey-800">
            {" "}
            <img
              src="src\assets\logo.png"
              alt="Logo"
              className="w-10 h-10 rounded-full"/>
          </a>

          <div
            className="w-7 h-5 relative cursor-pointer z-40 md:hidden"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            &#9776;
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#about"
              className="text-black hover:text-blue-700 transition-colors duration-400"
            >
              {" "}
              About{" "}
            </a>
            <a
              href="#projects"
              className="text-black hover:text-blue-700 transition-colors duration-400"
            >
              {" "}
              Projects{" "}
            </a>
                        <a
              href="#work"
              className="text-black hover:text-blue-700 transition-colors duration-400"
            >
              {" "}
              Work{" "}
            </a>
            <a
              href="#contact"
              className="text-black hover:text-blue-700 transition-colors duration-400"
            >
              {" "}
              Contact{" "}
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};