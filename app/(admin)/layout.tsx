import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { SessionProvider } from "@/components/admin/session-provider"
import { Toaster } from "@/components/ui/sonner"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-background">
        <AdminSidebar />
        {/* pt-14 sur mobile (header fixe), pas de padding-top sur lg, ml-60 uniquement sur lg */}
        <main className="pt-14 lg:pt-0 lg:ml-60 min-h-screen p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
      <Toaster position="bottom-right" />
    </SessionProvider>
  )
}
