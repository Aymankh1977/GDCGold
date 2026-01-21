import React from 'react';

interface PageSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const PageSection: React.FC<PageSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <section className="space-y-3">
      {(title || description) && (
        <div>
          {title && (
            <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              {title}
            </h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">
              {description}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {children}
      </div>
    </section>
  );
};
