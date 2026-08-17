import { motion } from "framer-motion";

function LoadingSpinner() {
  return(
    <div className="min-h-screen flex items-center justify-center bg-[#111111]">
      <motion.div
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className="w-16 h-16 border-4 border-gray-700 border-t-[#ff9f0a] rounded-full"
      />
    </div>
  )
}

export default LoadingSpinner
