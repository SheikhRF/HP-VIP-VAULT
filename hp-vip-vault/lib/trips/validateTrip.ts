// Shared trip-body validation, used by both POST /api/trips (create) and
// PATCH /api/trips/[id] (edit) so the two never drift out of sync.

export type TripRow = {
  car_id: number;
  start_date: string;
  end_date: string;
  mileage_before: number;
  mileage_after: number;
  rating: number;
  notes: string | null;
};

export type ValidateTripResult =
  | { ok: true; row: TripRow }
  | { ok: false; error: string };

export function validateTripBody(body: Record<string, unknown>): ValidateTripResult {
  const { car_id, start_date, end_date, mileage_before, mileage_after, rating, notes } = body;

  if (!car_id || !start_date || !mileage_before || !end_date || !mileage_after || !rating) {
    return { ok: false, error: "Missing mandatory trip data" };
  }

  const mBefore = parseInt(mileage_before as string, 10);
  const mAfter = parseInt(mileage_after as string, 10);

  if (mAfter < mBefore) {
    return { ok: false, error: "Odometer After cannot be less than Odometer Before" };
  }

  return {
    ok: true,
    row: {
      car_id: parseInt(car_id as string, 10),
      start_date: start_date as string,
      end_date: end_date as string,
      mileage_before: mBefore,
      mileage_after: mAfter,
      rating: parseInt(rating as string, 10),
      notes: (notes as string) || null,
    },
  };
}
