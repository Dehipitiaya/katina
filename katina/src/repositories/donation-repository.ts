import { prisma } from "@/lib/prisma";
import type {
  DonationItemCreateInput,
  DonationItemUpdateInput,
  PledgeCreateInput,
  PledgeUpdateInput,
} from "@/validators/donation";

const itemOrder = [{ sortOrder: "asc" as const }, { createdAt: "asc" as const }];
const pledgeOrder = { createdAt: "asc" as const };

export async function listDonationItems() {
  return prisma.donationItem.findMany({
    orderBy: itemOrder,
    include: { pledges: { orderBy: pledgeOrder } },
  });
}

export type DonationItemWithPledges = Awaited<
  ReturnType<typeof listDonationItems>
>[number];

export async function findDonationItemById(id: string) {
  return prisma.donationItem.findUnique({
    where: { id },
    include: { pledges: { orderBy: pledgeOrder } },
  });
}

export async function findPledgeById(id: string) {
  return prisma.donationPledge.findUnique({ where: { id } });
}

async function getNextSortOrder() {
  const result = await prisma.donationItem.aggregate({ _max: { sortOrder: true } });
  return (result._max.sortOrder ?? 0) + 1;
}

export async function createDonationItem(input: DonationItemCreateInput) {
  return prisma.donationItem.create({
    data: {
      name: input.name,
      category: input.category,
      note: input.note,
      type: input.type,
      targetAmount: input.type === "ITEM" ? null : input.targetAmount,
      unit: input.type === "QUANTITY" ? input.unit : null,
      sortOrder: input.sortOrder ?? (await getNextSortOrder()),
    },
    include: { pledges: true },
  });
}

export async function createDonationItems(
  items: Array<{ name: string; type: string; targetAmount: number | null; unit: string | null }>,
  category?: string,
) {
  const firstSortOrder = await getNextSortOrder();

  return prisma.donationItem.createMany({
    data: items.map((item, index) => ({
      ...item,
      category,
      sortOrder: firstSortOrder + index,
    })),
  });
}

export async function updateDonationItem(
  id: string,
  input: Omit<DonationItemUpdateInput, "targetAmount" | "unit"> & {
    targetAmount?: number | null;
    unit?: string | null;
  },
) {
  return prisma.donationItem.update({
    where: { id },
    data: input,
    include: { pledges: { orderBy: pledgeOrder } },
  });
}

export async function swapDonationItemOrder(
  first: { id: string; sortOrder: number },
  second: { id: string; sortOrder: number },
) {
  await prisma.$transaction([
    prisma.donationItem.update({
      where: { id: first.id },
      data: { sortOrder: second.sortOrder },
    }),
    prisma.donationItem.update({
      where: { id: second.id },
      data: { sortOrder: first.sortOrder },
    }),
  ]);
}

export async function deleteDonationItem(id: string) {
  return prisma.donationItem.delete({ where: { id } });
}

/**
 * Locks the item row so two people cannot take the same item (or overshoot a
 * money target) at the same moment. `assertAllowed` throws to reject the write.
 */
export async function createPledgeLocked(
  itemId: string,
  buildPledge: (
    item: DonationItemWithPledges,
  ) => Omit<PledgeCreateInput, "itemId" | "amount"> & { amount: number | null },
) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "DonationItem" WHERE "id" = ${itemId} FOR UPDATE`;

    const item = await tx.donationItem.findUnique({
      where: { id: itemId },
      include: { pledges: { orderBy: pledgeOrder } },
    });

    if (!item) {
      throw new Error("This item is no longer available.");
    }

    return tx.donationPledge.create({ data: { ...buildPledge(item), itemId } });
  });
}

export async function updatePledgeLocked(
  id: string,
  itemId: string,
  input: Omit<PledgeUpdateInput, "amount"> & { amount?: number | null },
  assertAllowed: (item: DonationItemWithPledges) => void,
) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT "id" FROM "DonationItem" WHERE "id" = ${itemId} FOR UPDATE`;

    const item = await tx.donationItem.findUnique({
      where: { id: itemId },
      include: { pledges: { orderBy: pledgeOrder } },
    });

    if (!item) {
      throw new Error("Item not found.");
    }

    assertAllowed(item);

    return tx.donationPledge.update({ where: { id }, data: input });
  });
}

export async function deletePledge(id: string) {
  return prisma.donationPledge.delete({ where: { id } });
}

export async function mergeDonationsFromBackup(
  items: Array<{
    id: string;
    name: string;
    category: string | null;
    note: string | null;
    type: string;
    targetAmount: number | null;
    unit: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>,
  pledges: Array<{
    id: string;
    itemId: string;
    name: string;
    phone: string;
    batch: string;
    faculty: string | null;
    amount: number | null;
    createdAt: string;
    updatedAt: string;
  }>,
) {
  const itemResult = items.length
    ? await prisma.donationItem.createMany({
        data: items.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        })),
        skipDuplicates: true,
      })
    : { count: 0 };

  const existingItemIds = new Set(
    (await prisma.donationItem.findMany({ select: { id: true } })).map(
      (item) => item.id,
    ),
  );
  const restorablePledges = pledges.filter((pledge) =>
    existingItemIds.has(pledge.itemId),
  );
  const pledgeResult = restorablePledges.length
    ? await prisma.donationPledge.createMany({
        data: restorablePledges.map((pledge) => ({
          ...pledge,
          createdAt: new Date(pledge.createdAt),
          updatedAt: new Date(pledge.updatedAt),
        })),
        skipDuplicates: true,
      })
    : { count: 0 };

  return {
    importedCount: itemResult.count + pledgeResult.count,
    skippedCount:
      items.length + pledges.length - itemResult.count - pledgeResult.count,
  };
}
