import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getFaviconUrl = (websiteUrl: string) => {
  try {
    const domain = new URL(websiteUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  } catch {
    return null;
  }
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case "paid":
      return "bg-green-100 text-green-800 border-green-300";
    case "sent":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "overdue":
      return "bg-red-100 text-red-800 border-red-300";
    case "draft":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "cancelled":
      return "bg-orange-100 text-orange-800 border-orange-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};
