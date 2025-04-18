import Weather from '@/components/weather/index'
import { LocationProvider } from '@/hooks/location-provider.tsx'
import { Analytics } from '@vercel/analytics/vue'

export default function App() {
  return (
    <Analytics>
      <LocationProvider>
        <Weather />
      </LocationProvider>
    </Analytics>
  )
}
