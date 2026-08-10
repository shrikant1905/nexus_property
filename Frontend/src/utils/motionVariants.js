// Reusable Framer Motion variants for Relaxtay app
// Duration: 0.25s to 0.4s | Distance: 12px to 20px | Smooth easing

export const defaultEase = [0.25, 0.1, 0.25, 1.0];

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: defaultEase } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: defaultEase } },
};

export const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: defaultEase } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2, ease: defaultEase } },
};

export const slideInRight = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.35, ease: defaultEase } },
  exit: { opacity: 0, x: 16, transition: { duration: 0.2, ease: defaultEase } },
};

export const slideInTop = {
  hidden: { opacity: 0, y: -16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: defaultEase } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2, ease: defaultEase } },
};

export const slideInBottom = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: defaultEase } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2, ease: defaultEase } },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: defaultEase } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: 0.2, ease: defaultEase } },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: defaultEase } },
};

export const pageTransition = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: defaultEase } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: defaultEase } },
};

export const modalAnimation = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: defaultEase } },
  exit: { opacity: 0, scale: 0.96, y: 12, transition: { duration: 0.2, ease: defaultEase } },
};

export const backdropAnimation = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const dropdownAnimation = {
  hidden: { opacity: 0, y: -10, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2, ease: defaultEase } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.15, ease: defaultEase } },
};

export const sidebarAnimation = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.3, ease: defaultEase } },
  exit: { x: '-100%', transition: { duration: 0.25, ease: defaultEase } },
};

export const buttonHoverTap = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.15 },
};
