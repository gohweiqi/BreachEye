"use client";

import { useState, useEffect } from "react";

/** Animated Counter Component */
export default function AnimatedCounter({
  value,
  duration = 2000,
  className = "",
}: {
  value: number | string;
  duration?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState<number | string>(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterId = `counter-${
    typeof value === "string" ? value.replace(/,/g, "") : value
  }`;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(counterId);
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [counterId, isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    if (typeof value === "number") {
      const start = 0;
      const end = value;
      const startTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(end);
        }
      };

      animate();
    } else {
      // For string values, animate from a starting point
      const numericValue = parseInt(value.replace(/,/g, ""), 10);
      if (!isNaN(numericValue)) {
        // Start from 90% of the value to make it look like it's counting
        const start = Math.floor(numericValue * 0.9);
        const end = numericValue;
        const startTime = Date.now();

        const animate = () => {
          const now = Date.now();
          const progress = Math.min((now - startTime) / duration, 1);
          const current = Math.floor(start + (end - start) * progress);
          // Format with commas
          setDisplayValue(current.toLocaleString());

          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            setDisplayValue(value);
          }
        };

        animate();
      } else {
        setDisplayValue(value);
      }
    }
  }, [isVisible, value, duration]);

  const formatNumber = (num: number | string) => {
    if (typeof num === "string") return num;
    return num.toLocaleString();
  };

  return (
    <span id={counterId} className={className}>
      {formatNumber(displayValue)}
    </span>
  );
}

