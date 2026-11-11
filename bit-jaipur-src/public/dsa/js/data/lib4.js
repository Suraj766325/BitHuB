/* data/lib4.js — Module IV algorithms (searching, hashing, sorting). */
(function () {
  'use strict';
  const R = String.raw;
  DSA.library = DSA.library || {};
  const SAMPLE = '64 25 12 22 11 90 3';
  DSA.library[4] = [
    {
      id: 'linear-search', title: 'Linear search', summary: 'Check the elements one by one.', tags: ['Searching'], time: 'O(n)', best: 'O(1)', space: 'O(1)', viz: 'search',
      idea: 'Compare the key with a[0], a[1], … until it is found or the array ends. It works on any list, sorted or not, and on linked lists.',
      steps: ['For i = 0 to n − 1: if a[i] == key return i.', 'If the loop ends, return −1 (not found).'],
      note: 'Best case: key is first (1 comparison). Worst case: key is last or absent (n comparisons). Average: about n/2.',
      pseudo: ['for i = 0 to n - 1:', '  if a[i] == key: return i', 'return -1'],
      expect: 'Index of 22: 3\nIndex of 99: -1\n',
      code: {
        c: R`#include <stdio.h>

int linearSearch(int a[], int n, int key) {
    for (int i = 0; i < n; i++)
        if (a[i] == key) return i;
    return -1;
}

int main(void) {
    int a[] = {64, 25, 12, 22, 11, 90, 3}, n = 7;
    printf("Index of 22: %d\n", linearSearch(a, n, 22));
    printf("Index of 99: %d\n", linearSearch(a, n, 99));
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

int linearSearch(const vector<int> &a, int key) {
    for (size_t i = 0; i < a.size(); i++)
        if (a[i] == key) return (int)i;
    return -1;
}

int main() {
    vector<int> a = {64, 25, 12, 22, 11, 90, 3};
    cout << "Index of 22: " << linearSearch(a, 22) << "\n";
    cout << "Index of 99: " << linearSearch(a, 99) << "\n";
    return 0;
}
`,
        java: R`class Main {
    static int linearSearch(int[] a, int key) {
        for (int i = 0; i < a.length; i++)
            if (a[i] == key) return i;
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {64, 25, 12, 22, 11, 90, 3};
        System.out.println("Index of 22: " + linearSearch(a, 22));
        System.out.println("Index of 99: " + linearSearch(a, 99));
    }
}
`,
        py: R`def linear_search(a, key):
    for i, x in enumerate(a):
        if x == key:
            return i
    return -1


a = [64, 25, 12, 22, 11, 90, 3]
print("Index of 22:", linear_search(a, 22))
print("Index of 99:", linear_search(a, 99))
`,
      },
    },
    {
      id: 'binary-search', title: 'Binary search', summary: 'Halve a sorted array at every step.', tags: ['Searching'], time: 'O(log n)', best: 'O(1)', space: 'O(1)', viz: 'search',
      idea: 'On a sorted array, compare the key with the middle element. If equal, done; if the key is smaller, only the left half can hold it; otherwise only the right half. Each step halves the range, so at most ⌊log₂ n⌋ + 1 comparisons are needed.',
      steps: ['low = 0, high = n − 1.', 'While low ≤ high: mid = low + (high − low) / 2.', 'If a[mid] == key return mid; if a[mid] < key set low = mid + 1; else high = mid − 1.', 'Return −1 when the range is empty.'],
      note: 'Write mid = low + (high − low) / 2 rather than (low + high) / 2, which can overflow for very large arrays.',
      pseudo: ['low = 0; high = n - 1', 'while low <= high:', '  mid = low + (high - low) / 2', '  if a[mid] == key: return mid', '  else if a[mid] < key: low = mid + 1', '  else: high = mid - 1', 'return -1'],
      expect: 'Index of 23: 3\nIndex of 80: 8\nIndex of 5: -1\nComparisons for 80: 4\n',
      code: {
        c: R`#include <stdio.h>

int binarySearch(int a[], int n, int key, int *steps) {
    int low = 0, high = n - 1;
    *steps = 0;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        (*steps)++;
        if (a[mid] == key) return mid;
        if (a[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main(void) {
    int a[] = {4, 9, 15, 23, 31, 42, 58, 67, 80}, n = 9, steps;
    printf("Index of 23: %d\n", binarySearch(a, n, 23, &steps));
    printf("Index of 80: %d\n", binarySearch(a, n, 80, &steps));
    printf("Index of 5: %d\n", binarySearch(a, n, 5, &steps));
    binarySearch(a, n, 80, &steps);
    printf("Comparisons for 80: %d\n", steps);
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

int binarySearch(const vector<int> &a, int key, int &steps) {
    int low = 0, high = (int)a.size() - 1;
    steps = 0;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        steps++;
        if (a[mid] == key) return mid;
        if (a[mid] < key) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}

int main() {
    vector<int> a = {4, 9, 15, 23, 31, 42, 58, 67, 80};
    int steps;
    cout << "Index of 23: " << binarySearch(a, 23, steps) << "\n";
    cout << "Index of 80: " << binarySearch(a, 80, steps) << "\n";
    cout << "Index of 5: " << binarySearch(a, 5, steps) << "\n";
    binarySearch(a, 80, steps);
    cout << "Comparisons for 80: " << steps << "\n";
    return 0;
}
`,
        java: R`class Main {
    static int steps;

    static int binarySearch(int[] a, int key) {
        int low = 0, high = a.length - 1;
        steps = 0;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            steps++;
            if (a[mid] == key) return mid;
            if (a[mid] < key) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {4, 9, 15, 23, 31, 42, 58, 67, 80};
        System.out.println("Index of 23: " + binarySearch(a, 23));
        System.out.println("Index of 80: " + binarySearch(a, 80));
        System.out.println("Index of 5: " + binarySearch(a, 5));
        binarySearch(a, 80);
        System.out.println("Comparisons for 80: " + steps);
    }
}
`,
        py: R`def binary_search(a, key):
    low, high, steps = 0, len(a) - 1, 0
    while low <= high:
        mid = low + (high - low) // 2
        steps += 1
        if a[mid] == key:
            return mid, steps
        if a[mid] < key:
            low = mid + 1
        else:
            high = mid - 1
    return -1, steps


a = [4, 9, 15, 23, 31, 42, 58, 67, 80]
print("Index of 23:", binary_search(a, 23)[0])
print("Index of 80:", binary_search(a, 80)[0])
print("Index of 5:", binary_search(a, 5)[0])
print("Comparisons for 80:", binary_search(a, 80)[1])
`,
      },
    },
    {
      id: 'bubble-sort', title: 'Bubble sort', summary: 'Swap neighbours until the largest values settle at the end.', tags: ['Sorting'], time: 'O(n²)', best: 'O(n) with early stop', space: 'O(1)', viz: 'sort',
      idea: 'In each pass compare every pair of neighbours and swap them if they are out of order. After pass k the k largest values are in their final places at the end. If a pass makes no swap the array is already sorted, so we can stop.',
      steps: ['Repeat n − 1 times (passes).', 'For j = 0 to n − pass − 2: if a[j] > a[j + 1] swap them.', 'If no swap happened in the pass, stop early.'],
      note: 'Stable and in place. About n²/2 comparisons in the worst case.',
      pseudo: ['for pass = 1 to n - 1:', '  swapped = false', '  for j = 0 to n - pass - 1:', '    if a[j] > a[j + 1]: swap a[j], a[j + 1]; swapped = true', '  if not swapped: break'],
      expect: '3 11 12 22 25 64 90\n',
      code: {
        c: R`#include <stdio.h>

void bubbleSort(int a[], int n) {
    for (int pass = 1; pass < n; pass++) {
        int swapped = 0;
        for (int j = 0; j < n - pass; j++) {
            if (a[j] > a[j + 1]) {
                int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                swapped = 1;
            }
        }
        if (!swapped) break;
    }
}

int main(void) {
    int a[] = {64, 25, 12, 22, 11, 90, 3}, n = 7;
    bubbleSort(a, n);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

void bubbleSort(vector<int> &a) {
    int n = a.size();
    for (int pass = 1; pass < n; pass++) {
        bool swapped = false;
        for (int j = 0; j < n - pass; j++) {
            if (a[j] > a[j + 1]) { swap(a[j], a[j + 1]); swapped = true; }
        }
        if (!swapped) break;
    }
}

int main() {
    vector<int> a = {64, 25, 12, 22, 11, 90, 3};
    bubbleSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << (i ? " " : "") << a[i];
    cout << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    static void bubbleSort(int[] a) {
        int n = a.length;
        for (int pass = 1; pass < n; pass++) {
            boolean swapped = false;
            for (int j = 0; j < n - pass; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }

    public static void main(String[] args) {
        int[] a = {64, 25, 12, 22, 11, 90, 3};
        bubbleSort(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) sb.append(i > 0 ? " " : "").append(a[i]);
        System.out.println(sb);
    }
}
`,
        py: R`def bubble_sort(a):
    n = len(a)
    for p in range(1, n):
        swapped = False
        for j in range(n - p):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break


a = [64, 25, 12, 22, 11, 90, 3]
bubble_sort(a)
print(*a)
`,
      },
    },
    {
      id: 'selection-sort', title: 'Selection sort', summary: 'Repeatedly select the minimum of the unsorted part.', tags: ['Sorting', 'Syllabus'], time: 'O(n²)', best: 'O(n²)', space: 'O(1)', viz: 'sort',
      idea: 'Find the smallest element of a[i..n−1] and swap it with a[i]. After i steps the first i places hold the i smallest values in order. It always makes n(n−1)/2 comparisons but at most n − 1 swaps.',
      steps: ['For i = 0 to n − 2: min = i.', 'For j = i + 1 to n − 1: if a[j] < a[min] then min = j.', 'Swap a[i] and a[min].'],
      note: 'Not stable (the long-distance swap can reorder equal keys). Good when writes are expensive.',
      pseudo: ['for i = 0 to n - 2:', '  min = i', '  for j = i + 1 to n - 1:', '    if a[j] < a[min]: min = j', '  swap a[i], a[min]'],
      expect: '3 11 12 22 25 64 90\n',
      code: {
        c: R`#include <stdio.h>

void selectionSort(int a[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[min]) min = j;
        int t = a[i]; a[i] = a[min]; a[min] = t;
    }
}

int main(void) {
    int a[] = {64, 25, 12, 22, 11, 90, 3}, n = 7;
    selectionSort(a, n);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

void selectionSort(vector<int> &a) {
    int n = a.size();
    for (int i = 0; i < n - 1; i++) {
        int min = i;
        for (int j = i + 1; j < n; j++)
            if (a[j] < a[min]) min = j;
        swap(a[i], a[min]);
    }
}

int main() {
    vector<int> a = {64, 25, 12, 22, 11, 90, 3};
    selectionSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << (i ? " " : "") << a[i];
    cout << "\n";
    return 0;
}
`,
        java: R`class Main {
    static void selectionSort(int[] a) {
        int n = a.length;
        for (int i = 0; i < n - 1; i++) {
            int min = i;
            for (int j = i + 1; j < n; j++)
                if (a[j] < a[min]) min = j;
            int t = a[i]; a[i] = a[min]; a[min] = t;
        }
    }

    public static void main(String[] args) {
        int[] a = {64, 25, 12, 22, 11, 90, 3};
        selectionSort(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) sb.append(i > 0 ? " " : "").append(a[i]);
        System.out.println(sb);
    }
}
`,
        py: R`def selection_sort(a):
    n = len(a)
    for i in range(n - 1):
        m = i
        for j in range(i + 1, n):
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]


a = [64, 25, 12, 22, 11, 90, 3]
selection_sort(a)
print(*a)
`,
      },
    },
    {
      id: 'insertion-sort', title: 'Insertion sort', summary: 'Grow a sorted prefix by inserting the next element.', tags: ['Sorting', 'Syllabus'], time: 'O(n²)', best: 'O(n)', space: 'O(1)', viz: 'sort',
      idea: 'Treat a[0..i−1] as already sorted. Take key = a[i] and shift every larger element of the sorted part one place right, then drop the key into the gap. Like sorting playing cards in the hand.',
      steps: ['For i = 1 to n − 1: key = a[i]; j = i − 1.', 'While j ≥ 0 and a[j] > key: a[j + 1] = a[j]; j−−.', 'a[j + 1] = key.'],
      note: 'Stable and in place. On nearly sorted data it is close to O(n), which is why it is used for small partitions inside faster sorts.',
      pseudo: ['for i = 1 to n - 1:', '  key = a[i]; j = i - 1', '  while j >= 0 and a[j] > key:', '    a[j + 1] = a[j]; j = j - 1', '  a[j + 1] = key'],
      expect: '3 11 12 22 25 64 90\n',
      code: {
        c: R`#include <stdio.h>

void insertionSort(int a[], int n) {
    for (int i = 1; i < n; i++) {
        int key = a[i], j = i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

int main(void) {
    int a[] = {64, 25, 12, 22, 11, 90, 3}, n = 7;
    insertionSort(a, n);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

void insertionSort(vector<int> &a) {
    for (size_t i = 1; i < a.size(); i++) {
        int key = a[i], j = (int)i - 1;
        while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
        a[j + 1] = key;
    }
}

int main() {
    vector<int> a = {64, 25, 12, 22, 11, 90, 3};
    insertionSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << (i ? " " : "") << a[i];
    cout << "\n";
    return 0;
}
`,
        java: R`class Main {
    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i], j = i - 1;
            while (j >= 0 && a[j] > key) { a[j + 1] = a[j]; j--; }
            a[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        int[] a = {64, 25, 12, 22, 11, 90, 3};
        insertionSort(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) sb.append(i > 0 ? " " : "").append(a[i]);
        System.out.println(sb);
    }
}
`,
        py: R`def insertion_sort(a):
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]
            j -= 1
        a[j + 1] = key


a = [64, 25, 12, 22, 11, 90, 3]
insertion_sort(a)
print(*a)
`,
      },
    },
    {
      id: 'merge-sort', title: 'Merge sort', summary: 'Split, sort both halves, merge. Always O(n log n).', tags: ['Sorting', 'Divide and conquer', 'Syllabus'], time: 'O(n log n)', best: 'O(n log n)', space: 'O(n)', viz: 'sort',
      idea: 'Divide the array in two halves, sort each half recursively, then merge the two sorted halves by repeatedly taking the smaller front element. A single element is already sorted (the base case).',
      steps: ['If lo ≥ hi return.', 'mid = (lo + hi) / 2; sort [lo..mid] and [mid+1..hi].', 'Merge: copy both halves, then take the smaller front value each time (take the left one on ties to stay stable).', 'Copy any leftovers.'],
      note: 'Recurrence T(n) = 2T(n/2) + n gives O(n log n) in every case. The merge step is also how external sorting combines runs.',
      pseudo: ['mergeSort(a, lo, hi):', '  if lo >= hi: return', '  mid = (lo + hi) / 2', '  mergeSort(a, lo, mid); mergeSort(a, mid + 1, hi)', '  merge(a, lo, mid, hi)', 'merge: i = lo, j = mid + 1; repeatedly copy the smaller of a[i], a[j] into tmp; copy leftovers; copy tmp back'],
      expect: '3 11 12 22 25 64 90\n',
      code: {
        c: R`#include <stdio.h>

void merge(int a[], int lo, int mid, int hi) {
    int tmp[64], i = lo, j = mid + 1, k = 0;
    while (i <= mid && j <= hi) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
    while (i <= mid) tmp[k++] = a[i++];
    while (j <= hi) tmp[k++] = a[j++];
    for (k = 0, i = lo; i <= hi; i++, k++) a[i] = tmp[k];
}

void mergeSort(int a[], int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    merge(a, lo, mid, hi);
}

int main(void) {
    int a[] = {64, 25, 12, 22, 11, 90, 3}, n = 7;
    mergeSort(a, 0, n - 1);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

void merge(vector<int> &a, int lo, int mid, int hi) {
    vector<int> tmp;
    int i = lo, j = mid + 1;
    while (i <= mid && j <= hi) tmp.push_back(a[i] <= a[j] ? a[i++] : a[j++]);
    while (i <= mid) tmp.push_back(a[i++]);
    while (j <= hi) tmp.push_back(a[j++]);
    for (int k = 0; k < (int)tmp.size(); k++) a[lo + k] = tmp[k];
}

void mergeSort(vector<int> &a, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(a, lo, mid);
    mergeSort(a, mid + 1, hi);
    merge(a, lo, mid, hi);
}

int main() {
    vector<int> a = {64, 25, 12, 22, 11, 90, 3};
    mergeSort(a, 0, (int)a.size() - 1);
    for (size_t i = 0; i < a.size(); i++) cout << (i ? " " : "") << a[i];
    cout << "\n";
    return 0;
}
`,
        java: R`class Main {
    static void merge(int[] a, int lo, int mid, int hi) {
        int[] tmp = new int[hi - lo + 1];
        int i = lo, j = mid + 1, k = 0;
        while (i <= mid && j <= hi) tmp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];
        while (i <= mid) tmp[k++] = a[i++];
        while (j <= hi) tmp[k++] = a[j++];
        System.arraycopy(tmp, 0, a, lo, tmp.length);
    }

    static void mergeSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int mid = lo + (hi - lo) / 2;
        mergeSort(a, lo, mid);
        mergeSort(a, mid + 1, hi);
        merge(a, lo, mid, hi);
    }

    public static void main(String[] args) {
        int[] a = {64, 25, 12, 22, 11, 90, 3};
        mergeSort(a, 0, a.length - 1);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) sb.append(i > 0 ? " " : "").append(a[i]);
        System.out.println(sb);
    }
}
`,
        py: R`def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    return out + left[i:] + right[j:]


print(*merge_sort([64, 25, 12, 22, 11, 90, 3]))
`,
      },
    },
    {
      id: 'quick-sort', title: 'Quick sort', summary: 'Partition around a pivot, then sort both sides.', tags: ['Sorting', 'Divide and conquer', 'PYQ'], time: 'O(n log n) avg, O(n²) worst', best: 'O(n log n)', space: 'O(log n)', viz: 'sort',
      idea: 'Choose the first element as the pivot and rearrange so that everything smaller is on its left and everything larger on its right; the pivot is then in its final position. Sort the two sides the same way. The course notes use two scans (from the right, then from the left) that swap values with the pivot until they meet; this program does the same partition with two indices.',
      steps: ['pivot = a[lo]; i = lo + 1; j = hi.', 'Move i right while a[i] ≤ pivot; move j left while a[j] > pivot.', 'If i < j swap a[i] and a[j] and continue; otherwise stop.', 'Swap the pivot with a[j]. Now a[j] is in its final place.', 'Recurse on [lo..j−1] and [j+1..hi].'],
      note: 'Worst case O(n²) happens when the pivot is always the smallest or largest value (for example an already sorted array with the first element as pivot). Choosing a random or median-of-three pivot avoids this in practice.',
      pseudo: ['quickSort(a, lo, hi):', '  if lo >= hi: return', '  p = partition(a, lo, hi)', '  quickSort(a, lo, p - 1); quickSort(a, p + 1, hi)', 'partition(a, lo, hi): pivot = a[lo]; i = lo + 1; j = hi', '  loop: while i <= j and a[i] <= pivot: i++', '        while j >= i and a[j] > pivot: j--', '        if i >= j: break;  swap a[i], a[j]', '  swap a[lo], a[j]; return j'],
      expect: 'Sorted: 18 19 21 32 42 65 73 74 88\n',
      code: {
        c: R`#include <stdio.h>

int partition(int a[], int lo, int hi) {
    int pivot = a[lo], i = lo + 1, j = hi;
    for (;;) {
        while (i <= j && a[i] <= pivot) i++;
        while (j >= i && a[j] > pivot) j--;
        if (i >= j) break;
        int t = a[i]; a[i] = a[j]; a[j] = t;
    }
    int t = a[lo]; a[lo] = a[j]; a[j] = t;       /* pivot to its final place */
    return j;
}

void quickSort(int a[], int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}

int main(void) {
    int a[] = {42, 32, 73, 21, 19, 18, 88, 65, 74}, n = 9;
    quickSort(a, 0, n - 1);
    printf("Sorted:");
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

int partition(vector<int> &a, int lo, int hi) {
    int pivot = a[lo], i = lo + 1, j = hi;
    for (;;) {
        while (i <= j && a[i] <= pivot) i++;
        while (j >= i && a[j] > pivot) j--;
        if (i >= j) break;
        swap(a[i], a[j]);
    }
    swap(a[lo], a[j]);                           // pivot to its final place
    return j;
}

void quickSort(vector<int> &a, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(a, lo, hi);
    quickSort(a, lo, p - 1);
    quickSort(a, p + 1, hi);
}

int main() {
    vector<int> a = {42, 32, 73, 21, 19, 18, 88, 65, 74};
    quickSort(a, 0, (int)a.size() - 1);
    cout << "Sorted:";
    for (int x : a) cout << " " << x;
    cout << "\n";
    return 0;
}
`,
        java: R`class Main {
    static int partition(int[] a, int lo, int hi) {
        int pivot = a[lo], i = lo + 1, j = hi;
        for (;;) {
            while (i <= j && a[i] <= pivot) i++;
            while (j >= i && a[j] > pivot) j--;
            if (i >= j) break;
            int t = a[i]; a[i] = a[j]; a[j] = t;
        }
        int t = a[lo]; a[lo] = a[j]; a[j] = t;   // pivot to its final place
        return j;
    }

    static void quickSort(int[] a, int lo, int hi) {
        if (lo >= hi) return;
        int p = partition(a, lo, hi);
        quickSort(a, lo, p - 1);
        quickSort(a, p + 1, hi);
    }

    public static void main(String[] args) {
        int[] a = {42, 32, 73, 21, 19, 18, 88, 65, 74};
        quickSort(a, 0, a.length - 1);
        StringBuilder sb = new StringBuilder("Sorted:");
        for (int x : a) sb.append(" ").append(x);
        System.out.println(sb);
    }
}
`,
        py: R`def partition(a, lo, hi):
    pivot, i, j = a[lo], lo + 1, hi
    while True:
        while i <= j and a[i] <= pivot:
            i += 1
        while j >= i and a[j] > pivot:
            j -= 1
        if i >= j:
            break
        a[i], a[j] = a[j], a[i]
    a[lo], a[j] = a[j], a[lo]                    # pivot to its final place
    return j


def quick_sort(a, lo, hi):
    if lo >= hi:
        return
    p = partition(a, lo, hi)
    quick_sort(a, lo, p - 1)
    quick_sort(a, p + 1, hi)


a = [42, 32, 73, 21, 19, 18, 88, 65, 74]
quick_sort(a, 0, len(a) - 1)
print("Sorted:", *a)
`,
      },
    },
    {
      id: 'radix-sort', title: 'Radix sort (LSD)', summary: 'Sort digit by digit, least significant first, with a stable pass.', tags: ['Sorting', 'Non-comparison', 'PYQ'], time: 'O(d·(n + 10))', best: '', space: 'O(n)', viz: 'sort',
      idea: 'Sort the numbers by their ones digit, then by their tens digit, then hundreds, and so on, always using a stable sort (counting sort) for each digit. Stability makes the earlier order survive, so after the last pass the whole list is sorted. No two numbers are ever compared with each other.',
      steps: ['Find the maximum value to know how many digits d are needed.', 'For each digit position exp = 1, 10, 100, …: count how many numbers have each digit 0–9.', 'Turn the counts into end positions, then place the numbers into the output going right to left (this keeps the pass stable).', 'Copy the output back and move to the next digit.'],
      note: 'Advantage over comparison sorts: O(d·n) can beat O(n log n) when the number of digits is small. It needs extra space and works for integers and fixed-length strings.',
      pseudo: ['radixSort(a, n):', '  max = largest value in a', '  for exp = 1; max / exp > 0; exp = exp * 10:', '    countingSort(a, n, exp)', 'countingSort by digit (x / exp) % 10:', '  count[digit]++ for every x; prefix sums; place elements from right to left; copy back'],
      expect: '2 24 45 66 75 90 170 802\n',
      code: {
        c: R`#include <stdio.h>

void countingByDigit(int a[], int n, int exp) {
    int out[64], count[10] = {0};
    for (int i = 0; i < n; i++) count[(a[i] / exp) % 10]++;
    for (int d = 1; d < 10; d++) count[d] += count[d - 1];
    for (int i = n - 1; i >= 0; i--) out[--count[(a[i] / exp) % 10]] = a[i];
    for (int i = 0; i < n; i++) a[i] = out[i];
}

void radixSort(int a[], int n) {
    int max = a[0];
    for (int i = 1; i < n; i++) if (a[i] > max) max = a[i];
    for (int exp = 1; max / exp > 0; exp *= 10) countingByDigit(a, n, exp);
}

int main(void) {
    int a[] = {170, 45, 75, 90, 802, 24, 2, 66}, n = 8;
    radixSort(a, n);
    for (int i = 0; i < n; i++) printf(i ? " %d" : "%d", a[i]);
    printf("\n");
    return 0;
}
`,
        cpp: R`#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

void countingByDigit(vector<int> &a, int exp) {
    vector<int> out(a.size());
    int count[10] = {0};
    for (int x : a) count[(x / exp) % 10]++;
    for (int d = 1; d < 10; d++) count[d] += count[d - 1];
    for (int i = (int)a.size() - 1; i >= 0; i--) out[--count[(a[i] / exp) % 10]] = a[i];
    a = out;
}

void radixSort(vector<int> &a) {
    int max = *max_element(a.begin(), a.end());
    for (int exp = 1; max / exp > 0; exp *= 10) countingByDigit(a, exp);
}

int main() {
    vector<int> a = {170, 45, 75, 90, 802, 24, 2, 66};
    radixSort(a);
    for (size_t i = 0; i < a.size(); i++) cout << (i ? " " : "") << a[i];
    cout << "\n";
    return 0;
}
`,
        java: R`class Main {
    static void countingByDigit(int[] a, int exp) {
        int n = a.length;
        int[] out = new int[n], count = new int[10];
        for (int x : a) count[(x / exp) % 10]++;
        for (int d = 1; d < 10; d++) count[d] += count[d - 1];
        for (int i = n - 1; i >= 0; i--) out[--count[(a[i] / exp) % 10]] = a[i];
        System.arraycopy(out, 0, a, 0, n);
    }

    static void radixSort(int[] a) {
        int max = a[0];
        for (int x : a) if (x > max) max = x;
        for (int exp = 1; max / exp > 0; exp *= 10) countingByDigit(a, exp);
    }

    public static void main(String[] args) {
        int[] a = {170, 45, 75, 90, 802, 24, 2, 66};
        radixSort(a);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < a.length; i++) sb.append(i > 0 ? " " : "").append(a[i]);
        System.out.println(sb);
    }
}
`,
        py: R`def counting_by_digit(a, exp):
    out, count = [0] * len(a), [0] * 10
    for x in a:
        count[(x // exp) % 10] += 1
    for d in range(1, 10):
        count[d] += count[d - 1]
    for x in reversed(a):
        count[(x // exp) % 10] -= 1
        out[count[(x // exp) % 10]] = x
    return out


def radix_sort(a):
    exp = 1
    while max(a) // exp > 0:
        a = counting_by_digit(a, exp)
        exp *= 10
    return a


print(*radix_sort([170, 45, 75, 90, 802, 24, 2, 66]))
`,
      },
    },
    {
      id: 'heap-sort', title: 'Heap sort', summary: 'Build a max-heap, then repeatedly move the maximum to the end.', tags: ['Sorting', 'Heap', 'PYQ'], time: 'O(n log n)', best: 'O(n log n)', space: 'O(1)', viz: 'sort',
      idea: 'View the array as a complete binary tree (children of i are 2i+1 and 2i+2). First rearrange it into a max-heap with heapify, from the last parent up to the root. Then swap the root (the maximum) with the last element, shrink the heap by one and heapify the root again. Repeat until the heap is empty.',
      steps: ['Build: for i = n/2 − 1 down to 0, heapify(i, n).', 'heapify(i, size): find the largest of a[i] and its two children; if a child is larger swap and continue downward.', 'For last = n − 1 down to 1: swap a[0] and a[last], then heapify(0, last).'],
      note: 'This is the "heapify process" asked in the End Semester 2025 paper. Building a heap bottom-up costs O(n); the n extractions cost O(n log n).',
      pseudo: ['heapify(a, size, i):', '  largest = i; l = 2i + 1; r = 2i + 2', '  if l < size and a[l] > a[largest]: largest = l', '  if r < size and a[r] > a[largest]: largest = r', '  if largest != i: swap a[i], a[largest]; heapify(a, size, largest)', 'heapSort(a, n):', '  for i = n/2 - 1 down to 0: heapify(a, n, i)', '  for last = n - 1 down to 1: swap a[0], a[last]; heapify(a, last, 0)'],
      expect: 'Max-heap: 10 5 8 4 1 3 7\nSorted: 1 3 4 5 7 8 10\n',
      code: {
        c: R`#include <stdio.h>

void heapify(int a[], int size, int i) {
    int largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size && a[r] > a[largest]) largest = r;
    if (largest != i) {
        int t = a[i]; a[i] = a[largest]; a[largest] = t;
        heapify(a, size, largest);
    }
}

void print(const char *label, int a[], int n) {
    printf("%s:", label);
    for (int i = 0; i < n; i++) printf(" %d", a[i]);
    printf("\n");
}

int main(void) {
    int a[] = {4, 10, 3, 5, 1, 8, 7}, n = 7;
    for (int i = n / 2 - 1; i >= 0; i--) heapify(a, n, i);
    print("Max-heap", a, n);
    for (int last = n - 1; last > 0; last--) {
        int t = a[0]; a[0] = a[last]; a[last] = t;
        heapify(a, last, 0);
    }
    print("Sorted", a, n);
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <vector>
using namespace std;

void heapify(vector<int> &a, int size, int i) {
    int largest = i, l = 2 * i + 1, r = 2 * i + 2;
    if (l < size && a[l] > a[largest]) largest = l;
    if (r < size && a[r] > a[largest]) largest = r;
    if (largest != i) { swap(a[i], a[largest]); heapify(a, size, largest); }
}

void print(const string &label, const vector<int> &a) {
    cout << label << ":";
    for (int x : a) cout << " " << x;
    cout << "\n";
}

int main() {
    vector<int> a = {4, 10, 3, 5, 1, 8, 7};
    int n = a.size();
    for (int i = n / 2 - 1; i >= 0; i--) heapify(a, n, i);
    print("Max-heap", a);
    for (int last = n - 1; last > 0; last--) { swap(a[0], a[last]); heapify(a, last, 0); }
    print("Sorted", a);
    return 0;
}
`,
        java: R`class Main {
    static void heapify(int[] a, int size, int i) {
        int largest = i, l = 2 * i + 1, r = 2 * i + 2;
        if (l < size && a[l] > a[largest]) largest = l;
        if (r < size && a[r] > a[largest]) largest = r;
        if (largest != i) {
            int t = a[i]; a[i] = a[largest]; a[largest] = t;
            heapify(a, size, largest);
        }
    }

    static void print(String label, int[] a) {
        StringBuilder sb = new StringBuilder(label + ":");
        for (int x : a) sb.append(" ").append(x);
        System.out.println(sb);
    }

    public static void main(String[] args) {
        int[] a = {4, 10, 3, 5, 1, 8, 7};
        int n = a.length;
        for (int i = n / 2 - 1; i >= 0; i--) heapify(a, n, i);
        print("Max-heap", a);
        for (int last = n - 1; last > 0; last--) {
            int t = a[0]; a[0] = a[last]; a[last] = t;
            heapify(a, last, 0);
        }
        print("Sorted", a);
    }
}
`,
        py: R`def heapify(a, size, i):
    largest, l, r = i, 2 * i + 1, 2 * i + 2
    if l < size and a[l] > a[largest]:
        largest = l
    if r < size and a[r] > a[largest]:
        largest = r
    if largest != i:
        a[i], a[largest] = a[largest], a[i]
        heapify(a, size, largest)


a = [4, 10, 3, 5, 1, 8, 7]
n = len(a)
for i in range(n // 2 - 1, -1, -1):
    heapify(a, n, i)
print("Max-heap:", *a)
for last in range(n - 1, 0, -1):
    a[0], a[last] = a[last], a[0]
    heapify(a, last, 0)
print("Sorted:", *a)
`,
      },
    },
    {
      id: 'hash-chaining', title: 'Hash table with chaining', summary: 'h(k) = k mod M; keys that collide share a list.', tags: ['Hashing', 'Syllabus'], time: 'O(1) average', best: 'O(1)', space: 'O(n + M)', viz: 'hash',
      idea: 'A hash function maps a key to a table slot, so a lookup goes straight to the right place instead of searching. When two keys map to the same slot (a collision) chaining keeps all of them in a linked list at that slot. The load factor α = n / M tells how long the chains are on average.',
      steps: ['index = key mod M.', 'Insert: add the key to the list at table[index] (skip if already present).', 'Search: walk the list at table[index].', 'Delete: unlink the key from that list.'],
      note: 'A good hash function spreads keys evenly. If all keys landed in one slot the table would degrade to a single list and operations would cost O(n). Linear probing is the alternative: on a collision try the next slot.',
      pseudo: ['hash(k) = k mod M', 'insert(k): i = hash(k); if k not in table[i]: append k to table[i]', 'search(k): i = hash(k); walk table[i] looking for k', 'delete(k): i = hash(k); remove k from table[i]'],
      expect: 'Slots:\n0:\n1: 8 22 15\n2:\n3: 10\n4: 11 25\n5:\n6:\nSearch 25: found\nSearch 18: not found\n',
      code: {
        c: R`#include <stdio.h>
#include <stdlib.h>
#define M 7

typedef struct Node { int key; struct Node *next; } Node;
Node *table[M];

void insert(int k) {
    int i = k % M;
    for (Node *p = table[i]; p; p = p->next) if (p->key == k) return;
    Node *n = malloc(sizeof(Node));
    n->key = k; n->next = table[i]; table[i] = n;     /* add at the head of the chain */
}

int search(int k) {
    for (Node *p = table[k % M]; p; p = p->next) if (p->key == k) return 1;
    return 0;
}

int main(void) {
    int keys[] = {15, 22, 8, 10, 25, 11};
    for (int i = 0; i < 6; i++) insert(keys[i]);

    printf("Slots:\n");
    for (int i = 0; i < M; i++) {
        printf("%d:", i);
        for (Node *p = table[i]; p; p = p->next) printf(" %d", p->key);
        printf("\n");
    }
    printf("Search 25: %s\n", search(25) ? "found" : "not found");
    printf("Search 18: %s\n", search(18) ? "found" : "not found");
    for (int i = 0; i < M; i++) while (table[i]) { Node *t = table[i]; table[i] = t->next; free(t); }
    return 0;
}
`,
        cpp: R`#include <iostream>
#include <list>
#include <vector>
#include <algorithm>
using namespace std;

const int M = 7;
vector<list<int>> table(M);

void insert(int k) {
    auto &chain = table[k % M];
    if (find(chain.begin(), chain.end(), k) == chain.end()) chain.push_front(k);   // head of the chain
}

bool search(int k) {
    auto &chain = table[k % M];
    return find(chain.begin(), chain.end(), k) != chain.end();
}

int main() {
    for (int k : {15, 22, 8, 10, 25, 11}) insert(k);

    cout << "Slots:\n";
    for (int i = 0; i < M; i++) {
        cout << i << ":";
        for (int k : table[i]) cout << " " << k;
        cout << "\n";
    }
    cout << "Search 25: " << (search(25) ? "found" : "not found") << "\n";
    cout << "Search 18: " << (search(18) ? "found" : "not found") << "\n";
    return 0;
}
`,
        java: R`import java.util.*;

class Main {
    static final int M = 7;
    @SuppressWarnings("unchecked")
    static LinkedList<Integer>[] table = new LinkedList[M];

    static void insert(int k) {
        int i = k % M;
        if (table[i] == null) table[i] = new LinkedList<>();
        if (!table[i].contains(k)) table[i].addFirst(k);          // head of the chain
    }

    static boolean search(int k) {
        return table[k % M] != null && table[k % M].contains(k);
    }

    public static void main(String[] args) {
        for (int k : new int[]{15, 22, 8, 10, 25, 11}) insert(k);

        System.out.println("Slots:");
        for (int i = 0; i < M; i++) {
            StringBuilder sb = new StringBuilder(i + ":");
            if (table[i] != null) for (int k : table[i]) sb.append(" ").append(k);
            System.out.println(sb);
        }
        System.out.println("Search 25: " + (search(25) ? "found" : "not found"));
        System.out.println("Search 18: " + (search(18) ? "found" : "not found"));
    }
}
`,
        py: R`M = 7
table = [[] for _ in range(M)]


def insert(k):
    chain = table[k % M]
    if k not in chain:
        chain.insert(0, k)               # head of the chain


def search(k):
    return k in table[k % M]


for k in (15, 22, 8, 10, 25, 11):
    insert(k)

print("Slots:")
for i, chain in enumerate(table):
    print(f"{i}:", *chain)
print("Search 25:", "found" if search(25) else "not found")
print("Search 18:", "found" if search(18) else "not found")
`,
      },
    },
  ];
})();
