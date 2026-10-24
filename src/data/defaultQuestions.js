export const PRIZE_LADDER = [
  { level: 1, prize: "₹1,000", safe: false },
  { level: 2, prize: "₹2,000", safe: false },
  { level: 3, prize: "₹3,000", safe: false },
  { level: 4, prize: "₹5,000", safe: false },
  { level: 5, prize: "₹10,000", safe: true },  // Milestone 1 (Safe Haven)
  { level: 6, prize: "₹20,000", safe: false },
  { level: 7, prize: "₹40,000", safe: false },
  { level: 8, prize: "₹80,000", safe: false },
  { level: 9, prize: "₹1,60,000", safe: false },
  { level: 10, prize: "₹3,20,000", safe: true }, // Milestone 2 (Safe Haven)
  { level: 11, prize: "₹6,40,000", safe: false },
  { level: 12, prize: "₹12,50,000", safe: false },
  { level: 13, prize: "₹25,00,000", safe: false },
  { level: 14, prize: "₹50,00,000", safe: false },
  { level: 15, prize: "₹1 Crore", safe: true }   // Jackpot!
];

export const DEFAULT_QUESTIONS = [
  {
    id: "q-1",
    level: 1,
    prize: "₹1,000",
    question: "Which keyboard shortcut is universally used to 'Undo' the last action?",
    options: ["Ctrl + C", "Ctrl + Z", "Ctrl + V", "Ctrl + Y"],
    correctAnswer: 1,
    timeLimit: 30,
    category: "Computers",
    explanation: "Ctrl + Z (or Cmd + Z on macOS) reverts the most recent action.",
    flipQuestion: {
      question: "Which of the following is considered the 'Brain' of a computer?",
      options: ["RAM", "Hard Disk", "CPU", "Motherboard"],
      correctAnswer: 2,
      explanation: "The Central Processing Unit (CPU) performs primary calculations and logic."
    }
  },
  {
    id: "q-2",
    level: 2,
    prize: "₹2,000",
    question: "In college life, what does the abbreviation 'CGPA' stand for?",
    options: [
      "Cumulative Grade Point Average",
      "Central Grade Performance Assessment",
      "Calculated Grade Point Accumulation",
      "Core Graduation Performance Average"
    ],
    correctAnswer: 0,
    timeLimit: 30,
    category: "Campus Life",
    explanation: "CGPA represents Cumulative Grade Point Average across all academic semesters.",
    flipQuestion: {
      question: "Which popular programming language was originally named 'Oak'?",
      options: ["Python", "Java", "C++", "PHP"],
      correctAnswer: 1,
      explanation: "James Gosling developed Oak, which was later renamed Java in 1995."
    }
  },
  {
    id: "q-3",
    level: 3,
    prize: "₹3,000",
    question: "Which Indian festival is celebrated with colors, marking the arrival of spring?",
    options: ["Diwali", "Holi", "Eid", "Navratri"],
    correctAnswer: 1,
    timeLimit: 30,
    category: "Culture",
    explanation: "Holi is known as the festival of colors and signifies the victory of good over evil.",
    flipQuestion: {
      question: "What does 'HTTP' stand for in a web address?",
      options: [
        "HyperText Transfer Protocol",
        "High Technical Text Provider",
        "Hyper Transfer Text Platform",
        "Hosted Text Transmission Program"
      ],
      correctAnswer: 0,
      explanation: "HTTP stands for HyperText Transfer Protocol."
    }
  },
  {
    id: "q-4",
    level: 4,
    prize: "₹5,000",
    question: "Who is known as the 'Father of the Indian Constitution'?",
    options: [
      "Mahatma Gandhi",
      "Dr. B. R. Ambedkar",
      "Jawaharlal Nehru",
      "Sardar Vallabhbhai Patel"
    ],
    correctAnswer: 1,
    timeLimit: 30,
    category: "History",
    explanation: "Dr. Bhimrao Ramji Ambedkar chaired the Drafting Committee of the Constitution.",
    flipQuestion: {
      question: "Which company created the Android mobile operating system before Google acquired it?",
      options: ["Android Inc.", "Symbian Ltd.", "Sun Microsystems", "Motorola"],
      correctAnswer: 0,
      explanation: "Android Inc. was founded by Andy Rubin, Rich Miner, Nick Sears, and Chris White in 2003."
    }
  },
  {
    id: "q-5",
    level: 5,
    prize: "₹10,000", // Milestone 1
    question: "Which scientist proposed the three laws of motion and universal gravitation?",
    options: ["Albert Einstein", "Sir Isaac Newton", "Galileo Galilei", "Nikola Tesla"],
    correctAnswer: 1,
    timeLimit: 30,
    category: "Science",
    explanation: "Sir Isaac Newton published his landmark laws of motion in the Principia Mathematica in 1687.",
    flipQuestion: {
      question: "What is the primary gas found in the Earth's atmosphere?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Argon"],
      correctAnswer: 1,
      explanation: "Nitrogen makes up approximately 78% of Earth's atmosphere."
    }
  },
  {
    id: "q-6",
    level: 6,
    prize: "₹20,000",
    question: "In web development, which CSS layout module is designed for 1-dimensional layouts?",
    options: ["CSS Grid", "Flexbox", "Table layout", "Floats"],
    correctAnswer: 1,
    timeLimit: 45,
    category: "Tech",
    explanation: "Flexbox deals with layout in one dimension at a time (either row or column).",
    flipQuestion: {
      question: "Which protocol is primarily used to securely transfer files over SSH?",
      options: ["SFTP", "FTP", "Telnet", "SMTP"],
      correctAnswer: 0,
      explanation: "SFTP (SSH File Transfer Protocol) provides secure file transfer over SSH."
    }
  },
  {
    id: "q-7",
    level: 7,
    prize: "₹40,000",
    question: "Which space agency successfully landed Chandrayaan-3 near the south pole of the Moon?",
    options: ["NASA", "Roscosmos", "ISRO", "ESA"],
    correctAnswer: 2,
    timeLimit: 45,
    category: "Current Affairs & Space",
    explanation: "ISRO achieved this historic lunar landing on August 23, 2023.",
    flipQuestion: {
      question: "Which element on the periodic table has the chemical symbol 'Au'?",
      options: ["Silver", "Gold", "Copper", "Platinum"],
      correctAnswer: 1,
      explanation: "Au comes from the Latin word 'Aurum', meaning shining dawn (Gold)."
    }
  },
  {
    id: "q-8",
    level: 8,
    prize: "₹80,000",
    question: "In computer science, what is the worst-case time complexity of QuickSort?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correctAnswer: 1,
    timeLimit: 45,
    category: "Algorithms",
    explanation: "When the pivot partition is heavily unbalanced, QuickSort degrades to O(n²).",
    flipQuestion: {
      question: "Which Indian mathematician invented the concept of zero (Shunya) as a number?",
      options: ["Aryabhata", "Brahmagupta", "Bhaskara II", "Ramanujan"],
      correctAnswer: 1,
      explanation: "Brahmagupta defined formal rules and arithmetic for zero in the Brahmasphutasiddhanta (628 CE)."
    }
  },
  {
    id: "q-9",
    level: 9,
    prize: "₹1,60,000",
    question: "Which prestigious Indian institute was the first Indian Institute of Technology (IIT) to be established?",
    options: ["IIT Bombay", "IIT Kharagpur", "IIT Madras", "IIT Delhi"],
    correctAnswer: 1,
    timeLimit: 45,
    category: "Education History",
    explanation: "IIT Kharagpur was established in May 1950 at the Hijli Detention Camp.",
    flipQuestion: {
      question: "Which port number is standard for HTTPS encrypted traffic?",
      options: ["80", "443", "8080", "22"],
      correctAnswer: 1,
      explanation: "Port 443 is the standard default port for HTTPS communication."
    }
  },
  {
    id: "q-10",
    level: 10,
    prize: "₹3,20,000", // Milestone 2
    question: "Which Nobel laureate wrote the famous book 'A Brief History of Time'?",
    options: ["Stephen Hawking", "Richard Feynman", "Carl Sagan", "Kip Thorne"],
    correctAnswer: 0,
    timeLimit: 45,
    category: "Literature & Science",
    explanation: "Theoretical physicist Stephen Hawking published the landmark book in 1988.",
    flipQuestion: {
      question: "Who was the first woman to win a Nobel Prize?",
      options: ["Marie Curie", "Rosalind Franklin", "Mother Teresa", "Ada Lovelace"],
      correctAnswer: 0,
      explanation: "Marie Curie won the Nobel Prize in Physics in 1903 and later in Chemistry in 1911."
    }
  },
  {
    id: "q-11",
    level: 11,
    prize: "₹6,40,000",
    question: "In networking, what does the 'B' in 'BGP' routing protocol stand for?",
    options: ["Broadband", "Border", "Binary", "Bridge"],
    correctAnswer: 1,
    timeLimit: 60,
    category: "Networking",
    explanation: "BGP stands for Border Gateway Protocol, the routing protocol of the global Internet.",
    flipQuestion: {
      question: "What is the name of the world's deepest oceanic trench?",
      options: ["Mariana Trench", "Java Trench", "Puerto Rico Trench", "Philippine Trench"],
      correctAnswer: 0,
      explanation: "The Mariana Trench reaches a maximum known depth of ~10,994 meters (Challenger Deep)."
    }
  },
  {
    id: "q-12",
    level: 12,
    prize: "₹12,50,000",
    question: "Who created Git, the distributed version control system, in 2005?",
    options: ["Linus Torvalds", "Guido van Rossum", "Dennis Ritchie", "Ken Thompson"],
    correctAnswer: 0,
    timeLimit: 60,
    category: "Software History",
    explanation: "Linus Torvalds developed Git to manage the development of the Linux kernel.",
    flipQuestion: {
      question: "Which treaty marked the end of World War I in 1919?",
      options: ["Treaty of Versailles", "Treaty of Paris", "Treaty of Ghent", "Treaty of Rome"],
      correctAnswer: 0,
      explanation: "The Treaty of Versailles was signed on June 28, 1919, officially ending WWI."
    }
  },
  {
    id: "q-13",
    level: 13,
    prize: "₹25,00,000",
    question: "Which Indian state has the highest literacy rate according to official Census data?",
    options: ["Goa", "Mizoram", "Kerala", "Tripura"],
    correctAnswer: 2,
    timeLimit: 60,
    category: "Geography",
    explanation: "Kerala holds the highest literacy rate in India, exceeding 94%.",
    flipQuestion: {
      question: "What is the SI unit of electric capacitance?",
      options: ["Farad", "Henry", "Tesla", "Weber"],
      correctAnswer: 0,
      explanation: "The Farad (symbol F) is the SI unit of electrical capacitance."
    }
  },
  {
    id: "q-14",
    level: 14,
    prize: "₹50,00,000",
    question: "Which ancient university in Bihar was founded during the Gupta Empire in the 5th century CE?",
    options: ["Takshashila", "Nalanda", "Vikramashila", "Vallabhi"],
    correctAnswer: 1,
    timeLimit: 60,
    category: "Ancient History",
    explanation: "Nalanda Mahavihara was founded during Kumaragupta I's reign and attracted scholars from across Asia.",
    flipQuestion: {
      question: "Which cryptographic hashing algorithm produces a 256-bit hash value?",
      options: ["MD5", "SHA-1", "SHA-256", "DES"],
      correctAnswer: 2,
      explanation: "SHA-256 is part of the SHA-2 family designed by the NSA, outputting 32 bytes (256 bits)."
    }
  },
  {
    id: "q-15",
    level: 15,
    prize: "₹1 Crore", // Jackpot question!
    question: "Who was the first Indian citizen to be awarded the prestigious Turing Award (the 'Nobel of Computing')?",
    options: ["Raj Reddy", "Vijay P. Bhatkar", "N. R. Narayana Murthy", "Manindra Agrawal"],
    correctAnswer: 0,
    timeLimit: 90,
    category: "Computer Science Legends",
    explanation: "Dabbala Rajagopal 'Raj' Reddy received the ACM Turing Award in 1994 for pioneering AI and speech recognition systems.",
    flipQuestion: {
      question: "In what year did Tim Berners-Lee write the first proposal for the World Wide Web at CERN?",
      options: ["1989", "1991", "1985", "1993"],
      correctAnswer: 0,
      explanation: "Tim Berners-Lee wrote 'Information Management: A Proposal' in March 1989 at CERN."
    }
  }
];
