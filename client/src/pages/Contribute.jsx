import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Trash2, Edit3, Check, X, Plus, Eye, RefreshCw } from 'lucide-react';

export default function ContributePage() {
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('create');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [allProblems, setAllProblems] = useState([]);
  const [editingProblem, setEditingProblem] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const API_URL = import.meta.env.VITE_URL || 'http://localhost:3000';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'easy',
    rating: 50,
    tags: '',
    defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
    testCases: [{ input: '', expectedOutput: '' }]
  });

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      fetchAllProblems();
    }
  }, [currentUser]);

  useEffect(() => {
    if (activeTab === 'manage' && currentUser?.role === 'admin') {
      fetchAllProblems();
    }
  }, [activeTab, currentUser]);

  const fetchAllProblems = async () => {
    setFetchLoading(true);
    setMessage({ type: '', text: '' }); 
    
    try {
      console.log('Fetching all problems...');
      console.log('Current user:', currentUser);
      console.log('User role:', currentUser?.role);
      
      const res = await fetch(`${API_URL}/api/problems/all`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.token && { 'Authorization': `Bearer ${currentUser.token}` })
        }
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', res.headers);
      
      if (res.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }
      
      if (res.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
      }
      
      const data = await res.json();
      console.log('Fetched data:', data);
      
      if (data.success) {
        setAllProblems(data.problems || []);
        setDebugInfo(data.debug);
        console.log('Problems set:', (data.problems || []).length);
        
        (data.problems || []).forEach((problem, index) => {
          console.log(`Problem ${index + 1}:`, {
            id: problem._id,
            title: problem.title,
            isApproved: problem.isApproved,
            createdBy: problem.createdBy?.username
          });
        });
      } else {
        console.error('Failed to fetch problems:', data.message);
        setMessage({ type: 'error', text: data.message || 'Failed to fetch problems' });
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
      
      let errorMessage = 'Error fetching problems: ';
      if (error.message.includes('403') || error.message.includes('Access denied')) {
        errorMessage += 'Access denied. Please ensure you have admin privileges and are properly authenticated.';
      } else if (error.message.includes('401') || error.message.includes('Authentication failed')) {
        errorMessage += 'Authentication failed. Please log out and log in again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage += 'Network error. Please check your connection and try again.';
      } else {
        errorMessage += error.message;
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setFetchLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTestCaseChange = (index, field, value) => {
    const updatedTestCases = [...formData.testCases];
    updatedTestCases[index][field] = value;
    setFormData(prev => ({
      ...prev,
      testCases: updatedTestCases
    }));
  };

  const addTestCase = () => {
    setFormData(prev => ({
      ...prev,
      testCases: [...prev.testCases, { input: '', expectedOutput: '' }]
    }));
  };

  const removeTestCase = (index) => {
    if (formData.testCases.length > 1) {
      const updatedTestCases = formData.testCases.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        testCases: updatedTestCases
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'easy',
      rating: 50,
      tags: '',
      defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
      testCases: [{ input: '', expectedOutput: '' }]
    });
    setEditingProblem(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const submitData = {
        ...formData,
        tags: tagsArray,
        rating: parseInt(formData.rating)
      };

      const url = editingProblem ? `${API_URL}/api/problems/update/${editingProblem._id}` : `${API_URL}/api/problems/create`;
      const method = editingProblem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          // Add explicit authorization header if available
          ...(currentUser?.token && { 'Authorization': `Bearer ${currentUser.token}` })
        },
        credentials: 'include',
        body: JSON.stringify(submitData)
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        resetForm();
        if (currentUser.role === 'admin') {
          fetchAllProblems();
        }
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (problem) => {
    setFormData({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      rating: problem.rating,
      tags: problem.tags.join(', '),
      defaultCode: problem.defaultCode,
      testCases: problem.testCases
    });
    setEditingProblem(problem);
    setActiveTab('create');
  };

  const handleDelete = async (problemId) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      const res = await fetch(`${API_URL}/api/problems/delete/${problemId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.token && { 'Authorization': `Bearer ${currentUser.token}` })
        }
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Problem deleted successfully' });
        fetchAllProblems();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: 'Error deleting problem' });
    }
  };

  const handleApprove = async (problemId) => {
    try {
      const res = await fetch(`${API_URL}/api/problems/approve/${problemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(currentUser?.token && { 'Authorization': `Bearer ${currentUser.token}` })
        }
      });

      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Problem approved successfully' });
        fetchAllProblems();
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      console.error('Approve error:', error);
      setMessage({ type: 'error', text: 'Error approving problem' });
    }
  };

  const handleRefreshProblems = () => {
    fetchAllProblems();
  };

  if (!currentUser) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Contribute Problems</h1>
        <p className="text-gray-600">Please sign in to contribute problems to our platform.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Contribute Problems</h1>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => setActiveTab('create')}
          className={`px-6 py-3 ${activeTab === 'create' 
            ? 'border-b-2 border-blue-600 text-blue-600' 
            : 'text-gray-600 hover:text-gray-800'}`}
        >
          {editingProblem ? 'Edit Problem' : 'Create Problem'}
        </button>
        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-6 py-3 ${activeTab === 'manage' 
              ? 'border-b-2 border-blue-600 text-blue-600' 
              : 'text-gray-600 hover:text-gray-800'}`}
          >
            Manage Problems
          </button>
        )}
      </div>

      {/* Success/Error Message */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Debug Info for Admin */}
      {currentUser?.role === 'admin' && debugInfo && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-medium text-blue-800 mb-2">Debug Information:</h3>
          <div className="text-sm text-blue-700">
            <p>Total problems in database: {debugInfo.total}</p>
            <p>Pending problems: {debugInfo.pending}</p>
            <p>Approved problems: {debugInfo.approved}</p>
            <p>Problems fetched: {debugInfo.fetched}</p>
          </div>
        </div>
      )}

      {/* Create/Edit Problem Tab */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Two Sum"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty *
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-200) *
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="200"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated) *
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., arrays, hash-table, two-pointers"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Problem Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows="6"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the problem statement, constraints, and any examples..."
              />
            </div>

            {/* Default Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Code Template *
              </label>
              <textarea
                name="defaultCode"
                value={formData.defaultCode}
                onChange={handleInputChange}
                required
                rows="10"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="Provide the default code template for users to start with..."
              />
            </div>

            {/* Test Cases */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Test Cases *
                </label>
                <button
                  type="button"
                  onClick={addTestCase}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Add Test Case
                </button>
              </div>
              
              {formData.testCases.map((testCase, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Test Case {index + 1}</h4>
                    {formData.testCases.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Input
                      </label>
                      <textarea
                        value={testCase.input}
                        onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                        rows="3"
                        className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
                        placeholder="Input for this test case..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expected Output *
                      </label>
                      <textarea
                        value={testCase.expectedOutput}
                        onChange={(e) => handleTestCaseChange(index, 'expectedOutput', e.target.value)}
                        rows="3"
                        required
                        className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm"
                        placeholder="Expected output for this test case..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Submitting...' : (editingProblem ? 'Update Problem' : 'Submit Problem')}
              </button>
              
              {editingProblem && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Admin Manage Problems Tab */}
      {activeTab === 'manage' && currentUser?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Add refresh button */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">All Problems</h2>
            <div className="flex gap-2">
              <button
                onClick={handleRefreshProblems}
                disabled={fetchLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
              >
                {fetchLoading ? 'Loading...' : 'Refresh List'}
              </button>
            </div>
          </div>
          
          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading problems...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Difficulty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {allProblems.map((problem) => (
                    <tr key={problem._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{problem.title}</div>
                        <div className="text-sm text-gray-500">Rating: {problem.rating}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          problem.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                          problem.difficulty === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          problem.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {problem.isApproved ? 'Approved' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {problem.createdBy?.username || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(problem)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Edit Problem"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {!problem.isApproved && (
                            <button
                              onClick={() => handleApprove(problem._id)}
                              className="text-green-600 hover:text-green-900"
                              title="Approve Problem"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDelete(problem._id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Problem"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!fetchLoading && allProblems.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No problems found. Start by creating your first problem!
            </div>
          )}
        </div>
      )}
    </div>
  );
}