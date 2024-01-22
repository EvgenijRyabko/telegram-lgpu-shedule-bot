export const paginationMenu = (pagination: {
  total: number;
  perPage: number;
  page: number;
  lastPage: number;
}) => ({
  reply_markup: {
    inline_keyboard: [
      [
        pagination.page !== 1 ? { text: ' <-- ', callback_data: 'PREVIOUS_PAGE' } : undefined,
        pagination.page !== pagination.lastPage
          ? { text: ' --> ', callback_data: 'NEXT_PAGE' }
          : undefined,
      ].filter((el) => el) as { text: string; callback_data: string }[],
      [{ text: 'В главное меню', callback_data: 'TO_MAIN' }],
    ],
  },
});
