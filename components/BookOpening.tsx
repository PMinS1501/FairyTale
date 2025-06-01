'use client'
import { motion } from "framer-motion"
import Image from "next/image"

export default function BookOpening({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ scale: 0.5, rotateY: 0, opacity: 0 }}
      animate={{ scale: 1, rotateY: 180, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="w-[300px] h-[400px] bg-white rounded-xl shadow-2xl overflow-hidden">
        <Image src="/imsi.png" alt="책" width={300} height={400} className="object-cover" />
      </div>
    </motion.div>
  )
}