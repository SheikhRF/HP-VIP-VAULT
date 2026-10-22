import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import Navbar from "@/components/navbar";
import TripEditForm from "@/components/TripEditForm";
import { isAdminClaims, isDriverOrAdminClaims } from "@/lib/auth/requireAdmin";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export default async function EditTripPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { userId, sessionClaims } = await auth();
  if (!userId) redirect("/sign-in");

  const { data: trip } = await supabase.from("trips").select("*").eq("trip_id", id).single();
  if (!trip) notFound();

  // Same ownership rule as the PATCH/DELETE API routes: the owning driver
  // only while currently a driver (or admin), or any admin regardless.
  const isOwner = trip.user_id === userId && isDriverOrAdminClaims(sessionClaims);
  if (!isOwner && !isAdminClaims(sessionClaims)) {
    redirect("/trips");
  }

  return (
    <>
      <Navbar />
      <TripEditForm trip={trip} />
    </>
  );
}
