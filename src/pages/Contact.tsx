// Contact showing the users contact info
import React from 'react';

const Contact: React.FC = () => {
return (
  <>
    <div className='w-full flex flex-col items-center justify-center'>
        <h1 className="text-3xl font-bold">Contact Me</h1>
        <p className="text-lg">You can reach me in the <a href='https://discord.gg/cUXuE6Qmrt' target='_blank' rel='noreferrer' className='text-accent hover:text-red-700'>pyro</a> discord server!</p>
    </div>
  </>
);
};

export default Contact;



