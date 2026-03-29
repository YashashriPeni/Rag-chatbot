import { useEffect, useState } from "react";

export default function SplashScreen({ onFinish }) {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setFade(true), 1500);
    const timer2 = setTimeout(onFinish, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-[#fdf8f3] transition-opacity duration-500 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="text-center">

        <h1 className="text-3xl font-bold mb-4 animate-pulse">
          🏥 Arundhati
        </h1>

        <p className="text-gray-500 mb-4">
          Student Health Assistant
        </p>

        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-150"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full animate-bounce delay-300"></div>
        </div>

      </div>
    </div>
  );
}