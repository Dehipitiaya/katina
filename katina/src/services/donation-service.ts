import { formatItemAmount, parseItemQuantity, roundAmount } from "@/lib/item-quantity";
import { normalizePhone } from "@/lib/phone";
import {
  createDonationItem,
  createDonationItems,
  createPledgeLocked,
  deleteDonationItem,
  deletePledge,
  findDonationItemById,
  findPledgeById,
  listDonationItems,
  mergeDonationsFromBackup,
  swapDonationItemOrder,
  updateDonationItem,
  updatePledgeLocked,
  type DonationItemWithPledges,
} from "@/repositories/donation-repository";
import type {
  DonationItemRecord,
  DonationItemType,
  DonationPledgeRecord,
  PublicDonationItem,
} from "@/types/donation";
import type { BackupFileInput } from "@/validators/backup";
import type {
  DonationItemBulkCreateInput,
  DonationItemCreateInput,
  DonationItemUpdateInput,
  PledgeCreateInput,
  PledgeUpdateInput,
} from "@/validators/donation";

type PledgeRow = DonationItemWithPledges["pledges"][number];

function sumPledges(pledges: PledgeRow[]) {
  return roundAmount(pledges.reduce((total, pledge) => total + (pledge.amount ?? 0), 0));
}

function getProgress(item: DonationItemWithPledges) {
  const type = item.type as DonationItemType;

  if (type === "ITEM") {
    return {
      pledgedAmount: item.pledges.length,
      remainingAmount: null,
      isComplete: item.pledges.length > 0,
    };
  }

  const pledgedAmount = sumPledges(item.pledges);
  const remainingAmount = Math.max(roundAmount((item.targetAmount ?? 0) - pledgedAmount), 0);

  return { pledgedAmount, remainingAmount, isComplete: remainingAmount === 0 };
}

function toPledgeRecord(pledge: PledgeRow): DonationPledgeRecord {
  return {
    id: pledge.id,
    itemId: pledge.itemId,
    name: pledge.name,
    amount: pledge.amount,
    phone: pledge.phone,
    batch: pledge.batch,
    faculty: pledge.faculty,
    createdAt: pledge.createdAt.toISOString(),
    updatedAt: pledge.updatedAt.toISOString(),
  };
}

function toPublicItem(item: DonationItemWithPledges): PublicDonationItem {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    note: item.note,
    type: item.type as DonationItemType,
    targetAmount: item.targetAmount,
    unit: item.unit,
    ...getProgress(item),
    pledges: item.pledges.map((pledge) => ({
      id: pledge.id,
      name: pledge.name,
      amount: pledge.amount,
    })),
  };
}

