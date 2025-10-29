import { Info } from 'lucide-react';
import Swal from 'sweetalert2';

interface InfoIconProps {
    title: string;
    content: string | string[];
    className?: string;
    size?: number;
}

export const InfoIcon = ({ title, content, className = '', size = 16 }: InfoIconProps) => {
    const handleClick = () => {
        // Convertir array de strings a HTML con saltos de línea
        const htmlContent = Array.isArray(content) 
            ? content.map(line => `<p class="mb-2 last:mb-0">${line}</p>`).join('')
            : `<p>${content}</p>`;

        Swal.fire({
            title: title,
            html: htmlContent,
            icon: 'info',
            confirmButtonText: 'Entendido',
            confirmButtonColor: '#3B82F6',
            customClass: {
                popup: 'swal2-popup-custom',
                title: 'swal2-title-custom',
                htmlContainer: 'swal2-html-custom',
            },
            didOpen: () => {
                // Aplicar estilos para dark mode si está activo
                const isDark = document.documentElement.classList.contains('dark');
                const popup = Swal.getPopup();
                if (popup && isDark) {
                    popup.style.backgroundColor = '#1F2937';
                    popup.style.color = '#F9FAFB';
                    
                    const title = popup.querySelector('.swal2-title');
                    if (title) {
                        (title as HTMLElement).style.color = '#F9FAFB';
                    }
                    
                    const htmlContainer = popup.querySelector('.swal2-html-container');
                    if (htmlContainer) {
                        (htmlContainer as HTMLElement).style.color = '#E5E7EB';
                    }
                }
            }
        });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`inline-flex items-center justify-center text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200 ${className}`}
            aria-label={`Información sobre ${title}`}
        >
            <Info size={size} />
        </button>
    );
};