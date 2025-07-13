import React from "react";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <>
      <Navbar />
      <div className="w-full flex justify-center mt-12 px-4">
        <div className="max-w-4xl bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-4">About D CODE IDE</h2>
          <p className="text-lg leading-relaxed">
            <strong>[D CODE]</strong> is a versatile integrated development
            environment designed for developers of all levels. It supports
            multiple programming languages, including Python, JavaScript, Java,
            C++, and more.
          </p>
          <p className="text-lg leading-relaxed mt-4">
            Key features include intelligent code completion, real-time
            collaboration, an integrated debugger, and a customizable interface.
            Enhance your workflow with our extensive plugin library and built-in
            terminal. Get started quickly with our comprehensive documentation
            and tutorials.
          </p>
        </div>
      </div>
    </>
  );
};

export default About;
