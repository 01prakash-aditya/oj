import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { compileAndRun, aiCodeReview, chatBot } from '../services/api.js';
import { updateUserSuccess } from '../redux/user/userSlice.js';

export default function Compiler() {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestingAllCases, setIsTestingAllCases] = useState(false);
  const [isReviewingCode, setIsReviewingCode] = useState(false);
  const [aiReview, setAiReview] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('16px');
  const [language, setLanguage] = useState('cpp');
  const [statusMessage, setStatusMessage] = useState('');
  const [executionTime, setExecutionTime] = useState(null);
  const [memoryUsage, setMemoryUsage] = useState(null);
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [testCaseIndex, setTestCaseIndex] = useState(0);
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [chatPrompt, setChatPrompt] = useState('');
  const [reviewType, setReviewType] = useState('code');
  const location = useLocation();
  const API_URL = import.meta.env.VITE_URL || 'http://localhost:3000';

  const defaultCodeTemplates = {
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, AlgoU!" << endl;\n    return 0;\n}',
    java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, AlgoU!");\n    }\n}',
    python: 'print("Hello, AlgoU!")'
  };

  const [code, setCode] = useState(defaultCodeTemplates.cpp);

  const sampleProblems = [
    // sample
  ];

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    
    if (!selectedProblem) {
      setCode(defaultCodeTemplates[newLanguage]);
      setInput(''); 
    } else {
      const problemCode = selectedProblem.defaultCode && selectedProblem.defaultCode[newLanguage] 
        ? selectedProblem.defaultCode[newLanguage]
        : defaultCodeTemplates[newLanguage]; 
      
      setCode(problemCode);
      
      if (selectedProblem.testCases && selectedProblem.testCases.length > 0) {
        setInput(selectedProblem.testCases[testCaseIndex].input);
      }
    }
    
    setOutput('');
    setStatusMessage('');
    setAllTestsPassed(false);
  };

  useEffect(() => {
    const fetchSolvedProblems = async () => {
      if (currentUser) {
        try {
          const response = await fetch(`${API_URL}/api/user/solved-problems`, {
            credentials: 'include'
          });
          const data = await response.json();
          if (data.success) {
            setSolvedProblems(data.solvedProblems);
          }
        } catch (error) {
          console.error('Error fetching solved problems:', error);
        }
      }
    };

    fetchSolvedProblems();
  }, [currentUser]);

  useEffect(() => {
    const storedProblem = localStorage.getItem('selectedProblem');
    if (storedProblem) {
      try {
        const problem = JSON.parse(storedProblem);
        setSelectedProblem(problem);
        
        const problemCode = problem.defaultCode && problem.defaultCode[language] 
          ? problem.defaultCode[language]
          : defaultCodeTemplates[language];
        
        setCode(problemCode);
        
        if (problem.testCases && problem.testCases.length > 0) {
          setInput(problem.testCases[0].input);
          setTestCaseIndex(0);
        }
        setOutput('');
        setStatusMessage('');
        setAllTestsPassed(false);
        localStorage.removeItem('selectedProblem'); // Clean up
      } catch (error) {
        console.error("Error parsing problem from localStorage:", error);
      }
    }

    // Check for problem passed via URL parameters
    const urlParams = new URLSearchParams(location.search);
    const problemId = urlParams.get('problemId');
    if (problemId) {
      const problem = getProblemById(parseInt(problemId));
      if (problem) {
        loadProblem(problem);
      }
    }
  }, [location, language]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts);
    };
  }, [code]); 

  const handleKeyboardShortcuts = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleCompile();
    }
  };

  const loadProblem = (problem) => {
    setSelectedProblem(problem);
    
    // Always use problem's default code for the current language or fallback to basic template
    const problemCode = problem.defaultCode && problem.defaultCode[language] 
      ? problem.defaultCode[language]
      : defaultCodeTemplates[language];
    
    setCode(problemCode);
    
    if (problem.testCases && problem.testCases.length > 0) {
      setInput(problem.testCases[0].input);
      setTestCaseIndex(0);
    }
    setOutput('');
    setStatusMessage('');
    setAllTestsPassed(false); 
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      
      const indentation = language === 'python' ? '    ' : '    '; // 4 spaces for all languages
      const newCode = code.substring(0, start) + indentation + code.substring(end);
      setCode(newCode);
      
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + indentation.length;
      }, 0);
    }
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setStatusMessage('Compiling and executing...');
    setOutput('');
    
    try {
      const result = await compileAndRun(language, code, input);
      
      if (result.success === false) {
        console.log('Original error:', result.error);
        
        let errorMessage = result.error;

        if (errorMessage.includes('Command failed:')) {
          const firstNewlineIndex = errorMessage.indexOf('\n');
          if (firstNewlineIndex !== -1) {
            errorMessage = errorMessage.substring(firstNewlineIndex + 1).trim();
          }
        }
        
        console.log('Cleaned error:', errorMessage);
        
        if (!errorMessage || errorMessage.trim() === '') {
          errorMessage = result.error || 'Unknown compilation error';
        }
        
        setOutput(errorMessage);
        setStatusMessage('Compilation failed');
        setAllTestsPassed(false);
        return;
      }
      
      setOutput(result.output);
      
      if (selectedProblem && selectedProblem.testCases) {
        const expectedOutput = selectedProblem.testCases[testCaseIndex].expectedOutput.trim();
        const actualOutput = result.output.trim();
        
        if (actualOutput === expectedOutput) {
          setStatusMessage('Success: Correct output! Test case passed.');
        } else {
          setStatusMessage(`Test Failed: Expected "${expectedOutput}", Got "${actualOutput}"`);
          setAllTestsPassed(false);
        }
      } else {
        setStatusMessage('Success: Program executed successfully');
      }
      
    } catch (error) {
      setOutput(`Error: ${error.message}`);
      setStatusMessage('Compilation failed');
      setAllTestsPassed(false);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleAIReview = async () => {
    if (!code.trim()) {
      setStatusMessage('Please write some code before requesting a review');
      return;
    }

    setIsReviewingCode(true);
    setStatusMessage('Getting AI review...');

    try {
      const data = await aiCodeReview(language, code, input);

      if (data.review) {
        setAiReview(data.review);
        setStatusMessage('AI review completed successfully');
        setShowReviewModal(true);
      } else {
        setStatusMessage('AI review failed: No review returned');
      }
    } catch (error) {
      setStatusMessage(`AI review error: ${error.message}`);
      console.error('AI Review Error:', error);
    } finally {
      setIsReviewingCode(false);
    }
  };

  const handleChatBot = async () => {
    if (!chatPrompt.trim()) {
      setStatusMessage('Please enter a message for the chat bot');
      return;
    }

    setIsChatting(true);
    setStatusMessage('Getting AI response...');

    try {
      const data = await chatBot(chatPrompt);
      
      if (data.response) {
        setStatusMessage('Chat response received');
        setChatPrompt('');
        setAiReview(data.response);
      } else {
        setStatusMessage('Chat failed: No response returned');
      }
    } catch (error) {
      setStatusMessage(`Chat error: ${error.message}`);
      console.error('Chat Bot Error:', error);
    } finally {
      setIsChatting(false);
    }
  };


  const handleTestAllCases = async () => {
    if (!selectedProblem || !selectedProblem.testCases || selectedProblem.testCases.length === 0) {
      return;
    }

    setIsTestingAllCases(true);
    setStatusMessage('Running all test cases...');
    setOutput('');

    let results = [];
    let allPassed = true;

    for (let i = 0; i < selectedProblem.testCases.length; i++) {
      const testCase = selectedProblem.testCases[i];
      
      try {
        const result = await compileAndRun(language, code, testCase.input);
        let passed = false;
        let output = '';

        if (result.success !== false) {
          output = result.output ? result.output.trim() : '';
          passed = output === testCase.expectedOutput.trim();
        } else {
          output = `Error: ${result.error}`;
          passed = false;
        }

        results.push({ testCase, output, passed });
        if (!passed) allPassed = false;
      } catch (error) {
        results.push({ 
          testCase, 
          output: `Error: ${error.message}`, 
          passed: false 
        });
        allPassed = false;
      }
    }

    setIsTestingAllCases(false);
    setAllTestsPassed(allPassed);
    
    const resultsOutput = results.map((result, idx) => {
      return `Test Case ${idx + 1}: ${result.passed ? 'PASSED ✓' : 'FAILED ✗'}\n` +
             `Input: ${result.testCase.input || '(empty)'}\n` +
             `Expected: ${result.testCase.expectedOutput}\n` + 
             `Got: ${result.output}\n${'-'.repeat(40)}`;
    }).join('\n');
    
    setOutput(`${resultsOutput}\n\nSummary: ${results.filter(r => r.passed).length}/${results.length} test cases passed.`);
    setStatusMessage(allPassed ? 'Success: All test cases passed! Ready to submit.' : 'Warning: Some test cases failed');
  };

  const handleSubmitSolution = async () => {
    if (!currentUser) {
      setStatusMessage('Please sign in to submit your solution');
      return;
    }

    if (!selectedProblem) {
      setStatusMessage('No problem selected to submit');
      return;
    }

    const isProblemSolved = solvedProblems.includes(selectedProblem.id);
    if (isProblemSolved) {
      setStatusMessage('You have already solved this problem!');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage('Submitting solution...');
    
    try {
      const response = await fetch(`${API_URL}/api/user/submit-solution`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          problemId: selectedProblem.id
        })
      });

      const data = await response.json();
      
      if (data.success) {
        dispatch(updateUserSuccess(data.user));
        
        setSolvedProblems(prev => [...prev, selectedProblem.id]);
        
        setStatusMessage(`🎉 Solution submitted successfully! Rating increased by ${data.ratingGained} points!`);
        setOutput(`All test cases passed! ✅\n\nCongratulations! You've successfully solved "${selectedProblem.title}"\nRating gained: +${data.ratingGained} points\nTotal problems solved: ${data.user.questionCount}`);
        
        setAllTestsPassed(false);
      } else {
        setStatusMessage(data.message || 'Submission failed');
      }

    } catch (error) {
      setStatusMessage(`Submission error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestCaseChange = (index) => {
    if (selectedProblem && selectedProblem.testCases && selectedProblem.testCases[index]) {
      setTestCaseIndex(index);
      setInput(selectedProblem.testCases[index].input);
      setOutput('');
      setAllTestsPassed(false);
    }
  };

  const getProblemById = (id) => {
    const idNumber = parseInt(id);
    return sampleProblems.find(p => p.id === idNumber) || null;
  };

  const isProblemSolved = selectedProblem && solvedProblems.includes(selectedProblem.id);

  useEffect(() => {
    setAllTestsPassed(false);
  }, [code]);

  // Function to format AI review text with proper headings
  const formatAIReview = (reviewText) => {
    if (!reviewText) return '';
    
    return reviewText
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  };

  // Get language-specific syntax highlighting class
  const getLanguageClass = () => {
    switch(language) {
      case 'java': return 'language-java';
      case 'python': return 'language-python';
      case 'cpp':
      default: return 'language-cpp';
    }
  };

  return (
    <div className="p-3 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-center my-5">Online Compiler</h1>
      
      {/* Problem selection & controls */}
      <div className="bg-blue-100 rounded-lg p-4 shadow-sm mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">Language</label>
              <select
                id="language"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-2 w-full md:w-40"
              >
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="python">Python</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
              <select
                id="theme"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-2 w-full md:w-40"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="fontSize" className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
              <select
                id="fontSize"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                className="bg-white border border-gray-300 rounded-md p-2 w-full md:w-40"
              >
                <option value="14px">Small</option>
                <option value="16px">Medium</option>
                <option value="18px">Large</option>
              </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="problem" className="block text-sm font-medium text-gray-700 mb-1">Problem</label>
            <select
              id="problem"
              onChange={(e) => {
                const id = parseInt(e.target.value);
                if (id === 0) {
                  setSelectedProblem(null);
                  setCode(defaultCodeTemplates[language]);
                  setInput('');
                  setAllTestsPassed(false);
                } else {
                  const problem = getProblemById(id);
                  if (problem) loadProblem(problem);
                }
              }}
              value={selectedProblem ? selectedProblem.id : "0"}
              className="bg-white border border-gray-300 rounded-md p-2 w-full md:w-60"
            >
              <option value="0">Free Coding (No Problem)</option>
              {/* Show the selected problem in the dropdown */}
              {selectedProblem && (
                <option key={selectedProblem.id} value={selectedProblem.id}>
                  {selectedProblem.title}
                </option>
              )}
              {/* Show all available problems */}
              {sampleProblems.map(problem => (
                problem.id !== selectedProblem?.id && (
                  <option key={problem.id} value={problem.id}>
                    {problem.title}
                  </option>
                )
              ))}
            </select>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCompile}
            disabled={isCompiling || isTestingAllCases || isSubmitting || isReviewingCode}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {isCompiling ? 'Compiling...' : 'Run Code (Ctrl+Enter)'}
          </button>

          <button
            onClick={handleAIReview}
            disabled={isCompiling || isTestingAllCases || isSubmitting || isReviewingCode}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isReviewingCode ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reviewing...
              </>
            ) : (
              <>
                🤖 AI Review
              </>
            )}
          </button>

          {selectedProblem && selectedProblem.testCases && (
            <>
              {!allTestsPassed ? (
                <button
                  onClick={handleTestAllCases}
                  disabled={isCompiling || isTestingAllCases || isSubmitting || isReviewingCode}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  {isTestingAllCases ? 'Testing All Cases...' : 'Test All Cases'}
                </button>
              ) : (
                <button
                  onClick={handleSubmitSolution}
                  disabled={isCompiling || isTestingAllCases || isSubmitting || isProblemSolved || isReviewingCode}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isProblemSolved 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : isProblemSolved ? 'Already Solved' : 'Submit Solution'}
                </button>
              )}
            </>
          )}
        </div>

        {/* Language indicator */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">Current Language:</span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            language === 'cpp' ? 'bg-blue-100 text-blue-800' :
            language === 'java' ? 'bg-orange-100 text-orange-800' :
            'bg-green-100 text-green-800'
          }`}>
            {language === 'cpp' ? 'C++' : language === 'java' ? 'Java' : 'Python'}
          </span>
        </div>

        {/* Status message */}
        {statusMessage && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${
            statusMessage.includes('Success') || statusMessage.includes('🎉') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : statusMessage.includes('Warning') || statusMessage.includes('Failed')
              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
              : statusMessage.includes('Error') || statusMessage.includes('Compilation failed')
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {statusMessage}
          </div>
        )}
      </div>

      {/* Problem Description */}
      {selectedProblem && (
        <div className={`rounded-lg shadow-sm border p-6 mb-6 ${
          isProblemSolved 
            ? 'bg-green-50 border-green-200' 
            : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className={`text-2xl font-bold ${
                isProblemSolved ? 'text-green-800' : 'text-gray-800'
              }`}>{selectedProblem.title}</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedProblem.difficulty === 'easy' ? 'bg-green-500 text-white' :
                selectedProblem.difficulty === 'moderate' ? 'bg-yellow-500 text-white' :
                selectedProblem.difficulty === 'difficult' ? 'bg-red-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {selectedProblem.difficulty}
              </span>
              <span className={`text-sm ${
                isProblemSolved ? 'text-green-700' : 'text-gray-600'
              }`}>Rating: {selectedProblem.rating}</span>
            </div>
            {isProblemSolved && (
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                ✓ Solved
              </span>
            )}
          </div>
          
          <div className="prose max-w-none mb-6">
            <p className={`leading-relaxed ${
              isProblemSolved ? 'text-green-800' : 'text-gray-700'
            }`}>{selectedProblem.description}</p>
            
          </div>
        </div>
      )}

      {/* Code Editor and Input/Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Code Editor */}
        <div className="bg-white rounded-lg shadow-sm ">
          <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg">
            <h3 className="font-semibold text-gray-800">Code Editor</h3>
          </div>
          <div className="p-4">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`w-full h-96 p-4 rounded-lg font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                theme === 'dark' 
                  ? 'bg-gray-900 text-green-400 border-gray-700' 
                  : 'bg-white text-gray-900'
              }`}
              style={{ fontSize }}
              placeholder="Write your code here..."
              spellCheck="false"
            />
          </div>
        </div>

        {/* Input/Output */}
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Input</h3>
              {selectedProblem && selectedProblem.testCases && selectedProblem.testCases.length > 1 && (
                <select
                  value={testCaseIndex}
                  onChange={(e) => handleTestCaseChange(parseInt(e.target.value))}
                  className="text-sm bg-white border border-gray-300 rounded px-2 py-1"
                >
                  {selectedProblem.testCases.map((_, idx) => (
                    <option key={idx} value={idx}>Test Case {idx + 1}</option>
                  ))}
                </select>
              )}
            </div>
            <div className="p-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter input here..."
                disabled={selectedProblem && selectedProblem.testCases}
              />
              {selectedProblem && selectedProblem.testCases && (
                <p className="text-sm text-gray-500 mt-2">
                  Input is automatically set from test case
                </p>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="bg-gray-50 px-4 py-3 border-b rounded-t-lg">
              <h3 className="font-semibold text-gray-800">Output</h3>
            </div>
            <div className="p-4">
              <pre className="w-full h-32 p-3 bg-gray-50 border border-gray-300 rounded-lg font-mono text-sm overflow-auto whitespace-pre-wrap">
                {output || 'Output will appear here...'}
              </pre>
              
              {/* Expected Output for Problems */}
              {selectedProblem && selectedProblem.testCases && selectedProblem.testCases[testCaseIndex] && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">Expected Output:</h4>
                  <pre className="text-sm font-mono text-blue-700">
                    {selectedProblem.testCases[testCaseIndex].expectedOutput}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {(executionTime !== null || memoryUsage !== null) && (
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Performance Metrics</h3>
          <div className="flex gap-6">
            {executionTime !== null && (
              <div className="text-sm">
                <span className="text-gray-600">Execution Time:</span>
                <span className="font-mono ml-2 text-blue-600">{executionTime}ms</span>
              </div>
            )}
            {memoryUsage !== null && (
              <div className="text-sm">
                <span className="text-gray-600">Memory Usage:</span>
                <span className="font-mono ml-2 text-green-600">{memoryUsage}KB</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AI Review Section */}
      {aiReview && (
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="bg-indigo-50 px-4 py-3 border-b rounded-t-lg flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <h3 className="font-semibold text-indigo-800">AI Code Review</h3>
            <button
              onClick={() => setAiReview('')}
              className="ml-auto text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              Clear Review
            </button>
          </div>
          <div className="p-6">
            <div 
              className="prose max-w-none text-sm text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: formatAIReview(aiReview)
              }}
            />
          </div>
        </div>
      )}

      {/* Chat Bot Section */}
      <div className="bg-white rounded-lg shadow-sm border mb-6">
        <div className="bg-emerald-50 px-4 py-3 border-b rounded-t-lg flex items-center gap-2">
          <span className="text-xl">💬</span>
          <h3 className="font-semibold text-emerald-800">AI Chat Assistant</h3>
        </div>
        <div className="p-6">
          <div className="mb-4">
            <label htmlFor="chatPrompt" className="block text-sm font-medium text-gray-700 mb-2">
              Ask AI anything about coding, algorithms, or get help with your solution:
            </label>
            <textarea
              id="chatPrompt"
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              placeholder="e.g., 'Explain how binary search works', 'Help me optimize this code', 'What's the time complexity of my solution?'"
              disabled={isChatting}
            />
          </div>
          
          <button
            onClick={handleChatBot}
            disabled={isChatting || !chatPrompt.trim()}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {isChatting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Getting Response...
              </>
            ) : (
              <>
                <span>💬</span>
                Send Message
              </>
            )}
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Keyboard Shortcuts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Run Code:</span>
            <kbd className="bg-white px-2 py-1 rounded border text-xs font-mono">Ctrl + Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tab in Editor:</span>
            <kbd className="bg-white px-2 py-1 rounded border text-xs font-mono">Tab</kbd>
          </div>
        </div>
      </div>
    </div>
  );
}