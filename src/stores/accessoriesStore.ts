import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAccessoriesStore = defineStore('accessoriesStore', () => {
    const accessoriesValue = ref<Record<string, boolean>[]>([
        { 'Дыхательный клапан': false, },
        { 'Монтажная пластина': false, },
        { 'Тэговая табличка': false, },
        { 'Пластина заземления': false, }
    ]);

    function setAccessoriesValue(index: number, isActive: boolean, key: string) {
        accessoriesValue.value[index][key] = isActive
    }

    return { accessoriesValue, setAccessoriesValue }
});