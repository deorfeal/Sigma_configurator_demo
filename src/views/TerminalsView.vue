<script setup lang="ts">
import { ref, reactive, nextTick } from 'vue';
import ConfiguratorItem from '../components/ConfiguratorItem.vue'; // Импортируем компонент
import Alert from '../components/Alert.vue'; // Импортируем компонент
import type { SelectsValues, SelectedValues } from '../interfaces/selects'; // Импортируем тип
import type { ItemInfo } from '../interfaces/itemInfo'; // Импортируем тип
import { useTerminalsSelectsStore } from '../stores/terminalsSelectsStore'; // Импортируем стор
import { showAlert, useAlertState } from '../utils/alertManager'; // Импорт функции showAlert
import { isSelectsFilled } from '../utils/isSelectsFilled';
import { generateUniqueId } from '../utils/generateId';

const props = defineProps<{
    configuratorIsHighlight: boolean;
}>();

const emit = defineEmits<{
    (e: 'addInputs', index: number): void;
}>();

const alertState = useAlertState(); // Получаем состояние алерта
const terminalsSelectsStore = useTerminalsSelectsStore() // Импортируем стор

const selectsValues = ref<SelectsValues>({ // Задаем начальное значение
    'Бренд клеммы': [
        { value: '0', text: 'WeidMuller' },
    ],
    'Размер': [
        { value: '0', text: '2.5' },
        { value: '1', text: '4' },
        { value: '2', text: '6' },
        { value: '3', text: '10' },
        { value: '4', text: '16' },
        { value: '5', text: '35' },
    ],
    'Цвет': [
        { value: '0', text: 'Белый' },
        { value: '1', text: 'Синий' },
        { value: '2', text: 'Зеленый' },
    ]
});

const startedValues = ref<SelectedValues>({ // Задаем начальное значение
    'Бренд клеммы': '',
    'Размер': '',
    'Цвет': ''
});

const items = ref<Array<{ id: number, itemInfo: ItemInfo }>>([ // Создаем список элементов
    { id: generateUniqueId(), itemInfo: { hasSlider: true, hasAdd: true, hasAddNew: true, willCloses: true, title: 'Блок', number: 1, disabled: false, sliderValue: 3 } }
]);

const selectedValues = ref<SelectedValues>({ // Создаем константу с выбранными значениями
    'Бренд клеммы': '',
    'Размер': '',
    'Цвет': ''
});

function addSelectedValues(el: SelectedValues) { // Обновляем константу с выбранными значениями
    selectedValues.value = el;
    applyButtonIsActive.value = isSelectsFilled(selectedValues.value);
}

const sliderValue = ref<number>(3); // Создаем константу со значением количества в счётчике

const totalsliderValue = ref<number>(0); // Создаем константу со значением количества всех счетчиков

function updateSliderValue(number: number) { // Обновляем константу со значением количества в счётчике
    sliderValue.value = number;
    applyButtonIsActive.value = isSelectsFilled(selectedValues.value);
}

function syncSelectedValuesWithStore(el: SelectedValues, id: number, count: number) { // Закидываем данные в стор
    terminalsSelectsStore.setSelectValue(el, id, count);
}

function decreaseTotalSliderValue(id: number) { // Уменьшаем константу со значением количества в счётчике
    const item = terminalsSelectsStore.selectValues.find((item) => item.id === id.toString());
    item ? totalsliderValue.value -= Number(item.count) : totalsliderValue.value -= sliderValue.value;
}

async function addNewItem(id: number) {
    if (totalsliderValue.value < 13) {
        const newNumber = items.value.length + 1;
        const newId = generateUniqueId();
        items.value.push({
            id: newId,
            itemInfo: { hasSlider: true, hasAdd: true, hasAddNew: true, willCloses: true, title: 'Блок', number: newNumber, disabled: false, sliderValue: 3 }
        });
        selectedValues.value = { 'Бренд клеммы': '', 'Размер': '', 'Цвет': '' };
        updateItemVisibility();
        addButtonIsActive.value = false
        showAlert('Новый блок добавлен', 'alert--success');
    } else {
        showAlert('Нельзя добавлять больше 13 элементов', 'alert--warning');
    }
}

