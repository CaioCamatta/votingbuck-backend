import { recipient } from '@prisma/client';

export type Recipient = recipient;

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

export interface IdeologyDistribution {
  ideology: number;
  count: number;
}

export interface TopDonationsDollarsByIndustry {
  industry: string;
  dollars_donated: number;
}

export interface TopDonationsDollarsByCorporation {
  corporation: string;
  dollars_donated: number;
}

export interface TopDonationsDollarsByUniversity {
  university: string;
  dollars_donated: number;
}
