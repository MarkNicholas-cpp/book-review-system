import type { ReactNode } from 'react';
import './Container.css';

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

const Container = ({ children, className = '' }: ContainerProps) => {
  return (
    <div className={`container ${className}`}>
      {children}
    </div>
  );
};

export default Container;

