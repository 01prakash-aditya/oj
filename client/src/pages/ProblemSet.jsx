import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProblemSet() {
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const API_URL = import.meta.env.VITE_URL || 'http://localhost:3000';

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
    const fetchProblems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/problems/approved`);
        const data = await response.json();
        
        if (data.success) {
          setProblems(data.problems);
        } else {
          setError('Failed to fetch problems');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching problems:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  useEffect(() => {
    let filtered = [...problems];
    
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(problem => problem.difficulty === filterDifficulty);
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(problem => 
        problem.title.toLowerCase().includes(query) || 
        problem.description.toLowerCase().includes(query) ||
        problem.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredProblems(filtered);
  }, [problems, filterDifficulty, searchQuery]);

  const handleProblemClick = (problem) => {
    const problemData = {
      id: problem._id,
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      rating: problem.rating,
      tags: problem.tags,
      defaultCode: problem.defaultCode,
      testCases: problem.testCases
    };
    
    localStorage.setItem('selectedProblem', JSON.stringify(problemData));
    navigate('/compiler');
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'moderate':
        return 'text-yellow-600 bg-yellow-100';
      case 'difficult':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyCount = (difficulty) => {
    return problems.filter(p => p.difficulty === difficulty).length;
  };

  const isProblemSolved = (problemId) => {
    return solvedProblems.includes(problemId);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading problems...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Problems</div>
          <div className="text-red-500">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">Problem Set</h1>
      
      {/* Filters and Search */}
      <div className="bg-blue-100 p-4 rounded-lg mb-6 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setFilterDifficulty('all')}
              className={`px-4 py-2 rounded-md ${filterDifficulty === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            >
              All ({problems.length})
            </button>
            <button 
              onClick={() => setFilterDifficulty('easy')}
              className={`px-4 py-2 rounded-md ${filterDifficulty === 'easy' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
            >
              Easy ({getDifficultyCount('easy')})
            </button>
            <button 
              onClick={() => setFilterDifficulty('moderate')}
              className={`px-4 py-2 rounded-md ${filterDifficulty === 'moderate' ? 'bg-yellow-600 text-white' : 'bg-gray-200'}`}
            >
              Moderate ({getDifficultyCount('moderate')})
            </button>
            <button 
              onClick={() => setFilterDifficulty('difficult')}
              className={`px-4 py-2 rounded-md ${filterDifficulty === 'difficult' ? 'bg-red-600 text-white' : 'bg-gray-200'}`}
            >
              Difficult ({getDifficultyCount('difficult')})
            </button>
          </div>
          
          <div className="w-full md:w-64">
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Problems Table with Responsive Width */}
<div className="bg-white rounded-lg shadow overflow-hidden">
  {/* Mobile scroll hint */}
  <div className="sm:hidden bg-gray-50 px-4 py-2 text-xs text-gray-600 border-b">
    ← Swipe left to see more columns
  </div>
  
  {/* Scrollable table container - only scroll on mobile/tablet */}
  <div className="overflow-x-auto lg:overflow-x-visible">
    <table className="w-full divide-y divide-gray-200 lg:min-w-0" style={{ minWidth: '700px' }}>
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-16">#</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap lg:w-auto">Title</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-24">Difficulty</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-20">Rating</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-24">Action</th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {filteredProblems.map((problem, index) => (
          <tr 
            key={problem._id} 
            className={`hover:bg-gray-50 ${isProblemSolved(problem._id) ? 'bg-green-50' : ''}`}
          >
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 w-16">
              <div className="flex items-center gap-2">
                {index + 1}
                {isProblemSolved(problem._id) && (
                  <span className="text-green-600 text-lg">✓</span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500 lg:w-auto" style={{ minWidth: '300px' }}>
              <div className="flex items-center gap-2 mb-1">
                <div className="font-medium text-gray-900">{problem.title}</div>
                {isProblemSolved(problem._id) && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                    Solved
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {problem.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
                    {tag}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm w-24">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(problem.difficulty)} whitespace-nowrap`}>
                {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-20">{problem.rating}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-24">
              <button
                onClick={() => handleProblemClick(problem)}
                className={`px-3 py-1 rounded-md whitespace-nowrap ${
                  isProblemSolved(problem._id)
                    ? 'text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100'
                    : 'text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100'
                }`}
              >
                {isProblemSolved(problem._id) ? 'Review' : 'Solve'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

{filteredProblems.length === 0 && !loading && (
  <div className="text-center p-8 text-gray-500">
    {problems.length === 0 
      ? "No problems available yet. Check back later!" 
      : "No problems match your filters. Try adjusting your search criteria."
    }
  </div>
)}
      
      {/* Featured Problem Section */}
      {filteredProblems.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">Featured Problem</h2>
          
          <div className={`p-5 rounded-lg shadow ${isProblemSolved(filteredProblems[0]._id) ? 'bg-green-50 border border-green-200' : 'bg-white'}`}>
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">{filteredProblems[0].title}</h3>
                  {isProblemSolved(filteredProblems[0]._id) && (
                    <span className="text-green-600 text-xl">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getDifficultyColor(filteredProblems[0].difficulty)}`}>
                    {filteredProblems[0].difficulty.charAt(0).toUpperCase() + filteredProblems[0].difficulty.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">Rating: {filteredProblems[0].rating}</span>
                  {isProblemSolved(filteredProblems[0]._id) && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                      Solved
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleProblemClick(filteredProblems[0])}
                className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                  isProblemSolved(filteredProblems[0]._id)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isProblemSolved(filteredProblems[0]._id) ? 'Review This Problem' : 'Solve This Problem'}
              </button>
            </div>
            
            <div className="prose max-w-none">
              <p className="mb-4">{filteredProblems[0].description}</p>
              
              {filteredProblems[0].testCases && filteredProblems[0].testCases.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-lg font-medium mb-2">Example Test Cases:</h4>
                  <div className="grid gap-4 mb-4">
                    {filteredProblems[0].testCases.slice(0, 2).map((testCase, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Input:</p>
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            {testCase.input || '(Empty)'}
                          </pre>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Expected Output:</p>
                          <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                            {testCase.expectedOutput}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}