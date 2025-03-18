import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';

const Footer: React.FC = () => {
  return (
    <div className='bg-contentBackground mt-auto'>
      <footer className='flex items-center h-20 justify-center'>
        made with <FontAwesomeIcon icon={faHeart} className='mx-1'/> Using React
      </footer>
    </div>
  );
};

export default Footer;