import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Navbar from "@/components/Navbar";

const NotFound: React.FC = () => {
  // Removed dynamic import of web component, not needed with DotLottieReact

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center  bg-white text-center px-4">
        <DotLottieReact
          src="https://lottie.host/1db20179-aa46-4746-b88e-fd6955a10b17/rjnerbal21.lottie"
          style={{ width: 400, height: 400 }}
          autoplay
          loop
        />

        <h1 className="text-3xl font-bold text-gray-800 mt-4">
          404 - Page Not Found
        </h1>
        <p className="text-gray-600 mt-2">
          Oops! The page you are looking for doesn’t exist.
        </p>

        <a
          href="/"
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Go Home
        </a>
      </div>
    </>
  );
};

export default NotFound;
