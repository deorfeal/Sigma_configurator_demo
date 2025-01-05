<script setup lang="ts">
import { ref, computed } from 'vue';
import ConfiguratorItem from '../components/ConfiguratorItem.vue';
import type { SelectsValues, SelectedValues } from '../interfaces/selects'; // Импортируем тип
import type { ItemInfo } from '../interfaces/itemInfo'; // Импортируем тип
import { showAlert, useAlertState } from '../utils/alertManager'; // Импорт функции showAlert
import Sides from '../components/Sides.vue'
import Locations from '../components/Locations.vue'
import Order from '../components/Order.vue';
import { useInputsSelectsStore } from '../stores/inputsSelectsStore'; // Импортируем стор
const inputsSelectsStore = useInputsSelectsStore()
import Alert from '../components/Alert.vue';
const alertState = useAlertState(); // Получаем состояние алерта

const props = defineProps<{
    configuratorIsHighlight: boolean;
}>();

// Определяем события
const emit = defineEmits<{
    (e: 'addInputs', index: number, fromAdditionalBlock: boolean, activeTub: number): void;
}>();

const selectedValuesForValidation = ref<SelectedValues>({ 'Размер': '', 'Компонент': '', 'Материал': '', 'Тип компонента': '' });

const activeTub = ref<number>(1); // Храним активный индекс

// Функция для обработки выбора
const selectTab = (tab: number) => {
    activeTub.value = tab;
    applyButtonIsActive.value = false;
    addButtonIsActive.value = false;
};

// Объединенная структура для хранения данных
const locations = ref<{ type: 'main' | 'additional'; data: Record<number, boolean>[] }[]>([
    { type: 'main', data: Array(4).fill({ 0: false, 1: false }) }, // Задаем начальное значение
    { type: 'additional', data: Array(4).fill({ 0: false, 1: false, 2: false }) } // Задаем начальное значение
]);

const mainLocationsAvailability = ref<boolean[]>([true, true, true, true])
const additionalLocationsVisibility = ref<boolean[]>([false, false, false, false])

// Вынесенная функция для обнуления данных
function resetLocationData(locationData: Record<number, boolean>[], index: number) {
    locationData[index] = Object.keys(locationData[index]).reduce((acc, key) => {
        acc[Number(key)] = false; // Обнуляем данные
        return acc; // Возвращаем обновленные данные
    }, {} as Record<number, boolean>);
}

// Закидываем данные выбранных значений в стор
function syncSelectedLocationWithStore(tabIndex: number, selectedIndex: number, isMainLocations: boolean) {
    inputsSelectsStore.setLocationValue(tabIndex, selectedIndex, isMainLocations) // Закидываем данные в стор 
}

function validateApplyButton(
    selectedValues: SelectedValues,
    index: number,
    fromAdditionalBlock: boolean
) {

    // Проверка заполненности селектов
    const selectsFilled = Object.values(selectedValues).every(value => value !== null && value !== '');

    // Локальная ссылка на текущую группу локаций
    let locationGroup = ref(locations.value[0]);

    // Проверяем активность дополнительной локации с учётом текущего индекса
    const hasActiveAdditionalLocation = additionalLocationsVisibility.value.some((visible, i) => i === index && visible);

    // Если это дополнительный блок
    if (fromAdditionalBlock) {
        if (hasActiveAdditionalLocation) {
            locationGroup.value = locations.value[1]; // Переключаем на дополнительную группу
        }
    }

    // Проверяем, есть ли активные локации в основной группе
    const hasActiveLocation = ref(locationGroup.value.data[index] && Object.values(locationGroup.value.data[index]).includes(true));

    // Активируем кнопку "Применить" при выполнении условий
    applyButtonIsActive.value = selectsFilled && hasActiveLocation.value;
}


// Функция для обработки выбора
function handleCheckedLocation(tabIndex: number, selectedIndex: number, isMainLocations: boolean) {
    const locationType = isMainLocations ? 'main' : 'additional'; // Определяем тип
    const locationGroup = locations.value.find(loc => loc.type === locationType); // Находим группу

    if (locationGroup) {
        resetLocationData(locationGroup.data, tabIndex); // Обнуляем данные
        locationGroup.data[tabIndex][selectedIndex] = true; // Обновляем данные
    }

    syncSelectedLocationWithStore(tabIndex, selectedIndex, isMainLocations);

    // Вызываем validateApplyButton с актуальными значениями
    validateApplyButton(selectedValuesForValidation.value || {}, tabIndex, !isMainLocations);
}

const sliderValue = ref<number>(0); // Создаем константу со значением количества в счётчике

// Функция для создания элемента
const createItem = (title: string, hasAddNew: boolean = false) => ({
    itemInfo: {
        hasSlider: true,
        hasAdd: true,
        willCloses: false,
        title,
        disabled: false,
        hasAddNew
    }
});

// Задаем начальные значения
const allBlocks = ref<Record<string, Array<{ itemInfo: ItemInfo }>>>(
    {
        'mainBlock': Array(4).fill(null).map(() => createItem('Кабельный ввод', true)),
        'additionalBlock': Array(4).fill(null).map(() => createItem('Кабельный ввод'))
    },
);

