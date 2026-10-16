import AddAssetForm from "@/components/admin/AddAssetForm";
import Navbar from "@/components/navbar";
import Reveal from "@/components/Reveal";
import SpeedBackdrop from "@/components/SpeedBackdrop";

export const metadata = {
  title: "HP-VIP | Asset Induction",
  description: "Establish new vehicle record in the vault",
};

export default function AddCarPage() {
  return (
    <main className="relative overflow-hidden min-h-screen bg-background text-white selection:bg-orange-500/30">
      <Navbar />
      <SpeedBackdrop variant="corner" />
      <div className="relative z-10 container mx-auto px-6 py-12 md:py-20">
        <Reveal>
          <AddAssetForm />
        </Reveal>
      </div>
    </main>
  );
}