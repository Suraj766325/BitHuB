import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { API_BASE } from '../config';
const PracticeMode = lazy(() => import('./PracticeMode'));
import CreatorsSection from './CreatorsSection';

// ============================================================
// LOCAL REFERENCE BOOKS REGISTRY (MANUAL HIGH-FIDELITY BOOK DATA)
// ============================================================
const REFERENCE_BOOKS_REGISTRY = {
  "MA24101": [
    {
      filename: "Linear_Algebra_and_its_application.pdf",
      title: "Linear Algebra and Its Applications",
      author: "David C. Lay, Steven R. Lay & Judi J. McDonald",
      tags: ["Mathematics", "Linear Algebra", "Matrices", "Eigenvalues"]
    },
    {
      filename: "Thomas_Calculus.pdf",
      title: "Thomas' Calculus",
      author: "George B. Thomas Jr., Joel R. Hass & Christopher Heil",
      tags: ["Mathematics", "Calculus", "Integration", "Multivariable"]
    }
  ],
  "CE24101": [
    {
      filename: "Basic Concepts of Environmental Chemistry (D.W. Conell).pdf",
      title: "Basic Concepts of Environmental Chemistry",
      author: "D.W. Connell",
      tags: ["Environmental Science", "Chemistry", "Pollution", "Ecology"]
    }
  ],
  "BE24101": [
    {
      filename: "Biochemistry 5th Edition, Jeremy M. Berg.pdf",
      title: "Biochemistry",
      author: "Jeremy M. Berg, John L. Tymoczko & Lubert Stryer",
      tags: ["Biology", "Biochemistry", "Metabolism", "Biomolecules"]
    },
    {
      filename: "Lehninger Principles of Biochemistry Fourth Edition.pdf",
      title: "Principles of Biochemistry",
      author: "Albert L. Lehninger, David L. Nelson & Michael M. Cox",
      tags: ["Biology", "Biochemistry", "Enzymes & Catalysis", "Cell Metabolism"]
    }
  ],
  "CS24101": [
    {
      filename: "Let us c - Yashwant Kanetkar.pdf",
      title: "Let Us C",
      author: "Yashavant Kanetkar",
      tags: ["Programming", "C Language", "Control Statements", "Arrays & Pointers"]
    },
    {
      filename: "Programming-with-C-Byron-Gottfried.pdf",
      title: "Programming with C (Schaum's Outlines)",
      author: "Byron S. Gottfried",
      tags: ["Programming", "C Language", "Functions", "Structures & Unions"]
    },
    {
      filename: "The.C.Programming.Language.2Nd.Ed Prentice.Hall.Brian.W.Kernighan.and.Dennis.M.Ritchie.pdf",
      title: "The C Programming Language",
      author: "Brian W. Kernighan & Dennis M. Ritchie",
      tags: ["Programming", "C Language", "Standard Library", "Pointers & Arrays"]
    }
  ],
  "EE24101": [
    {
      filename: "A Textbook of Electrical Engineering B.L Theraja.pdf",
      title: "A Textbook of Electrical Technology",
      author: "B.L. Theraja & A.K. Theraja",
      tags: ["Electrical Engineering", "DC Circuits", "AC Circuits", "Magnetic Circuits"]
    },
    {
      filename: "Basics of Electrical Engineering Edward Hughes.pdf",
      title: "Electrical and Electronic Technology",
      author: "Edward Hughes",
      tags: ["Electrical Engineering", "AC Circuits", "Transformers", "DC Machines"]
    },
    {
      filename: "Hayt Engineering Circuit Analysis 8th txtbk.pdf",
      title: "Engineering Circuit Analysis",
      author: "William H. Hayt, Jack E. Kemmerly & Steven M. Durbin",
      tags: ["Electrical Engineering", "Circuit Analysis", "Network Theorems", "AC Steady State"]
    }
  ],
  "MA24103": [
    {
      filename: "197-advanced-engineering-mathematics KA Stroud.pdf",
      title: "Advanced Engineering Mathematics",
      author: "K.A. Stroud",
      tags: ["Mathematics", "Engineering Math", "Differential Equations", "Fourier Analysis"]
    },
    {
      filename: "Advanced Engineering Mathematics 9th Edition by ERWIN KREYSZIG.pdf",
      title: "Advanced Engineering Mathematics",
      author: "Erwin Kreyszig",
      tags: ["Mathematics", "Advanced Calculus", "Linear Algebra", "Complex Analysis"]
    },
    {
      filename: "Complex Variables and Applications.pdf",
      title: "Complex Variables and Applications",
      author: "James Ward Brown & Ruel V. Churchill",
      tags: ["Complex Variables", "Mathematics", "Analytic Functions", "Integration"]
    },
    {
      filename: "NumericalMethods.pdf",
      title: "Numerical Methods for Engineers",
      author: "Steven C. Chapra & Raymond P. Canale",
      tags: ["Numerical Methods", "Mathematics", "Root Finding", "Interpolation"]
    },
    {
      filename: "Probability and Statistics for Engineers.pdf",
      title: "Probability and Statistics for Engineers & Scientists",
      author: "Ronald E. Walpole & Raymond H. Myers",
      tags: ["Probability", "Statistics", "Random Variables", "Distributions"]
    }
  ],
  "PH24101": [
    {
      filename: "Concepts of Modern Physics by Arthur Beiser.pdf",
      title: "Concepts of Modern Physics",
      author: "Arthur Beiser",
      tags: ["Physics", "Modern Physics", "Quantum Theory", "Relativity"]
    },
    {
      filename: "emft_sadiku.pdf",
      title: "Elements of Electromagnetics",
      author: "Matthew N.O. Sadiku",
      tags: ["Physics", "Electromagnetic Theory", "Maxwell Equations", "Vector Calculus"]
    },
    {
      filename: "OPTICS A GHATAK.pdf",
      title: "Optics",
      author: "Ajoy Ghatak",
      tags: ["Physics", "Optics", "Interference", "Diffraction", "Lasers"]
    }
  ],
  "ME24101": [
    {
      filename: "A Textbook of Engineering Mechanics By R. S. Khurmi.pdf",
      title: "A Textbook of Engineering Mechanics",
      author: "R.S. Khurmi",
      tags: ["Mechanical Engineering", "Statics", "Dynamics", "Trusses"]
    },
    {
      filename: "ME24101 Complete Course Material.pdf",
      title: "ME24101 Complete Course Material",
      author: "Department of Mechanical Engineering",
      tags: ["Mechanical Engineering", "Course Notes", "Manufacturing", "Thermodynamics"]
    }
  ]
};

// ============================================================
// SUBJECTS REGISTRY & DATA INTEGRATION ENDPOINTS
// ============================================================
// Future developers can connect this registry object to backend API fetches
// (e.g. fetch(`${API_BASE}/api/subjects/${code}`).then(res => res.json()))

