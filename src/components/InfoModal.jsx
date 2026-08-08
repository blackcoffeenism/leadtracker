import React from 'react';

export const InfoModal = ({ type, isOpen, onClose }) => {
  if (!isOpen) return null;

  const getContent = () => {
    switch (type) {
      case 'about':
        return {
          title: "About LeadFlow CRM",
          icon: "info",
          body: (
            <div className="space-y-3 text-body-md text-on-surface-variant">
              <p>
                <strong>LeadFlow CRM</strong> version 1.0 is an enterprise-grade customer relationship management solution designed for real estate professionals and modern dealmakers.
              </p>
              <p>
                Features include real-time lead tracking, interactive timeline audit trails, intelligent notification alerts, and seamless multi-device responsiveness.
              </p>
              <div className="p-3 bg-surface-container rounded-lg text-xs font-mono text-outline">
                Build: v1.0.4-production<br />
                Stack: React 18, Vite, Tailwind CSS v3
              </div>
            </div>
          )
        };
      case 'privacy':
        return {
          title: "Privacy Policy",
          icon: "policy",
          body: (
            <div className="space-y-3 text-body-md text-on-surface-variant max-h-[60vh] overflow-y-auto pr-2">
              <p><strong>1. Data Collection:</strong> We prioritize user privacy and encrypt all stored lead information locally and in transit.</p>
              <p><strong>2. Information Usage:</strong> Lead information, phone numbers, and timeline logs are strictly restricted to authorized user accounts.</p>
              <p><strong>3. Security Standards:</strong> LeadFlow CRM implements SOC-2 compliant data access protocols and client data isolation.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: "Terms of Service",
          icon: "description",
          body: (
            <div className="space-y-3 text-body-md text-on-surface-variant max-h-[60vh] overflow-y-auto pr-2">
              <p><strong>1. Acceptance of Terms:</strong> By using LeadFlow CRM, you agree to comply with all applicable sales governance and privacy laws.</p>
              <p><strong>2. Account Ownership:</strong> Authorized users are solely responsible for maintaining credentials and confidentiality of client details.</p>
              <p><strong>3. Usage Limits:</strong> Fair usage policies apply to bulk automated outbound communications.</p>
            </div>
          )
        };
      default:
        return { title: "", icon: "info", body: null };
    }
  };

  const content = getContent();

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest dark:bg-surface-dim border border-surface-variant rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-lg border-b border-surface-variant flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">{content.icon}</span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface font-bold">{content.title}</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-on-surface-variant hover:bg-surface-container rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-lg">
          {content.body}

          <div className="flex justify-end pt-md mt-md border-t border-surface-variant">
            <button
              onClick={onClose}
              className="px-lg py-sm bg-primary-container text-on-primary font-button text-button rounded-lg shadow hover:opacity-90 transition-opacity"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
