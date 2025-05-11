import React from 'react';
import './App.css'
import "tailwindcss";

function App() {
  return (
    <div className="font-sans bg-gray-100 text-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full backdrop-blur-md bg-white/30 shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">Mayank Thite</h1>
          <nav className="space-x-6">
            <a href="#about" className="hover:underline">About</a>
            <a href="#education" className="hover:underline">Education</a>
            <a href="#projects" className="hover:underline">Projects</a>
            <a href="#certifications" className="hover:underline">Certifications</a>
            <a href="#contact" className="hover:underline">Contact</a>
          </nav>
        </div>
      </header>

      <main className="pt-24 max-w-7xl mx-auto px-4">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 my-20">
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold">Hi, I'm Mayank.<br />A Data Analyst</h2>
            <a href="/resume.pdf" download className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700">Get Resume</a>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img src="/mayank-profile.jpg" alt="Mayank Thite" className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg" />
          </div>
        </section>

        {/* About */}
        <section id="about" className="my-20">
          <h3 className="text-2xl font-semibold mb-4">About Me</h3>
          <p>Experienced Data Analyst transforming complex datasets into actionable insights using SQL, Python, Tableau, and Power BI.</p>
        </section>

        {/* Education */}
        <section id="education" className="my-20">
          <h3 className="text-2xl font-semibold mb-4">Education</h3>
          <ul className="list-disc pl-5">
            <li>Conestoga College - Big Data Solutions Architecture (2024)</li>
            <li>Conestoga College - Computer Applications Development (2023)</li>
            <li>Savitribai Phule Pune University - BBA (2020)</li>
          </ul>
        </section>

        {/* Projects */}
        <section id="projects" className="my-20">
          <h3 className="text-2xl font-semibold mb-6">Projects</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(id => (
              <div key={id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 cursor-pointer">
                <h4 className="text-lg font-semibold mb-2">Project {id}</h4>
                <p className="text-sm">Brief description of Project {id}...</p>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section id="certifications" className="my-20">
          <h3 className="text-2xl font-semibold mb-4">Certifications</h3>
          <ul className="list-disc pl-5">
            <li>Programming in C (2021)</li>
            <li>SQL Server 2019 (2023)</li>
          </ul>
        </section>

        {/* Contact */}
        <section id="contact" className="my-20 grid md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4">Contact Me</h3>
            <form className="space-y-4">
              <input type="text" placeholder="Name" className="w-full p-2 border rounded" />
              <input type="email" placeholder="Email" className="w-full p-2 border rounded" />
              <textarea placeholder="Message" rows="4" className="w-full p-2 border rounded"></textarea>
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Send</button>
            </form>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Let's Connect</h3>
            <p>Email: <a href="mailto:mayankthite.ca@gmail.com" className="text-blue-600 hover:underline">mayankthite.ca@gmail.com</a></p>
            <p>LinkedIn: <a href="https://linkedin.com/in/your-link" className="text-blue-600 hover:underline">linkedin.com/in/your-link</a></p>
            <p>Elevator Pitch: <a href="/elevator-pitch.mp4" className="text-blue-600 hover:underline">Watch Video</a></p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 text-center">
        <p>&copy; {new Date().getFullYear()} Mayank Thite. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;