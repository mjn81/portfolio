'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { DotButton, useDotButton } from './carousel-dot-button';
import {
	PrevButton,
	NextButton,
	usePrevNextButtons,
} from './carousel-arrow-buttons';
import Autoplay from 'embla-carousel-autoplay';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

type EmblaOptionsType = any;

type PropType = {
	slides: React.ReactNode[];
	options?: EmblaOptionsType;
	className?: string;
	showDots?: boolean;
	showArrows?: boolean;
	autoplay?: boolean;
	autoplayDelay?: number;
	itemsPerView?: {
		mobile: number;
		tablet: number;
		desktop: number;
	};
};

const Carousel: React.FC<PropType> = (props) => {
	const {
		slides,
		options = { loop: true },
		className,
		showDots = true,
		showArrows = true,
		autoplay = true,
		autoplayDelay = 4000,
		itemsPerView = { mobile: 1, tablet: 2, desktop: 3 },
	} = props;

	const [isHovering, setIsHovering] = useState(false);
	const [showLeftArrow, setShowLeftArrow] = useState(false);
	const [showRightArrow, setShowRightArrow] = useState(false);

	// Configure autoplay plugin
	const autoplayPlugin = autoplay
		? [
				Autoplay({
					delay: autoplayDelay,
					stopOnInteraction: false,
					stopOnMouseEnter: true,
					playOnInit: true,
				}),
		  ]
		: [];

	const [emblaRef, emblaApi] = useEmblaCarousel(options, autoplayPlugin);

	const { selectedIndex, scrollSnaps, onDotButtonClick } =
		useDotButton(emblaApi);

	const {
		prevBtnDisabled,
		nextBtnDisabled,
		onPrevButtonClick,
		onNextButtonClick,
	} = usePrevNextButtons(emblaApi);

	// Handle mouse move for arrow visibility
	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			if (!emblaApi) return;

			const rect = e.currentTarget.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const width = rect.width;

			setShowLeftArrow(x < width * 0.3);
			setShowRightArrow(x > width * 0.7);
		},
		[emblaApi]
	);

	const handleMouseEnter = useCallback(() => {
		setIsHovering(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setIsHovering(false);
		setShowLeftArrow(false);
		setShowRightArrow(false);
	}, []);

	// Only show carousel features if more than 3 items
	const shouldShowCarouselFeatures = slides.length > 3;

	return (
		<div className={cn('embla', className)}>
			<div
				className="embla__viewport relative overflow-hidden"
				ref={emblaRef}
				onMouseMove={shouldShowCarouselFeatures ? handleMouseMove : undefined}
				onMouseEnter={shouldShowCarouselFeatures ? handleMouseEnter : undefined}
				onMouseLeave={shouldShowCarouselFeatures ? handleMouseLeave : undefined}
				style={{ 
					paddingTop: '8px', // Add space for hover effect
					paddingBottom: '8px' // Add space for hover effect
				}}
			>
				<div className="embla__container flex">
					{slides.map((slide, index) => (
						<div
							key={index}
							className={cn(
								'embla__slide flex-shrink-0 px-2',
								// Responsive sizing
								`basis-full sm:basis-1/${itemsPerView.tablet} lg:basis-1/${itemsPerView.desktop}`
							)}
							style={{
								minWidth: 0, // Prevents flex items from overflowing
							}}
						>
							<div className="h-full">{slide}</div>
						</div>
					))}
				</div>

				{/* Arrow Buttons - Only show if more than 3 items */}
				{shouldShowCarouselFeatures && showArrows && (
					<>
						<AnimatePresence>
							{isHovering && showLeftArrow && (
								<motion.div
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -10 }}
									transition={{ duration: 0.2 }}
									className="absolute left-4 top-1/2 -translate-y-1/2 z-10"
								>
									<PrevButton
										onClick={onPrevButtonClick}
										disabled={prevBtnDisabled}
									/>
								</motion.div>
							)}
						</AnimatePresence>

						<AnimatePresence>
							{isHovering && showRightArrow && (
								<motion.div
									initial={{ opacity: 0, x: 10 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 10 }}
									transition={{ duration: 0.2 }}
									className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
								>
									<NextButton
										onClick={onNextButtonClick}
										disabled={nextBtnDisabled}
									/>
								</motion.div>
							)}
						</AnimatePresence>
					</>
				)}
			</div>

			{/* Dot Navigation - Only show if more than 3 items */}
			{shouldShowCarouselFeatures && showDots && (
				<div className="embla__dots flex justify-center gap-2 mt-6">
					{scrollSnaps.map((_: number, index: number) => (
						<DotButton
							key={index}
							onClick={() => onDotButtonClick(index)}
							className={cn(
								'embla__dot w-2 h-2 rounded-full transition-all duration-300',
								index === selectedIndex
									? 'bg-primary scale-125'
									: 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
							)}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default Carousel;
