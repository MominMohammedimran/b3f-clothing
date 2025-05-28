import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preloader() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1500); // Show image + text
    const t2 = setTimeout(() => setStep(2), 2300); // Replace with final text
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const tshirtPath =
    "M420,100 L380,80 L350,50 L310,70 L290,120 L210,120 L190,70 L150,50 L120,80 L80,100 L90,180 L120,160 L130,420 L370,420 L380,160 L410,180 Z";

  return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-white ">
      <svg
        viewBox="0 0 500 500"
        className="
          w-full
          max-w-[20rem]     /* smaller max width on mobile */
          sm:max-w-[36rem]  /* bigger max width on tablets+ */
          md:max-w-[48rem]

          h-[40rem]         /* smaller height on mobile */
          sm:h-[44rem]
          md:h-[50rem]

          max-h-[80vh]
        "
        fill="none"
        stroke="black"
        strokeWidth="2"
      >
        <defs>
          <clipPath id="shirt-clip">
            <path d={tshirtPath} />
          </clipPath>
        </defs>

        {/* T-shirt outline */}
        <motion.path
          d={tshirtPath}
          initial={{ pathLength: 0, pathOffset: 1 }}
          animate={{ pathLength: 1, pathOffset: 0 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
          stroke="black"
          strokeWidth="3"
          fill="none"
        />

        {/* Dotted square */}
        <rect
          x="170"
          y="180"
          width="160"
          height="160"
          stroke="black"
          strokeWidth="1.5"
          strokeDasharray="6,4"
          clipPath="url(#shirt-clip)"
          fill="none"
        />

        <AnimatePresence>
          {step === 1 && (
            <>
              {/* Image */}
              <motion.image
                key="brand-image"
                href="data:image/jpeg;base64,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"
                x="180"
                y="160"
                width="140"
                height="150"
                clipPath="url(#shirt-clip)"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.4 }}
              />
              {/* Text below image */}
              <motion.text
                key="step1-text"
                x="250"
                y="320"
                textAnchor="middle"
                fontSize="18"
                fill="black"
                fontFamily="Arial, sans-serif"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                clipPath="url(#shirt-clip)"
              >
                Your Photo Here
              </motion.text>
            </>
          )}
        </AnimatePresence>

        {/* Final text after image */}
        <AnimatePresence>
          {step >= 2 && (
           <motion.g
              key="brand-final-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              clipPath="url(#shirt-clip)"
         >
           <text
               x="250"
             y="240"
            textAnchor="middle"
           fontSize="24"
              fill="black"
               fontFamily="Arial, sans-serif"
                >
                    <tspan x="250" dy="0">Your Text</tspan>
                 <tspan x="250" dy="28">Here</tspan>
               </text>
        </motion.g>

          )}
        </AnimatePresence>
      </svg>
    </div>
  );
}
