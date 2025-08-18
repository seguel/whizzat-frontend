import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combina clsx com tailwind-merge para evitar conflitos de classe
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
