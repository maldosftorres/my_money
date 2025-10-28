import Swal from 'sweetalert2';

// Configuración base para SweetAlert2
const baseConfig = {
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#ef4444',
    background: '#ffffff',
    color: '#1f2937',
    customClass: {
        popup: 'rounded-lg shadow-xl',
        confirmButton: 'px-4 py-2 rounded-md font-medium',
        cancelButton: 'px-4 py-2 rounded-md font-medium',
        title: 'text-lg font-semibold',
        content: 'text-sm'
    }
};

// Configuración para modo oscuro (si quieres implementarlo después)
// const darkConfig = {
//     ...baseConfig,
//     background: '#1f2937',
//     color: '#f9fafb'
// };

export const notifications = {
    /**
     * Muestra una notificación de éxito
     */
    success: (message: string, title: string = '¡Éxito!') => {
        return Swal.fire({
            ...baseConfig,
            icon: 'success',
            title,
            text: message,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            toast: true,
            position: 'top-end'
        });
    },

    /**
     * Muestra una notificación de error
     */
    error: (message: string, title: string = 'Error') => {
        return Swal.fire({
            ...baseConfig,
            icon: 'error',
            title,
            text: message,
            confirmButtonText: 'Entendido'
        });
    },

    /**
     * Muestra una notificación de advertencia
     */
    warning: (message: string, title: string = 'Advertencia') => {
        return Swal.fire({
            ...baseConfig,
            icon: 'warning',
            title,
            text: message,
            confirmButtonText: 'Entendido'
        });
    },

    /**
     * Muestra una notificación informativa
     */
    info: (message: string, title: string = 'Información') => {
        return Swal.fire({
            ...baseConfig,
            icon: 'info',
            title,
            text: message,
            confirmButtonText: 'Entendido'
        });
    },

    /**
     * Muestra un diálogo de confirmación
     */
    confirm: (
        message: string,
        title: string = '¿Estás seguro?',
        confirmText: string = 'Sí, confirmar',
        cancelText: string = 'Cancelar'
    ) => {
        return Swal.fire({
            ...baseConfig,
            icon: 'question',
            title,
            text: message,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            reverseButtons: true
        });
    },

    /**
     * Muestra un diálogo de confirmación para eliminar
     */
    confirmDelete: (
        itemName: string = 'este elemento',
        message?: string
    ) => {
        return Swal.fire({
            ...baseConfig,
            icon: 'warning',
            title: '¿Eliminar elemento?',
            text: message || `¿Estás seguro de que deseas eliminar ${itemName}? Esta acción no se puede deshacer.`,
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#ef4444',
            reverseButtons: true
        });
    },

    /**
     * Muestra un toast de carga
     */
    loading: (message: string = 'Procesando...') => {
        return Swal.fire({
            ...baseConfig,
            title: message,
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    },

    /**
     * Cierra cualquier modal abierto
     */
    close: () => {
        Swal.close();
    },

    /**
     * Muestra un diálogo con input de fecha
     */
    inputDate: (options: {
        title: string;
        text: string;
        inputLabel: string;
        inputValue?: string;
        confirmButtonText?: string;
        showCancelButton?: boolean;
    }) => {
        return Swal.fire({
            ...baseConfig,
            title: options.title,
            text: options.text,
            input: 'date',
            inputLabel: options.inputLabel,
            inputValue: options.inputValue || new Date().toISOString().split('T')[0],
            showCancelButton: options.showCancelButton || false,
            confirmButtonText: options.confirmButtonText || 'Confirmar',
            cancelButtonText: 'Cancelar',
            inputValidator: (value) => {
                if (!value) {
                    return 'Debe seleccionar una fecha';
                }
                return null;
            }
        });
    },

    /**
     * Toast simple para notificaciones rápidas
     */
    toast: {
        success: (message: string) => {
            return Swal.fire({
                ...baseConfig,
                icon: 'success',
                title: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        },

        error: (message: string) => {
            return Swal.fire({
                ...baseConfig,
                icon: 'error',
                title: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true
            });
        },

        warning: (message: string) => {
            return Swal.fire({
                ...baseConfig,
                icon: 'warning',
                title: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true
            });
        },

        info: (message: string) => {
            return Swal.fire({
                ...baseConfig,
                icon: 'info',
                title: message,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true
            });
        }
    }
};