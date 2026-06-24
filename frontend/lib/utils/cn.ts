import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// shadcn/ui-compatible class combiner: clsx for conditionals + tailwind-merge so
// conflicting Tailwind classes resolve to the last one (what v0-generated
// components expect). Drop-in for the previous naive join.
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
