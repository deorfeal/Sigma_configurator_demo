// configuratorUtils.ts

import type { ItemInfo } from '../interfaces/itemInfo'; // Импортируйте необходимые типы
import type { SelectedValues } from '../interfaces/selects'; // Импортируйте необходимые типы


export function syncSelectedValuesWithStore(el: SelectedValues, store: any) {
    Object.entries(el).forEach(([key, value]) => {
        store.setSelectValue(key, value);
    });
}

export function refreshItemIndexes(items: Array<{ id: number; itemInfo: ItemInfo }>) {
    items.forEach((item, idx) => {
        item.id = idx + 1;
        item.itemInfo.number = idx + 1;
    });
    updateItemVisibility(items);
}

export function updateItemVisibility(items: Array<{ id: number; itemInfo: ItemInfo }>) {
    items.forEach((item, idx) => {
        if (idx < items.length - 1) {
            item.itemInfo.hasAdd = false;
            item.itemInfo.disabled = true;
        }
    });
}
