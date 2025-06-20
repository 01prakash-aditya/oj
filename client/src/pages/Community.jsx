import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function Community() {
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_URL = import.meta.env.VITE_URL || 'http://localhost:3000';

  // Discussion form state
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    content: '',
    problemId: '',
    tags: []
  });
  const [showNewDiscussionForm, setShowNewDiscussionForm] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  // Edit discussion state
  const [editingDiscussion, setEditingDiscussion] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    content: '',
    problemId: '',
    tags: []
  });
  const [editTagInput, setEditTagInput] = useState('');
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`${API_URL}/api/user/leaderboard`);
        const data = await response.json();
        if (data.success) {
          setLeaderboard(data.leaderboard);
        } else {
          setError('Failed to fetch leaderboard');
        }
      } catch (err) {
        setError('Error connecting to server');
        console.error('Error fetching leaderboard:', err);
      }
    };

    fetchLeaderboard();
  }, []);

  // Fetch discussions
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await fetch(`${API_URL}/api/community/discussions`);
        const data = await response.json();
        if (data.success) {
          setDiscussions(data.discussions);
        }
      } catch (err) {
        console.error('Error fetching discussions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  // Search discussions
  const handleSearch = async (query) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`${API_URL}/api/community/discussions/search/${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSearchResults(data.discussions);
      }
    } catch (err) {
      console.error('Error searching discussions:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !newDiscussion.tags.includes(tagInput.trim())) {
      setNewDiscussion({
        ...newDiscussion,
        tags: [...newDiscussion.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setNewDiscussion({
      ...newDiscussion,
      tags: newDiscussion.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddEditTag = () => {
    if (editTagInput.trim() && !editForm.tags.includes(editTagInput.trim())) {
      setEditForm({
        ...editForm,
        tags: [...editForm.tags, editTagInput.trim()]
      });
      setEditTagInput('');
    }
  };

  const handleRemoveEditTag = (tagToRemove) => {
    setEditForm({
      ...editForm,
      tags: editForm.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleSubmitDiscussion = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert('Please sign in to post a discussion');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/community/discussions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newDiscussion)
      });

      const data = await response.json();
      if (data.success) {
        setDiscussions([data.discussion, ...discussions]);
        setNewDiscussion({ title: '', content: '', problemId: '', tags: [] });
        setShowNewDiscussionForm(false);
        alert('Discussion posted successfully!');
      } else {
        alert(data.message || 'Failed to post discussion');
      }
    } catch (err) {
      console.error('Error posting discussion:', err);
      alert('Error posting discussion');
    }
  };

  const handleEditDiscussion = (discussion) => {
    setEditingDiscussion(discussion._id);
    setEditForm({
      title: discussion.title,
      content: discussion.content,
      problemId: discussion.problemId || '',
      tags: [...discussion.tags]
    });
  };

  const handleUpdateDiscussion = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/community/discussions/${editingDiscussion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      const data = await response.json();
      if (data.success) {
        setDiscussions(discussions.map(d => 
          d._id === editingDiscussion ? data.discussion : d
        ));
        setEditingDiscussion(null);
        setEditForm({ title: '', content: '', problemId: '', tags: [] });
        alert('Discussion updated successfully!');
      } else {
        alert(data.message || 'Failed to update discussion');
      }
    } catch (err) {
      console.error('Error updating discussion:', err);
      alert('Error updating discussion');
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this discussion? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/community/discussions/${discussionId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();
      if (data.success) {
        setDiscussions(discussions.filter(d => d._id !== discussionId));
        alert('Discussion deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete discussion');
      }
    } catch (err) {
      console.error('Error deleting discussion:', err);
      alert('Error deleting discussion');
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const displayedDiscussions = searchQuery.trim() && searchQuery.length >= 2 ? searchResults : discussions;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600">Loading community...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-slate-800">Community</h1>
      
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-6 py-2 rounded-md transition-colors ${
              activeTab === 'discussions'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:text-blue-600'
            }`}
          >
            Discussions
          </button>
        </div>
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-blue-200 p-6 text-slate-800">
            <h2 className="text-2xl font-bold mb-2">🏆 Global Leaderboard</h2>
            <p className="opacity-90">Top performers based on problem-solving ratings</p>
          </div>
          
          {error ? (
            <div className="p-6 text-center text-red-600">{error}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Problems Solved</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.map((user, index) => (
                    <tr
                      key={user._id}
                      className={`hover:bg-gray-50 ${
                        currentUser && user._id === currentUser._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className="text-2xl">{getRankIcon(index + 1)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.profilePicture || 'https://tableconvert.com/images/avatar.png'}
                            alt={user.username}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.username}
                              {currentUser && user._id === currentUser._id && (
                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-blue-600">{user.rating || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.solvedProblems?.length || 0}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {leaderboard.length === 0 && !error && (
            <div className="p-6 text-center text-gray-500">
              No users on the leaderboard yet. Start solving problems to be the first!
            </div>
          )}
        </div>
      )}

      {/* Discussions Tab */}
      {activeTab === 'discussions' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearch(e.target.value);
                }}
                className="w-full p-3 pl-10 border border-gray-300 rounded-lg"
                placeholder="Search discussions by title, content, or tags..."
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            {searchQuery.trim() && searchQuery.length >= 2 && (
              <div className="mt-2 text-sm text-gray-600">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found for "{searchQuery}"
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>

          {/* New Discussion Button */}
          {currentUser && (
            <div className="text-right">
              <button
                onClick={() => setShowNewDiscussionForm(!showNewDiscussionForm)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                {showNewDiscussionForm ? 'Cancel' : 'New Discussion'}
              </button>
            </div>
          )}

          {/* New Discussion Form */}
          {showNewDiscussionForm && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Start a New Discussion</h3>
              <form onSubmit={handleSubmitDiscussion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({...newDiscussion, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="What would you like to discuss?"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                  <textarea
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({...newDiscussion, content: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg h-32"
                    placeholder="Share your thoughts, approaches, or questions..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Problem ID (Optional)</label>
                  <input
                    type="text"
                    value={newDiscussion.problemId}
                    onChange={(e) => setNewDiscussion({...newDiscussion, problemId: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Related problem ID (if any)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      className="flex-1 p-3 border border-gray-300 rounded-lg"
                      placeholder="Add a tag and press Enter"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {newDiscussion.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewDiscussionForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Post Discussion
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Discussions List */}
          <div className="space-y-4">
            {displayedDiscussions.map((discussion) => (
              <div key={discussion._id} className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow">
                {editingDiscussion === discussion._id ? (
                  // Edit Form
                  <form onSubmit={handleUpdateDiscussion} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                      <textarea
                        value={editForm.content}
                        onChange={(e) => setEditForm({...editForm, content: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg h-32"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Problem ID</label>
                      <input
                        type="text"
                        value={editForm.problemId}
                        onChange={(e) => setEditForm({...editForm, problemId: e.target.value})}
                        className="w-full p-3 border border-gray-300 rounded-lg"
                        placeholder="Related problem ID (if any)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={editTagInput}
                          onChange={(e) => setEditTagInput(e.target.value)}
                          className="flex-1 p-3 border border-gray-300 rounded-lg"
                          placeholder="Add a tag"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEditTag())}
                        />
                        <button
                          type="button"
                          onClick={handleAddEditTag}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editForm.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveEditTag(tag)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditingDiscussion(null)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                ) : (
                  // Display Mode
                  <>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{discussion.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-2">
                            <img
                              className="h-6 w-6 rounded-full object-cover"
                              src={discussion.author?.profilePicture || 'https://tableconvert.com/images/avatar.png'}
                              alt={discussion.author?.username}
                            />
                            <span>{discussion.author?.username || 'Anonymous'}</span>
                          </div>
                          <span>•</span>
                          <span>{formatDate(discussion.createdAt)}</span>
                          {discussion.problemId && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600">Problem: {discussion.problemId}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      {currentUser && discussion.author?._id === currentUser._id && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditDiscussion(discussion)}
                            className="text-blue-600 hover:text-blue-800 p-2"
                            title="Edit discussion"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteDiscussion(discussion._id)}
                            className="text-red-600 hover:text-red-800 p-2"
                            title="Delete discussion"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">{discussion.content}</p>
                    
                    {discussion.tags && discussion.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {discussion.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          
          {displayedDiscussions.length === 0 && (
            <div className="bg-white p-8 rounded-lg shadow text-center">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery.trim() ? 'No discussions found' : 'No discussions yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery.trim() 
                  ? 'Try adjusting your search terms or browse all discussions.'
                  : 'Be the first to start a discussion in the community!'
                }
              </p>
              {currentUser && !searchQuery.trim() && (
                <button
                  onClick={() => setShowNewDiscussionForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start First Discussion
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}