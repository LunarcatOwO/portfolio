// In accordance with Apache2.0 license as aquired from naterfute
// App.tsx
import React from 'react';
import Projects from './pages/Projects.tsx';
import Experience from './pages/Experience.tsx'
import Card from './pages/Card.tsx';
import Contact from './pages/Contact.tsx';

const App: React.FC = () => {
  return (
    <div className='w-full flex flex-col'>
      <Card />
      <div className='flex flex-col md:flex-row justify-center items-center w-full md:space-x-10 mt-20'>
        <Projects />
      </div>
      <div className='flex flex-col md:flex-row justify-center items-center w-full md:space-x-10 mt-20'>
      <Experience />
      </div>

      <Contact />
    </div>
  );
};

export default App;

