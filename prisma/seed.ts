import { importTrainingPlan } from "../scripts/import-plan";

async function main() {
  const count = await importTrainingPlan();
  console.log(`Seed complete. Imported ${count} planned workouts.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
