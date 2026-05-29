export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#060912] flex items-center justify-center relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cyber-grid-bg opacity-30" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  )
}
