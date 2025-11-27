/* =========================================
   COURSE CATALOG DATABASE
   ========================================= */

const MASTER_COURSE_CATALOG = [
    { id: "1103", name: "Introduction to Language and Literature", dept: "English" },
    { id: "1105", name: "Introduction to Language and Literature Honors", dept: "English" },
    { id: "1108", name: "AP Seminar", dept: "English" },
    { id: "1208", name: "AP Research", dept: "English" },
    { id: "1213", name: "Western Literature", dept: "English" },
    { id: "1215", name: "Western Literature Honors", dept: "English" },
    { id: "1313", name: "American Literature", dept: "English" },
    { id: "1315", name: "American Literature Honors", dept: "English" },
    { id: "1418", name: "AP English Language and Composition", dept: "English" },
    { id: "1448", name: "AP English Literature and Composition", dept: "English" },
    { id: "2103", name: "Global History & Geography 9", dept: "Social Studies" },
    { id: "2106", name: "AP World History: Modern", dept: "Social Studies" },
    { id: "2303", name: "US History and Government 11", dept: "Social Studies" },
    { id: "2418", name: "AP United States History", dept: "Social Studies" },
    { id: "2438", name: "AP U.S. Government and Politics", dept: "Social Studies" },
    { id: "3133", name: "Algebra 1", dept: "Mathematics" },
    { id: "3143", name: "Geometry", dept: "Mathematics" },
    { id: "3353", name: "Trigonometry and Algebra 2", dept: "Mathematics" },
    { id: "3418", name: "AP Calculus BC", dept: "Mathematics" },
    { id: "3428", name: "AP Calculus AB", dept: "Mathematics" },
    { id: "3458", name: "AP Statistics", dept: "Mathematics" },
    { id: "4708", name: "AP Biology", dept: "Science" },
    { id: "4731", name: "AP Chemistry", dept: "Science" },
    { id: "4778", name: "AP Physics 1", dept: "Science" },
    { id: "6113", name: "Introduction to Sacred Scripture", dept: "Theology" },
    { id: "7110", name: "Physical Education", dept: "Physical Education" },
    { id: "9999", name: "Personal", dept: "General" } // Essential for logic
];

// Helper to find course by ID
function getCourseDetails(id) {
    return MASTER_COURSE_CATALOG.find(c => c.id === id) || { id: id, name: "Unknown Course", dept: "N/A" };
}