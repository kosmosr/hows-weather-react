import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { CityDrawerInfo } from '@/components/weather/types.ts'

// 最近访问的localstorage key
export const RECENT_STORAGE_KEY = 'recent_cities_key'
export const MAX_RECENT_CITIES = 5 // 最大存储数量

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStoredRecentCities = (): CityDrawerInfo[] => {
  try {
    const stored = localStorage.getItem(RECENT_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Error parsing recent cities from localStorage:', e)
  }
  return []
}
