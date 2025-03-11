// Установка библиотеки node-telegram-bot-api
// Перед запуском убедитесь, что у вас установлен node.js и выполнена команда npm install node-telegram-bot-api

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const {SocksProxyAgent} = require('socks-proxy-agent');
const axios = require('axios');

// Настраиваем SOCKS-прокси
const proxyUrl = process.env.PROXY_URL;
const useProxy = proxyUrl !== undefined;

// Используем прокси в axios
let axiosInstance = null;

if (useProxy) {
    const agent = new SocksProxyAgent(proxyUrl);
    axiosInstance = axios.create({
        httpAgent: agent,
        httpsAgent: agent,
    });
} else {
    axiosInstance = axios.create();
}
console.log("Use proxy: " + useProxy);
console.log("Proxy url: " + proxyUrl);
console.log("App url: " + process.env.APP_URL);
// Получаем токен из переменной окружения
const token = process.env.TELEGRAM_BOT_TOKEN;
const openaiApiKey = process.env.OPENAI_API_KEY;

if (!token) {
    throw new Error('TELEGRAM_BOT_TOKEN не задан в переменных окружения');
}

// Создаем экземпляр бота
const bot = new TelegramBot(token, {polling: true});

// Обработчик команды /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;

    // Текст сообщения
    const message = 'Это приложение intelinvest.ru';

    // Inline-клавиатура с mini-app
    const options = {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: 'Открыть',
                        web_app: {
                            url: process.env.APP_URL || 'https://intelinvest.ru/app?tgApp=true'
                        }
                    }
                ]
            ]
        }
    };

    // Отправка сообщения с клавиатурой
    bot.sendMessage(chatId, message, options);
});

// Обработка всех остальных сообщений
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    if (!openaiApiKey) {
        bot.sendMessage(chatId, "Я пока не умею отвечать на ваши сообщения, но обязательно скоро научусь");
        return;
    }
    const text = msg.text;

    // Игнорируем сообщения команды /start
    if (text.startsWith('/start')) {
        return;
    }

    try {
        // Запрос к API OpenAI
        const response = await axiosInstance.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [
                    {role: 'user', content: text}
                ]
            },
            {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Отправляем ответ пользователю
        const reply = response.data.choices[0].message.content;
        bot.sendMessage(chatId, reply);
    } catch (error) {
        console.error('Ошибка при запросе к OpenAI:', error);
        bot.sendMessage(chatId, 'Произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте позже.');
    }
});

console.log('Бот запущен. Ожидаем команды /start');
