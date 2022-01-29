export interface Organization {
  id: string;
  name: string;
  industry: string;
}

export interface DonationsByMonth {
  month_start_date: string;
  amount_donated: number;
}
[];

export interface TopDonators {
  contributor: string;
  total_amount: number;
}
[];
