// Mock data — Automation Rules
export const automationRules = [
  {
    id: 'ar1',
    name: 'Water Utility Auto-Categorize',
    conditions: [{ field: 'vendor', operator: 'contains', value: 'Water' }],
    actions: [{ type: 'categorize', value: 'Utilities' }],
    isActive: true,
  },
  {
    id: 'ar2',
    name: 'Amazon Supplies',
    conditions: [{ field: 'vendor', operator: 'contains', value: 'Amazon' }],
    actions: [{ type: 'categorize', value: 'Supplies' }],
    isActive: true,
  },
  {
    id: 'ar3',
    name: 'Airbnb Revenue Match',
    conditions: [{ field: 'vendor', operator: 'contains', value: 'Airbnb' }],
    actions: [{ type: 'categorize', value: 'Revenue' }, { type: 'match', value: 'reservation' }],
    isActive: true,
  },
  {
    id: 'ar4',
    name: 'FPL Electric',
    conditions: [{ field: 'vendor', operator: 'contains', value: 'FPL' }],
    actions: [{ type: 'categorize', value: 'Utilities' }],
    isActive: true,
  },
  {
    id: 'ar5',
    name: 'Pro Clean Services',
    conditions: [{ field: 'vendor', operator: 'contains', value: 'Pro Clean' }],
    actions: [{ type: 'categorize', value: 'Cleaning' }],
    isActive: false,
  },
];
