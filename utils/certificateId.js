import { v4 as uuid } from "uuid";

export function generateCertificateId() {
  return "AURA-" + uuid().slice(0, 8).toUpperCase();
}
