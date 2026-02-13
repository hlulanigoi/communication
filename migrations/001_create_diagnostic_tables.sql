-- Migration: Create Vehicle Problems and Diagnostics Tables
-- Description: Creates tables for vehicle diagnostic system with problem library and diagnostic findings
-- Created: 2026-02-13

-- Create vehicle_problems table (Master library of all possible vehicle problems)
CREATE TABLE IF NOT EXISTS vehicle_problems (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  part_category TEXT NOT NULL,
  problem_name TEXT NOT NULL,
  symptoms TEXT, -- JSON array of symptoms
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'Moderate', -- "Minor", "Moderate", "Critical"
  common_causes TEXT, -- JSON array of possible causes
  estimated_repair_cost TEXT DEFAULT '0',
  estimated_repair_time TEXT,
  frequency_count TEXT DEFAULT '0', -- How many times this problem has been diagnosed
  created_by TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_vehicle_problems_part_category ON vehicle_problems(part_category);
CREATE INDEX IF NOT EXISTS idx_vehicle_problems_severity ON vehicle_problems(severity);
CREATE INDEX IF NOT EXISTS idx_vehicle_problems_problem_name ON vehicle_problems(problem_name);

-- Create vehicle_diagnostics table (Specific problems found during inspections)
CREATE TABLE IF NOT EXISTS vehicle_diagnostics (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
  vehicle_inspection_id VARCHAR(255) NOT NULL REFERENCES vehicle_inspections(id) ON DELETE CASCADE,
  vehicle_id VARCHAR(255) NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  problem_id VARCHAR(255) REFERENCES vehicle_problems(id) ON DELETE SET NULL, -- Null if custom problem
  problem_name TEXT NOT NULL, -- Stored name in case problem is deleted
  part_category TEXT NOT NULL, -- For searching even if problem is deleted
  severity TEXT NOT NULL DEFAULT 'Moderate', -- "Minor", "Moderate", "Critical"
  notes TEXT, -- Specific notes about this car's issue
  photos TEXT, -- JSON array of photo URLs/paths
  recommended_action TEXT, -- What should be done about this
  estimated_cost TEXT, -- Cost for THIS vehicle
  estimated_repair_time TEXT,
  status TEXT NOT NULL DEFAULT 'Identified', -- "Identified", "Quoted", "Approved", "In Progress", "Repaired", "Deferred"
  job_created TEXT DEFAULT 'false', -- Boolean flag for job creation
  job_id VARCHAR(255) REFERENCES jobs(id) ON DELETE SET NULL,
  diagnosed_by VARCHAR(255) REFERENCES staff(id) ON DELETE SET NULL,
  diagnosed_by_name TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_vehicle_diagnostics_inspection_id ON vehicle_diagnostics(vehicle_inspection_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_diagnostics_vehicle_id ON vehicle_diagnostics(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_diagnostics_problem_id ON vehicle_diagnostics(problem_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_diagnostics_status ON vehicle_diagnostics(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_diagnostics_part_category ON vehicle_diagnostics(part_category);

-- Create trigger to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_vehicle_problems_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER vehicle_problems_update_timestamp BEFORE UPDATE
  ON vehicle_problems FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_problems_timestamp();

CREATE OR REPLACE FUNCTION update_vehicle_diagnostics_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER vehicle_diagnostics_update_timestamp BEFORE UPDATE
  ON vehicle_diagnostics FOR EACH ROW
  EXECUTE FUNCTION update_vehicle_diagnostics_timestamp();
