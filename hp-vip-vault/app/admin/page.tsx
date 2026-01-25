import Navbar from "@/components/navbar";
export default function AdminPage() {
  return (
    <>
    <Navbar/>
    <div className="min-h-screen bg-background text-foreground px-6 py-8">
      
      <h1 className="text-3xl font-bold text-primary mb-6">
        Admin
      </h1>

      {/* Admin content goes here */}
      <div className="bg-card border border-border rounded-md p-6">
        <p className="text-muted-foreground">
          Admin dashboard coming soon.
        </p>
      </div>

    </div>
    </>
  );
}
