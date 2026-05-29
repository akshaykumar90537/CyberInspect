import Sidebar from '@/components/layout/Sidebar'
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#060912] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
