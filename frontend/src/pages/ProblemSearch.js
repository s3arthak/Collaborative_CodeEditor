import React, { useState } from "react";
import "../ProblemSearch.css"; // Make sure your CSS is linked
const sampleProblems = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: "Find two numbers that add up to the target.",
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    example: "Because nums[0] + nums[1] == 9, return [0, 1].",
  },
  {
    id: 2,
    title: "Reverse Integer",
    difficulty: "Easy",
    description: "Reverse digits of a 32-bit signed integer.",
    input: "x = 123",
    output: "321",
    example: "Input: -123 → Output: -321",
  },
  {
    id: 3,
    title: "Palindrome Number",
    difficulty: "Easy",
    description: "Check if a number is a palindrome.",
    input: "x = 121",
    output: "true",
    example: "121 reads the same forward and backward.",
  },
  {
    id: 4,
    title: "Roman to Integer",
    difficulty: "Easy",
    description: "Convert a Roman numeral to an integer.",
    input: "s = 'III'",
    output: "3",
    example: "'IX' → 9",
  },
  {
    id: 5,
    title: "Valid Parentheses",
    difficulty: "Easy",
    description: "Check if the input string has valid brackets.",
    input: "s = '()[]{}'",
    output: "true",
    example: "All brackets are closed properly.",
  },
  {
    id: 6,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    description: "Merge two sorted linked lists into one.",
    input: "l1 = [1,2,4], l2 = [1,3,4]",
    output: "[1,1,2,3,4,4]",
    example: "Return merged list in sorted order.",
  },
  {
    id: 7,
    title: "Remove Duplicates from Array",
    difficulty: "Easy",
    description: "Remove duplicate values in-place from sorted array.",
    input: "nums = [1,1,2]",
    output: "2",
    example: "Array becomes [1,2,_]",
  },
  {
    id: 8,
    title: "Remove Element",
    difficulty: "Easy",
    description: "Remove all instances of a value in-place.",
    input: "nums = [3,2,2,3], val = 3",
    output: "2",
    example: "Array becomes [2,2,_,_]",
  },
  {
    id: 9,
    title: "Find Index of First Occurrence",
    difficulty: "Easy",
    description: "Find first index of needle in haystack.",
    input: "haystack = 'hello', needle = 'll'",
    output: "2",
    example: "'ll' starts at index 2",
  },
  {
    id: 10,
    title: "Length of Last Word",
    difficulty: "Easy",
    description: "Return the length of the last word in a string.",
    input: "s = 'Hello World'",
    output: "5",
    example: "'World' is the last word.",
  },
  {
    id: 11,
    title: "Plus One",
    difficulty: "Easy",
    description: "Add one to a number represented as an array.",
    input: "digits = [1,2,3]",
    output: "[1,2,4]",
    example: "123 + 1 = 124",
  },
  {
    id: 12,
    title: "Add Binary",
    difficulty: "Easy",
    description: "Add two binary strings and return result.",
    input: "a = '11', b = '1'",
    output: "'100'",
    example: "11 (3) + 1 = 100",
  },
  {
    id: 13,
    title: "Climb Stairs",
    difficulty: "Easy",
    description: "Ways to climb `n` steps, 1 or 2 at a time.",
    input: "n = 3",
    output: "3",
    example: "[1+1+1], [1+2], [2+1]",
  },
  {
    id: 14,
    title: "Maximum Subarray",
    difficulty: "Easy",
    description: "Find the subarray with the maximum sum.",
    input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
    output: "6",
    example: "Subarray [4,-1,2,1] has max sum.",
  }
]

const ProblemSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState(null);

  const handleSearch = () => {
    const lower = query.toLowerCase();
    const filtered = sampleProblems.filter((p) =>
      p.title.toLowerCase().includes(lower)
    );
    setResults(filtered);
    setSelectedProblem(null);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="problem-search-container">
      <input
        type="text"
        className="inputField"
        placeholder="Search problems (e.g., Two Sum)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyUp={handleKeyPress}
      />
      <button className="btn searchBtn" onClick={handleSearch}>
        🔍 Search
      </button>

      <div className="problem-results">
        {results.map((p) => (
          <div
            className="problem-card"
            key={p.id}
            onClick={() => setSelectedProblem(p)}
            style={{ cursor: "pointer" }}
          >
            <h4>
              {p.title}
              <span
                style={{
                  backgroundColor:
                    p.difficulty === "Easy"
                      ? "#81c784"
                      : p.difficulty === "Medium"
                      ? "#ffb74d"
                      : "#e57373",
                  color: "#1e1e2f",
                  padding: "2px 8px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  marginLeft: "8px",
                  fontSize: "13px",
                }}
              >
                {p.difficulty}
              </span>
            </h4>
          </div>
        ))}
      </div>

      {selectedProblem && (
        <div className="problem-full-view">
          <h2>{selectedProblem.title}</h2>
          <p>
            <strong>Difficulty:</strong> {selectedProblem.difficulty}
          </p>
          <p>
            <strong>Description:</strong> {selectedProblem.description}
          </p>
          <p>
            <strong>Input:</strong> {selectedProblem.input}
          </p>
          <p>
            <strong>Output:</strong> {selectedProblem.output}
          </p>
          <p>
            <strong>Example:</strong> {selectedProblem.example}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProblemSearch;