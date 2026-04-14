import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'muted'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

const Badge = ({ className, variant = 'primary', size = 'md', children, ...props }: BadgeProps) => {
  const variants = {
    primary: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    secondary: 'bg-secondary-500/20 text-secondary-400 border-secondary-500/30',
    success: 'bg-success-500/20 text-success-400 border-success-500/30',
    warning: 'bg-warning-500/20 text-warning-400 border-warning-500/30',
    danger: 'bg-danger-500/20 text-danger-400 border-danger-500/30',
    muted: 'bg-background-muted text-text-muted border-border'
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm'
  }

  return (
    <div 
      className={cn(
        'status-badge',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export default Badge