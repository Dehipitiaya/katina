/** ITEM: one person gives it all. QUANTITY: people share a count. MONEY: people share a rupee total. */
export type DonationItemType = "ITEM" | "QUANTITY" | "MONEY";

export type PublicDonationPledge = {
  id: string;
  name: string;
  amount: number | null;
};

export type PublicDonationItem = {
  id: string;
  name: string;
  category: string | null;
  note: string | null;
  type: DonationItemType;
  targetAmount: number | null;
  unit: string | null;
  pledgedAmount: number;
  remainingAmount: number | null;
  isComplete: boolean;
  pledges: PublicDonationPledge[];
};

export type DonationPledgeRecord = PublicDonationPledge & {
  itemId: string;
  phone: string;
  batch: string;
  faculty: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DonationItemRecord = Omit<PublicDonationItem, "pledges"> & {
  sortOrder: number;
  pledges: DonationPledgeRecord[];
  createdAt: string;
  updatedAt: string;
};
