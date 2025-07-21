/**
 * Creates a debounced function that delays invoking func until after wait milliseconds have elapsed
 * since the last time the debounced function was invoked.
 *
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns A debounced version of the original function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: number | undefined;

  return function (this: any, ...args: Parameters<T>) {
    const context = this;

    if (timeout !== undefined) {
      window.clearTimeout(timeout);
    }

    timeout = window.setTimeout(() => {
      timeout = undefined;
      func.apply(context, args);
    }, wait);
  };
}
