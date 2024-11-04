export interface IOrder {
    _id: string;
    createdAt: string;
    expectedat: string;
    status: string;
    price: number;
  }
  
  export interface MonthlyData {
    month: string;
    sales: number;
    profit: number;
  }
  
  export interface IDashboardData {
    _id: string;
    agentname: string;
    orders: IOrder[];
    totalSales: number;
    totalProfit: number;
    monthlyData: MonthlyData[];
  }