function toItemRecord(item: DonationItemWithPledges): DonationItemRecord {
  return {
    ...toPublicItem(item),
    sortOrder: item.sortOrder,
    pledges: item.pledges.map(toPledgeRecord),
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

export async function getPublicDonationItems() {
  const items = await listDonationItems();
  return items.map(toPublicItem);
}

export async function getAdminDonationItems() {
  const items = await listDonationItems();
  return items.map(toItemRecord);
}

export async function pledgeDonation(input: PledgeCreateInput) {
  const pledge = await createPledgeLocked(input.itemId, (item) => {
    const details = {
      name: input.name,
      phone: normalizePhone(input.phone),
      batch: input.batch,
      faculty: input.faculty,
    };

    if (item.type === "ITEM") {
      if (item.pledges.length > 0) {
        throw new Error("Someone has already taken this item.");
      }

      return { ...details, amount: null };
    }

    const remaining = getProgress(item).remainingAmount ?? 0;

    if (remaining === 0) {
      throw new Error("This item has already been fully donated.");
    }

    if (!input.amount) {
      throw new Error(
        item.type === "MONEY" ? "Enter the amount you can donate." : "Enter how many you can give.",
      );
    }

    if (item.type === "MONEY" && !Number.isInteger(input.amount)) {
      throw new Error("Enter a whole rupee amount.");
    }

    if (input.amount > remaining) {
      throw new Error(`Only ${formatItemAmount(item, remaining)} is still needed.`);
    }

    return { ...details, amount: input.amount };
  });

  return { id: pledge.id, name: pledge.name, amount: pledge.amount };
}

export async function editPledge(id: string, input: PledgeUpdateInput) {
  const current = await findPledgeById(id);

  if (!current) {
    throw new Error("Pledge not found.");
  }

  await updatePledgeLocked(
    id,
    current.itemId,
    {
      ...input,
      ...(input.phone ? { phone: normalizePhone(input.phone) } : {}),
      ...(input.faculty === "" ? { faculty: null } : {}),
    },
    (item) => {
      if (item.type === "ITEM") {
        if (input.amount !== undefined) {
          throw new Error("This item does not have an amount.");
        }
        return;
      }

      if (input.amount === undefined) {
        return;
      }

      const others = sumPledges(item.pledges.filter((pledge) => pledge.id !== id));
      const remaining = roundAmount((item.targetAmount ?? 0) - others);

      if (item.type === "MONEY" && !Number.isInteger(input.amount)) {
        throw new Error("Enter a whole rupee amount.");
      }

      if (input.amount > remaining) {
        throw new Error(`Only ${formatItemAmount(item, remaining)} can be set for this pledge.`);
      }
    },
  );

  return getDonationItemRecord(current.itemId);
}

export async function removePledge(id: string) {
  const pledge = await deletePledge(id);
  return getDonationItemRecord(pledge.itemId);
}

async function getDonationItemRecord(id: string) {
  const item = await findDonationItemById(id);

  if (!item) {
    throw new Error("Item not found.");
  }

  return toItemRecord(item);
}

export async function addDonationItem(input: DonationItemCreateInput) {
  return toItemRecord(await createDonationItem(input));
}

export async function addDonationItems(input: DonationItemBulkCreateInput) {
  const result = await createDonationItems(
    input.names.map((name) => {
      const quantity = parseItemQuantity(name);

      return quantity
        ? { name, type: "QUANTITY", ...quantity }
        : { name, type: "ITEM", targetAmount: null, unit: null };
    }),
    input.category,
  );
  return { createdCount: result.count, items: await getAdminDonationItems() };
}

export async function editDonationItem(id: string, input: DonationItemUpdateInput) {
  const current = await findDonationItemById(id);

  if (!current) {
    throw new Error("Item not found.");
  }

  const nextType = input.type ?? current.type;
  const nextTarget =
    input.targetAmount !== undefined ? input.targetAmount : current.targetAmount;

  if (input.type && input.type !== current.type && current.pledges.length > 0) {
    throw new Error("Remove the existing pledges before changing the item type.");
  }

  if (nextType !== "ITEM") {
    if (!nextTarget) {
      throw new Error("Enter the total needed.");
    }

    if (nextType === "MONEY" && !Number.isInteger(nextTarget)) {
      throw new Error("Use a whole rupee amount.");
    }

    if (nextTarget < sumPledges(current.pledges)) {
      throw new Error("The total cannot be lower than the amount already pledged.");
    }
  }

  return toItemRecord(
    await updateDonationItem(id, {
      ...input,
      ...(input.category === "" ? { category: null } : {}),
      ...(input.note === "" ? { note: null } : {}),
      targetAmount: nextType === "ITEM" ? null : nextTarget,
      unit: nextType === "QUANTITY" ? (input.unit === undefined ? current.unit : input.unit || null) : null,
    }),
  );
}

export async function moveDonationItem(id: string, direction: "up" | "down") {
  const items = await listDonationItems();
  const index = items.findIndex((item) => item.id === id);
  const neighbour = items[direction === "up" ? index - 1 : index + 1];

  if (index === -1) {
    throw new Error("Item not found.");
  }

  if (neighbour) {
    const current = items[index];
    // Equal sort orders (e.g. bulk imports) would not move, so fall back to positions.
    const currentOrder = current.sortOrder === neighbour.sortOrder ? index : current.sortOrder;
    const neighbourOrder =
      current.sortOrder === neighbour.sortOrder
        ? direction === "up"
          ? index - 1
          : index + 1
        : neighbour.sortOrder;

    await swapDonationItemOrder(
      { id: current.id, sortOrder: currentOrder },
      { id: neighbour.id, sortOrder: neighbourOrder },
    );
  }

  return getAdminDonationItems();
}

export async function removeDonationItem(id: string) {
  await deleteDonationItem(id);
  return getAdminDonationItems();
}

export async function getDonationsBackup() {
  const items = await listDonationItems();

  return {
    donationItems: items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      note: item.note,
      type: item.type as DonationItemType,
      targetAmount: item.targetAmount,
      unit: item.unit,
      sortOrder: item.sortOrder,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
    donationPledges: items.flatMap((item) => item.pledges.map(toPledgeRecord)),
  };
}

export async function restoreDonationsBackup(input: BackupFileInput) {
  return mergeDonationsFromBackup(
    input.donationItems ?? [],
    input.donationPledges ?? [],
  );
}
