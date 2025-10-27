// Utility functions to identify freshman-level courses based on course codes, titles, and departments
// Uses heuristics to classify courses as likely freshman level without database changes

// Common patterns that indicate freshman-level courses
const FRESHMAN_INDICATORS = [
  // Course code patterns (e.g., CS101, MATH100)
  /\b\w*[A-Z]{2,}\s*101\b/i,      // Course code with 101
  /\b\w*[A-Z]{2,}\s*100\b/i,      // Course code with 100
  /\b\w*[A-Z]{2,}\s*102\b/i,      // Course code with 102
  /\b\w*[A-Z]{2,}\s*1[0-9]{2}\b/i, // Course code starting with 1xxx (1000-1999 level)
  
  // Title patterns
  /\bintro\b/i,                    // Contains "intro"
  /\bintroduction\b/i,             // Contains "introduction"
  /\bbasic\b/i,                    // Contains "basic"
  /\bfundament(al|als)\b/i,        // Contains "fundamental" or "fundamentals"
  /\bfirst year\b/i,               // Contains "first year"
  /\bfreshman\b/i,                 // Contains "freshman"
  /\bbeginner\b/i,                 // Contains "beginner"
  /\blevel 1\b/i,                  // Contains "level 1"
  /\b1st year\b/i,                 // Contains "1st year"
  /\bundergraduate level\b/i,      // Contains "undergraduate level"
];

// Common course codes that are typically for freshman students
const FRESHMAN_COURSE_CODES = [
  // Computer Science
  'CSEN101', 'CSEN102', 'CS101', 'COSC101', 'COMP101',
  // Mathematics
  'MATH101', 'MATH102', 'MATH100', 'CALC1', 'CAL1',
  // Physics
  'PHYS101', 'PHYS102', 'PH101',
  // Chemistry
  'CHEM101', 'CHEM102',
  // English
  'ENG101', 'ENGL101', 'WRIT101',
  // General Education
  'GENED', 'GEN101', 'GE101',
  // Biology
  'BIOL101', 'BIO101',
  // History
  'HIST101',
  // Psychology
  'PSY101', 'PSYC101',
  // Sociology
  'SOC101', 'SOCY101'
];

// Common subject areas that are typically for freshman students
const FRESHMAN_DEPARTMENTS = [
  'General Education',
  'Foundation Studies',
  'Common Courses',
  'Mandatory Courses',
  'Basic Sciences',
  'Introductory Studies'
];

// Function to determine if a course is likely a freshman course
export const isFreshmanCourse = (courseCode: string, title: string, department: string, materialId?: string): boolean => {
  // If a materialId is provided, check for admin overrides first
  if (materialId) {
    const overrides = JSON.parse(localStorage.getItem('freshmanCourseOverrides') || '{}');
    if (overrides.hasOwnProperty(materialId)) {
      return overrides[materialId]; // Return the override value (true/false)
    }
  }

  // Check course code patterns
  if (FRESHMAN_COURSE_CODES.some(code => 
    courseCode.toUpperCase().includes(code.toUpperCase())
  )) {
    return true;
  }

  // Check course code patterns with regex
  if (FRESHMAN_INDICATORS.some(pattern => 
    pattern.test(courseCode) || pattern.test(title)
  )) {
    return true;
  }

  // Check department
  if (FRESHMAN_DEPARTMENTS.some(dept => 
    department.toLowerCase().includes(dept.toLowerCase())
  )) {
    return true;
  }

  // Check if department contains "1st" as this often indicates freshman level
  if (/\b1st\b/i.test(department) || /\bfirst\b/i.test(department)) {
    return true;
  }

  return false;
};

// Function to filter materials to only include freshman courses
export const getFreshmanMaterials = (materials: Array<any>): Array<any> => {
  return materials.filter(material => 
    isFreshmanCourse(
      material.course || '', 
      material.title || '', 
      material.department || '',
      material.id
    )
  );
};