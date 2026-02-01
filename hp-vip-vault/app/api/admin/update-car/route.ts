import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase with Service Role for bypass permissions
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Vault Connection Failure: Missing Credentials");
  return createClient(url, key);
}

export async function POST(req: Request) {
  const supabase = getSupabase();
  const contentType = req.headers.get("content-type") || "";

  try {
    // --- BRANCH A: JSON PROTOCOL (Decommissioning / Delete) ---
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { car_id, isDelete } = body;

      if (isDelete && car_id) {
        // 1. Fetch existing asset to identify media for purging
        const { data: car } = await supabase
          .from("cars")
          .select("pictures")
          .eq("car_id", car_id)
          .single();

        // 2. Purge files from Storage Bucket if they exist
        if (car?.pictures && Array.isArray(car.pictures)) {
          const pathsToDelete = car.pictures
            .map((url: string) => url.split("car-images/")[1])
            .filter(Boolean);

          if (pathsToDelete.length > 0) {
            await supabase.storage.from("car-images").remove(pathsToDelete);
          }
        }

        // 3. Decommission database record
        const { error: dbError } = await supabase
          .from("cars")
          .delete()
          .eq("car_id", car_id);

        if (dbError) throw dbError;
        return NextResponse.json({ success: true, message: "Asset Purged" });
      }
    }

    // --- BRANCH B: FORMDATA PROTOCOL (Commit Overrides & Photos) ---
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const carId = formData.get("car_id");

      if (!carId) return NextResponse.json({ error: "Missing Asset ID" }, { status: 400 });

      // 1. Build update object from all form fields
      const updateData: any = {};
      
      // List of all keys to extract from FormData (matches your database schema)
      const fields = [
        "registration", "make", "model", "year_of_manufacture", "mot", 
        "tax_status", "tax_due_date", "acceleration_0_100", "body_type", 
        "engine_capacity", "curb_weight", "cylinder_layout", "drive_wheels", 
        "engine_power", "fuel_tank_capacity", "gearbox_type", "max_speed", 
        "max_torque", "max_trunk_capacity", "number_of_cylinders", 
        "number_of_gears", "number_of_seats", "mileage", "price", "location"
      ];

      fields.forEach((field) => {
        const value = formData.get(field);
        if (value !== null) {
          // Sanitization: Convert empty/dash strings to null for DB integrity
          updateData[field] = (value === "" || value === "-") ? null : value;
        }
      });

      // 2. Handle New Photo Uploads
      const newFiles = formData.getAll("photos") as File[];
      let newPhotoUrls: string[] = [];

      if (newFiles.length > 0) {
        for (const file of newFiles) {
          const fileName = `${carId}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
          const { data, error: uploadError } = await supabase.storage
            .from("car-images")
            .upload(fileName, file);

          if (data) {
            const { data: { publicUrl } } = supabase.storage
              .from("car-images")
              .getPublicUrl(data.path);
            newPhotoUrls.push(publicUrl);
          }
        }
      }

      // 3. Merge with existing pictures
      const { data: currentCar } = await supabase
        .from("cars")
        .select("pictures")
        .eq("car_id", carId)
        .single();
        
      const existingPictures = currentCar?.pictures || [];
      updateData.pictures = [...existingPictures, ...newPhotoUrls];

      // 4. Commit Overrides to Database
      const { error: updateError } = await supabase
        .from("cars")
        .update(updateData)
        .eq("car_id", carId);

      if (updateError) throw updateError;
      return NextResponse.json({ success: true, message: "Asset Updated" });
    }

    return NextResponse.json({ error: "Unsupported Protocol" }, { status: 415 });

  } catch (error: any) {
    console.error("Vault API Error:", error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Internal System Error" 
    }, { status: 500 });
  }
}