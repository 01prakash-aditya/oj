import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  
  return (
    <div className='px-4 py-12 max-w-4xl mx-auto'>
      <h1 className='text-4xl font-bold mb-6 text-slate-800 text-center'>
        Welcome {currentUser?.fullName} - CodeKhana
      </h1>
      
      <div className='bg-blue-50 p-6 rounded-lg shadow-md mb-8'>
        <h2 className='text-2xl font-semibold mb-3 text-blue-800'>
          Solve. Compile. Compete.
        </h2>
        <p className='mb-4 text-slate-700 text-lg'>
          <b>CodeKhana</b> is a powerful online judge platform with an integrated compiler that allows 
          you to practice coding problems, test your solutions instantly, and improve your 
          programming skills through competition and learning.
        </p>
        <div className='flex justify-center'>
          <button onClick={() => navigate('/compiler')} className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-4'>
            {currentUser ? 'Start Coding' : 'Try Now'}
          </button>
          <button onClick={() => navigate('/problemset')} className='bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700'>
            Browse Problems
          </button>
        </div>
      </div>
      
      <div className='grid md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white p-5 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-3 text-slate-800'>
            <span className='text-green-600 mr-2'>✓</span>Online Compiler
          </h3>
          <p className='text-slate-700'>
            Write, compile, and execute code in c++ programming language directly in your browser.
            Our compiler provides real-time feedback and execution status for your submissions.
          </p>
        </div>
        
        <div className='bg-white p-5 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-3 text-slate-800'>
            <span className='text-purple-600 mr-2'>⚡</span>Problem Bank
          </h3>
          <p className='text-slate-700'>
            Access hundreds of algorithmic challenges sorted by difficulty and topics.
            From easy to advanced problems, we've got you covered for technical interviews
            and competitive programming.
          </p>
        </div>
        
        <div className='bg-white p-5 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-3 text-slate-800'>
            <span className='text-orange-600 mr-2'>🏆</span>Leaderboard
          </h3>
          <p className='text-slate-700'>
            Solve problems from a diverse set of topics and earn ratings for each solution.
            Climb the leaderboard and track your progress over time with detailed statistics.
          </p>
        </div>
        
        <div className='bg-white p-5 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-3 text-slate-800'>
            <span className='text-blue-600 mr-2'>👥</span>Community
          </h3>
          <p className='text-slate-700'>
            Join a thriving community of developers. Discuss solutions, share approaches,
            and learn from others. Collaborative learning accelerates your growth.
          </p>
        </div>
      </div>
      
      <div className='text-center text-slate-700 mb-4'>
        <p>
          Built with the MERN stack (MongoDB, Express, React, Node.js). Features secure authentication
          with JWT to protect your account and submissions.
        </p>
      </div>
      
      {!currentUser && (
        <div className='flex justify-center'>
          <button onClick={() => navigate('/sign-up')} className='bg-slate-800 text-white px-6 py-2 rounded-lg hover:bg-slate-900'>
            Sign Up Free
          </button>
        </div>
      )}
    </div>
  );
}