import React from 'react';
import ContentBox from '../components/ContentBox';
import ProjectBox from '../components/ProjectBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPython, faRust, faJs, faCss, faHtml5 } from '@fortawesome/free-brands-svg-icons';
// import Logo from '../components/icons/Godot';

const Experience: React.FC = () => {
  return (
    <>
      <ContentBox title={'My Experience'} className='w-full md:w-3/5 mb-20 grainybg'>
        <div className='space-y-5'>

          <ProjectBox className='hover:[background:linear-gradient(45deg,#172033,theme(colors.gray.600)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.pythonSecondary)_80%,_theme(colors.pythonPrimary)_86%,_theme(colors.pythonPrimary)_90%,_theme(colors.pythonPrimary)_94%,_theme(colors.pythonSecondary))_border-box] hover:border hover:border-transparent hover:animate-border'>
            <FontAwesomeIcon icon={faPython} className='mr-4'/>Python
          </ProjectBox>
          <ProjectBox className='hover:[background:linear-gradient(45deg,#172033,theme(colors.gray.600)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.typescriptSecondary)_80%,_theme(colors.typescriptPrimary)_86%,_theme(colors.typescriptPrimary)_90%,_theme(colors.typescriptPrimary)_94%,_theme(colors.typescriptSecondary))_border-box] hover:border hover:border-transparent hover:animate-border'>
            <FontAwesomeIcon icon={faJs} className='mr-4'/>Typescript
          </ProjectBox>
          <ProjectBox className='hover:[background:linear-gradient(45deg,#172033,theme(colors.gray.600)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.rustSecondary)_80%,_theme(colors.rustPrimary)_86%,_theme(colors.rustPrimary)_90%,_theme(colors.rustPrimary)_94%,_theme(colors.rustSecondary))_border-box] hover:border hover:border-transparent hover:animate-border'>
            <FontAwesomeIcon icon={faRust} className='mr-4'/>Rust
          </ProjectBox>
          <ProjectBox>
            {/* <Logo fill='currentColor' className='mr-4 flex flex-row items-center' /> */}
            GdScript
          </ProjectBox>
          <ProjectBox><FontAwesomeIcon icon={faHtml5} className='mr-4'/>Html</ProjectBox>
          <ProjectBox><FontAwesomeIcon icon={faCss} className='mr-4'/>Css</ProjectBox>
        </div>
      </ContentBox>
    </>
  );
};

export default Experience;
