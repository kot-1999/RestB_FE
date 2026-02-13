export class LocalStorage {
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static get(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }
}

export function showError(err) {

    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message ?? err.messages,

        // Position logic
        position: 'bottom-end',

        // Toast mode looks better in corner
        toast: true,

        timer: 5000,
        timerProgressBar: true,

        showCloseButton: true,
        showConfirmButton: false,

        didOpen: (toast) => {
            // Pause timer when hovered
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
}

export function showSuccess(text) {
    if (text)
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text,

            // Position logic
            position: 'bottom-end',

            // Toast mode looks better in corner
            toast: true,
            timer: 3000,
            timerProgressBar: true,

            showCloseButton: true,
            showConfirmButton: false,

            didOpen: (toast) => {
                // Pause timer when hovered
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
}

export function authRequired() {

}