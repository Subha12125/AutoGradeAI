import React from 'react';
import autoGradeLogo from '../../assets/AutoGrade Ai.png';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="w-full py-6 sm:py-8 px-4 sm:px-8 border-t border-outline-variant/10 bg-white/50 backdrop-blur-md">
      <div className="flex flex-col items-center gap-4 sm:gap-6 md:flex-row md:justify-between">
        <div className="flex items-center gap-3">
          <img src={autoGradeLogo} alt="AutoGrade Ai Logo" className="w-10 h-10 object-contain" />
          <span className="font-headline font-black text-on-surface tracking-tight">AutoGrade Ai</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 sm:gap-8 text-[10px] font-bold uppercase tracking-widest text-outline">
          <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-primary transition-colors">Help Center</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Support</a>
        </div>
        
        <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest text-center">
          © {currentYear} AutoGrade Ai. All Academic Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
