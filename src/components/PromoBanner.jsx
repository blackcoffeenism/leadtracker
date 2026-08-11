import React from 'react';

export const PromoBanner = ({ className = "" }) => {
  return (
    <a
      href="https://www.engr.services"
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden block w-full rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary-container/20 dark:from-white/5 dark:via-white/10 dark:to-white/5 border border-primary/20 dark:border-white/15 p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/40 cursor-pointer ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 relative z-10">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary/15 dark:bg-white/10 flex items-center justify-center text-primary dark:text-primary-fixed shrink-0 group-hover:scale-105 transition-transform duration-300">
            <span className="material-symbols-outlined text-xl sm:text-2xl">rocket_launch</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary dark:text-primary-fixed mb-0.5">
              <span className="material-symbols-outlined text-xs">auto_awesome</span>
              <span>Custom Software Solutions</span>
            </div>
            <p className="font-semibold text-xs sm:text-sm text-on-surface dark:text-gray-100">
              Want a custom app like this? <span className="text-primary dark:text-primary-fixed font-bold">Message Us at</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-primary text-on-primary dark:bg-primary-container dark:text-on-primary font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-sm group-hover:opacity-95 transition-opacity shrink-0 self-end sm:self-center">
          <span>www.engr.services</span>
          <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">open_in_new</span>
        </div>
      </div>
    </a>
  );
};
