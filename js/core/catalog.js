/* =========================================
   COURSE CATALOG DATABASE
   ========================================= */

const CATALOG_KEY = "operation_twa_catalog_v1";

// THE FULL COURSE LIST
const DEFAULT_CATALOG = [
    // --- ENGLISH ---
    { id: "1103", name: "Introduction to Language and Literature", dept: "English" },
    { id: "1105", name: "Introduction to Language and Literature Honors", dept: "English" },
    { id: "1108", name: "AP Seminar", dept: "English" },
    { id: "1208", name: "AP Research", dept: "English" },
    { id: "1213", name: "Western Literature", dept: "English" },
    { id: "1215", name: "Western Literature Honors", dept: "English" },
    { id: "1313", name: "American Literature", dept: "English" },
    { id: "1315", name: "American Literature Honors", dept: "English" },
    { id: "1405", name: "Afro-Literature I – Honors (College Credit)", dept: "English" },
    { id: "1406", name: "Afro-Literature II – Honors", dept: "English" },
    { id: "1415", name: "World Literature I: Antiquity to Renaissance – Honors", dept: "English" },
    { id: "1418", name: "AP English Language and Composition", dept: "English" },
    { id: "1425", name: "World Literature II: Enlightenment to Present – Honors", dept: "English" },
    { id: "1445", name: "Modern Drama - Honors", dept: "English" },
    { id: "1448", name: "AP English Literature and Composition", dept: "English" },
    { id: "1455", name: "Film Appreciation – Honors", dept: "English" },
    { id: "1456", name: "Screenwriting – Honors", dept: "English" },
    { id: "1465", name: "Myths, Fables, & Fairy Tales in the Modern World – Honors", dept: "English" },
    { id: "1466", name: "Shakespeare in Society – Honors", dept: "English" },
    { id: "1472", name: "Sounds & Articulation – Honors", dept: "English" },
    { id: "1474", name: "Public Speaking – Honors", dept: "English" },
    { id: "1475", name: "Literature of New York – Honors", dept: "English" },
    { id: "1485", name: "Ideas and Themes in Lit: “Quest for Self-Awareness” – Honors", dept: "English" },
    { id: "1495", name: "Literary Forms and Genres: “Modern Mindfulness” – Honors", dept: "English" },
    { id: "1505", name: "American Roots Music – Honors", dept: "English" },
    { id: "1506", name: "Adventure and Exploration – Honors", dept: "English" },
    { id: "1515", name: "Journalism I – Honors", dept: "English" },
    { id: "1525", name: "Journalism II – Honors", dept: "English" },
    { id: "1535", name: "Poets vs. Society – Honors", dept: "English" },
    { id: "1545", name: "Literary Rebellion – Honors", dept: "English" },
    { id: "1635", name: "The Short Story – Honors", dept: "English" },
    { id: "1636", name: "Gothic, Mystery and Science Fiction – Honors", dept: "English" },

    // --- SOCIAL STUDIES ---
    { id: "2103", name: "Global History & Geography 9", dept: "Social Studies" },
    { id: "2105", name: "Global History & Geography 9 Honors", dept: "Social Studies" },
    { id: "2106", name: "AP World History: Modern (9th/10th)", dept: "Social Studies" },
    { id: "2116", name: "AP World History: Modern (10th)", dept: "Social Studies" },
    { id: "2203", name: "Global History & Geography 10", dept: "Social Studies" },
    { id: "2205", name: "Global History & Geography 10 Honors", dept: "Social Studies" },
    { id: "2213", name: "AP European History", dept: "Social Studies" },
    { id: "2238", name: "AP African American Studies", dept: "Social Studies" },
    { id: "2303", name: "United States History and Government 11", dept: "Social Studies" },
    { id: "2305", name: "United States History and Government 11 Honors", dept: "Social Studies" },
    { id: "2418", name: "AP United States History (11th)", dept: "Social Studies" },
    { id: "2419", name: "AP United States History (10th)", dept: "Social Studies" },
    { id: "2425", name: "Introduction to Psychology - Honors", dept: "Social Studies" },
    { id: "2433", name: "Government and Economics - Honors", dept: "Social Studies" },
    { id: "2438", name: "AP U.S. Government and Politics", dept: "Social Studies" },
    { id: "2443", name: "Government and Economics", dept: "Social Studies" },
    { id: "2448", name: "AP Comparative Government and Politics", dept: "Social Studies" },
    { id: "2466", name: "Constitutional Law I", dept: "Social Studies" },
    { id: "2467", name: "Constitutional Law II", dept: "Social Studies" },
    { id: "2468", name: "AP Microeconomics", dept: "Social Studies" },
    { id: "2478", name: "AP Macroeconomics", dept: "Social Studies" },
    { id: "2588", name: "AP Psychology", dept: "Social Studies" },

    // --- BUSINESS ---
    { id: "2565", name: "Business and Entrepreneurship - Honors", dept: "Business" },
    { id: "2925", name: "Business Law – Honors", dept: "Business" },
    { id: "2935", name: "Introduction to Business – Honors", dept: "Business" },
    { id: "2945", name: "Principles of Marketing – Honors", dept: "Business" },
    { id: "2955", name: "Business and Personal Finance Honors", dept: "Business" },
    { id: "2965", name: "Business Data Analytics and Accounting - Honors", dept: "Business" },

    // --- MATHEMATICS ---
    { id: "3132", name: "Transitional Algebra", dept: "Mathematics" },
    { id: "3133", name: "Algebra 1", dept: "Mathematics" },
    { id: "3143", name: "Geometry", dept: "Mathematics" },
    { id: "3245", name: "Geometry Honors", dept: "Mathematics" },
    { id: "3332", name: "Intermediate Algebra", dept: "Mathematics" },
    { id: "3342", name: "Geometry Juniors", dept: "Mathematics" },
    { id: "3345", name: "Introduction to Analysis Honors", dept: "Mathematics" },
    { id: "3352", name: "Trigonometry and Algebra 2 (Seniors)", dept: "Mathematics" },
    { id: "3353", name: "Trigonometry and Algebra 2", dept: "Mathematics" },
    { id: "3375", name: "Trigonometry and Algebra 2 Honors / Pre-Calc Honors", dept: "Mathematics" },
    { id: "3402", name: "Senior Functions", dept: "Mathematics" },
    { id: "3418", name: "AP Calculus BC", dept: "Mathematics" },
    { id: "3428", name: "AP Calculus AB", dept: "Mathematics" },
    { id: "3444", name: "AP Pre-Calculus", dept: "Mathematics" },
    { id: "3454", name: "AP Statistics (STEM list)", dept: "Mathematics" },
    { id: "3458", name: "AP Statistics", dept: "Mathematics" },
    { id: "3625", name: "University Level Calculus 3: Multivariate Calculus", dept: "Mathematics" },

    // --- STEM ---
    { id: "3508", name: "AP Computer Science Principles", dept: "STEM" },
    { id: "3514", name: "AP Computer Science A", dept: "STEM" },
    { id: "3515", name: "AP Computer Principles", dept: "STEM" },
    { id: "3520", name: "Intro to Engineering", dept: "STEM" },
    { id: "3521", name: "Advanced Engineering", dept: "STEM" },
    { id: "3523", name: "Intro to Engineering (Senior ID)", dept: "STEM" },
    { id: "3524", name: "Advanced Engineering (Senior ID)", dept: "STEM" },
    { id: "3528", name: "AP Computer Science A", dept: "STEM" },
    { id: "3535", name: "Intro to Robotics - Honors", dept: "STEM" },
    { id: "3623", name: "Intro to Engineering (Junior ID)", dept: "STEM" },

    // --- SCIENCE ---
    { id: "4315", name: "Organic Chemistry - Honors", dept: "Science" },
    { id: "4455", name: "Human Anatomy and Physiology Honors", dept: "Science" },
    { id: "4515", name: "Independent Science Research - Honors", dept: "Science" },
    { id: "4616", name: "Independent Science Research 2", dept: "Science" },
    { id: "4618", name: "Independent Science Research 2 (Lab Assignment)", dept: "Science" },
    { id: "4668", name: "AP Environmental Science (Lecture)", dept: "Science" },
    { id: "4669", name: "AP Environmental Science (Lab)", dept: "Science" },
    { id: "4708", name: "AP Biology (Lecture)", dept: "Science" },
    { id: "4709", name: "AP Biology (Lab)", dept: "Science" },
    { id: "4713", name: "Life Science: Biology (Lecture)", dept: "Science" },
    { id: "4714", name: "Life Science: Biology (Lab)", dept: "Science" },
    { id: "4715", name: "Life Science: Biology Honors (Lecture)", dept: "Science" },
    { id: "4716", name: "Life Science: Biology Honors (Lab)", dept: "Science" },
    { id: "4721", name: "Earth & Space Sciences (Lecture)", dept: "Science" },
    { id: "4722", name: "Earth & Space Sciences (Lab)", dept: "Science" },
    { id: "4727", name: "Earth & Space Sciences Honors (Lecture)", dept: "Science" },
    { id: "4728", name: "Earth & Space Sciences Honors (Lab)", dept: "Science" },
    { id: "4731", name: "AP Chemistry (Lecture)", dept: "Science" },
    { id: "4732", name: "AP Chemistry (Lab)", dept: "Science" },
    { id: "4733", name: "Physical Setting/Chemistry (Lecture)", dept: "Science" },
    { id: "4734", name: "Physical Setting/Chemistry (Lab)", dept: "Science" },
    { id: "4735", name: "Physical Setting/Chemistry Honors (Lecture)", dept: "Science" },
    { id: "4736", name: "Physical Setting/Chemistry Honors (Lab)", dept: "Science" },
    { id: "4745", name: "Physical Setting/Physics Honors (Lecture)", dept: "Science" },
    { id: "4746", name: "Physical Setting/Physics Honors (Lab)", dept: "Science" },
    { id: "4753", name: "AP Physics 2 (Lecture)", dept: "Science" },
    { id: "4754", name: "AP Physics 2 (Lab)", dept: "Science" },
    { id: "4755", name: "Microbiology – Honors (Lecture)", dept: "Science" },
    { id: "4756", name: "Microbiology – Honors (Lab)", dept: "Science" },
    { id: "4763", name: "Environmental Science (Lecture)", dept: "Science" },
    { id: "4764", name: "Environmental Science (Lab)", dept: "Science" },
    { id: "4773", name: "Marine Science (Lecture)", dept: "Science" },
    { id: "4774", name: "Marine Science (Lab)", dept: "Science" },
    { id: "4775", name: "Human Anatomy and Physiology Honors (Lecture)", dept: "Science" },
    { id: "4776", name: "Human Anatomy and Physiology Honors (Lab)", dept: "Science" },
    { id: "4778", name: "AP Physics 1 (Lecture)", dept: "Science" },
    { id: "4779", name: "AP Physics 1 (Lab)", dept: "Science" },
    { id: "4783", name: "Forensic Science (Lecture)", dept: "Science" },
    { id: "4784", name: "Forensic Science (Lab)", dept: "Science" },
    { id: "4785", name: "Forensic Science Honors (Lecture)", dept: "Science" },
    { id: "4786", name: "Forensic Science Honors (Lab)", dept: "Science" },
    { id: "4791", name: "Intermediate Physical Science (Lecture)", dept: "Science" },
    { id: "4792", name: "Intermediate Physical Science (Lab)", dept: "Science" },
    { id: "4887", name: "Emergency Medical Technician (Lecture)", dept: "Science" },
    { id: "4888", name: "Emergency Medical Technician (Lab)", dept: "Science" },
    { id: "4898", name: "AP Physics C (Lecture)", dept: "Science" },
    { id: "4899", name: "AP Physics C (Lab)", dept: "Science" },

    // --- FOREIGN LANGUAGE ---
    { id: "5103", name: "Introduction to French", dept: "Foreign Language" },
    { id: "5105", name: "French 9 Honors", dept: "Foreign Language" },
    { id: "5133", name: "Introduction to Italian", dept: "Foreign Language" },
    { id: "5135", name: "Italian 9 Honors", dept: "Foreign Language" },
    { id: "5153", name: "Introduction to Spanish", dept: "Foreign Language" },
    { id: "5155", name: "Spanish 9 Honors", dept: "Foreign Language" },
    { id: "5163", name: "Spanish 9 Experienced", dept: "Foreign Language" },
    { id: "5203", name: "French 10", dept: "Foreign Language" },
    { id: "5205", name: "French 10 Honors", dept: "Foreign Language" },
    { id: "5233", name: "Italian 10", dept: "Foreign Language" },
    { id: "5235", name: "Italian 10 Honors", dept: "Foreign Language" },
    { id: "5253", name: "Spanish 10", dept: "Foreign Language" },
    { id: "5255", name: "Spanish 10 Honors", dept: "Foreign Language" },
    { id: "5263", name: "Spanish 10 Experienced", dept: "Foreign Language" },
    { id: "5303", name: "French 11", dept: "Foreign Language" },
    { id: "5305", name: "French 11 Honors", dept: "Foreign Language" },
    { id: "5333", name: "Italian 11", dept: "Foreign Language" },
    { id: "5335", name: "Italian 11 Honors", dept: "Foreign Language" },
    { id: "5353", name: "Spanish 11", dept: "Foreign Language" },
    { id: "5355", name: "Spanish 11 Honors", dept: "Foreign Language" },
    { id: "5363", name: "Spanish 11 Experienced", dept: "Foreign Language" },
    { id: "5418", name: "AP French Language and Culture", dept: "Foreign Language" },
    { id: "5428", name: "AP Italian Language and Culture", dept: "Foreign Language" },
    { id: "5448", name: "AP Spanish Language and Culture", dept: "Foreign Language" },
    { id: "5463", name: "Spanish 12 Experienced - Honors", dept: "Foreign Language" },
    { id: "5465", name: "Advanced Spanish 12: Conv. & Grammar – Honors", dept: "Foreign Language" },
    { id: "5575", name: "Spanish for Public Servants and Health Professionals", dept: "Foreign Language" },
    { id: "5865", name: "American Sign Language I", dept: "Foreign Language" },
    { id: "5895", name: "American Sign Language II", dept: "Foreign Language" },

    // --- THEOLOGY ---
    { id: "6113", name: "Introduction to Sacred Scripture", dept: "Theology" },
    { id: "6115", name: "Introduction to Sacred Scripture - Honors", dept: "Theology" },
    { id: "6123", name: "Introduction to Catholicism", dept: "Theology" },
    { id: "6125", name: "Intro to Catholic Faith – Franciscan Approach Honors", dept: "Theology" },
    { id: "6303", name: "Moral Theology", dept: "Theology" },
    { id: "6315", name: "The Moral Voice in the Modern World - Honors", dept: "Theology" },
    { id: "6456", name: "Apologetics/Church History", dept: "Theology" },
    { id: "6464", name: "Living the Gospel of Jesus Christ", dept: "Theology" },
    { id: "6465", name: "Intro to Ancient and Catholic Philosophy - Honors", dept: "Theology" },
    { id: "6475", name: "Kolbe Leadership Class - Honors", dept: "Theology" },

    // --- PHYSICAL EDUCATION ---
    { id: "7110", name: "Physical Education 9 & 10 (Fall/Spring)", dept: "Physical Education" },
    { id: "7121", name: "Physical Education 9 & 10 (Fall/Spring)", dept: "Physical Education" },
    { id: "7210", name: "Physical Education 11 & 12 (Fall/Spring)", dept: "Physical Education" },
    { id: "7221", name: "Physical Education 11 & 12 (Fall/Spring)", dept: "Physical Education" },
    { id: "7473", name: "Health", dept: "Physical Education" },
    { id: "7477", name: "Independent Health", dept: "Physical Education" },
    { id: "7611", name: "Athletics in Society", dept: "Physical Education" },

    // --- FINE ARTS ---
    { id: "8118", name: "AP Art History", dept: "Fine Arts" },
    { id: "8145", name: "Theatre Arts II - Honors: Scene Study", dept: "Fine Arts" },
    { id: "8183", name: "Theatre Arts I: Intro to Acting and Improvisation", dept: "Fine Arts" },
    { id: "8185", name: "Theatre Arts I - Honors", dept: "Fine Arts" },
    { id: "8203", name: "Studio in Art", dept: "Fine Arts" },
    { id: "8205", name: "Studio in Art - Honors", dept: "Fine Arts" },
    { id: "8207", name: "Introduction to 3D Modeling", dept: "Fine Arts" },
    { id: "8215", name: "Studio in Media Arts - Honors", dept: "Fine Arts" },
    { id: "8413", name: "Ceramics", dept: "Fine Arts" },
    { id: "8418", name: "AP 2-D Art and Design", dept: "Fine Arts" },
    { id: "8445", name: "Digital Media Content Creation - Honors", dept: "Fine Arts" },
    { id: "8455", name: "Portfolio Prep - Honors", dept: "Fine Arts" },
    { id: "8465", name: "Drawing and Painting - Honors", dept: "Fine Arts" },
    { id: "8483", name: "Digital Illustration and Design", dept: "Fine Arts" },
    { id: "8653", name: "Music Theory", dept: "Fine Arts" },
    { id: "8813", name: "Concert Band", dept: "Fine Arts" },
    { id: "8823", name: "Symphonic Band", dept: "Fine Arts" },
    { id: "8825", name: "Symphonic Band Honors", dept: "Fine Arts" },
    { id: "8833", name: "Jazz Band", dept: "Fine Arts" },
    { id: "8835", name: "Jazz Band - Honors", dept: "Fine Arts" },
    { id: "8843", name: "Chamber Music", dept: "Fine Arts" },
    { id: "8853", name: "Orchestra", dept: "Fine Arts" },
    { id: "8855", name: "Orchestra Honors", dept: "Fine Arts" },
    { id: "8861", name: "Introduction to Bagpipes", dept: "Fine Arts" },
    { id: "8862", name: "Bagpipes", dept: "Fine Arts" },
    { id: "8864", name: "Introduction to Music: Keyboard Skills", dept: "Fine Arts" },
    { id: "8865", name: "Bagpipes - Honors", dept: "Fine Arts" },
    { id: "8873", name: "Chorus", dept: "Fine Arts" },
    { id: "8874", name: "Sophomore Chorus Honors", dept: "Fine Arts" },
    { id: "8875", name: "Gregorian Schola Honors", dept: "Fine Arts" },
    { id: "8877", name: "Chorus", dept: "Fine Arts" },
    { id: "8878", name: "Sophomore Chorus Honors", dept: "Fine Arts" },
    { id: "8880", name: "Gregorian Schola Honors", dept: "Fine Arts" },
    { id: "8883", name: "Chorus", dept: "Fine Arts" },
    { id: "8884", name: "Sophomore Chorus Honors", dept: "Fine Arts" },
    { id: "8885", name: "Gregorian Schola Honors", dept: "Fine Arts" },
    { id: "8887", name: "Chorus", dept: "Fine Arts" },
    { id: "8889", name: "Sophomore Chorus Honors", dept: "Fine Arts" },
    { id: "8890", name: "Gregorian Schola Honors", dept: "Fine Arts" },
    { id: "8901", name: "Percussion Ensemble (Standard & Honors)", dept: "Fine Arts" },
    { id: "8911", name: "Introduction to Highland Pipe Band Drumming", dept: "Fine Arts" },
    { id: "8912", name: "Highland Pipe Band Drumming", dept: "Fine Arts" },
    { id: "8915", name: "Highland Pipe Band Drumming - Honors", dept: "Fine Arts" },

    // --- GENERAL ---
    { id: "9999", name: "Personal", dept: "General" }
];

