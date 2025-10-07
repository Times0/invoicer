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
			return "bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800";
		case "finalized":
			return "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
		case "draft":
			return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
		case "cancelled":
			return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
		default:
			return "bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
	}
};

export const getStatusLabel = (status: string) => {
	switch (status) {
		case "paid":
			return "Paid";
		case "finalized":
			return "Finalized";
		case "draft":
			return "Draft";
		case "cancelled":
			return "Cancelled";
		default:
			return status;
	}
};
