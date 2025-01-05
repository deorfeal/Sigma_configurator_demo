<script setup lang="ts">
import { ref, reactive } from 'vue';
import ConfiguratorItem from '../components/ConfiguratorItem.vue';
import type { SelectsValues, SelectedValues } from '../interfaces/selects';
import type { ItemInfo } from '../interfaces/itemInfo';
import { useCasesSelectsStore } from '../stores/casesSelectsStore';
const casesSelectsStore = useCasesSelectsStore()

const props = defineProps<{
    configuratorIsHighlight: boolean;
}>();

const emit = defineEmits<{
    (e: 'accessoriesHighlight', index: number): void;
}>();

const selectsValues = ref<SelectsValues>({
    'Материал корпуса': [
        { value: '0', text: 'Нержавеющая сталь' },
        { value: '1', text: 'Армированный полиэстер' },
    ],
    'Серия полиэстера': [
        { value: '0', text: 'P1000', img: 'images/p1000-img.png' },
        { value: '1', text: 'P7000', img: 'images/p7000-img.png' },
    ],
    'Серия стали': [
        { value: '0', text: 'S1', img: 'images/s1-img.png' },
    ],
    'Размер': [
        { value: '0', text: '250x250' },
        { value: '1', text: '500x500' },
    ]
});

// Задаем начальное значение
const startedValues = ref(casesSelectsStore.selectValues);

const items = ref<Array<{ id: number, itemInfo: ItemInfo }>>([
    { id: 1, itemInfo: { hasSlider: false, hasAdd: false, willCloses: false, title: 'Корпус' } }
]);

// Закидываем данные в стор
function syncSelectedValuesWithStore(el: SelectedValues) {
    Object.entries(el).forEach(([key, value]) => {
        casesSelectsStore.setSelectValue(key, value);
    });

    handleDeleteSelectValue()
}

// Удаляем значение в зависимости от типа фильтра ( для правильной работы с пропуском далее, на следующий таб )
function handleDeleteSelectValue() {
    const filterType = getFilterType();
    const seriesToRemove = filterType === '0' ? 'Серия полиэстера' : 'Серия стали';
    casesSelectsStore.deleteSelectValue(seriesToRemove);
}

// Создаем константу с фильтрами
const filterObject = <Record<string, string[]>>(
    {
        'started': ['Материал корпуса', 'Размер'],
        '0': ['Материал корпуса', 'Серия стали', 'Размер'],
        '1': ['Материал корпуса', 'Серия полиэстера', 'Размер']
    }
)

// Функция для получения типа фильтра
function getFilterType() {
    const componentValue = casesSelectsStore.selectValues['Материал корпуса']; // Получаем компонент

    switch (componentValue) {
        case '0':
        case '1':
            return componentValue;
        default:
            return 'started';
    }
}
</script>

<template>
    <div class="configurator-item__body configurator-body"
        :class="{ 'configurator-body--highlight': configuratorIsHighlight }">
        <template v-for="(item, index) in items" :key="item.id">
            <ConfiguratorItem :selectsValues="selectsValues" :startedValues="startedValues"
                @updateSelectedValues="syncSelectedValuesWithStore($event)" :itemInfo="item.itemInfo"
                :filterObject="filterObject" :filterType="getFilterType()"
                :filterWatchedProperty="'Материал корпуса'" />
        </template>
    </div>
</template>