/* =========================================
   LOGIC (Persistence & Helpers)
   ========================================= */

// 1. GET FULL CATALOG (Loads from LocalStorage or Defaults)
function getCatalog() {
    const raw = localStorage.getItem(CATALOG_KEY);
    if(raw) return JSON.parse(raw);

    // Initial Save
    localStorage.setItem(CATALOG_KEY, JSON.stringify(DEFAULT_CATALOG));
    return DEFAULT_CATALOG;
}

// 2. GET COURSE DETAILS
// Handles "1103" and "1103-1" (Instances)
function getCourseDetails(fullId) {
    if(!fullId) return null;
    const baseId = fullId.split('-')[0]; // Strip suffix
    const catalog = getCatalog();

    // Find exact match
    let course = catalog.find(c => c.id === baseId);

    // Fallback if not found
    if(!course) return { id: baseId, name: "Unknown Course (" + baseId + ")", dept: "N/A" };

    return course;
}

// 3. ADD NEW COURSE (For Admin)
function addNewCourseToCatalog(id, name, dept) {
    const catalog = getCatalog();
    if(catalog.find(c => c.id === id)) return false; // Duplicate check

    catalog.push({ id, name, dept });
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
    return true;
}

// 4. REMOVE COURSE (For Admin)
function removeCourseFromCatalog(id) {
    let catalog = getCatalog();
    catalog = catalog.filter(c => c.id !== id);
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
}