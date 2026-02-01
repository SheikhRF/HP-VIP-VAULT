import AddAssetForm from "@/components/admin/AddAssetForm";
import Navbar from "@/components/navbar";

export const metadata = {
  title: "HP-VIP | Asset Induction",
  description: "Establish new vehicle record in the vault",
};

export default function AddCarPage() {
  return (
    <main className="min-h-screen bg-background text-white selection:bg-orange-500/30">
      <Navbar />
      <div className="relative z-10 container mx-auto px-6 py-12 md:py-20">
        <AddAssetForm />
      </div>
    </main>
  );
}