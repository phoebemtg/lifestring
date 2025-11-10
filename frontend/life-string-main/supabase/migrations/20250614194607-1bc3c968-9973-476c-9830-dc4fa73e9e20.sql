
-- Update house_competitions table to include time and location
ALTER TABLE house_competitions 
ADD COLUMN competition_time TIME,
ADD COLUMN location TEXT;

-- Add a date column for the competition date
ALTER TABLE house_competitions 
ADD COLUMN competition_date DATE;

-- Create a table to track house points transactions for audit purposes
CREATE TABLE house_points_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id INTEGER NOT NULL,
  points_change INTEGER NOT NULL,
  reason TEXT,
  admin_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add an index for faster queries
CREATE INDEX idx_house_points_transactions_house_id ON house_points_transactions(house_id);
CREATE INDEX idx_house_points_transactions_created_at ON house_points_transactions(created_at);
