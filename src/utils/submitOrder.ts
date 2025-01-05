import axios from 'axios';

const TELEGRAM_TOKEN = import.meta.env.VITE_TELEGRAM_TOKEN;
const CHAT_ID = import.meta.env.VITE_CHAT_ID;
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;

function escapeMarkdown(text: string): string {
    return text.replace(/([_*[\]()~`>#+=|{}.!-])/g, '\\$1');
}

export async function submitOrder(
    orderFormStore: any,
    accessoriesStore: any,
    casesSelectsStore: any,
    terminalsSelectsStore: any,
    inputsSelectsStore: any,
    orientationStore: any
): Promise<boolean> {
    const message = `
📦 *Новый заказ:*  
1️⃣ *Order Form Data:* ${escapeMarkdown(JSON.stringify(orderFormStore.orderFormData))}  
2️⃣ *Accessories Value:* ${escapeMarkdown(JSON.stringify(accessoriesStore.accessoriesValue))}  
3️⃣ *Cases Select Values:* ${escapeMarkdown(JSON.stringify(casesSelectsStore.selectValues))}  
4️⃣ *Terminals Select Values:* ${escapeMarkdown(JSON.stringify(terminalsSelectsStore.selectValues))}  
5️⃣ *Inputs Select Values:* ${escapeMarkdown(JSON.stringify(inputsSelectsStore.selectsValues))}  
6️⃣ *Orientation Value:* ${escapeMarkdown(JSON.stringify(orientationStore.orientationValue))}  
    `;

    try {
        const response = await axios.post(TELEGRAM_API_URL, {
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'MarkdownV2'
        });
        console.log('Ответ от Telegram:', response.data);
        return true;
    } catch (error: any) {
        console.error('Ошибка при отправке сообщения в Telegram:', error.response?.data || error.message);
        return false;
    }
}