// Задаем начальное значение
const selectsValues = ref<SelectsValues>({
    'Размер': [
        { value: '0', text: 'М20' },
        { value: '1', text: 'М25' },
        { value: '2', text: 'М32' },
        { value: '3', text: 'М40' },
        { value: '4', text: 'М50' },
    ],
    'Компонент': [
        { value: '0', text: 'Заглушка' },
        { value: '1', text: 'Кабельный Гланд' },
    ],
    'Материал': [
        { value: '0', text: 'Пластик' },
        { value: '1', text: 'Металл' },
    ],
    'Тип компонента': [
        { value: '0', text: 'Бронированный' },
        { value: '1', text: 'Небронированный' },
    ]
});

// Закидываем данные выбранных значений в стор
function syncSelectedValuesWithStore(selectedValues: SelectedValues, index: number, fromAdditionalBlock: boolean) {
    inputsSelectsStore.setSelectValue(selectedValues, index, fromAdditionalBlock) // Закидываем данные в стор 
}

// Закидываем данные со счётчиком в стор
function syncSliderValueWithStore(sliderValue: number, index: number, fromAdditionalBlock: boolean) {
    inputsSelectsStore.setSliderValue(sliderValue, index, fromAdditionalBlock) // Закидываем данные в стор
}

function syncAddedValueWithStore(added: boolean, index: number, fromAdditionalBlock: boolean) {
    inputsSelectsStore.setAdded(added, index, fromAdditionalBlock) // Закидываем данные в стор
}

// Задаем начальное значение
const startedValues = ref(inputsSelectsStore.selectsValues);

// Функция для получения типа фильтра
function getFilterType(index: number, fromAdditionalBlock: boolean) {
    const targetArray = fromAdditionalBlock
        ? inputsSelectsStore.selectsValues['additionalSelectsValues']
        : inputsSelectsStore.selectsValues['mainSelectsValues'];

    const componentValue = targetArray[index]['componentValues']['Компонент']; // Получаем компонент
    return componentValue === '0' ? '0' : componentValue === '1' ? '1' : 'started'; // Возвращаем тип
}

// Создаем константу с фильтрами
const filterObject = <Record<string, string[]>>(
    {
        'started': ['Размер', 'Компонент'],
        '0': ['Размер', 'Компонент', 'Материал'],
        '1': ['Размер', 'Компонент', 'Тип компонента']
    }
)

// Обновляем константу с выбранными значениями
function addSelectedValues(selectedValues: SelectedValues, index: number, fromAdditionalBlock: boolean) {
    // Синхронизация данных в сторе
    syncSelectedValuesWithStore(selectedValues, index, fromAdditionalBlock);

    // Дополнительная логика для "Размер"
    if (fromAdditionalBlock) {
        const mainSize = inputsSelectsStore.selectsValues['mainSelectsValues'][index]['componentValues']['Размер'];
        const additionalSize = inputsSelectsStore.selectsValues['additionalSelectsValues'][index]['componentValues']['Размер'];

        additionalLocationsVisibility.value[index] = additionalSize > mainSize;
    }

    selectedValuesForValidation.value = selectedValues;

    // Вызываем validateApplyButton с актуальными значениями
    validateApplyButton(selectedValues, index, fromAdditionalBlock);
}


// Обновляем константу со значением количества в счётчике
function updateSliderValue(number: number, index: number, fromAdditionalBlock: boolean) {
    sliderValue.value = number; // Обновляем константу
    syncSliderValueWithStore(sliderValue.value, index, fromAdditionalBlock) // Закидываем данные в стор
    validateApplyButton(selectedValuesForValidation.value || {}, index, fromAdditionalBlock);
}

const additionalBlockIsVisible = ref<number>()

const applyButtonIsActive = ref<boolean>(false)
const addButtonIsActive = ref<boolean>(false)

function handleAdd(index: number, fromAdditionalBlock: boolean) {
    // Деактивация блока
    const disableBlock = (blockType: 'mainBlock' | 'additionalBlock') => {
        allBlocks.value[blockType][index].itemInfo.disabled = true;
        allBlocks.value[blockType][index].itemInfo.hasAdd = false;
    };

    if (fromAdditionalBlock) {
        if (!additionalLocationsVisibility.value[index]) {
            disableBlock('additionalBlock');
        }
    } else {
        mainLocationsAvailability.value[index] = false; // Убираем доступность у основных локаций 
        additionalBlockIsVisible.value = index; // Добавляем активный индекс
        disableBlock('mainBlock');
    }

    showAlert('Дополнительный блок добавлен', 'alert--success');
}

