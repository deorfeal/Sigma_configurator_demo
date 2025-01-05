import { ref } from 'vue';

const alertState = ref<{ isVisible: boolean; message: string; class: string }>({
    isVisible: false,
    message: '',
    class: ''
});

let alertTimeout: number | null = null; // Хранит идентификатор таймера

export function showAlert(message: string, alertClass: string) {
    alertState.value = { isVisible: true, message, class: alertClass };

    // Если таймер уже установлен, очистите его
    if (alertTimeout) {
        clearTimeout(alertTimeout);
    }

    // Установите новый таймер
    alertTimeout = setTimeout(() => {
        hideAlert();
    }, 3000);
}

export function hideAlert() {
    alertState.value = { isVisible: false, message: '', class: '' };
    alertTimeout = null; // Обнуляем таймер
}

export function useAlertState() {
    return alertState;
}
