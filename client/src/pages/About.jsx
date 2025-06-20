import React from 'react';

export default function About() {
  return (
    <div className='px-4 py-12 max-w-4xl mx-auto'>
      <h1 className='text-4xl font-bold mb-6 text-slate-800 text-center'>About - CodeKhana</h1>
      
      <div className='bg-blue-50 p-6 rounded-lg shadow-md mb-8'>
        <h2 className='text-2xl font-semibold mb-3 text-blue-800'>
          Mission
        </h2>
        <p className='mb-4 text-slate-700 text-lg'>
          <b>CodeKhana</b> was built to democratize coding practice and make competitive programming 
          accessible to everyone. We believe that regular practice with instant feedback is the 
          key to mastering programming skills and acing technical interviews.
        </p>
      </div>
      
      <div className='grid md:grid-cols-2 gap-6 mb-8'>
        <div className='bg-white p-5 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-3 text-slate-800'>
            <span className='text-blue-600 mr-2'>🧩</span>Features
          </h3>
          <p className='text-slate-700'>
            The platform features hundreds of coding challenges, from basic algorithms to complex 
            data structures. Each problem is carefully designed to teach fundamental concepts 
            and advanced techniques used in software development and competitive programming.
          </p>
        </div>
        
        <div className='bg-white p-5 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-3 text-slate-800'>
            <span className='text-green-600 mr-2'>💻</span>Technology
          </h3>
          <p className='text-slate-700'>
            Built on the MERN stack (MongoDB, Express, React, Node.js) with secure JWT authentication.
            Our compiler infrastructure supports c++ programming language with sandbox execution for 
            safety and reliability.
          </p>
        </div>
        
        <div className='bg-white p-5 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-3 text-slate-800'>
            <span className='text-orange-600 mr-2'>🚀</span>Vision
          </h3>
          <p className='text-slate-700'>
            Aimed to build the most comprehensive and user-friendly online judge platform, helping 
            programmers of all skill levels improve their algorithmic thinking and coding efficiency
            through practice and competition.
          </p>
        </div>
        
        <div className='bg-white p-5 rounded-lg shadow'>
          <h3 className='text-xl font-semibold mb-3 text-slate-800'>
            <span className='text-purple-600 mr-2'>👥</span>Community
          </h3>
          <p className='text-slate-700'>
            Join a thriving community of developers who share solutions, discuss algorithms, and 
            participate in regular coding contests. Learn from peers and build your professional
            network while improving your programming skills.
          </p>
        </div>
      </div>
      
      <div className='bg-slate-50 p-6 rounded-lg shadow-md mb-6'>
        <h2 className='text-2xl font-semibold mb-3 text-slate-800'>
          How It Works
        </h2>
        <div className='grid md:grid-cols-3 gap-4 text-center'>
          <div className='p-4'>
            <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-blue-600 text-xl font-bold'>1</span>
            </div>
            <h3 className='font-semibold mb-2'>Choose a Problem</h3>
            <p className='text-slate-600 text-sm'>Browse our collection and select a challenge that matches your skill level</p>
          </div>
          
          <div className='p-4'>
            <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-blue-600 text-xl font-bold'>2</span>
            </div>
            <h3 className='font-semibold mb-2'>Write Your Code</h3>
            <p className='text-slate-600 text-sm'>Use our online editor to write a solution in your preferred language</p>
          </div>
          
          <div className='p-4'>
            <div className='bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3'>
              <span className='text-blue-600 text-xl font-bold'>3</span>
            </div>
            <h3 className='font-semibold mb-2'>Get Instant Feedback</h3>
            <p className='text-slate-600 text-sm'>Submit and receive immediate results on correctness and efficiency</p>
          </div>
        </div>
      </div>
      
      <div className='text-center text-slate-700'>
        <p className='mb-4'>
          Whether you're preparing for technical interviews, competitive programming contests, or 
          simply want to improve your problem-solving skills,<b> CodeKhana</b> is the platform for you.
        </p>
        <p className='italic text-sm text-slate-500'>
          Developer : Aditya Prakash 
        </p>
      </div>
    </div>
  );
}