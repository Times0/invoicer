"use client";

import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

interface Tab {
	label: string;
	to: string;
}

import { useRouterState } from "@tanstack/react-router";

export default function Tabs({ tabs }: { tabs: Tab[] }) {
	const routerState = useRouterState();
	const currentPath = routerState.location.pathname;

	const findMatchingTabIndex = useCallback(
		(path: string) => {
			const exactMatch = tabs.findIndex((tab) => tab.to === path);
			if (exactMatch !== -1) return exactMatch;

			const sortedTabs = tabs
				.map((tab, index) => ({ tab, index }))
				.sort((a, b) => b.tab.to.length - a.tab.to.length);
			for (const { tab, index } of sortedTabs) {
				if (tab.to !== "/" && path.startsWith(tab.to)) {
					return index;
				}
			}
			return 0;
		},
		[tabs],
	);

	const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
	const [activeIndex, setActiveIndex] = useState(() =>
		findMatchingTabIndex(currentPath),
	);
	const [hoverStyle, setHoverStyle] = useState({});
	const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" });
	const tabRefs = useRef<(HTMLDivElement | null)[]>([]);

	useEffect(() => {
		const newActiveIndex = findMatchingTabIndex(currentPath);
		setActiveIndex(newActiveIndex);
	}, [currentPath, findMatchingTabIndex]);

	useEffect(() => {
		if (hoveredIndex !== null) {
			const hoveredElement = tabRefs.current[hoveredIndex];
			if (hoveredElement) {
				const { offsetLeft, offsetWidth } = hoveredElement;
				setHoverStyle({
					left: `${offsetLeft}px`,
					width: `${offsetWidth}px`,
				});
			}
		}
	}, [hoveredIndex]);

	useEffect(() => {
		const activeElement = tabRefs.current[activeIndex];
		if (activeElement) {
			const { offsetLeft, offsetWidth } = activeElement;
			setActiveStyle({
				left: `${offsetLeft}px`,
				width: `${offsetWidth}px`,
			});
		}
	}, [activeIndex]);

	return (
		<div className={`w-full border-none shadow-none relative flex`}>
			<div className="p-0">
				<div className="relative">
					<div
						className="absolute h-[30px] transition-all duration-300 ease-out bg-[#0e0f1114] dark:bg-[#ffffff1a] rounded-[6px] flex items-center"
						style={{
							...hoverStyle,
							opacity: hoveredIndex !== null ? 1 : 0,
						}}
					/>

					{/* Active Indicator */}
					<div
						className="absolute bottom-[-6px] h-[2px] bg-[#0e0f11] dark:bg-white transition-all duration-300 ease-out"
						style={activeStyle}
					/>

					{/* Tabs */}
					<div className="relative flex space-x-[6px] items-center">
						{tabs.map((tab, index) => (
							<Link
								to={tab.to}
								key={tab.to}
								ref={(el) => {
									tabRefs.current[index] = el as HTMLDivElement | null;
								}}
								className={`px-3 py-2 cursor-pointer transition-colors duration-300 h-[30px] ${
									index === activeIndex
										? "text-[#0e0e10] dark:text-white"
										: "text-[#0e0f1199] dark:text-[#ffffff99]"
								}`}
								onMouseEnter={() => setHoveredIndex(index)}
								onMouseLeave={() => setHoveredIndex(null)}
								onClick={() => setActiveIndex(index)}
							>
								<div className="text-sm font-[var(--www-mattmannucci-me-geist-regular-font-family)] leading-5 whitespace-nowrap flex items-center justify-center h-full">
									{tab.label}
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
