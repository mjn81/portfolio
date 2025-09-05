'use client';

import React, { ComponentPropsWithRef, useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

type UsePrevNextButtonsType = {
  prevBtnDisabled: boolean;
  nextBtnDisabled: boolean;
  onPrevButtonClick: () => void;
  onNextButtonClick: () => void;
};

type EmblaCarouselType = any;
export const usePrevNextButtons = (
  emblaApi: EmblaCarouselType | undefined
): UsePrevNextButtonsType => {
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);

  const onPrevButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollPrev();
  }, [emblaApi]);

  const onNextButtonClick = useCallback(() => {
    if (!emblaApi) return;
    emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback((emblaApi: EmblaCarouselType) => {
    setPrevBtnDisabled(!emblaApi.canScrollPrev());
    setNextBtnDisabled(!emblaApi.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect(emblaApi);
    emblaApi.on('reInit', onSelect).on('select', onSelect);
  }, [emblaApi, onSelect]);

  return {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick
  };
};

type PropType = ComponentPropsWithRef<'button'>;

export const PrevButton: React.FC<PropType> = (props) => {
  const { children, className, disabled, ...restProps } = props;

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm border-border/50 shadow-lg hover:bg-background hover:shadow-xl transition-all duration-200 hover:scale-105',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
        className
      )}
      disabled={disabled}
      type="button"
      {...restProps}
    >
      <ChevronLeft className="h-5 w-5" />
      {children}
    </Button>
  );
};

export const NextButton: React.FC<PropType> = (props) => {
  const { children, className, disabled, ...restProps } = props;

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(
        'h-12 w-12 rounded-full bg-background/90 backdrop-blur-sm border-border/50 shadow-lg hover:bg-background hover:shadow-xl transition-all duration-200 hover:scale-105',
        'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100',
        className
      )}
      disabled={disabled}
      type="button"
      {...restProps}
    >
      <ChevronRight className="h-5 w-5" />
      {children}
    </Button>
  );
};
