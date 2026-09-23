import React from 'react';

const ScoreCard = ({ label, value, subValue, icon, color = 'primary', noBg = false }) => {
  const statusValues = ['completed', 'failed', 'evaluating', 'processing', 'pending', 'created'];
  const isStatusValue = statusValues.includes(value?.toLowerCase());

  const statusStyles = {
    completed: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    failed: 'bg-red-50 text-red-700 border border-red-200',
    evaluating: 'bg-amber-50 text-amber-700 border border-amber-200',
    processing: 'bg-amber-50 text-amber-700 border border-amber-200',
    pending: 'bg-blue-50 text-blue-700 border border-blue-200',
    created: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  };

  const statusDots = {
    completed: 'bg-emerald-500',
    failed: 'bg-red-500',
    evaluating: 'bg-amber-500 animate-pulse',
    processing: 'bg-amber-500 animate-pulse',
    pending: 'bg-blue-500',
    created: 'bg-indigo-500',
  };

  const colors = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    secondary: 'bg-secondary/10 text-secondary border border-secondary/20',
    success: 'bg-success/10 text-success border border-success/20',
    error: 'bg-error/10 text-error border border-error/20',
    warning: 'bg-warning/10 text-warning border border-warning/20',
  };

  const textColors = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
  };

  const remixIconMap = {
    menu_book: 'ri-book-open-line',
    task_alt: 'ri-checkbox-circle-line',
    pending_actions: 'ri-time-line',
    toll: 'ri-coin-line',
    bolt: 'ri-flashlight-line',
    trending_up: 'ri-line-chart-line',
    people: 'ri-group-line',
    check_circle: 'ri-checkbox-circle-fill',
    grade: 'ri-award-line',
    description: 'ri-file-text-line',
    verified: 'ri-shield-check-line',
    error: 'ri-error-warning-line',
    add_circle: 'ri-add-circle-line',
    analytics: 'ri-bar-chart-box-line',
  };

  const remixClass = icon?.startsWith('ri-') ? icon : (remixIconMap[icon] || null);

  const renderIcon = (sizeClass = 'text-xl sm:text-2xl') => {
    if (remixClass) {
      return (
        <span className="inline-flex items-center justify-center">
          <i className={`${remixClass} ${sizeClass}`} />
          <span className="sr-only">{icon}</span>
        </span>
      );
    }
    return <span className="material-symbols-outlined text-xl sm:text-2xl font-variation-fill">{icon}</span>;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-5 md:p-6 rounded-2xl atmospheric-shadow border border-slate-200/80 hover:border-primary/30 flex flex-col justify-between h-full min-h-[130px] sm:min-h-[160px] group hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
      {/* Decorative subtle ambient gradient in card corner */}
      <div className="absolute -top-10 -right-10 w-24 h-24 rounded-full bg-slate-100/50 group-hover:bg-primary/5 transition-colors pointer-events-none" />

      {/* Top Section: Icon */}
      <div className="mb-3 sm:mb-4 relative z-10 flex items-center justify-between">
        {!noBg ? (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xs transition-transform duration-300 group-hover:scale-105 ${colors[color]}`}>
            {renderIcon('text-xl sm:text-2xl')}
          </div>
        ) : (
          <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${textColors[color] || 'text-on-surface'}`}>
            {renderIcon('text-2xl sm:text-4xl')}
          </div>
        )}
      </div>
      
      {/* Bottom Section: Text & Values */}
      <div className="relative z-10 flex flex-col gap-1">
        {isStatusValue ? (
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider w-fit ${statusStyles[value?.toLowerCase()] || 'bg-gray-100 text-gray-700'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusDots[value?.toLowerCase()] || 'bg-gray-500'}`} />
            {value}
          </span>
        ) : (
          <h3 className="text-2xl sm:text-3xl font-extrabold font-headline text-slate-900 leading-none tracking-tight">{value}</h3>
        )}
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-tight mt-1.5 break-words">
          {label}
        </p>
        {subValue && (
          <p className={`text-[11px] font-semibold mt-0.5 flex items-center gap-1 ${subValue.includes('+') ? 'text-emerald-500' : 'text-on-surface-variant'}`}>
            {subValue}
          </p>
        )}
      </div>
      
    </div>
  );
};

export default ScoreCard;
