import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = '0%',
  freezeOnceVisible = false,
}: UseIntersectionObserverOptions = {}) {
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const frozen = isIntersecting && freezeOnceVisible;

  const thresholdString = JSON.stringify(threshold);

  useEffect(() => {
    const node = ref.current;
    if (!node || frozen) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      { threshold, root, rootMargin }
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thresholdString, root, rootMargin, frozen]);

  return { ref, isIntersecting };
}