const SUBJECTS_REGISTRY = {
  "MA24101": {
    name: "Mathematics 1",
    code: "MA24101",
    semester: "1st Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Calculus: Limits, Continuity & Differentiability' },
      { id: 'Module-2', name: 'Module-2', title: 'Infinite Series & Convergence Tests' },
      { id: 'Module-3', name: 'Module-3', title: 'Matrices & Systems of Linear Equations' },
      { id: 'Module-4', name: 'Module-4', title: 'Multivariable Calculus & Partial Derivatives' },
      { id: 'Module-5', name: 'Module-5', title: 'Vector Calculus & Multiple Integrals' }
    ],
    books: [
      { id: 'book1', title: 'Thomas\' Calculus', author: 'George B. Thomas Jr.', size: '22.1 MB' },
      { id: 'book2', title: 'Linear Algebra and Its Applications', author: 'David C. Lay', size: '29.4 MB' }
    ],
    papers: []
  },
  "EC24101": {
    name: "Basics of Electronic Engineering",
    code: "EC24101",
    semester: "1st Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Semiconductor Physics & PN Junction Diodes' },
      { id: 'Module-2', name: 'Module-2', title: 'Bipolar Junction Transistors (BJTs)' },
      { id: 'Module-3', name: 'Module-3', title: 'Field Effect Transistors (MOSFETs)' },
      { id: 'Module-4', name: 'Module-4', title: 'Operational Amplifiers & Applications' },
      { id: 'Module-5', name: 'Module-5', title: 'Digital Electronics & Logic Gates' }
    ],
    books: [
      { id: 'book1', title: 'Electronic Devices & Circuit Theory', author: 'Boylestad & Nashelsky', size: '18.4 MB' },
      { id: 'book2', title: 'Microelectronic Circuits', author: 'Sedra & Smith', size: '34.2 MB' }
    ],
    papers: []
  },
  "CH24101": {
    name: "Chemistry",
    code: "CH24101",
    semester: "1st Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Atomic & Molecular Structure' },
      { id: 'Module-2', name: 'Module-2', title: 'Spectroscopic Techniques & Molecular Spectroscopy' },
      { id: 'Module-3', name: 'Module-3', title: 'Thermodynamics & Chemical Equilibrium' },
      { id: 'Module-4', name: 'Module-4', title: 'Electrochemistry & Corrosion' },
      { id: 'Module-5', name: 'Module-5', title: 'Polymers & Engineering Materials' }
    ],
    books: [
      { id: 'book1', title: 'Engineering Chemistry', author: 'Shashi Chawla', size: '15.6 MB' },
      { id: 'book2', title: 'A Textbook of Engineering Chemistry', author: 'Jain & Jain', size: '22.1 MB' }
    ],
    papers: []
  },
  "CE24101": {
    name: "Environmental Sciences",
    code: "CE24101",
    semester: "1st Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Ecology, Ecosystems & Energy Flow' },
      { id: 'Module-2', name: 'Module-2', title: 'Air Pollution & Atmospheric Chemistry' },
      { id: 'Module-3', name: 'Module-3', title: 'Water & Wastewater Treatment' },
      { id: 'Module-4', name: 'Module-4', title: 'Soil Pollution & Solid Waste Management' },
      { id: 'Module-5', name: 'Module-5', title: 'Noise Pollution & Environmental Impact Assessment' }
    ],
    books: [
      { id: 'book1', title: 'Basic Concepts of Environmental Chemistry', author: 'D.W. Connell', size: '14.0 MB' }
    ],
    papers: []
  },
  "ME24101": {
    name: "Basics of Mechanical Engineering",
    code: "ME24101",
    semester: "1st Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Statics: Force Systems, Equilibrium & Trusses' },
      { id: 'Module-2', name: 'Module-2', title: 'Kinematics & Kinetics of Rigid Bodies' },
      { id: 'Module-3', name: 'Module-3', title: 'Friction, Vibrations & Simple Harmonic Motion' },
      { id: 'Module-4', name: 'Module-4', title: 'Thermodynamics: IC Engines, Boilers & Heat Transfer' },
      { id: 'Module-5', name: 'Module-5', title: 'Manufacturing Processes & Engineering Materials' }
    ],
    books: [
      { id: 'book1', title: 'A Textbook of Engineering Mechanics', author: 'R.S. Khurmi', size: '20.0 MB' },
      { id: 'book2', title: 'ME24101 Complete Course Material', author: 'Department of ME', size: '5.1 MB' }
    ],
    papers: []
  },
  "LAB-SEM1": {
    name: "1st Semester Labs",
    code: "LAB-SEM1",
    semester: "1st Semester",
    modules: [
      { id: 'Module-1', name: 'Exp-1 & 2', title: 'Chemistry Lab: Titrations & Water Hardness' },
      { id: 'Module-2', name: 'Exp-3 & 4', title: 'Electronics Lab: V-I Characteristics & Rectifiers' },
      { id: 'Module-3', name: 'Exp-5 & 6', title: 'Workshop Practice: Fitting & Carpentry' },
      { id: 'Module-4', name: 'Exp-7 & 8', title: 'Drawing & Graphics: Orthographic Projection' }
    ],
    books: [
      { id: 'book1', title: 'Engineering Chemistry Lab Manual', author: 'Dept. of Chemistry', size: '4.8 MB' },
      { id: 'book2', title: 'Electronics & Workshop Practical Guide', author: 'Workshop Instructors', size: '6.5 MB' }
    ],
    papers: [
      { id: 'paper1', year: '2024', term: 'End Term', solved: true, filename: 'Viva_Questions_Sem1_Labs.pdf' },
      { id: 'paper2', year: '2023', term: 'End Term', solved: true, filename: 'Lab_Exam_Calculations_2023.pdf' }
    ]
  },
  "CS24101": {
    name: "Programming for Problem Solving",
    code: "CS24101",
    semester: "2nd Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Algorithms & Flowcharts' },
      { id: 'Module-2', name: 'Module-2', title: 'C Program Structure, Variables & I/O' },
      { id: 'Module-3', name: 'Module-3', title: 'Iterative Structures, Loops & Arrays' },
      { id: 'Module-4', name: 'Module-4', title: 'Functions, Parameters & Recursion' },
      { id: 'Module-5', name: 'Module-5', title: 'Structures, Pointers & Macros' }
    ],
    books: [
      { id: 'book1', title: 'Programming in ANSI C', author: 'E. Balagurusamy', size: '11.8 MB' },
      { id: 'book2', title: 'Let Us C', author: 'Yashavant Kanetkar', size: '9.2 MB' }
    ],
    papers: [
      { id: 'paper1', year: '2024', term: 'Mid Term', solved: true, filename: 'Programming_Mid_2024_Solved.pdf' },
      { id: 'paper2', year: '2023', term: 'End Term', solved: true, filename: 'Programming_End_2023_Solved.pdf' },
      { id: 'paper3', year: '2023', term: 'Mid Term', solved: false, filename: 'Programming_Mid_2023_Unsolved.pdf' }
    ]
  },
  "MA24103": {
    name: "Mathematics 2",
    code: "MA24103",
    semester: "2nd Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Ordinary Differential Equations of 2nd & higher order' },
      { id: 'Module-2', name: 'Module-2', title: 'Series Solutions & Special Functions (Bessel, Legendre)' },
      { id: 'Module-3', name: 'Module-3', title: 'Fourier Series & Separation of Variables for PDEs' },
      { id: 'Module-4', name: 'Module-4', title: 'Analytic functions, Complex Differentiation & Integration' },
      { id: 'Module-5', name: 'Module-5', title: 'Applied Probability, Expectation, Random Variables & distributions' }
    ],
    books: [
      { id: 'book1', title: 'Higher Engineering Mathematics Vol II', author: 'B.S. Grewal', size: '15.4 MB' },
      { id: 'book2', title: 'Advanced Engineering Mathematics', author: 'H.K. Dass', size: '20.6 MB' }
    ],
    papers: [
      { id: 'paper1', year: '2024', term: 'Mid Term', solved: true, filename: 'Math2_Mid_2024_Solved.pdf' },
      { id: 'paper2', year: '2023', term: 'End Term', solved: true, filename: 'Math2_End_2023_Solved.pdf' }
    ]
  },
  "PH24101": {
    name: "Physics",
    code: "PH24101",
    semester: "2nd Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Physical Optics & Wave Optics (Interference, Diffraction, Polarization)' },
      { id: 'Module-2', name: 'Module-2', title: 'Gradient, Divergence, Curl & Electromagnetic Theory' },
      { id: 'Module-3', name: 'Module-3', title: 'Special Theory of Relativity & Lorentz Transformations' },
      { id: 'Module-4', name: 'Module-4', title: 'Planck Black-body radiation, Wave-particle Duality & Quantum Mechanics' },
      { id: 'Module-5', name: 'Module-5', title: 'Lasers, Spontaneous & Stimulated emission, Nuclear & Plasma Physics' }
    ],
    books: [
      { id: 'book1', title: 'Fundamentals of Physics', author: 'Halliday, Resnick & Walker', size: '31.5 MB' },
      { id: 'book2', title: 'A Textbook of Engineering Physics', author: 'M.N. Avadhanulu', size: '17.8 MB' }
    ],
    papers: [
      { id: 'paper1', year: '2024', term: 'Mid Term', solved: true, filename: 'Physics_Mid_2024_Solved.pdf' },
      { id: 'paper2', year: '2023', term: 'End Term', solved: false, filename: 'Physics_End_2023_Unsolved.pdf' }
    ]
  },
  "EE24101": {
    name: "Basics of Electrical Engineering",
    code: "EE24101",
    semester: "2nd Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Introduction to Electrical Elements & classification' },
      { id: 'Module-2', name: 'Module-2', title: 'Steady State D.C. Circuit Analysis' },
      { id: 'Module-3', name: 'Module-3', title: 'Sinusoidal Steady State Single-phase AC Circuits' },
      { id: 'Module-4', name: 'Module-4', title: 'Three-Phase AC Balanced & Unbalanced Systems' },
      { id: 'Module-5', name: 'Module-5', title: 'Magnetic Circuits & Eddy/Hysteresis losses' }
    ],
    books: [
      { id: 'book1', title: 'Basic Electrical Engineering', author: 'C.L. Wadhwa', size: '14.5 MB' },
      { id: 'book2', title: 'Electrical Technology', author: 'B.L. Theraja', size: '24.1 MB' }
    ],
    papers: [
      { id: 'paper1', year: '2024', term: 'Mid Term', solved: true, filename: 'Electrical_Mid_2024_Solved.pdf' },
      { id: 'paper2', year: '2023', term: 'End Term', solved: true, filename: 'Electrical_End_2023_Solved.pdf' }
    ]
  },
  "BE24101": {
    name: "Biological Science for Engineers",
    code: "BE24101",
    semester: "2nd Semester",
    modules: [
      { id: 'Module-1', name: 'Module-1', title: 'Introduction to Biological Sciences' },
      { id: 'Module-2', name: 'Module-2', title: 'Molecular Biology and Genetics' },
      { id: 'Module-3', name: 'Module-3', title: 'Biochemistry' },
      { id: 'Module-4', name: 'Module-4', title: 'Applications of Biological Sciences in Engineering' },
      { id: 'Module-5', name: 'Module-5', title: 'Global Challenges and Ethical Considerations' }
    ],
    books: [
      { id: 'book1', title: 'Biology for Engineers', author: 'Arthur T. Johnson', size: '21.0 MB' }
    ],
    papers: []
  },
  "LAB-SEM2": {
    name: "2nd Semester Labs",
    code: "LAB-SEM2",
    semester: "2nd Semester",
    modules: [
      { id: 'Module-1', name: 'Exp-1 & 2', title: 'Physics Lab: Newton Rings & Laser Diffractions' },
      { id: 'Module-2', name: 'Exp-3 & 4', title: 'Electrical Lab: KVL/KCL & Transformer Ratios' },
      { id: 'Module-3', name: 'Exp-5 & 6', title: 'Programming Lab: Matrix Operations & File I/O' },
      { id: 'Module-4', name: 'Exp-7 & 8', title: 'Viva Voice: Practical Concepts & Viva Cards' }
    ],
    books: [
      { id: 'book1', title: 'Engineering Physics Practical Guide', author: 'Dept. of Physics', size: '5.2 MB' },
      { id: 'book2', title: 'Electrical Lab Manual & C Programs', author: 'Lab Instructors', size: '7.8 MB' }
    ],
    papers: [
      { id: 'paper1', year: '2024', term: 'End Term', solved: true, filename: 'Viva_Questions_Sem2_Labs.pdf' },
      { id: 'paper2', year: '2023', term: 'End Term', solved: true, filename: 'Lab_Calculations_Sem2_Solved.pdf' }
    ]
  }
};

