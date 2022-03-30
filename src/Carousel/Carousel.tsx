import React, {
  forwardRef,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { v4 as uuidV4 } from "uuid";
import { JSX } from "@babel/types";
import cn from "classnames";
import styles from "./Carousel.module.scss";

export interface CarouselProps {
  children: JSX.Element[];
  renderNavigation?: boolean; // Flag to show the navigation arrows in the dom for navigating the carousel.
  scrollable?: boolean;
}

export interface CarouselRefHandler {
  scrollLeft?: () => void;
  scrollRight?: () => void;
}

const Carousel = forwardRef<CarouselRefHandler, CarouselProps>(
  (
    { children, renderNavigation = true, scrollable = false },
    ref
  ): ReactElement => {
    const carouselRef = useRef<HTMLDivElement>(null);
    const minSwipeDistance = 50;
    let disableScroll = false;
    let buttonNavigation = false;
    let touchStart: number | null = null;
    let touchEnd: number | null = null;

    useImperativeHandle(ref, () => ({
      scrollLeft() {
        handleScrollLeft();
      },
      scrollRight() {
        handleScrollRight();
      },
    }));

    const clientWidth: number = carouselRef.current?.clientWidth || 0;

    const cardWidth = carouselRef.current?.children[0].clientWidth || 1;

    // Need to specify the number of cards we could see in the dom, then it will push the children (for illusion) to achieve the scroll
    const [illusionCount, setIllusionCount] = useState(0);

    useEffect(() => {
      setIllusionCount(Math.max(3, Math.round(clientWidth / cardWidth)));
    }, [clientWidth, cardWidth]);

    const getScrollWidth = () => {
      return carouselRef.current?.scrollWidth || 0;
    };

    const getGap = (): number => {
      const firstNode = carouselRef.current?.childNodes?.[0] as HTMLElement;
      const secondNode = carouselRef.current?.childNodes?.[1] as HTMLElement;

      const firstNodePos =
        firstNode?.offsetLeft + firstNode?.getBoundingClientRect().width;
      const secondNodePos = secondNode?.offsetLeft || 0;

      return Math.abs(firstNodePos - secondNodePos);
    };

    const clonesWidth: number = illusionCount * (cardWidth + getGap());

    const cardsWidth: number = children?.length * (cardWidth + getGap());

    const cardLeftSpacing: number = Math.round((clientWidth - cardWidth) / 2);

    useEffect(() => {
      if (getScrollWidth()) {
        setScrollPosition(cardsWidth - cardLeftSpacing);
      }
    }, [cardsWidth, cardLeftSpacing]);

    const getScrollPosition = (): number => {
      return carouselRef.current?.scrollLeft || 0;
    };

    const setScrollPosition = (pos: number): void => {
      if (carouselRef && carouselRef.current) {
        carouselRef.current.scrollLeft = pos;
      }
    };

    const carouselScrollTo = (position: number): void => {
      carouselRef.current?.scrollTo?.({
        left: position,
        behavior: "smooth",
      });
    };

    const handleScrollLeft = (): void => {
      buttonNavigation = true;
      carouselScrollTo(getScrollPosition() - (cardWidth + getGap()));
    };

    const handleScrollRight = (): void => {
      buttonNavigation = true;
      carouselScrollTo(getScrollPosition() + cardWidth + getGap());
    };

    const onScrollReviews = (): void => {
      if (disableScroll === false) {
        const scrollPos = getScrollPosition();

        if (clonesWidth + scrollPos >= getScrollWidth()) {
          if (buttonNavigation) {
            setScrollPosition(0);
            carouselScrollTo(cardWidth + getGap() - cardLeftSpacing);
            buttonNavigation = false;
          } else {
            setScrollPosition(1);
          }

          disableScroll = true;
        } else if (scrollPos <= 0) {
          if (buttonNavigation) {
            setScrollPosition(cardsWidth);
            carouselScrollTo(getScrollPosition() - cardLeftSpacing);
            buttonNavigation = false;
          } else {
            setScrollPosition(getScrollWidth() - clonesWidth);
          }

          disableScroll = true;
        }

        if (disableScroll) {
          window.setTimeout(function () {
            disableScroll = false;
          }, 150);
        }
      }
    };

    const onTouchStart = (e: React.TouchEvent<HTMLDivElement>): void => {
      touchEnd = null;
      touchStart = e?.targetTouches?.[0]?.clientX;
    };

    const onTouchMove = (e: React.TouchEvent<HTMLDivElement>): void => {
      touchEnd = e?.targetTouches?.[0]?.clientX;
    };

    const onTouchEnd = (): void => {
      if (!touchStart || !touchEnd) return;
      const distance = touchStart - touchEnd;

      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
        handleScrollRight();
      }

      if (isRightSwipe) {
        handleScrollLeft();
      }

      touchEnd = null;
      touchStart = null;
    };

    const renderChildren = useCallback(() => {
      if (children.length >= illusionCount) {
        if (Array.isArray(children)) {
          const illusionItems: JSX.Element[] = children.slice(0, illusionCount);
          return [
            ...children,
            ...illusionItems.map((item) => {
              return {
                ...item,
                key: uuidV4(),
              };
            }),
          ];
        }
      }
      return children;
    }, [children, illusionCount]);

    const renderNavigationIcons = () => {
      return (
        <>
          <div
            onClick={handleScrollLeft}
            className={cn("scroll-backward-arrow", styles.backwardArrow)}
          >
            {"<-"} back
          </div>
          <div
            onClick={handleScrollRight}
            className={cn("scroll-forward-arrow", styles.forwardArrow)}
          >
            forward {"->"}
          </div>
        </>
      );
    };

    return (
      <>
        <div
          id="scroll"
          className={cn("scroll", styles.carouselContainer, {
            [styles.scrollable]: scrollable,
          })}
          ref={carouselRef}
          onScroll={onScrollReviews}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onTouchMove={onTouchMove}
        >
          {renderChildren()}
        </div>
        {renderNavigation && (
          <div
            className={cn(
              "scroll-navigation-buttons",
              styles.navigationButtons
            )}
          >
            {renderNavigationIcons()}
          </div>
        )}
      </>
    );
  }
);

export default Carousel;
