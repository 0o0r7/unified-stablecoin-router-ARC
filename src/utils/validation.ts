import { ethers } from 'ethers';

export type Token = 'USDT' | 'USDC' | 'DAI';

export type ValidationError = {
  valid: boolean;
  error?: string;
  value?: any;
};

// Validate amount
export function validateAmount(
  amount: string | number,
  maxAmount: number = 1_000_000_000,
  minAmount: number = 0.000001
): ValidationError {
  try {
    const parsed = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(parsed)) return { valid: false, error: 'Invalid amount' };
    if (!isFinite(parsed)) return { valid: false, error: 'Amount must be finite' };
    if (parsed < minAmount) return { valid: false, error: `Minimum is ${minAmount}` };
    if (parsed > maxAmount) return { valid: false, error: `Maximum is ${maxAmount}` };
    if (parsed < 0) return { valid: false, error: 'Cannot be negative' };
    return { valid: true, value: parsed };
  } catch (e) {
    return { valid: false, error: String(e) };
  }
}

// Validate token amount with decimals
export function validateTokenAmount(
  amount: string | number,
  token: Token
): ValidationError & { wei?: bigint; decimals?: number } {
  const TOKEN_DECIMALS: Record<Token, number> = { USDT: 6, USDC: 6, DAI: 18 };
  const decimals = TOKEN_DECIMALS[token];
  
  const validation = validateAmount(amount);
  if (!validation.valid) return { ...validation, decimals };

  try {
    const parsed = validation.value as number;
    const places = (parsed.toString().split('.')[1] || '').length;
    if (places > decimals) {
      return { valid: false, error: `Max ${decimals} decimals`, decimals };
    }
    const wei = ethers.parseUnits(parsed.toString(), decimals);
    return { valid: true, value: parsed, wei, decimals };
  } catch (e) {
    return { valid: false, error: String(e), decimals };
  }
}

// Validate address
export function validateAddress(address: string): ValidationError {
  if (!address) return { valid: false, error: 'Address required' };
  const trimmed = address.trim().toLowerCase();
  if (!trimmed.startsWith('0x')) return { valid: false, error: 'Must start with 0x' };
  if (trimmed.length !== 42) return { valid: false, error: 'Must be 42 chars' };
  if (!/^0x[0-9a-f]{40}$/.test(trimmed)) return { valid: false, error: 'Invalid hex' };
  return { valid: true, value: trimmed };
}

// Validate recipient (not self)
export function validateRecipient(recipient: string, sender: string): ValidationError {
  const v = validateAddress(recipient);
  if (!v.valid) return v;
  if ((v.value as string).toLowerCase() === sender.toLowerCase()) {
    return { valid: false, error: 'Cannot send to self' };
  }
  return v;
}

// Format amount for display
export function formatAmount(
  amount: bigint | string | number,
  decimals: number,
  displayDecimals: number = 6
): string {
  try {
    let value: bigint;
    if (typeof amount === 'bigint') {
      value = amount;
    } else if (typeof amount === 'string') {
      value = BigInt(amount);
    } else {
      const wei = ethers.parseUnits(amount.toString(), decimals);
      value = BigInt(wei.toString());
    }
    const formatted = ethers.formatUnits(value, decimals);
    return parseFloat(formatted).toLocaleString('en-US', {
      maximumFractionDigits: displayDecimals,
    });
  } catch {
    return 'Invalid';
  }
}

// Convert to wei
export function toWei(amount: number | string, token: Token): bigint {
  const TOKEN_DECIMALS: Record<Token, number> = { USDT: 6, USDC: 6, DAI: 18 };
  return ethers.parseUnits(amount.toString(), TOKEN_DECIMALS[token]);
}

// Convert from wei
export function fromWei(wei: bigint | string, token: Token): number {
  const TOKEN_DECIMALS: Record<Token, number> = { USDT: 6, USDC: 6, DAI: 18 };
  return parseFloat(ethers.formatUnits(wei, TOKEN_DECIMALS[token]));
}
