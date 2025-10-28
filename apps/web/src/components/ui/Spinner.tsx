interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: 'primary' | 'white' | 'gray'
    className?: string
}

function Spinner({
    size = 'md',
    color = 'primary',
    className = ''
}: SpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12'
    }

    const colorClasses = {
        primary: 'text-primary-600 dark:text-primary-400',
        white: 'text-white',
        gray: 'text-gray-600 dark:text-gray-400'
    }

    return (
        <div className={`inline-block animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}>
            <svg
                className="w-full h-full"
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
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
            </svg>
        </div>
    )
}

interface FullScreenSpinnerProps {
    message?: string
    show?: boolean
}

export function FullScreenSpinner({
    message = 'Cargando...',
    show = true
}: FullScreenSpinnerProps) {
    if (!show) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-4">
                <Spinner size="xl" color="primary" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {message}
                </p>
            </div>
        </div>
    )
}

export default Spinner