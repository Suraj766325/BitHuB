/* ============================================================
 * data/notes.js — every file in Study Material/CS24201, grouped
 * by module. kind: hand (handwritten class notes), book (scanned
 * textbook pages), slides (lecture slides), code (C programs).
 * Paths are relative to Study Material/CS24201.
 * ============================================================ */
(function () {
  'use strict';
  const f = (path, title, kind, topic) => ({ path, title, kind, topic, ext: path.split('.').pop().toLowerCase() });
  DSA.notes = {
    1: [
      f('MOD1/1.1-intro_DS.pdf', 'Introduction to data structures', 'slides', 'Basics'),
      f('MOD1/1.2-Complexity-Algorithms.pdf', 'Complexity of algorithms', 'slides', 'Analysis'),
      f('MOD1/1.4-Polynomial.pdf', 'Polynomials and sparse matrix', 'slides', 'Arrays'),
      f('MOD1/DSA_Intro.pdf', 'Introduction to DSA', 'hand', 'Basics'),
      f('MOD1/Introduction to Data Structures and Algorithm.pdf', 'Introduction to data structures and algorithm', 'book', 'Basics'),
      f('MOD1/Intro_Algo_Asymptotic_notation.pdf', 'Algorithms and asymptotic notation', 'hand', 'Analysis'),
      f('MOD1/DSA-array.pdf', 'Arrays', 'hand', 'Arrays'),
      f('MOD1/Array-theory and algo.pdf', 'Arrays: theory and algorithms', 'book', 'Arrays'),
      f('MOD1/Recursion.pdf', 'Recursion', 'book', 'Recursion'),
      f('MOD1/factorial.c', 'factorial.c (recursive and iterative)', 'code', 'Recursion'),
    ],
    2: [
      f('MOD2/DSA-linked_list.pdf', 'Linked lists', 'hand', 'All variants'),
      f('MOD2/LinkedList_theory.pdf', 'Linked list: theory', 'book', 'Concepts'),
      f('MOD2/Linked_list operation algorithm.pdf', 'Linked list operation algorithms', 'book', 'Operations'),
      f('MOD2/Operation-on-linkedlist_theory-nd-algo.pdf', 'Operations on linked lists: theory and algorithms', 'book', 'Operations'),
    ],
    3: [
      f('MOD3/DSA-stack.pdf', 'Stacks', 'hand', 'Stack'),
      f('MOD3/stack-theory-nd-algo.pdf', 'Stack: theory and algorithms', 'book', 'Stack'),
      f('MOD3/Stack.pptx', 'Stack (presentation)', 'slides', 'Stack'),
      f('MOD3/stack.c', 'stack.c', 'code', 'Stack'),
      f('MOD3/polish-notation-stack_application.pdf', 'Polish notation: a stack application', 'book', 'Applications'),
      f('MOD3/TowerOfHanoi-algo.pdf', 'Tower of Hanoi', 'book', 'Applications'),
      f('MOD3/Queue-theory-nd-algo.pdf', 'Queue: theory and algorithms', 'book', 'Queue'),
      f('MOD3/simpl_queue.c', 'simpl_queue.c (linear queue)', 'code', 'Queue'),
      f('MOD3/circ_queue.c', 'circ_queue.c (circular queue)', 'code', 'Queue'),
    ],
    4: [
      f('MOD4/Linear_search-theory-nd-algo.pdf', 'Linear search', 'book', 'Searching'),
      f('MOD4/Binary_search-theory-nd-algo.pdf', 'Binary search', 'book', 'Searching'),
      f('MOD4/DSA-Linear_nd_Binary_search-theory.pdf', 'Linear and binary search', 'hand', 'Searching'),
      f('MOD4/dsa-hashing.pdf', 'Hashing', 'hand', 'Hashing'),
      f('MOD4/Bubble_sort-theory-nd-algo.pdf', 'Bubble sort', 'book', 'Sorting'),
      f('MOD4/dsa-selection-sort.pdf', 'Selection sort', 'book', 'Sorting'),
      f('MOD4/dsa-insertion-sort.pdf', 'Insertion sort', 'book', 'Sorting'),
      f('MOD4/DSA-merge-sort.pdf', 'Merge sort', 'book', 'Sorting'),
      f('MOD4/QuickSort-algo.pdf', 'Quick sort', 'book', 'Sorting'),
      f('MOD4/dsa-radix-sort.pdf', 'Radix sort', 'book', 'Sorting'),
    ],
    5: [
      f('MOD5/DSA-tree.pdf', 'Trees', 'hand', 'Trees'),
      f('MOD5/tree.c', 'tree.c', 'code', 'Trees'),
      f('MOD5/DSA-graph.pdf', 'Graphs', 'hand', 'Graphs'),
      f('MOD5/graph_non-linear_ds.pptx', 'Graphs: non-linear data structures (presentation)', 'slides', 'Graphs'),
    ],
  };
  DSA.notesExtra = [f('DATA STRUCTURE Notes.doc', 'Complete data structures notes (97 pages)', 'book', 'All modules'), f('CS24201 Syllabus.pdf', 'Course syllabus', 'book', 'Syllabus')];
  DSA.KIND = { hand: 'Handwritten', book: 'Textbook pages', slides: 'Slides', code: 'C program' };
  DSA.pyqPapers = [
    { path: 'QPA/MO-25_MID.pdf', title: 'Mid semester, Monsoon 2025' }, { path: 'QPA/MO-25_END.pdf', title: 'End semester, Monsoon 2025' },
    { path: 'QPA/MO-23_MID.pdf', title: 'Mid semester, Monsoon 2023' }, { path: 'QPA/MO-23_END.pdf', title: 'End semester, Monsoon 2023' },
  ];
})();
