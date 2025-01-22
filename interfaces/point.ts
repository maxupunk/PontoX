import type { User } from '~~/interfaces/user';
export interface Point {
    id?: number;
    tenantId?: number;
    userId: number;
    user?: User | null;
    entryDate?: string;
    entryTime?: string;
    entryImage?: string | null;
    entryExpressio?: string | null;
    departureDate?: string | null;
    departureTime?: string | null;
    departureImage?: string | null;
    departureExpressio?: string | null;
    observation?: string | null;
}