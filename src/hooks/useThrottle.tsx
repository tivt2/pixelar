import { useCallback, useRef } from "react"

type ThrottleFn = (...args: any[]) => void

export function useThrottle(callback: ThrottleFn, delay: number): ThrottleFn {
  const lastCallTime = useRef<number>(0)

  return useCallback(
    (...args: any[]) => {
      const currentTime = Date.now()

      if (currentTime - lastCallTime.current >= delay) {
        callback(...args)
        lastCallTime.current = currentTime
      }
    },
    [callback, delay]
  )
}
