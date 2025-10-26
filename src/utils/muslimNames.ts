// Common Muslim first names and surnames for detection
// This is a comprehensive but not exhaustive list of names typically associated with Muslims
// Names may be common in various cultures (Arabic, Persian, Turkish, Urdu, etc.)

export const muslimNames = {
  firstNames: [
    // Arabic names
    'Ahmed', 'Mohamed', 'Mohammed', 'Ali', 'Omar', 'Osman', 'Abdullah', 'Abdul', 'Hassan', 'Hussein',
    'Ibrahim', 'Ismail', 'Yusuf', 'Amin', 'Said', 'Khalid', 'Farid', 'Tariq', 'Nasir', 'Jamal',
    'Imran', 'Bilal', 'Yahya', 'Akram', 'Fahad', 'Rashid', 'Majid', 'Naveed', 'Talha', 'Zaid',
    'Amir', 'Nasir', 'Salim', 'Karim', 'Rafiq', 'Waleed', 'Sami', 'Tamer', 'Kareem', 'Adnan',
    'Mahmoud', 'Walid', 'Bashir', 'Faisal', 'Omar', 'Usman', 'Abubakar', 'Saad', 'Zakaria', 'Fahim',
    'Ayesha', 'Fatima', 'Aisha', 'Mariam', 'Khadija', 'Zainab', 'Hafsa', 'Amina', 'Khawla', 'Layla',
    'Nour', 'Sara', 'Noor', 'Huda', 'Zahra', 'Rabab', 'Jamila', 'Muna', 'Nadia', 'Safia',
    'Samira', 'Najma', 'Rania', 'Salma', 'Yasmin', 'Zaynab', 'Amira', 'Khadijah', 'Aaliyah', 'Maryam',
    
    // Persian/Iranian names
    'Hassan', 'Hossein', 'Ali', 'Mohsen', 'Amir', 'Reza', 'Saeed', 'Hadi', 'Hamid', 'Mostafa',
    'Arash', 'Ardalan', 'Behzad', 'Dariush', 'Farhad', 'Kamran', 'Mehdi', 'Navid', 'Parsa', 'Ramin',
    'Shayan', 'Yasin', 'Fatemeh', 'Mahtab', 'Narges', 'Parisa', 'Roxana', 'Shabnam', 'Tara', 'Yasamin',
    
    // Urdu/Pakistani names
    'Arsalan', 'Bilal', 'Daniyal', 'Ehtesham', 'Fahad', 'Ghulam', 'Hamza', 'Ijaz', 'Javed', 'Kashif',
    'Luqman', 'Mansoor', 'Nadeem', 'Owais', 'Qasim', 'Rizwan', 'Sohaib', 'Tayyab', 'Umar', 'Usman',
    'Waqar', 'Yasir', 'Zeeshan', 'Adeel', 'Babar', 'Chaudhry', 'Danish', 'Ebad', 'Faizan', 'Ghani',
    'Humaira', 'Iqra', 'Kinza', 'Laiba', 'Malaika', 'Nimra', 'Quratulain', 'Rabia', 'Sana', 'Tehreem',
    'Urooj', 'Zainab', 'Ayesha', 'Bushra', 'Dua', 'Erum', 'Fariha', 'Gulalai', 'Hoorain', 'Irsa',
    
    // Turkish names
    'Ahmet', 'Mehmet', 'Mustafa', 'Murat', 'Emin', 'Emre', 'Kemal', 'Yusuf', 'Arda', 'Ali',
    'Can', 'Cem', 'Deniz', 'Emir', 'Furkan', 'Gökhan', 'Hakan', 'Ismail', 'Kaan', 'Levent',
    'Melih', 'Nuri', 'Omer', 'Polat', 'Recep', 'Serkan', 'Tayfun', 'Umut', 'Volkan', 'Yasin',
    'Ayse', 'Fatma', 'Zeynep', 'Emine', 'Hatice', 'Hulya', 'Ipek', 'Nazli', 'Sibel', 'Tuana'
  ],
  
  surnames: [
    // Common Muslim surnames from various cultures
    'Al-Rashid', 'Al-Zaher', 'Al-Mahmoud', 'Al-Ameen', 'Al-Abdullah', 'Al-Hassan', 'Al-Khalil', 
    'Al-Ali', 'Al-Mahdi', 'Al-Sayed', 'Al-Shami', 'Al-Bakri', 'Al-Ghazi', 'Al-Harith', 'Al-Jabri',
    'Ahmed', 'Mohammed', 'Hassan', 'Ali', 'Khan', 'Syed', 'Sayed', 'Malik', 'Butt', 'Rao',
    'Mir', 'Qureshi', 'Ansari', 'Hussain', 'Khan', 'Ahmad', 'Sheikh', 'Farooq', 'Iqbal', 'Hashmi',
    'Jamil', 'Khalid', 'Majeed', 'Nadeem', 'Sadiq', 'Tariq', 'Yasin', 'Zafar', 'Zahir', 'Zia',
    'Abdullah', 'Abdel', 'Hakim', 'Hamid', 'Imran', 'Junaid', 'Kareem', 'Latif', 'Mansoor', 'Nasir',
    'Omar', 'Qadir', 'Rashid', 'Saleem', 'Talib', 'Usman', 'Waqar', 'Yahya', 'Zubair', 'Ibrahim',
    'Mohammad', 'Suleiman', 'Tawfik', 'Uthman', 'Waseem', 'Youssef', 'Zaki', 'Arafat', 'Bashir', 'Chaudhry',
    
    // Turkish surnames
    'Ozturk', 'Yilmaz', 'Kaya', 'Sahin', 'Demir', 'Celik', 'Kilic', 'Yildiz', 'Ozcan', 'Arslan',
    'Dogan', 'Aslan', 'Kurt', 'Ozkan', 'Cetin', 'Aydin', 'Albayrak', 'Yildirim', 'Celikkan', 'Koc',
    
    // Persian/Iranian surnames
    'Ahmadi', 'Mohammadi', 'Hassani', 'Alavi', 'Rashidi', 'Karimi', 'Hosseini', 'Sadeghi', 
    'Seyed', 'Hashemi', 'Bakhtiari', 'Kazemi', 'Moradi', 'Ebrahimi', 'Ghorbani', 'Jalali',
    'Noori', 'Rostami', 'Safavi', 'Tabatabaei', 'Tehrani', 'Mousavi', 'Khomeini', 'Shirazi'
  ]
};

// Helper function to normalize names for comparison
export const normalizeName = (name: string): string => {
  return name.trim().toLowerCase();
};

// Helper function to check if a name is in our Muslim names dataset
export const isMuslimName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const normalizedFullName = normalizeName(name);
  
  // Check if the full name exists in either first names or surnames
  if (muslimNames.firstNames.some(muslimName => 
    normalizeName(muslimName) === normalizedFullName
  )) {
    return true;
  }
  
  if (muslimNames.surnames.some(muslimName => 
    normalizeName(muslimName) === normalizedFullName
  )) {
    return true;
  }
  
  // Split the name and check individual parts
  const nameParts = normalizedFullName.split(' ');
  for (const part of nameParts) {
    // Check if any part of the name matches our Muslim name database
    if (
      muslimNames.firstNames.some(muslimName => 
        normalizeName(muslimName).includes(part) || part.includes(normalizeName(muslimName))
      ) ||
      muslimNames.surnames.some(muslimName => 
        normalizeName(muslimName).includes(part) || part.includes(normalizeName(muslimName))
      )
    ) {
      // Additional check to reduce false positives - make sure the matched part is significant
      if (part.length >= 3) {
        return true;
      }
    }
  }
  
  return false;
};