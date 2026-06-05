import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <BottomNav />
    </>
  )
}
