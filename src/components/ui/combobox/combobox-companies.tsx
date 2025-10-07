import type { Doc } from "convex/_generated/dataModel";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn, getFaviconUrl } from "@/lib/utils";

interface CompanyComboboxProps {
	options: Doc<"companies">[];
	value: Doc<"companies">;
	onValueChange: (value: Doc<"companies">) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	className?: string;
	buttonClassName?: string;
	contentClassName?: string;
}

export function CompanyCombobox({
	options,
	value,
	onValueChange,
	searchPlaceholder = "Search companies...",
	emptyText = "No companies found.",
	buttonClassName,
	contentClassName,
}: CompanyComboboxProps) {
	const [open, setOpen] = React.useState(false);

	const selected = options.find((option) => option._id === value._id);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-[240px] justify-between", buttonClassName)}
				>
					<span className="flex items-center gap-2">
						{selected?.website && (
							<img
								src={getFaviconUrl(selected.website) || ""}
								className="w-4 h-4 rounded"
								style={{ minWidth: 16, minHeight: 16 }}
								alt=""
							/>
						)}
						{selected?.name}
					</span>
					<ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className={cn("w-[240px] p-0", contentClassName)}>
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const favicon = getFaviconUrl(option.website || "");
								return (
									<CommandItem
										key={option._id}
										value={option._id}
										onSelect={() => {
											if (option._id !== value._id) {
												onValueChange(option);
											}
											setOpen(false);
										}}
									>
										<CheckIcon
											className={cn(
												"mr-2 h-4 w-4",
												value._id === option._id ? "opacity-100" : "opacity-0",
											)}
										/>
										{favicon && (
											<img
												src={favicon}
												className="w-4 h-4 rounded mr-2"
												style={{ minWidth: 16, minHeight: 16 }}
												alt=""
											/>
										)}
										{option.name}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
