/**
 * REGRESSION TEST — shared car compliance/driveability logic.
 * Guards against the dashboard / AssetIntelligenceCard / DashboardSearch
 * drift that previously caused disagreeing "needs attention" counts on
 * the same screen.
 *
 * Usage:
 *   npx tsx scripts/test-car-status-logic.ts
 */

import { isMotValid, isTaxValid, isServiceOverdue, needsAttention, isDriveable } from "../lib/cars/status";

let failures = 0;

function check(name: string, pass: boolean, detail?: string) {
  if (!pass) failures++;
  console.log(`${pass ? "PASS" : "FAIL"} - ${name}${detail ? ` (${detail})` : ""}`);
}

const future = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
const past = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString();

check("MOT Valid is valid", isMotValid({ mot: "Valid", tax_status: null, service_date: null }) === true);
check("MOT 'No details held by DVLA' is valid", isMotValid({ mot: "No details held by DVLA", tax_status: null, service_date: null }) === true);
check("MOT expired is invalid", isMotValid({ mot: "Not valid", tax_status: null, service_date: null }) === false);

check("Tax Taxed is valid", isTaxValid({ mot: null, tax_status: "Taxed", service_date: null }) === true);
check("Tax SORN is invalid", isTaxValid({ mot: null, tax_status: "SORN", service_date: null }) === false);
check("Tax untaxed is invalid", isTaxValid({ mot: null, tax_status: "Untaxed", service_date: null }) === false);

check("Future service date is not overdue", isServiceOverdue({ mot: null, tax_status: null, service_date: future }) === false);
check("Past service date is overdue", isServiceOverdue({ mot: null, tax_status: null, service_date: past }) === true);
check("Null service date is not overdue", isServiceOverdue({ mot: null, tax_status: null, service_date: null }) === false);

const compliantCar = { mot: "Valid", tax_status: "Taxed", service_date: future };
check("Fully compliant car does not need attention", needsAttention(compliantCar) === false);
check("Fully compliant car is driveable", isDriveable(compliantCar) === true);

const overdueServiceCar = { mot: "Valid", tax_status: "Taxed", service_date: past };
check("Car with overdue service needs attention", needsAttention(overdueServiceCar) === true);

const badTaxCar = { mot: "Valid", tax_status: "Untaxed", service_date: null };
check("Car with invalid tax needs attention", needsAttention(badTaxCar) === true);

const sornCar = { mot: "Valid", tax_status: "SORN", service_date: null };
check("SORN car needs attention (not driveable)", needsAttention(sornCar) === true);

if (failures > 0) {
  console.error(`\n${failures} case(s) failed.`);
  process.exit(1);
}
console.log("\nAll cases passed.");
