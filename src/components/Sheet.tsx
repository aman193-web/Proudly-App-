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
            className="absolute inset-0 z-40 bg-ink/35"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 z-50 rounded-t-[28px] bg-surface pb-8 pt-2.5 px-4 shadow-[0_-16px_40px_-12px_rgba(23,35,33,0.28)]"
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
            <div className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-hairline" />
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
