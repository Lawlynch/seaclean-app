import RequestForm from '@/components/RequestForm';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">SeaClean</h1>
          <p className="text-slate-500 mt-2">Client Portal & Staff Access</p>
        </div>
        <RequestForm />
      </div>
    </main>
  );
}