// Unique SVG Icon Renderer matching subject themes
const renderSubjectIcon = (code) => {
  switch (code) {
    case 'MA24101':
    case 'MA24103':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <path d="M4 12h2l3 7 5-14h6" strokeLinecap="round" strokeLinejoin="round" />
          <text x="14" y="16" fontSize="8" fontWeight="bold" fontFamily="sans-serif" fill="currentColor">x</text>
        </svg>
      );
    case 'PH24101':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <circle cx="12" cy="12" r="3" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(30 12 12)" />
          <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(150 12 12)" />
        </svg>
      );
    case 'CH24101':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <path d="M6 3h12M9 3v4L4.3 17.6A2 2 0 0 0 6 20h12a2 2 0 0 0 1.7-2.4L15 7V3" />
          <line x1="6" y1="14" x2="18" y2="14" />
        </svg>
      );
    case 'EC24101':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <rect x="2" y="2" width="20" height="20" rx="4" />
          <path d="M7 12h10M12 7v10" />
          <circle cx="7" cy="12" r="1.5" fill="currentColor" />
          <circle cx="17" cy="12" r="1.5" fill="currentColor" />
        </svg>
      );
    case 'CS24101':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
          <line x1="14" y1="4" x2="10" y2="20" />
        </svg>
      );
    case 'CE24101':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2Z" />
          <path d="M12 6c-2 2-3 4-3 6s1 4 3 6c2-2 3-4 3-6s-1-4-3-6Z" />
          <path d="M2 12h20" />
        </svg>
      );
    case 'ME24101':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      );
    case 'EE24101':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      );
    case 'LAB-SEM1':
    case 'LAB-SEM2':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          <path d="M9 14h6M9 10h6M9 18h4" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="math-logo-svg">
          <path d="M12 2L2 22h20L12 2z" />
        </svg>
      );
  }
};

