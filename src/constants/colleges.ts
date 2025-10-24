export const MEKELLE_UNIVERSITY_COLLEGES = [
  "College of Business and Economics",
  "College of Dryland Agriculture and Natural Resources Management",
  "College of Law and Governance",
  "College of Social Sciences and Languages",
  "College of Natural and Computational Sciences",
  "College of Health Sciences",
  "College of Veterinary Science"
] as const;

export type College = typeof MEKELLE_UNIVERSITY_COLLEGES[number];