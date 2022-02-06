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
export interface DonationsByParty {
  party: string;
  total_amount: number;
}
