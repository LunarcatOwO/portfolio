// Projects showing the user featured projects and a Description
import React from 'react';
import ContentBox from '../components/ContentBox';
import ProjectBox from '../components/ProjectBox';

const Projects: React.FC = () => {
return (
  <>
  <ContentBox title={'My Projects'} className=' w-full md:w-3/5 mb-10 grainybg'>
  <div className='space-y-5'>
    <ProjectBox title={'Youtube Downloader'} url='https://github.com/naterfute/YMusic' language='Python'>
      A Web-server Written in python for downloading youtube music remotely.
    </ProjectBox>
    <ProjectBox title={'Pyrodactyl'} url='https://github.com/pyrohost/pyrodactyl' language='Typescript, php'>
    Pyrodactyl is the Pterodactyl-based game server panel that's faster, smaller, safer, and more accessible than Pelican. 
    </ProjectBox>
    <ProjectBox title={'Guessing Game'} url='https://github.com/naterfute/guessing-game' language='Rust'>
      My first ever Rust project
    </ProjectBox>
    </div>
  </ContentBox>
</>
);
};

export default Projects;