function JaipurDashboard({ subjectCode, theme, onToggleTheme, onBack }) {
  // Retrieve specific subject dataset or fallback safely to Mathematics-1
  const subjectData = SUBJECTS_REGISTRY[subjectCode] || SUBJECTS_REGISTRY["MA24101"];

  // Detect real mobile screen
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mobile drawer trigger states
  const [mobileBooksOpen, setMobileBooksOpen] = useState(false);
  const [mobilePyqsOpen, setMobilePyqsOpen] = useState(false);
  const [mobilePracticeOpen, setMobilePracticeOpen] = useState(false);

  // Page / Content States
  const [activeModule, setActiveModule] = useState(subjectData.modules[0].id);
  const [selectedDifficulties, setSelectedDifficulties] = useState(['easy', 'medium', 'hard']);
  const [selectedMarks, setSelectedMarks] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  
  // Practice Meta Data from DB
  const [practiceMeta, setPracticeMeta] = useState(null);

  // Practice Mode Dropdowns
  const [modulesDropdownOpen, setModulesDropdownOpen] = useState(false);
  const [selectedPracticeModules, setSelectedPracticeModules] = useState(['mod1']);

  // Filters for Previous Year Papers
  const [yearFilter, setYearFilter] = useState('All');
  const [termFilter, setTermFilter] = useState('All'); // 'All', 'Mid Term', 'End Term'
  const [solvedFilter, setSolvedFilter] = useState('All'); // 'All', 'Solved', 'Unsolved'
  
  // Dropdown UI states for filter selectors
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [termDropdownOpen, setTermDropdownOpen] = useState(false);
  const [solvedDropdownOpen, setSolvedDropdownOpen] = useState(false);

  // Active campus selection dropdown state
  const [campusDropdownOpen, setCampusDropdownOpen] = useState(false);

  // Practice View State
  const [isPracticing, setIsPracticing] = useState(false);

  // Dynamic Subject Files from Backend
  const [subjectFiles, setSubjectFiles] = useState(null);

  // Multiple Notes Selector Modal State
  const [activeNotesModal, setActiveNotesModal] = useState(null);

  // Interaction feedback states (Toasts/Alerts)
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const toastTimerRef = useRef(null);

  const showToast = useCallback((msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToastMessage(msg);
    setToastVisible(true);
    toastTimerRef.current = setTimeout(() => {
      setToastVisible(false);
    }, 2800);
  }, []);

  // Update active module when subjectCode changes
  useEffect(() => {
    setActiveModule(subjectData.modules[0].id);
    setSelectedPracticeModules(['mod1']);
    setIsPracticing(false);
    setPracticeMeta(null);
    
    // Fetch dynamic files from backend
    fetch(`${API_BASE}/api/subjects/${subjectCode}/materials`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setSubjectFiles(data);
      })
      .catch(err => console.error("Failed to fetch materials:", err));

    // Fetch Practice Meta
    fetch(`${API_BASE}/api/practice/meta?subject=${subjectCode}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setPracticeMeta(data);
          if (data.years) setSelectedYears(data.years.map(String));
          if (data.marks) setSelectedMarks(data.marks);
          if (data.difficulties) {
             const diffs = data.difficulties.filter(Boolean).map(d => d.toLowerCase());
             if (diffs.length > 0) setSelectedDifficulties(diffs);
          }
        }
      })
      .catch(err => console.error("Failed to fetch practice meta:", err));
  }, [subjectCode, subjectData]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // Practice Selection functions
  const togglePracticeModule = (modId) => {
    setSelectedPracticeModules(prev => 
      prev.includes(modId) 
        ? prev.filter(id => id !== modId) 
        : [...prev, modId]
    );
  };

  const handleStartPractice = () => {
    if (selectedPracticeModules.length === 0) {
      showToast("Please select at least one module for practice!");
      return;
    }
    if (selectedDifficulties.length === 0) {
      showToast("Please select at least one difficulty level!");
      return;
    }
    if (selectedMarks.length === 0) {
      showToast("Please select at least one marks bracket!");
      return;
    }
    if (selectedYears.length === 0) {
      showToast("Please select at least one exam year!");
      return;
    }

    showToast(`Starting Practice Mode session!`);
    setIsPracticing(true);
  };

  // Parse QPA files into the format expected by the UI
  const dynamicPapers = subjectFiles?.qpa ? subjectFiles.qpa.map((filename, i) => {
    // filename format: SP-25_END.pdf
    let year = "2024";
    let term = "Mid Term";
    
    // Quick regex to extract from SP-25_END or MO-24_MID
    const match = filename.match(/(SP|MO)-(\d{2})_(MID|END)/i);
    if (match) {
      year = "20" + match[2];
      term = match[3].toUpperCase() === "MID" ? "Mid Term" : "End Term";
    } else {
      // Handle MA24103 MAQPA format: (END_SP22), (MID_SP23), etc.
      const altMatch = filename.match(/\((MID|END)_(SP|MO)(\d{2})\)/i);
      if (altMatch) {
        term = altMatch[1].toUpperCase() === "MID" ? "Mid Term" : "End Term";
        year = "20" + altMatch[3];
      }
    }

    return {
      id: `qpa-${i}`,
      year,
      term,
      solved: false, // Default to false for QPA
      filename
    };
  }) : subjectData.papers;

  // Filter Previous Year Papers
  const filteredPapers = dynamicPapers.filter(paper => {
    const matchYear = yearFilter === 'All' || paper.year === yearFilter;
    const matchTerm = termFilter === 'All' || paper.term === termFilter;
    const matchSolved = solvedFilter === 'All' || 
      (solvedFilter === 'Solved' && paper.solved) || 
      (solvedFilter === 'Unsolved' && !paper.solved);
    return matchYear && matchTerm && matchSolved;
  });

  // Compute available years dynamically from papers data
  const availableYears = [...new Set(dynamicPapers.map(p => p.year))].sort((a, b) => b - a);

  const handleDownloadPaper = (filename) => {
    // Use the actual QPA folder name from backend (handles MAQPA for MA24103)
    const qpaFolder = subjectFiles?.qpaFolder || 'QPA';
    window.open(`${API_BASE}/study-material/${subjectCode}/${qpaFolder}/${filename}`, '_blank');
  };

  const handleDownloadBook = (filename) => {
    window.open(`${API_BASE}/study-material/${subjectCode}/${filename}`, '_blank');
  };

  const handleResetFilters = () => {
    setYearFilter('All');
    setTermFilter('All');
    setSolvedFilter('All');
    showToast("Filters Reset! Viewing all papers.");
  };

  // Close dropdowns on outside click helper
  const closeAllDropdowns = () => {
    setModulesDropdownOpen(false);
    setYearDropdownOpen(false);
    setTermDropdownOpen(false);
    setSolvedDropdownOpen(false);
    setCampusDropdownOpen(false);
  };

  if (isPracticing) {
    return (
      <Suspense fallback={<div className="practice-loader-container"><div className="practice-spinner"></div></div>}>
        <PracticeMode 
          subjectCode={subjectCode}
          selectedModules={selectedPracticeModules}
          difficulties={selectedDifficulties}
          marks={selectedMarks}
          years={selectedYears}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onBack={() => setIsPracticing(false)}
        />
      </Suspense>
    );
  }

  if (isMobile) {
    return (
      <div className="mobile-dashboard-root" id="mobile-dashboard-root">
        {/* Toast popup */}
        <div className={`dashboard-toast ${toastVisible ? 'dashboard-toast--visible' : ''}`} id="mobile-dashboard-toast">
          {toastMessage}
        </div>

        {/* 1. Header */}
        <header className="mobile-dash-header">
          <button className="mobile-back-btn" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span>Back</span>
          </button>
          
          <div className="mobile-header-title-box">
            <span className="mobile-code-badge">{subjectData.code}</span>
            <h2 className="mobile-subject-title">{subjectData.name}</h2>
          </div>

          <button 
            className="mobile-theme-toggle"
            onClick={(e) => { e.stopPropagation(); onToggleTheme(); }}
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: 20, height: 20}}>
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{width: 20, height: 20}}>
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
          </button>
        </header>

        {/* 2. Main Content Area */}
        <div className="mobile-dash-scroll-container">
          {/* Notes Section: Primary Option */}
          <section className="mobile-notes-section">
            <div className="mobile-section-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="section-icon">
                <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              <h3>{subjectCode.startsWith('LAB') ? 'Experiments / Practicals' : 'Study Notes'}</h3>
            </div>

            <div className="mobile-modules-list">
              {subjectData.modules.map((mod, index) => {
                const modKey = `MOD${index + 1}`;
                const modFiles = subjectFiles?.notes?.[modKey] || [];
                return (
                  <button
                    key={mod.id}
                    className="mobile-module-row-btn"
                    onClick={() => {
                      if (modFiles.length === 1) {
                        window.open(`${API_BASE}/study-material/${subjectCode}/${modKey}/${modFiles[0]}`, '_blank');
                      } else if (modFiles.length > 1) {
                        setActiveNotesModal({
                          modKey,
                          modTitle: mod.title,
                          files: modFiles
                        });
                      } else {
                        showToast(`No notes uploaded yet for ${mod.name}`);
                      }
                    }}
                  >
                    <div className="mobile-mod-left">
                      <div className="mobile-mod-number-icon">{index + 1}</div>
                      <div className="mobile-mod-texts">
                        <span className="mobile-mod-name">{mod.name}</span>
                        <span className="mobile-mod-title-detail">{mod.title}</span>
                      </div>
                    </div>
                    <div className="mobile-mod-right">
                      {modFiles.length > 0 ? (
                        <span className="mobile-mod-file-badge">{modFiles.length} file{modFiles.length > 1 ? 's' : ''}</span>
                      ) : (
                        <span className="mobile-mod-empty-badge">Empty</span>
                      )}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="chevron-icon">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Syllabus Button below the primary Notes list */}
          <section className="mobile-syllabus-section">
            <button 
              className="mobile-syllabus-main-btn"
              onClick={() => {
                if (subjectFiles?.syllabus) {
                  window.open(`${API_BASE}/study-material/${subjectCode}/${subjectFiles.syllabus}`, '_blank');
                } else {
                  showToast("Syllabus PDF not found on server.");
                }
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-icon">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span>{subjectCode.startsWith('LAB') ? 'VIEW LAB MANUAL / INFO' : 'VIEW SUBJECT SYLLABUS'}</span>
            </button>
          </section>

          {/* Action Zone - Bottom Stack */}
          <section className="mobile-actions-zone">
            {/* View Reference Books and Materials */}
            <button className="mobile-action-card-btn" onClick={() => setMobileBooksOpen(true)}>
              <div className="mobile-action-left">
                <div className="mobile-action-icon-bg maroon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M4 19.5V15a2 2 0 0 1 2-2h14" />
                    <path d="M20 17v-4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z" />
                    <path d="M12 6V2h8v4" />
                  </svg>
                </div>
                <div className="mobile-action-titles">
                  <h4>{subjectCode.startsWith('LAB') ? 'Lab Manuals & Practical Guides' : 'Reference Books & Materials'}</h4>
                  <p>Access textbook PDFs and guides</p>
                </div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="chevron-right">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* View PYQs */}
            <button className="mobile-action-card-btn" onClick={() => setMobilePyqsOpen(true)}>
              <div className="mobile-action-left">
                <div className="mobile-action-icon-bg purple">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="mobile-action-titles">
                  <h4>{subjectCode.startsWith('LAB') ? 'Previous Practical Papers' : 'View Previous Year Papers (PYQs)'}</h4>
                  <p>Solved & unsolved exam papers</p>
                </div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="chevron-right">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

            {/* Start Practice Mode */}
            <button className="mobile-action-card-btn start-practice" onClick={() => setMobilePracticeOpen(true)}>
              <div className="mobile-action-left">
                <div className="mobile-action-icon-bg pink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div className="mobile-action-titles">
                  <h4>{subjectCode.startsWith('LAB') ? 'Start Lab Viva Mode' : 'Start Practice Mode'}</h4>
                  <p>Interactive questions & answers session</p>
                </div>
              </div>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="chevron-right">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </section>
        </div>

        {/* ==========================================
            MOBILE BOTTOM SHEETS / DRAWERS
            ========================================== */}

        {/* 1. Reference Books Bottom Sheet */}
        {mobileBooksOpen && (
          <div className="mobile-bottom-sheet-overlay" onClick={() => setMobileBooksOpen(false)}>
            <div className="mobile-bottom-sheet-panel" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-sheet-drag-handle" />
              <div className="mobile-sheet-header">
                <h3>{subjectCode.startsWith('LAB') ? 'Practical Guides' : 'Reference Books'}</h3>
                <button className="mobile-sheet-close-btn" onClick={() => setMobileBooksOpen(false)}>Close</button>
              </div>
              <div className="mobile-sheet-body scrollable">
                <div className="mobile-books-list">
                  {(subjectFiles?.referenceBooks ? subjectFiles.referenceBooks.map((item, i) => {
                    const filename = typeof item === 'object' && item !== null ? (item.filename || '') : item;
                    const titleVal = typeof item === 'object' && item !== null ? item.title : undefined;
                    const authorVal = typeof item === 'object' && item !== null ? item.author : undefined;
                    const tagsVal = typeof item === 'object' && item !== null ? item.tags : undefined;
                    const subjectRegistry = REFERENCE_BOOKS_REGISTRY[subjectCode];
                    const matchedBook = subjectRegistry?.find(b => b.filename === filename);
                    return {
                      id: `ref-${i}`,
                      title: titleVal || matchedBook?.title || filename.replace('.pdf', '').replace(/_/g, ' '),
                      author: authorVal || matchedBook?.author || 'Unknown Author',
                      tags: tagsVal || matchedBook?.tags || ['Reference Book'],
                      size: 'PDF',
                      filename: filename
                    };
                  }) : subjectData.books).map(book => (
                    <div 
                      key={book.id} 
                      className="mobile-book-item"
                      onClick={() => {
                        handleDownloadBook(book.filename || book.title);
                        setMobileBooksOpen(false);
                      }}
                    >
                      <div className="book-item-left">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pdf-icon">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div className="book-item-info">
                          <span className="book-title">{book.title}</span>
                          <span className="book-author">by {book.author || 'Department'}</span>
                        </div>
                      </div>
                      <span className="download-badge">OPEN</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. PYQs Bottom Sheet */}
        {mobilePyqsOpen && (
          <div className="mobile-bottom-sheet-overlay" onClick={() => setMobilePyqsOpen(false)}>
            <div className="mobile-bottom-sheet-panel" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-sheet-drag-handle" />
              <div className="mobile-sheet-header">
                <h3>{subjectCode.startsWith('LAB') ? 'Practical Papers' : 'Previous Year Papers (PYQs)'}</h3>
                <button className="mobile-sheet-close-btn" onClick={() => setMobilePyqsOpen(false)}>Close</button>
              </div>
              
              {/* Filters for PYQs */}
              <div className="mobile-pyq-filters">
                <div className="mobile-filter-selectors-grid">
                  <div className="filter-group">
                    <label>Year</label>
                    <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                      <option value="All">All Years</option>
                      {availableYears.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Term</label>
                    <select value={termFilter} onChange={(e) => setTermFilter(e.target.value)}>
                      <option value="All">All Terms</option>
                      <option value="Mid Term">Mid Term</option>
                      <option value="End Term">End Term</option>
                    </select>
                  </div>

                  <div className="filter-group">
                    <label>Status</label>
                    <select value={solvedFilter} onChange={(e) => setSolvedFilter(e.target.value)}>
                      <option value="All">All Status</option>
                      <option value="Solved">Solved</option>
                      <option value="Unsolved">Unsolved</option>
                    </select>
                  </div>
                </div>
                <button className="mobile-pyq-reset-btn" onClick={handleResetFilters}>Reset Filters</button>
              </div>

              <div className="mobile-sheet-body scrollable">
                <div className="mobile-pyqs-list">
                  {filteredPapers.length > 0 ? (
                    filteredPapers.map(paper => (
                      <div 
                        key={paper.id} 
                        className="mobile-pyq-item"
                        onClick={() => {
                          handleDownloadPaper(paper.filename);
                          setMobilePyqsOpen(false);
                        }}
                      >
                        <div className="pyq-item-left">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="pdf-icon">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <div className="pyq-item-info">
                            <span className="pyq-title">{subjectData.name}</span>
                            <span className="pyq-sub">{paper.term || 'Lab'} • {paper.year}</span>
                          </div>
                        </div>
                        <span className={`solved-badge ${paper.solved ? 'solved' : 'unsolved'}`}>
                          {paper.solved ? 'Solved' : 'Unsolved'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="mobile-pyqs-empty">
                      <p>No papers match filters.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Practice Config Bottom Sheet */}
        {mobilePracticeOpen && (
          <div className="mobile-bottom-sheet-overlay" onClick={() => setMobilePracticeOpen(false)}>
            <div className="mobile-bottom-sheet-panel" onClick={(e) => e.stopPropagation()}>
              <div className="mobile-sheet-drag-handle" />
              <div className="mobile-sheet-header">
                <h3>{subjectCode.startsWith('LAB') ? 'Viva Mode Config' : 'Practice Mode Config'}</h3>
                <button className="mobile-sheet-close-btn" onClick={() => setMobilePracticeOpen(false)}>Close</button>
              </div>

              <div className="mobile-sheet-body scrollable practice-config-body">
                {/* 1. Modules Selection */}
                <div className="config-section">
                  <label className="section-label">{subjectCode.startsWith('LAB') ? 'Select Experiments' : 'Select Modules'}</label>
                  <div className="mobile-modules-checkbox-grid">
                    {subjectData.modules.map((mod, index) => {
                      const practiceId = `mod${index + 1}`;
                      const isChecked = selectedPracticeModules.includes(practiceId);
                      return (
                        <label key={mod.id} className="mobile-checkbox-label">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={() => togglePracticeModule(practiceId)}
                          />
                          <span className="mobile-checkbox-custom" />
                          <span className="mobile-checkbox-text">{mod.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Difficulties Selection */}
                <div className="config-section">
                  <label className="section-label">Difficulty Level</label>
                  <div className="mobile-pills-row">
                    {(practiceMeta?.difficulties || ['easy', 'medium', 'hard']).map(diff => {
                      const isSelected = selectedDifficulties.includes(diff.toLowerCase());
                      return (
                        <button
                          key={diff}
                          onClick={() => {
                            setSelectedDifficulties(prev => 
                              prev.includes(diff.toLowerCase()) 
                                ? prev.filter(d => d !== diff.toLowerCase()) 
                                : [...prev, diff.toLowerCase()]
                            );
                          }}
                          className={`mobile-pill-btn ${isSelected ? 'active' : ''}`}
                        >
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Marks Selection */}
                <div className="config-section">
                  <label className="section-label">Marks Bracket</label>
                  <div className="mobile-pills-row">
                    {(practiceMeta?.marks || [2, 3, 5]).map(mark => {
                      const isSelected = selectedMarks.includes(mark);
                      return (
                        <button
                          key={mark}
                          onClick={() => {
                            setSelectedMarks(prev => 
                              prev.includes(mark) 
                                ? prev.filter(m => m !== mark) 
                                : [...prev, mark]
                            );
                          }}
                          className={`mobile-pill-btn ${isSelected ? 'active' : ''}`}
                        >
                          {mark} Marks
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Years Selection */}
                <div className="config-section">
                  <label className="section-label">Exam Years</label>
                  <div className="mobile-pills-row">
                    {(practiceMeta?.years?.map(String) || ['2022', '2023', '2024']).map(year => {
                      const isSelected = selectedYears.includes(year);
                      return (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYears(prev => 
                              prev.includes(year) 
                                ? prev.filter(y => y !== year) 
                                : [...prev, year]
                            );
                          }}
                          className={`mobile-pill-btn ${isSelected ? 'active' : ''}`}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Info Text */}
                {practiceMeta && (
                  <div className="mobile-practice-meta-info">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    <span>Total available: <strong>{practiceMeta.total_count}</strong> questions.</span>
                  </div>
                )}

                {/* START PRACTICE MODE BUTTON */}
                <button 
                  className="mobile-start-practice-btn"
                  onClick={() => {
                    handleStartPractice();
                    if (selectedPracticeModules.length > 0 && selectedDifficulties.length > 0 && selectedMarks.length > 0 && selectedYears.length > 0) {
                      setMobilePracticeOpen(false);
                    }
                  }}
                >
                  START PRACTICE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Multiple Notes Modal Modal Picker */}
        {activeNotesModal && (
          <div className="notes-modal-overlay" onClick={() => setActiveNotesModal(null)}>
            <div className="notes-modal-container mobile-notes-picker" onClick={(e) => e.stopPropagation()}>
              <div className="notes-modal-header">
                <div className="notes-modal-title">
                  <h3>{activeNotesModal.modKey}: Select Note</h3>
                  <span className="notes-modal-subtitle">{activeNotesModal.modTitle}</span>
                </div>
                <button className="btn-close-modal" onClick={() => setActiveNotesModal(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="notes-modal-body">
                <div className="notes-grid mobile-notes-grid">
                  {activeNotesModal.files.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="note-card-item mobile-note-card"
                      onClick={() => {
                        window.open(`${API_BASE}/study-material/${subjectCode}/${activeNotesModal.modKey}/${file}`, '_blank');
                        setActiveNotesModal(null);
                      }}
                    >
                      <div className="note-card-top">
                        <div className="note-card-icon">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '20px', height: '20px' }}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <span className="note-card-title">{file.replace('.pdf', '').replace(/_/g, ' ')}</span>
                      </div>
                      <button className="note-card-action-btn">
                        <span>Open Note</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="dashboard-container" onClick={closeAllDropdowns} id="dashboard-container">
      {/* Toast popup */}
      <div className={`dashboard-toast ${toastVisible ? 'dashboard-toast--visible' : ''}`} id="dashboard-toast">
        {toastMessage}
      </div>

      {/* ============================================================
          TOP HEADER
          ============================================================ */}
      <header className="dash-header" id="dash-header">
        <div className="dash-header__left">
          <div className="logo-container" onClick={onBack} title="Go back to subject selector">
            <div className="logo-icon-wrapper">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M4 19.5V15a2 2 0 0 1 2-2h14M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V17" />
                <path d="M6 2v11" />
              </svg>
            </div>
            <span className="logo-text">BitHub</span>
          </div>
        </div>

        <div className="dash-header__right">
          {/* Light/Dark Toggle Switch */}
          <button 
            className="theme-toggle-btn" 
            onClick={(e) => { e.stopPropagation(); onToggleTheme(); }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            aria-label="Toggle theme mode"
            id="theme-toggle-button"
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="toggle-icon">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="toggle-icon">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
              </svg>
            )}
            <span className="theme-toggle-slider">
              <span className="theme-toggle-knob" />
            </span>
          </button>

          {/* Campus Selector Dropdown */}
          <div className="campus-dropdown-container" onClick={(e) => e.stopPropagation()}>
            <button 
              className={`campus-select-btn ${campusDropdownOpen ? 'active' : ''}`}
              onClick={() => { closeAllDropdowns(); setCampusDropdownOpen(!campusDropdownOpen); }}
              id="campus-dropdown-trigger"
            >
              <svg className="campus-btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>Jaipur Campus</span>
              <svg className="arrow-down-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {campusDropdownOpen && (
              <div className="campus-dropdown-menu" id="campus-dropdown-menu">
                <div className="campus-dropdown-item active">Jaipur Campus (Active)</div>
                <div className="campus-dropdown-item" onClick={() => window.location.href = "/dev-root/index.html"}>
                  Mesra Campus
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================
          MAIN BODY LAYOUT
          ============================================================ */}
      <div className="dashboard-layout" id="dashboard-layout">
        
        {/* ============================================================
            SIDEBAR (LEFT COLUMN)
            ============================================================ */}
        <aside className="dash-sidebar" id="dash-sidebar">
          {/* Back button */}
          <button className="back-subjects-btn" onClick={onBack} id="back-subjects-button">
            <svg className="btn-arrow-left" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            <span>Back to Subjects</span>
          </button>

          {/* Notes Title Header */}
          <div className="sidebar-section-header">
            <svg className="sidebar-section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
            <span>{subjectCode.startsWith('LAB') ? 'EXPERIMENTS' : 'NOTES'}</span>
          </div>

          {/* Modules List */}
          <nav className="modules-nav" id="modules-nav">
            {subjectData.modules.map((mod, index) => {
              const isSelected = activeModule === mod.id;
              const modKey = `MOD${index + 1}`;
              const modFiles = subjectFiles?.notes?.[modKey] || [];
              
              return (
                <button
                  key={mod.id}
                  className={`module-nav-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    setActiveModule(mod.id);
                    if (modFiles.length === 1) {
                      window.open(`${API_BASE}/study-material/${subjectCode}/${modKey}/${modFiles[0]}`, '_blank');
                    } else if (modFiles.length > 1) {
                      setActiveNotesModal({
                        modKey,
                        modTitle: mod.title,
                        files: modFiles
                      });
                    } else {
                      showToast(`No notes uploaded yet for ${mod.name}`);
                    }
                  }}
                  id={`module-btn-${mod.id.toLowerCase()}`}
                >
                  <div className="module-item-left">
                    <svg className="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span>{mod.name}</span>
                  </div>
                  <svg className="chevron-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </nav>

          {/* Divider line before Syllabus */}
          <hr className="sidebar-divider" />

          {/* Syllabus Button */}
          <button 
            className="syllabus-btn" 
            onClick={() => {
              if (subjectFiles?.syllabus) {
                window.open(`${API_BASE}/study-material/${subjectCode}/${subjectFiles.syllabus}`, '_blank');
              } else {
                showToast("Syllabus PDF not found on server.");
              }
            }}
            id="syllabus-view-button"
          >
            {subjectCode.startsWith('LAB') ? 'LAB INFO' : 'SYLLABUS'}
          </button>
        </aside>

        {/* ============================================================
            MAIN CONTENT AREA (RIGHT COLUMN)
            ============================================================ */}
        <main className="dash-main-content" id="dash-main-content">
          
          {/* 1. Subject Header Box */}
          <section className="subject-header-box" id="subject-header-box">
            <div className="subject-meta-left">
              {/* Mathematics root-x square icon or dynamic subject icon */}
              <div className="math-logo-box">
                {renderSubjectIcon(subjectData.code)}
              </div>
              <div className="subject-titles">
                <h2 className="subject-title-name">{subjectData.name}</h2>
                <div className="subject-title-sub">
                  <span className="code-badge">{subjectData.code}</span>
                  <span className="bullet-separator">•</span>
                  <span className="sem-info">{subjectData.semester}</span>
                </div>
              </div>
            </div>

            {/* Stylized vector mountains illustration on the right */}
            <div className="subject-header-hills" aria-hidden="true">
              <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="hills-svg">
                <path 
                  d="M10 100 C 40 70, 60 50, 90 75 C 110 90, 130 65, 170 100 Z" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  opacity="0.3" 
                />
                <path 
                  d="M40 100 C 70 60, 90 40, 120 70 C 145 90, 160 55, 195 100 Z" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  opacity="0.5" 
                />
                <path 
                  d="M70 100 C 100 50, 125 30, 155 65 C 175 80, 185 70, 200 90" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  opacity="0.8" 
                />
                <circle cx="125" cy="20" r="1.5" fill="currentColor" opacity="0.6" />
                <circle cx="140" cy="28" r="1" fill="currentColor" opacity="0.4" />
                <circle cx="85" cy="40" r="1.2" fill="currentColor" opacity="0.5" />
              </svg>
            </div>
          </section>

          {/* 2. Grid for Lower Panels */}
          <div className="dashboard-panels-grid">
            
            {/* 2A. Practice Mode Card (Left Panel) */}
            <section className="dashboard-card practice-card" id="practice-card">
              <div className="card-header">
                <div className="card-header-icon-wrapper circle-pink">
                  <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <div className="card-header-titles">
                  <h3 className="card-title-main">{subjectCode.startsWith('LAB') ? 'Viva Mode' : 'Practice Mode'}</h3>
                  <p className="card-title-sub">Customize your session.</p>
                </div>
              </div>

              <div className="practice-card-content">
                {/* Select Modules Custom Dropdown */}
                <div className="practice-field-container" onClick={(e) => e.stopPropagation()}>
                  <button 
                    className={`custom-select-trigger ${modulesDropdownOpen ? 'open' : ''}`}
                    onClick={() => { closeAllDropdowns(); setModulesDropdownOpen(!modulesDropdownOpen); }}
                    id="select-modules-dropdown-btn"
                  >
                    <span>{subjectCode.startsWith('LAB') ? 'Select Experiments' : 'Select Modules'}</span>
                    <svg className="trigger-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                  
                  {modulesDropdownOpen && (
                    <div className="custom-dropdown-popover" id="select-modules-popover">
                      <p className="popover-title">Choose to Include:</p>
                      {subjectData.modules.map((mod, index) => {
                        const practiceId = `mod${index + 1}`;
                        const isChecked = selectedPracticeModules.includes(practiceId);
                        return (
                          <label key={mod.id} className="checkbox-label">
                            <input 
                              type="checkbox" 
                              checked={isChecked}
                              onChange={() => togglePracticeModule(practiceId)}
                            />
                            <span className="checkbox-custom" />
                            <span className="checkbox-text">{mod.name}: {mod.title.split(':')[1] || mod.title}</span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 1. Difficulty Multi-Select */}
                <div className="practice-filter-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.2rem' }}>
                  <span className="practice-filter-title" style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--dash-text-color)', fontFamily: 'var(--font-body)' }}>
                    Difficulty:
                  </span>
                  <div className="practice-filter-pills" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {(practiceMeta?.difficulties || ['easy', 'medium', 'hard']).map(diff => {
                      // Capitalize first letter for display
                      const displayDiff = diff.charAt(0).toUpperCase() + diff.slice(1);
                      const isSelected = selectedDifficulties.includes(diff.toLowerCase());
                      return (
                        <button
                          key={diff}
                          onClick={() => {
                            setSelectedDifficulties(prev => 
                              prev.includes(diff.toLowerCase()) 
                                ? prev.filter(d => d !== diff.toLowerCase()) 
                                : [...prev, diff.toLowerCase()]
                            );
                          }}
                          className={`practice-filter-pill ${isSelected ? 'active' : ''}`}
                          style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid var(--dash-active-module-bg)' : '1px solid rgba(0,0,0,0.1)',
                            background: isSelected ? 'var(--dash-active-module-bg)' : 'rgba(255,255,255,0.4)',
                            color: isSelected ? '#fff' : 'var(--dash-text-color)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            fontFamily: 'var(--font-body)'
                          }}
                        >
                          {displayDiff}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Marks Multi-Select */}
                <div className="practice-filter-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.2rem' }}>
                  <span className="practice-filter-title" style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--dash-text-color)', fontFamily: 'var(--font-body)' }}>
                    Marks Bracket:
                  </span>
                  <div className="practice-filter-pills" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {(practiceMeta?.marks || [2, 3, 5]).map(mark => {
                      const isSelected = selectedMarks.includes(mark);
                      return (
                        <button
                          key={mark}
                          onClick={() => {
                            setSelectedMarks(prev => 
                              prev.includes(mark) 
                                ? prev.filter(m => m !== mark) 
                                : [...prev, mark]
                            );
                          }}
                          className={`practice-filter-pill ${isSelected ? 'active' : ''}`}
                          style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid var(--dash-active-module-bg)' : '1px solid rgba(0,0,0,0.1)',
                            background: isSelected ? 'var(--dash-active-module-bg)' : 'rgba(255,255,255,0.4)',
                            color: isSelected ? '#fff' : 'var(--dash-text-color)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            fontFamily: 'var(--font-body)'
                          }}
                        >
                          {mark} Marks
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Year Multi-Select */}
                <div className="practice-filter-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                  <span className="practice-filter-title" style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--dash-text-color)', fontFamily: 'var(--font-body)' }}>
                    Exam Years:
                  </span>
                  <div className="practice-filter-pills" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                    {(practiceMeta?.years?.map(String) || ['2022', '2023', '2024']).map(year => {
                      const isSelected = selectedYears.includes(year);
                      return (
                        <button
                          key={year}
                          onClick={() => {
                            setSelectedYears(prev => 
                              prev.includes(year) 
                                ? prev.filter(y => y !== year) 
                                : [...prev, year]
                            );
                          }}
                          className={`practice-filter-pill ${isSelected ? 'active' : ''}`}
                          style={{
                            padding: '0.6rem 1.2rem',
                            borderRadius: '20px',
                            border: isSelected ? '1.5px solid var(--dash-active-module-bg)' : '1px solid rgba(0,0,0,0.1)',
                            background: isSelected ? 'var(--dash-active-module-bg)' : 'rgba(255,255,255,0.4)',
                            color: isSelected ? '#fff' : 'var(--dash-text-color)',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.25s ease',
                            fontFamily: 'var(--font-body)'
                          }}
                        >
                          {year}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Question Count Preview */}
                {practiceMeta && (
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--dash-text-muted)', fontSize: '0.85rem' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span>
                        Total available in bank: <strong>{practiceMeta.total_count}</strong> questions.
                      </span>
                   </div>
                )}

                {/* START Quiz / Practice Button */}
                <button 
                  className="start-practice-btn" 
                  onClick={handleStartPractice}
                  id="start-practice-button"
                >
                  START
                </button>
              </div>
            </section>

            {/* 2B. Reference Books & Materials + Papers Panel Stack (Right Panel) */}
            <div className="dashboard-right-stack">
              
              {/* Reference Books Card */}
              <section className="dashboard-card light-cream-card reference-card" id="reference-card">
                <div className="card-header">
                  <div className="card-header-icon-wrapper round-maroon">
                    <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M4 19.5V15a2 2 0 0 1 2-2h14" />
                      <path d="M20 17v-4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2Z" />
                      <path d="M12 6V2h8v4" />
                    </svg>
                  </div>
                  <div className="card-header-titles">
                    <h3 className="card-title-main">{subjectCode.startsWith('LAB') ? 'Lab Manuals & Practical Guides' : 'Reference Books and Materials'}</h3>
                  </div>
                </div>

                <div className="materials-list-container">
                  {(subjectFiles?.referenceBooks ? subjectFiles.referenceBooks.map((item, i) => {
                    // Handle both fully populated objects or simple filename strings
                    const filename = typeof item === 'object' && item !== null ? (item.filename || '') : item;
                    const titleVal = typeof item === 'object' && item !== null ? item.title : undefined;
                    const authorVal = typeof item === 'object' && item !== null ? item.author : undefined;
                    const tagsVal = typeof item === 'object' && item !== null ? item.tags : undefined;

                    // Try to match metadata in local registry
                    const subjectRegistry = REFERENCE_BOOKS_REGISTRY[subjectCode];
                    const matchedBook = subjectRegistry?.find(b => b.filename === filename);
                    
                    return {
                      id: `ref-${i}`,
                      title: titleVal || matchedBook?.title || filename.replace('.pdf', '').replace(/_/g, ' '),
                      author: authorVal || matchedBook?.author || 'Unknown Author',
                      tags: tagsVal || matchedBook?.tags || ['Reference Book'],
                      size: 'PDF',
                      filename: filename
                    };
                  }) : subjectData.books).map(book => (
                    <div 
                      key={book.id} 
                      className="material-file-item" 
                      onClick={() => handleDownloadBook(book.filename || book.title)}
                      title="Click to access study file"
                    >
                      <div className="file-item-left">
                        <svg className="pdf-doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <div className="file-info-text">
                          <span className="file-title">{book.title}</span>
                          <span className="file-author">by {book.author || 'Department'}</span>
                          {book.tags && (
                            <div className="book-tags-row" style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                              {book.tags.map((t, idx) => (
                                <span key={idx} style={{ fontSize: '0.65rem', background: 'rgba(198, 85, 117, 0.08)', color: 'var(--dash-active-module-bg)', padding: '2px 6px', borderRadius: '4px', fontWeight: '600', textTransform: 'uppercase' }}>
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="file-size-badge">{book.size}</span>
                    </div>
                  ))}
                </div>

                <div className="card-footer-info">
                  <svg className="footer-pdf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  <span>{subjectFiles?.referenceBooks ? subjectFiles.referenceBooks.length : subjectData.books.length} Files</span>
                </div>
              </section>

              {/* Previous Year Papers Card */}
              <section className="dashboard-card light-cream-card papers-card" id="papers-card">
                <div className="card-header">
                  <div className="card-header-icon-wrapper round-maroon">
                    <svg className="card-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div className="card-header-titles">
                    <h3 className="card-title-main">{subjectCode.startsWith('LAB') ? 'Previous Practical Papers' : 'Previous Year Papers'}</h3>
                  </div>
                </div>

                {/* Filters Section */}
                <div className="papers-filters-wrapper">
                  <span className="filters-label">Filters</span>
                  <div className="filters-row" onClick={(e) => e.stopPropagation()}>
                    
                    {/* 1. Year Filter Trigger */}
                    <div className="filter-dropdown-container">
                      <button 
                        className={`filter-badge-btn ${yearFilter !== 'All' ? 'filtered' : ''}`}
                        onClick={() => { closeAllDropdowns(); setYearDropdownOpen(!yearDropdownOpen); }}
                        id="filter-year-button"
                      >
                        <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Year {yearFilter !== 'All' ? `: ${yearFilter}` : ''}</span>
                      </button>

                      {yearDropdownOpen && (
                        <div className="filter-popover-menu">
                          {['All', ...availableYears].map(y => (
                            <div 
                              key={y} 
                              className={`filter-popover-item ${yearFilter === y ? 'active' : ''}`}
                              onClick={() => { setYearFilter(y); setYearDropdownOpen(false); }}
                            >
                              {y}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 2. Mid/End Term Filter Trigger */}
                    <div className="filter-dropdown-container">
                      <button 
                        className={`filter-badge-btn ${termFilter !== 'All' ? 'filtered' : ''}`}
                        onClick={() => { closeAllDropdowns(); setTermDropdownOpen(!termDropdownOpen); }}
                        id="filter-term-button"
                      >
                        <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                        <span>{termFilter === 'All' ? 'Mid/End Term' : termFilter}</span>
                      </button>

                      {termDropdownOpen && (
                        <div className="filter-popover-menu">
                          {['All', 'Mid Term', 'End Term'].map(t => (
                            <div 
                              key={t} 
                              className={`filter-popover-item ${termFilter === t ? 'active' : ''}`}
                              onClick={() => { setTermFilter(t); setTermDropdownOpen(false); }}
                            >
                              {t}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* 3. Solved Filter Trigger */}
                    <div className="filter-dropdown-container">
                      <button 
                        className={`filter-badge-btn ${solvedFilter !== 'All' ? 'filtered' : ''}`}
                        onClick={() => { closeAllDropdowns(); setSolvedDropdownOpen(!solvedDropdownOpen); }}
                        id="filter-solved-button"
                      >
                        <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span>{solvedFilter === 'All' ? 'Solved' : solvedFilter}</span>
                      </button>

                      {solvedDropdownOpen && (
                        <div className="filter-popover-menu">
                          {['All', 'Solved', 'Unsolved'].map(s => (
                            <div 
                              key={s} 
                              className={`filter-popover-item ${solvedFilter === s ? 'active' : ''}`}
                              onClick={() => { setSolvedFilter(s); setSolvedDropdownOpen(false); }}
                            >
                              {s}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* View All Button */}
                    <button 
                      className="view-all-badge-btn" 
                      onClick={handleResetFilters}
                      id="view-all-reset-button"
                    >
                      View All
                    </button>
                  </div>
                </div>

                {/* Filtered Papers List */}
                <div className="papers-list-container" id="papers-list-container">
                  {filteredPapers.length > 0 ? (
                    filteredPapers.map(paper => (
                      <div 
                        key={paper.id} 
                        className="paper-item-row"
                        onClick={() => handleDownloadPaper(paper.filename)}
                        title="Click to download paper PDF"
                      >
                        <div className="paper-info-left">
                          <svg className="pdf-small-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="paper-title-text">
                            {subjectData.name} ({paper.term || 'Lab'} {paper.year})
                          </span>
                        </div>
                        <div className="paper-badges-right">
                          <span className={`paper-badge-type ${paper.solved ? 'solved' : 'unsolved'}`}>
                            {paper.solved ? 'Solved' : 'Unsolved'}
                          </span>
                          <span className="paper-download-arrow">↓</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-papers-found">
                      <p>No papers match the selected filters.</p>
                      <button className="reset-filter-link" onClick={handleResetFilters}>
                        Clear Filters
                      </button>
                    </div>
                  )}
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>

      {/* Multiple Notes Selection Modal popup */}
      {activeNotesModal && (
        <div className="notes-modal-overlay" onClick={() => setActiveNotesModal(null)}>
          <div className="notes-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="notes-modal-header">
              <div className="notes-modal-title">
                <h3>{activeNotesModal.modKey}: Notes Selector</h3>
                <span className="notes-modal-subtitle">{activeNotesModal.modTitle}</span>
              </div>
              <button className="btn-close-modal" onClick={() => setActiveNotesModal(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="notes-modal-body">
              <div className="notes-grid">
                {activeNotesModal.files.map((file, idx) => (
                  <div 
                    key={idx} 
                    className="note-card-item"
                    onClick={() => window.open(`${API_BASE}/study-material/${subjectCode}/${activeNotesModal.modKey}/${file}`, '_blank')}
                  >
                    <div className="note-card-top">
                      <div className="note-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '22px', height: '22px' }}>
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <span className="note-card-title">{file.replace('.pdf', '').replace(/_/g, ' ')}</span>
                    </div>
                    <button className="note-card-action-btn">
                      <span>Open Note</span>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '14px', height: '14px' }}>
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <CreatorsSection />
    </div>
  );
}

export default JaipurDashboard;
