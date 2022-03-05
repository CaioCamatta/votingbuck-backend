import { organization } from '@prisma/client';

export type Organization = organization;

export interface DonationsByMonth {
  month_start_date: string;
  amount_donated: number;
}
[];

[];
export interface DonationsByParty {
  party: string;
  total_amount: number;
}

// Top recipients by dollar amount recieved
export interface TopRecipientsDollar {
  id: number;
  name: string;
  party: string;
  amount_received: number;
}

// Top recipients by number of donations received
export interface TopRecipientsDonation {
  id: number;
  name: string;
  party: string;
  donations_received: number;
}
