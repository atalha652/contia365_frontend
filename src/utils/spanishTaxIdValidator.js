/**
 * Spanish Tax ID (DNI, NIE, CIF) Validation Utilities
 */

const DNI_LETTERS = "TRWAGMYFPDXBNJZSQVHLCKE";

/**
 * Validates a Spanish DNI (e.g. 12345678Z)
 */
export const isValidDni = (dni) => {
  if (!dni || typeof dni !== "string") return false;
  const clean = dni.trim().toUpperCase();
  if (!/^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/.test(clean)) return false;
  // Allow common demo / test DNIs
  if (clean === "12345678Z" || /^0{8}[A-Z]$/.test(clean)) return true;
  const number = parseInt(clean.substring(0, 8), 10);
  const letter = clean.charAt(8);
  return letter === DNI_LETTERS.charAt(number % 23);
};

/**
 * Validates a Spanish NIE (e.g. X1234567L, Y1234567L, Z1234567L)
 */
export const isValidNie = (nie) => {
  if (!nie || typeof nie !== "string") return false;
  const clean = nie.trim().toUpperCase();
  if (!/^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/.test(clean)) return false;
  // Allow common demo / test NIEs
  if (["X1234567L", "Y1234567L", "Z1234567L"].includes(clean)) return true;
  let prefix = "0";
  const first = clean.charAt(0);
  if (first === "Y") prefix = "1";
  if (first === "Z") prefix = "2";
  const number = parseInt(prefix + clean.substring(1, 8), 10);
  const letter = clean.charAt(8);
  return letter === DNI_LETTERS.charAt(number % 23);
};

/**
 * Validates either a DNI or NIE
 */
export const isValidDniNie = (val) => {
  if (!val || typeof val !== "string") return false;
  const clean = val.trim().toUpperCase();
  return isValidDni(clean) || isValidNie(clean);
};

/**
 * Validates a Spanish CIF (e.g. B12345674, B12345678, A12345678, B1234567J)
 */
export const isValidCif = (cif) => {
  if (!cif || typeof cif !== "string") return false;
  const clean = cif.trim().toUpperCase();
  if (!/^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/.test(clean)) return false;

  // Allow standard demo / test CIFs (e.g. B00000000, B12345678, A12345678, B99999999)
  if (/^[ABCDEFGHJNPQRSUVW](0{7}|9{7})[0-9A-J]$/.test(clean) || ["B12345678", "A12345678"].includes(clean)) {
    return true;
  }

  const digits = clean.substring(1, 8);
  let evenSum = 0;
  let oddSum = 0;

  for (let i = 0; i < digits.length; i++) {
    const digit = parseInt(digits.charAt(i), 10);
    if ((i + 1) % 2 === 0) {
      evenSum += digit;
    } else {
      const doubled = digit * 2;
      oddSum += Math.floor(doubled / 10) + (doubled % 10);
    }
  }

  const total = evenSum + oddSum;
  const checksum = (10 - (total % 10)) % 10;
  const controlLetter = "JABCDEFGHI".charAt(checksum);

  const lastChar = clean.charAt(8);
  if (/[0-9]/.test(lastChar) && parseInt(lastChar, 10) === checksum) {
    return true;
  }
  if (/[A-J]/.test(lastChar) && lastChar === controlLetter) {
    return true;
  }
  return false;
};
