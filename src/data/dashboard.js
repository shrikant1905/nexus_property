// Mock data — Dashboard
export const adminDashboardData = {
  stats: [
    { label: 'Total Properties', value: '8', sub: '+2 this quarter', trend: 'up', icon: 'building' },
    { label: 'Total Owners', value: '5', sub: '+1 this month', trend: 'up', icon: 'users' },
    { label: 'Monthly Revenue', value: '$47,400', sub: '+12.5%', trend: 'up', icon: 'dollar' },
    { label: 'Occupancy Rate', value: '85%', sub: '+3% vs last month', trend: 'up', icon: 'percent' },
  ],
  revenueByProperty: [
    { property: 'Sunset Villa', revenue: 8500 },
    { property: 'Bayfront PH', revenue: 12000 },
    { property: 'Ocean Breeze', revenue: 6200 },
    { property: 'Garden Estate', revenue: 7200 },
    { property: 'Harbor View', revenue: 5500 },
    { property: 'Palm Court', revenue: 4800 },
    { property: 'Downtown', revenue: 3200 },
  ],
  expensesByCategory: [
    { name: 'Utilities', value: 3240, color: '#06b6d4' },
    { name: 'Maintenance', value: 2180, color: '#f59e0b' },
    { name: 'Cleaning', value: 4500, color: '#10b981' },
    { name: 'Supplies', value: 1890, color: '#8b5cf6' },
    { name: 'Marketing', value: 650, color: '#ef4444' },
  ],
};

export const financeDashboardData = {
  stats: [
    { label: 'Total Revenue', value: '$47,400', sub: '+12.5%', trend: 'up', icon: 'dollar', variant: 'green' },
    { label: 'Unreconciled', value: '2', sub: 'Bank feed', trend: 'down', icon: 'warning', variant: 'orange' },
    { label: 'Outstanding Inv', value: '4', sub: '$4,400 total', trend: 'down', icon: 'document', variant: 'red' },
    { label: 'Pending Payouts', value: '$12,450', sub: 'Owner balances', trend: 'up', icon: 'card', variant: 'blue' },
  ],
  revenueByProperty: adminDashboardData.revenueByProperty,
  expensesByCategory: adminDashboardData.expensesByCategory,
};

export const ownerPortalData = {
  ownerName: 'John Smith',
  propertyCount: 2,
  selectedMonth: 'March 2026',
  stats: [
    { label: 'Property Revenue', value: '$13,300', sub: '+12.5% this month', trend: 'up', icon: 'dollar', variant: 'green' },
    { label: 'Expenses', value: '$3,300', sub: 'All properties', trend: 'down', icon: 'trending-down', variant: 'red' },
    { label: 'Net Profit', value: '$10,000', sub: 'After fees', trend: 'up', icon: 'trending-up', variant: 'green' },
    { label: 'Open Invoices', value: '1', sub: 'Action needed', trend: 'down', icon: 'document', variant: 'orange' },
    { label: 'Payments Made', value: '$2,400', sub: 'This period', trend: 'down', icon: 'card', variant: 'blue' },
  ],
  monthlyProfit: [
    { month: 'Sep', profit: 0 },
    { month: 'Oct', profit: 0 },
    { month: 'Nov', profit: 0 },
    { month: 'Dec', profit: 0 },
    { month: 'Jan', profit: 0 },
    { month: 'Feb', profit: 8200 },
    { month: 'Mar', profit: 10000 },
  ],
  expensesByCategory: adminDashboardData.expensesByCategory,
};