async function handleApplySelectedValues(index: number, fromAdditionalBlock: boolean) {
    const selectType = fromAdditionalBlock ? 'additionalSelectsValues' : 'mainSelectsValues';
    if (inputsSelectsStore.selectsValues[selectType][index]['count'] === 0) {
        showAlert('Добавьте хотя бы один ввод', 'alert--warning');
        return
    }

    // Проверяем, есть ли активные локации
    const hasActiveLocation = (): boolean =>
        Object.values(locations.value[fromAdditionalBlock ? 1 : 0].data[index]).includes(true);

    if (fromAdditionalBlock) {
        if (!additionalLocationsVisibility.value[index] || hasActiveLocation()) {
            emit('addInputs', index, fromAdditionalBlock, activeTub.value);
            showAlert('Вводы добавлены', 'alert--success');
            addButtonIsActive.value = true;
            applyButtonIsActive.value = false;
        } else {
            showAlert('Выберите хотя бы одну локацию', 'alert--warning');
        }
    } else {
        if (hasActiveLocation()) {
            emit('addInputs', index, fromAdditionalBlock, activeTub.value);
            showAlert('Вводы добавлены', 'alert--success');
            addButtonIsActive.value = true;
            applyButtonIsActive.value = false;
        } else {
            showAlert('Выберите хотя бы одну локацию', 'alert--warning');
        }
    }
}

const orderIsOpen = ref(false)

function toggleOrderOrder() {
    orderIsOpen.value = !orderIsOpen.value
}

</script>

<template>
    <div class="configurator-item__body configurator-body"
        :class="{ 'configurator-body--highlight': configuratorIsHighlight }">
        <div class="configurator-body__wrapper configurator-body__wrapper--tubs">
            <Sides @changeTab="selectTab($event)" />
            <template v-for="(item, index) in 4">
                <Locations v-show="index === activeTub" :isMainLocations="true" :index="index"
                    @changeChecked="handleCheckedLocation"
                    :class="mainLocationsAvailability[index] ? '' : 'disabled'" />
            </template>
        </div>
        <template v-for="(item, index) in allBlocks['mainBlock']" :key="index">
            <ConfiguratorItem v-if="index === activeTub" :selectsValues="selectsValues"
                :startedValues="startedValues['mainSelectsValues'][index]['componentValues']"
                @updateSelectedValues="addSelectedValues($event, index, false)" :itemInfo="item.itemInfo"
                @updateCountOfItems="handleAdd(index, false)"
                @updateSliderValue="updateSliderValue($event, index, false)" :filterObject="filterObject"
                :filterType="getFilterType(index, false)" :sliderValue="startedValues['mainSelectsValues'][index].count"
                :sliderMaxValue="10" :filterWatchedProperty="'Компонент'"
                @applySelectedValues="handleApplySelectedValues(index, false)"
                :applyButtonIsActive="applyButtonIsActive" :addButtonIsActive="addButtonIsActive" />
        </template>
        <template v-for="(item, index) in allBlocks['additionalBlock']" :key="index">
            <ConfiguratorItem v-if="additionalBlockIsVisible === index && index === activeTub"
                :selectsValues="selectsValues"
                :startedValues="startedValues['additionalSelectsValues'][index]['componentValues']"
                @updateSelectedValues="addSelectedValues($event, index, true)" :itemInfo="item.itemInfo"
                @updateCountOfItems="handleAdd(index, true)" @updateSliderValue="updateSliderValue($event, index, true)"
                :filterObject="filterObject" :filterType="getFilterType(index, true)"
                :sliderValue="startedValues['additionalSelectsValues'][index].count" :sliderMaxValue="1"
                :filterWatchedProperty="'Компонент'" @applySelectedValues="handleApplySelectedValues(index, true)"
                :applyButtonIsActive="applyButtonIsActive">
                <template v-for="(item, index) in 4">
                    <Locations v-show="index === activeTub && additionalLocationsVisibility[index]"
                        :isMainLocations="false" :index="index" @changeChecked="handleCheckedLocation"
                        class="form__inputs-location" />
                </template>
            </ConfiguratorItem>
        </template>
        <button class="configurator-body__order open-order" type="button" @click.prevent="toggleOrderOrder">
            Сохранить и отправить запрос
        </button>
    </div>
    <Teleport to="body">
        <Transition name="fade" mode="out-in">
            <Order v-if="orderIsOpen" @closeOrder="toggleOrderOrder" :class="orderIsOpen ? 'popup--active' : ''" @closePopup="toggleOrderOrder" />
        </Transition>
        <Alert :isVisible="alertState.isVisible" :message="alertState.message" :class="alertState.class" />
    </Teleport>
</template>

<style lang="scss">
.open-order {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: #F2A41F;
    border: 1px solid #F2A41F;
    padding: 10px 20px;
    color: #fff;
    border-radius: 4px;
    text-transform: uppercase;
    font-weight: 700;
    font-size: clamp(16px, calc(16px + (18 - 2) * ((100vw - 375px) / (1165 - 375))), 18px);
    line-height: clamp(24px, calc(24px + (26 - 2) * ((100vw - 375px) / (1165 - 375))), 26px);
    letter-spacing: 0.54px;
    transition: background 0.3s, color 0.3s;
    font-family: "Oswald", sans-serif;
    width: max-content;

    &:hover {
        background: transparent;
        color: #F2A41F;
    }
}
</style>