export const menu = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: 'Просмотреть логи', callback_data: 'GET_LOGS' },
        { text: 'Просмотреть ошибки', callback_data: 'GET_ERRORS' },
      ],
      [
        { text: 'Запустить отчеты', callback_data: 'START_REPORTS' },
        { text: 'Остановить отчеты', callback_data: 'STOP_REPORTS' },
      ],
      [
        { text: 'Запустить расписание', callback_data: 'START_SHEDULE' },
        { text: 'Остановить расписание', callback_data: 'STOP_SHEDULE' },
      ],
      [{ text: 'Состояние служб', callback_data: 'STATUS' }],
    ],
  },
};
