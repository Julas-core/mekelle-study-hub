// Schools and their departments structure
export const MEKELLE_UNIVERSITY_SCHOOLS = {
  "School of Business and Economics": [
    "Accounting",
    "Economics",
    "Management",
    "Finance",
    "Marketing"
  ],
  "School of Agriculture and Natural Resources": [
    "Agriculture",
    "Natural Resources Management",
    "Dryland Agriculture",
    "Environmental Science"
  ],
  "School of Law and Governance": [
    "Law",
    "Public Administration",
    "Political Science",
    "International Relations"
  ],
  "School of Social Sciences and Languages": [
    "Sociology",
    "Psychology",
    "Linguistics",
    "Anthropology",
    "History"
  ],
  "School of Natural and Computational Sciences": [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Statistics"
  ],
  "School of EiTm": [
    "Computer Science",
    "Software Engineering",
    "Information Systems",
    "Data Science",
    "Artificial Intelligence",
    "Cybersecurity"
  ],
  "School of Health Sciences": [
    "Medicine",
    "Nursing",
    "Public Health",
    "Pharmacy",
    "Biomedical Sciences"
  ],
  "School of Veterinary Science": [
    "Veterinary Medicine",
    "Veterinary Public Health",
    "Animal Science"
  ]
} as const;

export type School = keyof typeof MEKELLE_UNIVERSITY_SCHOOLS;
export type Department = typeof MEKELLE_UNIVERSITY_SCHOOLS[School][number]; 
