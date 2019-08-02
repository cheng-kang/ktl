import { useEffect, useRef } from 'react';

export function useInterval(callback: () => void, delay: number | undefined) {
  const savedCallback = useRef<() => void | undefined>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      savedCallback.current && savedCallback.current();
    }
    if (delay !== undefined) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
