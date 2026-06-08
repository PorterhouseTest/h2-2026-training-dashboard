CREATE TYPE "BjjStyle" AS ENUM ('Gi', 'NoGi', 'MMA', 'OpenMat', 'Other');
CREATE TYPE "BjjRole" AS ENUM ('Taught', 'Trained', 'Rolled', 'Competed', 'Other');
CREATE TYPE "RaceConfidence" AS ENUM ('Low', 'Medium', 'High');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "TrainingPlan" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "raceDate" TIMESTAMP(3) NOT NULL,
  "sourceFileName" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "TrainingPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PlannedWorkout" (
  "id" TEXT NOT NULL,
  "trainingPlanId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "weekStartDate" TIMESTAMP(3) NOT NULL,
  "dayOfWeek" TEXT NOT NULL,
  "workoutText" TEXT NOT NULL,
  "workoutType" TEXT NOT NULL,
  "plannedDistanceMiles" DOUBLE PRECISION,
  "plannedDurationMinutes" INTEGER,
  "intensityLabel" TEXT,
  "isRaceDay" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PlannedWorkout_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GarminActivity" (
  "id" TEXT NOT NULL,
  "garminActivityId" TEXT NOT NULL,
  "activityDate" TIMESTAMP(3) NOT NULL,
  "activityType" TEXT NOT NULL,
  "activityName" TEXT NOT NULL,
  "durationSeconds" INTEGER,
  "distanceMiles" DOUBLE PRECISION,
  "averagePaceSecondsPerMile" INTEGER,
  "averageHeartRate" INTEGER,
  "maxHeartRate" INTEGER,
  "elevationGainFeet" DOUBLE PRECISION,
  "calories" INTEGER,
  "rawJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GarminActivity_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyHealthMetric" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "restingHeartRate" INTEGER,
  "hrv" DOUBLE PRECISION,
  "sleepSeconds" INTEGER,
  "sleepScore" DOUBLE PRECISION,
  "bodyBattery" INTEGER,
  "stressScore" DOUBLE PRECISION,
  "trainingReadiness" DOUBLE PRECISION,
  "rawJson" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyHealthMetric_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BjjSession" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "style" "BjjStyle" NOT NULL,
  "role" "BjjRole" NOT NULL,
  "intensity" INTEGER,
  "roundsRolled" INTEGER,
  "hardRounds" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BjjSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StrengthSession" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "workoutName" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StrengthSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "StrengthExercise" (
  "id" TEXT NOT NULL,
  "strengthSessionId" TEXT NOT NULL,
  "exerciseName" TEXT NOT NULL,
  "sets" INTEGER,
  "reps" INTEGER,
  "weight" DOUBLE PRECISION,
  "rpe" DOUBLE PRECISION,
  "painNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "StrengthExercise_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WeeklyWeight" (
  "id" TEXT NOT NULL,
  "weekStartDate" TIMESTAMP(3) NOT NULL,
  "dateLogged" TIMESTAMP(3) NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "WeeklyWeight_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "DailyNote" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "note" TEXT NOT NULL,
  "tag" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "DailyNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RacePrediction" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "predictedMarathonTimeSeconds" INTEGER,
  "predictedHalfMarathonTimeSeconds" INTEGER,
  "predicted10kTimeSeconds" INTEGER,
  "predicted5kTimeSeconds" INTEGER,
  "confidence" "RaceConfidence" NOT NULL,
  "explanation" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "RacePrediction_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SyncLog" (
  "id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "finishedAt" TIMESTAMP(3),
  "message" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SyncLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");
CREATE UNIQUE INDEX "PlannedWorkout_trainingPlanId_date_key" ON "PlannedWorkout"("trainingPlanId", "date");
CREATE INDEX "PlannedWorkout_date_idx" ON "PlannedWorkout"("date");
CREATE INDEX "PlannedWorkout_weekStartDate_idx" ON "PlannedWorkout"("weekStartDate");
CREATE UNIQUE INDEX "GarminActivity_garminActivityId_key" ON "GarminActivity"("garminActivityId");
CREATE INDEX "GarminActivity_activityDate_idx" ON "GarminActivity"("activityDate");
CREATE UNIQUE INDEX "DailyHealthMetric_date_key" ON "DailyHealthMetric"("date");
CREATE INDEX "BjjSession_date_idx" ON "BjjSession"("date");
CREATE INDEX "StrengthSession_date_idx" ON "StrengthSession"("date");
CREATE UNIQUE INDEX "WeeklyWeight_weekStartDate_key" ON "WeeklyWeight"("weekStartDate");
CREATE INDEX "DailyNote_date_idx" ON "DailyNote"("date");
CREATE INDEX "RacePrediction_date_idx" ON "RacePrediction"("date");
CREATE INDEX "SyncLog_source_startedAt_idx" ON "SyncLog"("source", "startedAt");

ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlannedWorkout" ADD CONSTRAINT "PlannedWorkout_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StrengthExercise" ADD CONSTRAINT "StrengthExercise_strengthSessionId_fkey" FOREIGN KEY ("strengthSessionId") REFERENCES "StrengthSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
