export interface CarComplianceFields {
  mot: string | null;
  tax_status: string | null;
  service_date: string | null;
}

export function isMotValid(car: CarComplianceFields): boolean {
  return car.mot === "Valid" || car.mot === "No details held by DVLA";
}

export function isTaxValid(car: CarComplianceFields): boolean {
  return car.tax_status === "Taxed";
}

export function isServiceOverdue(car: CarComplianceFields): boolean {
  return car.service_date !== null && new Date(car.service_date) < new Date();
}

// The canonical "does this car need attention" rule, used consistently
// across the dashboard stat, the asset card, and the fleet search filter.
export function needsAttention(car: CarComplianceFields): boolean {
  return !isMotValid(car) || !isTaxValid(car) || isServiceOverdue(car);
}

export function isDriveable(car: CarComplianceFields): boolean {
  return !needsAttention(car);
}
