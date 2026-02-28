import { PrismaClient, Nature, DrCr } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const groupData = [
    // ASSETS
    { name: "Fixed Assets",        nature: Nature.ASSET,     isSystem: true  },
    { name: "Current Assets",      nature: Nature.ASSET,     isSystem: true  },
    { name: "Members",             nature: Nature.ASSET,     isSystem: true  },
    // LIABILITIES
    { name: "Current Liabilities", nature: Nature.LIABILITY, isSystem: true  },
    { name: "Loans",               nature: Nature.LIABILITY, isSystem: true  },
    // EQUITY
    { name: "Capital & Reserves",  nature: Nature.EQUITY,    isSystem: true  },
    // INCOME
    { name: "Membership Income",   nature: Nature.INCOME,    isSystem: true  },
    { name: "Other Income",        nature: Nature.INCOME,    isSystem: false },
    // EXPENSES
    { name: "Event & Tournament",  nature: Nature.EXPENSE,   isSystem: false },
    { name: "Operational",         nature: Nature.EXPENSE,   isSystem: false },
    { name: "Other Expenses",      nature: Nature.EXPENSE,   isSystem: false },
  ];

  for (const group of groupData) {
    await prisma.ledgerGroup.upsert({
      where:  { name: group.name },
      update: {},
      create: group,
    });
  }

  const ledgerData = [
    // Current Assets
    { code: "1001", name: "Cash in Hand",          groupName: "Current Assets",      isSystem: true,  openingType: DrCr.DR, description: "Physical cash held by the club"     },
    { code: "1002", name: "Bank - Default",         groupName: "Current Assets",      isSystem: true,  openingType: DrCr.DR, description: "Default bank account"               },
    { code: "1003", name: "Fixed Deposit",          groupName: "Current Assets",      isSystem: false, openingType: DrCr.DR, description: "Fixed deposit investments"           },
    // Fixed Assets
    { code: "1101", name: "Equipment & Fixtures",   groupName: "Fixed Assets",        isSystem: false, openingType: DrCr.DR, description: "Equipment, furniture, fixtures"      },
    // Current Liabilities
    { code: "2001", name: "Payables",               groupName: "Current Liabilities", isSystem: false, openingType: DrCr.CR, description: "Outstanding payments"               },
    // Loans
    { code: "2101", name: "Loans Taken",            groupName: "Loans",               isSystem: false, openingType: DrCr.CR, description: "Loans borrowed"                     },
    // Capital
    { code: "3001", name: "General Fund",           groupName: "Capital & Reserves",  isSystem: true,  openingType: DrCr.CR, description: "Club general fund / capital"         },
    // Membership Income
    { code: "4001", name: "Membership Fee",         groupName: "Membership Income",   isSystem: true,  openingType: DrCr.CR, description: "Fee collected from members"          },
    // Other Income
    { code: "4101", name: "Donation & Sponsorship", groupName: "Other Income",        isSystem: false, openingType: DrCr.CR, description: "Donations and sponsorships received" },
    { code: "4102", name: "Event Income",           groupName: "Other Income",        isSystem: false, openingType: DrCr.CR, description: "Income from tournaments and events"  },
    { code: "4103", name: "Miscellaneous Income",   groupName: "Other Income",        isSystem: false, openingType: DrCr.CR, description: "Any other income"                   },
    // Event & Tournament
    { code: "5101", name: "Event Expenses",         groupName: "Event & Tournament",  isSystem: false, openingType: DrCr.DR, description: "Expenses for tournaments and events" },
    // Operational
    { code: "5201", name: "Equipments & Kits",      groupName: "Operational",         isSystem: false, openingType: DrCr.DR, description: "Equipments and kits"                },
    { code: "5202", name: "Ground Maintenance",     groupName: "Operational",         isSystem: false, openingType: DrCr.DR, description: "Ground and facility maintenance"     },
    { code: "5203", name: "Refreshments",           groupName: "Operational",         isSystem: false, openingType: DrCr.DR, description: "Food and drinks"                    },
    { code: "5204", name: "Travel & Transport",     groupName: "Operational",         isSystem: false, openingType: DrCr.DR, description: "Travel expenses"                    },
    // Other Expenses
    { code: "5301", name: "General Expenses",       groupName: "Other Expenses",      isSystem: false, openingType: DrCr.DR, description: "General expenses"                   },
    { code: "5302", name: "Miscellaneous Expenses", groupName: "Other Expenses",      isSystem: false, openingType: DrCr.DR, description: "Any other miscellaneous expenses"    },
  ];

  for (const ledger of ledgerData) {
    const group = await prisma.ledgerGroup.findUnique({
      where: { name: ledger.groupName },
    });
    if (!group) throw new Error(`LedgerGroup "${ledger.groupName}" not found`);
    await prisma.ledger.upsert({
      where:  { code: ledger.code },
      update: {},
      create: {
        code:        ledger.code,
        name:        ledger.name,
        groupId:     group.id,
        isSystem:    ledger.isSystem,
        openingType: ledger.openingType,
        description: ledger.description,
      },
    });
  }

  const hashedPassword = await bcrypt.hash("admin@123", 10);
  await prisma.user.upsert({
    where:  { email: "admin@townteamathanikkal.com" },
    update: {},
    create: {
      email:    "admin@townteamathanikkal.com",
      password: hashedPassword,
      role:     "SUPER_ADMIN",
    },
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => { console.error("❌ Seed error:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