async function deleteItem(id: number) { // Удаляем элемент
    if (items.value.length > 1) { // Если элементов больше одного
        const index = items.value.findIndex(item => item.id === id); // Находим индекс
        if (index !== -1 && index !== items.value.length - 1) { // Удаляем элемент только если он не последний
            decreaseTotalSliderValue(id); // Уменьшаем общий счетчик
            items.value.splice(index, 1); // Удаляем элемент
            terminalsSelectsStore.removeSelectValue(id) // Удаляем элемент из стора
            await nextTick(); // Ждем завершения рендеринга
            refreshItemIndexes(); // Обновляем номер элементов
            showAlert('Клеммы удалены', 'alert--warning');
        } else {
            showAlert('Нельзя удалить последний элемент', 'alert--warning');
        }
    } else {
        showAlert('Нелязь удалить единственный элемент', 'alert--warning');
    }
}

function refreshItemIndexes() { // Обновляем номер элементов
    items.value.forEach((item, idx) => {
        item.itemInfo.number = idx + 1;
    });
}

function updateItemVisibility() { // Показываем или скрываем кнопку добавления, а так же доступность элементов
    items.value.forEach((item, idx) => {
        if (idx < items.value.length - 1) {
            item.itemInfo.hasAdd = false;
            item.itemInfo.disabled = true;
        }
    });
}

const previousSliderId = ref<number>(0);
const previousSliderValue = ref<number>(3);

const applyButtonIsActive = ref<boolean>(false)
const addButtonIsActive = ref<boolean>(false)

async function handleApplySelectedValues(id: number) {
    // Найдем элемент в сторе
    const itemInStore = terminalsSelectsStore.selectValues.find(
        (item) => item.id === id.toString()
    );

    // Если элемент уже есть, удаляем его вклад из общего счетчика
    if (itemInStore) {
        totalsliderValue.value -= Number(itemInStore.count);
    }

    // Проверяем, не превышает ли добавление нового значения лимит
    if (totalsliderValue.value + sliderValue.value > 13) {
        // Если превышает, возвращаем старое значение в общий счетчик
        if (itemInStore) {
            totalsliderValue.value += Number(itemInStore.count);
        }
        showAlert('Нельзя добавлять больше 13 элементов', 'alert--warning');
        return;
    }

    // Если значение прошло проверку, обновляем общий счетчик
    totalsliderValue.value += sliderValue.value;

    // Обновляем предыдущее состояние
    previousSliderId.value = id;
    previousSliderValue.value = sliderValue.value;

    // Сохраняем данные в стор
    syncSelectedValuesWithStore(selectedValues.value, id, sliderValue.value);

    showAlert('Клеммы добавлены', 'alert--success');
    applyButtonIsActive.value = false;
    addButtonIsActive.value = true;
}

</script>

<template>
    <div class="configurator-item__body configurator-body configurator-body--terminals"
        :class="{ 'configurator-body--highlight': configuratorIsHighlight }">
        <template v-for="(item, index) in items" :key="item.id">
            <ConfiguratorItem :selectsValues="selectsValues" :startedValues="startedValues"
                @updateSelectedValues="addSelectedValues($event)" :itemInfo="item.itemInfo"
                @updateCountOfItems="addNewItem(item.id)" @removeItem="deleteItem(item.id)"
                @updateSliderValue="updateSliderValue($event)" :sliderValue="item.itemInfo.sliderValue"
                @applySelectedValues="handleApplySelectedValues(item.id)" :applyButtonIsActive="applyButtonIsActive"
                :addButtonIsActive="addButtonIsActive" />
        </template>
    </div>
    <Teleport to="body">
        <Alert :isVisible="alertState.isVisible" :message="alertState.message" :class="alertState.class" />
    </Teleport>
</template>

<style lang="scss">
.configurator-body--terminals {
    max-height: 570px;
    overflow: auto;
    margin-bottom: -30px;
    padding-bottom: 30px;

    &::-webkit-scrollbar {
        width: 5px;
        max-height: 100px;
    }

    /* Track */
    &::-webkit-scrollbar-track {
        background: #E6E8EB;
        border-radius: 2px;
    }

    /* Handle */
    &::-webkit-scrollbar-thumb {
        background: #007CBE;
        border-radius: 2px;
    }
}
</style>