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
                href="https://cmpggiyuiattqjmddcac.supabase.co/storage/v1/object/public/product-images/logo-image/B3F.webp"
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
