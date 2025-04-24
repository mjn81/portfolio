'use client';

import * as React from 'react';
import { X, Check, ChevronsUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
	Command,
	CommandGroup,
	CommandItem,
	CommandEmpty,
	CommandList,
} from '@/components/ui/command';
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export type Option = {
	value: string;
	label: string;
};

interface MultiSelectProps {
	options: Option[];
	selected: string[];
	onChange: (selected: string[]) => void;
	placeholder?: string;
	className?: string;
	creatable?: boolean;
}

export function MultiSelect({
	options,
	selected,
	onChange,
	placeholder = 'Select options...',
	className,
	creatable = false,
}: MultiSelectProps) {
	const [open, setOpen] = React.useState(false);
	const [inputValue, setInputValue] = React.useState('');

	const handleUnselect = (option: string) => {
		onChange(selected.filter((s) => s !== option));
	};

	const handleCreateTag = () => {
		if (inputValue.trim() !== '' && creatable) {
			const normalizedValue = inputValue.trim().toLowerCase();

			// Check if the tag already exists in options or selected
			const exists =
				options.some((option) => option.value === normalizedValue) ||
				selected.includes(normalizedValue);

			if (!exists) {
				onChange([...selected, normalizedValue]);
				setInputValue('');
			}
		}
	};

	const selectableOptions = options.filter(
		(option) => !selected.includes(option.value)
	);

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
        <Button
          // change type from button to div
          componentType='div'
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn(
						'w-full justify-between hover:bg-background',
						selected.length > 0 ? 'h-auto min-h-10' : 'h-10',
						className
					)}
					onClick={() => setOpen(!open)}
				>
					<div className="flex flex-wrap gap-1 py-1">
						{selected.length > 0 ? (
							selected.map((value) => {
								const label =
									options.find((option) => option.value === value)?.label ||
									value;
								return (
									<Badge
										key={value}
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{label}
										<button
											type="button"
											className="ml-1 rounded-full outline-none"
											onClick={(e) => {
												e.stopPropagation();
												handleUnselect(value);
											}}
										>
											<X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
										</button>
									</Badge>
								);
							})
						) : (
							<span className="text-muted-foreground">{placeholder}</span>
						)}
					</div>
					<ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-full p-0" align="start">
				<Command className="w-full">
					<div className="flex items-center border-b px-3">
						<input
							value={inputValue}
							onChange={(e) => setInputValue(e.target.value)}
							placeholder="Search or create tag..."
							className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ',') {
									e.preventDefault();
									handleCreateTag();
								}
							}}
						/>
					</div>
					<CommandList>
						<CommandEmpty>
							{creatable && inputValue.trim() !== '' ? (
								<button
									className="p-2 w-full text-left text-sm flex items-center hover:bg-accent cursor-pointer"
									onClick={handleCreateTag}
								>
									Create tag "{inputValue}"
								</button>
							) : (
								<p className="p-2 text-sm text-center">No tags found.</p>
							)}
						</CommandEmpty>
						<CommandGroup className="max-h-64 overflow-auto">
							{selectableOptions.map((option) => (
								<CommandItem
									key={option.value}
									value={option.value}
									onSelect={() => {
										onChange([...selected, option.value]);
										setInputValue('');
									}}
									className="cursor-pointer"
								>
									<Check
										className={cn(
											'mr-2 h-4 w-4',
											selected.includes(option.value)
												? 'opacity-100'
												: 'opacity-0'
										)}
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
