import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { ToastContainer } from '@/components/ui/Toast';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Header />
      <main className="ml-60 pt-16 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
      <ToastContainer />
    </div>
  );
}
