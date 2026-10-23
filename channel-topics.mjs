// Reviewed channel navigation; topic names stay consistent across posts.
export const TOPICS = new Set([
 'Фразы','Английский','Приветствия','Ресторан','Завтрак','Обед','Ужин','Такси',
 'Места','Паттайя','Еда','Прогулки','Маршруты','Карты','Советы','Бюджет',
 'Отзывы','Безопасность','Новости','Байки','Визы','Обновления','Объявления',
 'Оки','Комиксы','Погода','ОбратнаяСвязь'
]);
export function topicTags(post){
 if(post.topics===undefined)return [];
 if(!Array.isArray(post.topics)||post.topics.length<1||post.topics.length>3||
  new Set(post.topics).size!==post.topics.length||post.topics.some(t=>!TOPICS.has(t)))throw Error('invalid_channel_topics');
 return post.topics.map(t=>'#'+t);
}

export const REVIEWED_TOPICS = {
 'okok-project-intro-20261015':['Обновления','Паттайя'],
 'musselana-soup-per-item-20261015':['Еда','Места','Паттайя'],
 'okok-one-stop-walk-20261016':['Прогулки','Места'],
 'okok-menu-checklist-20261016':['Ресторан','Советы'],
 'okok-oki-guides-20261016':['Оки','Комиксы'],
 'okok-compact-route-20261017':['Маршруты','Прогулки'],
 'okok-save-place-20261017':['Еда','Места','Паттайя'],
 'okok-holiday-mood-20261017':['Прогулки','Паттайя'],
 'okok-rain-plan-20261018':['Погода','Прогулки','Советы'],
 'okok-daily-budget-20261018':['Бюджет','Советы'],
 'okok-channel-topics-20261018':['Обновления','ОбратнаяСвязь'],
 'okok-bikes-visas-20261019':['Байки','Визы','Обновления'],
 'okok-daily-choice-20261019':['Места','Прогулки'],
 'okok-reviews-context-20261020':['Отзывы','Советы'],
 'okok-wooden-museum-20261020':['Места','Паттайя'],
 'okok-map-entrance-20261021':['Карты','Маршруты','Советы'],
 'okok-english-entrance-20261021':['Фразы','Английский','Маршруты'],
 'okok-choose-with-friend-20261021':['Прогулки','Советы'],
 'okok-search-shortcut-20261022':['Места','Обновления'],
 'okok-nong-nooch-dinosaurs-20261022':['Места','Паттайя'],
 'okok-personal-message-20261022':['Объявления','Обновления'],
 'okok-source-date-20261023':['Отзывы','Советы'],
 'okok-english-spice-20261023':['Фразы','Английский','Ресторан'],
 'okok-city-selector-20261024':['Места','Обновления'],
 'okok-oki-care-20261024':['Оки','Обновления'],
 'okok-send-a-find-20261024':['Еда','Отзывы','ОбратнаяСвязь'],
 'okok-sunday-mood-20261025':['Прогулки','Паттайя'],
 'okok-menu-units-20261025':['Фразы','Ресторан','Бюджет'],
 'okok-wheel-descriptions-20261025':['Места','Советы'],
 'okok-opening-hours-20261026':['Места','Советы'],
 'okok-art-in-paradise-20261026':['Места','Паттайя'],
 'okok-next-week-question-20261026':['ОбратнаяСвязь','Обновления'],
 'okok-oki-comic-002-photo-memory-20261020':['Оки','Комиксы'],
 'okok-oki-comic-003-mango-plan-20261021':['Оки','Комиксы'],
 'okok-oki-comic-004-local-rain-20261022':['Оки','Комиксы'],
 'okok-oki-comic-005-coconut-orchestra-20261023':['Оки','Комиксы'],
 'okok-oki-comic-006-sand-tracks-20261024':['Оки','Комиксы'],
 'okok-oki-comic-007-suitcase-20261025':['Оки','Комиксы'],
 'okok-oki-comic-008-spicy-question-20261026':['Оки','Комиксы'],
 'okok-oki-comic-009-hammock-20261027':['Оки','Комиксы'],
 'okok-photo-before-bite-20261023':['Еда','Ресторан','Советы'],
 'okok-english-separate-sauce-20261027':['Фразы','Английский','Ресторан'],
 'okok-walk-photo-game-20261027':['Прогулки','Советы'],
 'okok-meeting-point-20261027':['Фразы','Маршруты','Советы'],
 'okok-oki-comic-010-sea-mail-20261028':['Оки','Комиксы'],
 'okok-offline-note-20261028':['Карты','Советы'],
 'okok-written-address-20261028':['Фразы','Английский','Маршруты'],
 'okok-bill-quiz-20261028':['Фразы','Английский','Ресторан']
};
