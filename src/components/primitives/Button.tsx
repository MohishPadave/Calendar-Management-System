import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onAnimationEnd' | 'style'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  isLoading?: boolean;
  animate?: boolean;
  ripple?: boolean;
}

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10 
    }
  },
  tap: { 
    scale: 0.95,
    transition: { 
      type: "spring", 
      stiffness: 600, 
      damping: 15 
    }
  },
  loading: {
    scale: [1, 1.02, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

const rippleVariants: Variants = {
  initial: { scale: 0, opacity: 0.6 },
  animate: { 
    scale: 4, 
    opacity: 0,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    children, 
    isLoading = false, 
    disabled,
    className = '',
    animate = true,
    ripple = true,
    onClick,
    ...props 
  }, ref) => {
    const [ripples, setRipples] = React.useState<Array<{ id: number; x: number; y: number }>>([]);
    
    const baseClasses = 'relative inline-flex items-center justify-center font-medium rounded-lg focus-visible disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';
    
    const variantClasses = {
      primary: 'bg-primary-600 dark:bg-primary-500 text-white hover:bg-primary-700 dark:hover:bg-primary-600 active:bg-primary-800 dark:active:bg-primary-700',
      secondary: 'bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-300 dark:hover:bg-neutral-600 active:bg-neutral-400 dark:active:bg-neutral-500',
      ghost: 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 active:bg-neutral-200 dark:active:bg-neutral-700',
      danger: 'bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 active:bg-red-800 dark:active:bg-red-700',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (ripple && !disabled && !isLoading) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newRipple = { id: Date.now(), x, y };
        setRipples(prev => [...prev, newRipple]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(r => r.id !== newRipple.id));
        }, 600);
      }
      
      onClick?.(e);
    };

    if (animate) {
      const motionProps = {
        variants: buttonVariants,
        initial: "initial" as const,
        animate: isLoading ? "loading" as const : "initial" as const,
        ...(disabled || isLoading ? {} : {
          whileHover: "hover" as const,
          whileTap: "tap" as const,
        }),
      };

      return (
        <motion.button
          ref={ref}
          className={classes}
          disabled={disabled || isLoading}
          onClick={handleClick}
          type={props.type}
          form={props.form}
          name={props.name}
          value={props.value}
          autoFocus={props.autoFocus}
          tabIndex={props.tabIndex}
          aria-label={props['aria-label']}
          aria-describedby={props['aria-describedby']}
          aria-expanded={props['aria-expanded']}
          aria-haspopup={props['aria-haspopup']}
          aria-pressed={props['aria-pressed']}
          role={props.role}
          id={props.id}
          title={props.title}
          {...motionProps}
        >
          {/* Ripple Effects */}
          <AnimatePresence>
            {ripples.map((ripple) => (
              <motion.span
                key={ripple.id}
                className="absolute rounded-full bg-white/30 pointer-events-none"
                style={{
                  left: ripple.x - 10,
                  top: ripple.y - 10,
                  width: 20,
                  height: 20,
                }}
                variants={rippleVariants}
                initial="initial"
                animate="animate"
                exit="initial"
              />
            ))}
          </AnimatePresence>

          {/* Content */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center"
              >
                <motion.svg 
                  className="-ml-1 mr-2 h-4 w-4" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <circle 
                    className="opacity-25" 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </motion.svg>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  Loading...
                </motion.span>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      );
    }

    // Non-animated version
    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || isLoading}
        onClick={handleClick}
        type={props.type}
        form={props.form}
        name={props.name}
        value={props.value}
        autoFocus={props.autoFocus}
        tabIndex={props.tabIndex}
        aria-label={props['aria-label']}
        aria-describedby={props['aria-describedby']}
        aria-expanded={props['aria-expanded']}
        aria-haspopup={props['aria-haspopup']}
        aria-pressed={props['aria-pressed']}
        role={props.role}
        id={props.id}
        title={props.title}
      >
        {isLoading ? (
          <>
            <svg 
              className="animate-spin -ml-1 mr-2 h-4 w-4" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;