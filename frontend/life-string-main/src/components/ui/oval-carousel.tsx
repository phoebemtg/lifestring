import React, { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface HorizontalCarouselProps {
  children: React.ReactNode[]
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
}

export const OvalCarousel: React.FC<HorizontalCarouselProps> = ({
  children,
  className,
  autoPlay = false,
  autoPlayInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Calculate the 3 visible cards (left, center, right)
  const getVisibleCards = () => {
    const totalCards = children.length
    if (totalCards === 0) return []

    const leftIndex = (currentIndex - 1 + totalCards) % totalCards
    const centerIndex = currentIndex
    const rightIndex = (currentIndex + 1) % totalCards

    return [
      { child: children[leftIndex], position: 'left', index: leftIndex },
      { child: children[centerIndex], position: 'center', index: centerIndex },
      { child: children[rightIndex], position: 'right', index: rightIndex },
    ]
  }

  const scrollPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + children.length) % children.length)
  }

  const scrollNext = () => {
    setCurrentIndex((prev) => (prev + 1) % children.length)
  }

  const scrollTo = (index: number) => {
    setCurrentIndex(index)
  }

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      scrollNext()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [autoPlay, autoPlayInterval, currentIndex])

  const visibleCards = getVisibleCards()

  return (
    <div className={cn("relative w-full max-w-5xl mx-auto py-12", className)}>
      {/* Main Carousel Container */}
      <div className="relative h-[450px] overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          {visibleCards.map((card, index) => (
            <div
              key={card.index}
              className={cn(
                "absolute w-80 h-[450px] transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] transform-gpu",
                card.position === 'left' && "translate-x-[-300px] scale-75 opacity-60 z-10",
                card.position === 'center' && "translate-x-0 scale-100 opacity-100 z-20",
                card.position === 'right' && "translate-x-[300px] scale-75 opacity-60 z-10"
              )}
            >
              <div className="w-full h-full">
                {card.child}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 h-14 w-14 rounded-full bg-background/90 backdrop-blur-sm border-2 border-border hover:bg-background hover:border-primary shadow-lg"
        onClick={scrollPrev}
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-7 w-7" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 h-14 w-14 rounded-full bg-background/90 backdrop-blur-sm border-2 border-border hover:bg-background hover:border-primary shadow-lg"
        onClick={scrollNext}
        aria-label="Next slide"
      >
        <ChevronRight className="h-7 w-7" />
      </Button>

      {/* Indicators */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-30">
        {children.map((_, index) => (
          <button
            key={index}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300 border-2",
              index === currentIndex
                ? "bg-primary border-primary scale-125"
                : "bg-background border-muted-foreground/30 hover:border-muted-foreground/60"
            )}
            onClick={() => scrollTo(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}