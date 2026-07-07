export const TemplateVisibility = ['draft', 'published', 'featured', 'hidden'] as const;
export type TemplateVisibility = (typeof TemplateVisibility)[number];

export const TemplateDifficulty = ['easy', 'moderate', 'challenging'] as const;
export type TemplateDifficulty = (typeof TemplateDifficulty)[number];

export const TemplateSeason = ['spring', 'summer', 'autumn', 'winter', 'year-round'] as const;
export type TemplateSeason = (typeof TemplateSeason)[number];

export const BUDGET_CATEGORIES = [
  { key: 'accommodation', label: 'Accommodation' },
  { key: 'transport', label: 'Transport' },
  { key: 'foodAndDrinks', label: 'Food & Drinks' },
  { key: 'activities', label: 'Activities' },
  { key: 'miscellaneous', label: 'Miscellaneous' },
] as const;

export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR', 'KRW',
  'MXN', 'NZD', 'SGD', 'HKD', 'THB', 'SEK', 'NOK', 'DKK', 'BRL', 'ZAR',
] as const;
export type Currency = (typeof CURRENCIES)[number];
