import { motion } from "framer-motion";

export function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <motion.span
          key={i}
          className="h-1.5 rounded-full"
          animate={{
            width: i === current ? 22 : 6,
            backgroundColor: i <= current ? "#217c72" : "#dce3e0",
          }}
          transition={{ duration: 0.3 }}
        />
      ))}
    </div>
  );
}
