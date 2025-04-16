import Weather from '@/components/weather/index'
import { LocationProvider } from '@/hooks/location-provider.tsx'

export default function App() {
  return (
    <LocationProvider>
      <Weather />
    </LocationProvider>
  )
}
