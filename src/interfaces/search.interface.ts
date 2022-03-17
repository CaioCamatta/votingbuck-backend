import { recipient } from '@prisma/client';

export interface Entity {
  id: string;
  value: {
    name: string;
    category: string;
    id: string;
  };
}
[];

export interface SearchResult {
  total: number;
  documents: Entity[];
}

export interface Search {
  politicians: Entity[];
  corporates: Entity[];
  universities: Entity[];
}
