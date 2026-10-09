import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";

/* Bottom sheet that overlays the phone content without leaving the current screen. */
export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="absolute inset-0 z-40"
            style={{ background: "rgba(18,22,20,0.28)", backdropFilter: "blur(3px)", WebkitBackdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 max-h-[88%] overflow-y-auto scroll-area rounded-t-[30px] border-t border-white/95 pb-8 pt-2.5 px-4 shadow-[0_-10px_40px_-10px_rgba(20,50,44,0.25)]"
            style={{
              background: "rgba(255,255,255,0.82)",
              backdropFilter: "blur(30px) saturate(1.6)",
              WebkitBackdropFilter: "blur(30px) saturate(1.6)",
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 90) onClose();
            }}
          >
            <div className="mx-auto mb-1 h-1 w-9 rounded-full bg-[#d5d8d3]" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
