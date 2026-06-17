// ============================================================
// KYA Payment Instruction — Core Logic
// ------------------------------------------------------------
// Freezing the beneficiary and the triple-mirror validation.
// This is the security heart of the payment flow. KYA never moves
// money; this logic captures an authenticated instruction and
// enforces that the beneficiary is the LC-tied supplier's account.
//
// Triple-mirror: the frozen beneficiary must agree across
//   (1) the supplier's current beneficiary record
//   (2) the LC's named beneficiary        [stubbed until LC capture exists]
//   (3) the frozen snapshot on the instruction
// Any mismatch blocks the payment and flags it.
// ============================================================

import crypto from "crypto";

export type SettlementCurrency = "USD" | "RMB";

export interface FrozenBeneficiary {
  name: string;
  account: string;
  bank: string;
  swift: string | null;
  currency: SettlementCurrency;
}

export interface SupplierBeneficiarySource {
  usd_beneficiary_name: string | null;
  usd_beneficiary_account: string | null;
  usd_beneficiary_bank: string | null;
  usd_beneficiary_swift: string | null;
  usd_details_status: string | null;
  rmb_beneficiary_name: string | null;
  rmb_beneficiary_account: string | null;
  rmb_beneficiary_bank: string | null;
  rmb_beneficiary_swift: string | null;
  rmb_details_status: string | null;
}

/**
 * Extract the supplier's beneficiary for the chosen settlement currency.
 * Returns null if the supplier has not provided details for that currency.
 */
export function getSupplierBeneficiary(
  supplier: SupplierBeneficiarySource,
  currency: SettlementCurrency
): FrozenBeneficiary | null {
  if (currency === "USD") {
    if (supplier.usd_details_status !== "provided" && supplier.usd_details_status !== "locked") return null;
    if (!supplier.usd_beneficiary_account || !supplier.usd_beneficiary_name) return null;
    return {
      name: supplier.usd_beneficiary_name,
      account: supplier.usd_beneficiary_account,
      bank: supplier.usd_beneficiary_bank || "",
      swift: supplier.usd_beneficiary_swift,
      currency: "USD",
    };
  } else {
    if (supplier.rmb_details_status !== "provided" && supplier.rmb_details_status !== "locked") return null;
    if (!supplier.rmb_beneficiary_account || !supplier.rmb_beneficiary_name) return null;
    return {
      name: supplier.rmb_beneficiary_name,
      account: supplier.rmb_beneficiary_account,
      bank: supplier.rmb_beneficiary_bank || "",
      swift: supplier.rmb_beneficiary_swift,
      currency: "RMB",
    };
  }
}

/**
 * Normalise a beneficiary into a canonical string for comparison.
 * Used by the triple-mirror to detect any mismatch.
 */
function canonical(b: { name: string; account: string; bank: string }): string {
  const norm = (s: string) => (s || "").trim().toUpperCase().replace(/\s+/g, " ");
  return [norm(b.name), norm(b.account), norm(b.bank)].join("|");
}

export interface TripleMirrorInput {
  frozen: FrozenBeneficiary;                         // snapshot on the instruction
  supplierCurrent: FrozenBeneficiary | null;         // supplier's current record
  lcBeneficiary?: { name: string; account: string; bank: string } | null; // LC (stub for now)
}

export interface TripleMirrorResult {
  ok: boolean;
  checkedLc: boolean;          // whether the LC leg was actually checked
  mismatches: string[];        // human-readable mismatch reasons
}

/**
 * The triple-mirror check. Supplier-match is enforced now.
 * LC-match is enforced only when an LC beneficiary is supplied
 * (deferred until LC beneficiary capture is built).
 */
export function tripleMirrorCheck(input: TripleMirrorInput): TripleMirrorResult {
  const mismatches: string[] = [];

  // (1) frozen vs supplier's current record — always enforced
  if (!input.supplierCurrent) {
    mismatches.push("Supplier no longer has beneficiary details on file for this currency.");
  } else if (canonical(input.frozen) !== canonical(input.supplierCurrent)) {
    mismatches.push("Frozen beneficiary does not match the supplier's current beneficiary record.");
  }

  // (2) frozen vs LC named beneficiary — enforced only if provided
  let checkedLc = false;
  if (input.lcBeneficiary) {
    checkedLc = true;
    if (canonical(input.frozen) !== canonical(input.lcBeneficiary)) {
      mismatches.push("Frozen beneficiary does not match the LC's named beneficiary.");
    }
  }

  return { ok: mismatches.length === 0, checkedLc, mismatches };
}

/**
 * Generate a unique, single-use instruction id (replay protection).
 */
export function generateInstructionId(): string {
  return "PI-" + Date.now().toString(36).toUpperCase() + "-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

/**
 * Deterministic hash of the instruction's material content (tamper-evidence).
 * The OTP attestation and signature bind to this hash.
 */
export function computeInstructionHash(parts: {
  instructionId: string;
  transactionId: string;
  leg: string;
  beneficiaryAccount: string;
  amount: number;
  currency: string;
  lcReference: string | null;
}): string {
  const material = [
    parts.instructionId,
    parts.transactionId,
    parts.leg,
    parts.beneficiaryAccount,
    String(parts.amount),
    parts.currency,
    parts.lcReference || "",
  ].join("::");
  return crypto.createHash("sha256").update(material).digest("hex");
}
/**
 * Sign the instruction payload. MOCK signing for now — uses an HMAC with a
 * local secret to stand in for real asymmetric signing. At ROECNY integration,
 * replace with real private-key signing; ROECNY verifies with KYA's public key.
 *
 * The signature covers the instruction hash + attestation, so it proves both
 * authenticity (from KYA) and that the customer authorised this exact instruction.
 */
export function signInstruction(parts: {
  instructionId: string;
  instructionHash: string;
  otpAttestationHash: string;
}): string {
  const secret = process.env.KYA_SIGNING_SECRET || "dev-mock-signing-secret";
  const material = [parts.instructionId, parts.instructionHash, parts.otpAttestationHash].join("::");
  return crypto.createHmac("sha256", secret).update(material).digest("hex");
}
/**
 * Verify an inbound notification's signature (proves it genuinely came from
 * the named party — anti-spoof). MOCK verification for now: checks an HMAC
 * with a per-party shared secret. At integration, replace with real
 * verification using each party's public key.
 */
export function verifyNotificationSignature(parts: {
  fromParty: string;
  notificationType: string;
  transactionId: string;
  instructionId: string | null;
  payloadHash: string;
  signature: string;
}): boolean {
  const secret =
    process.env["NOTIF_SECRET_" + parts.fromParty.toUpperCase()] ||
    process.env.NOTIF_SECRET_DEFAULT ||
    "dev-mock-notif-secret";
  const material = [
    parts.fromParty,
    parts.notificationType,
    parts.transactionId,
    parts.instructionId || "",
    parts.payloadHash,
  ].join("::");
  const expected = crypto.createHmac("sha256", secret).update(material).digest("hex");
  // Constant-time compare to avoid timing leaks.
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(parts.signature));
  } catch {
    return false;
  }
}

/**
 * Compute the payload hash for a notification (what the sender signs).
 */
export function computeNotificationPayloadHash(payload: unknown): string {
  return crypto.createHash("sha256").update(JSON.stringify(payload || {})).digest("hex");
}