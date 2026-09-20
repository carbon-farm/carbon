import { PrismaClient, Role } from '@prisma/client';

// Human-usable user IDs: "HH" + a letter for the role + a number, e.g. HHC-0042 is
// customer #42. Short enough to say on a call, write on a bill, or put in a UPI note.
const ROLE_LETTER: Record<Role, string> = {
  FARMER: 'F',
  EXPERT: 'E',
  MODERATOR: 'M',
  ADMINISTRATOR: 'A',
  VENDOR: 'V',
  SUPPORT_AGENT: 'S',
  CUSTOMER: 'C',
  MEMBER: 'C', // everyone who signs up: HHC-0042 (legacy farmers keep their HHF- codes)
};

export function userCodePrefix(role: Role): string {
  return `HH${ROLE_LETTER[role]}`;
}

export function formatUserCode(role: Role, sequence: number): string {
  return `${userCodePrefix(role)}-${String(sequence).padStart(4, '0')}`;
}

// Takes the next number for this role's prefix. The increment is a single atomic
// INSERT ... ON CONFLICT DO UPDATE ... RETURNING, so two people signing up at the
// same instant are always handed different numbers. If the user row then fails to
// save, that number is simply skipped — codes are never reused.
export async function nextUserCode(db: Pick<PrismaClient, '$queryRaw'>, role: Role): Promise<string> {
  const prefix = userCodePrefix(role);
  const rows = await db.$queryRaw<{ lastValue: number }[]>`
    INSERT INTO "UserCodeCounter" ("prefix", "lastValue") VALUES (${prefix}, 1)
    ON CONFLICT ("prefix") DO UPDATE SET "lastValue" = "UserCodeCounter"."lastValue" + 1
    RETURNING "lastValue"`;
  return formatUserCode(role, Number(rows[0].lastValue));
}
