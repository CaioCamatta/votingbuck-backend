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

// Distribution of ideology scores a company donates to
export interface IdeologyDistribution {
  ideology: number;
  dollars_donated: number;
}

// Total dollars donated by a corporation
export interface TotalContributionsDollar {
  dollars_donated: number;
  date: string;
}

// Share of registered voters on board of directors
export interface RegisteredVoters {
  democratic: number;
  republican: number;
  independent: number;
}
