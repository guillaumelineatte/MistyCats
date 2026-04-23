import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SessionProvider } from "@/components/admin/session-provider"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        <main className="ml-60 min-h-screen p-8">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </SessionProvider>
  )
}
