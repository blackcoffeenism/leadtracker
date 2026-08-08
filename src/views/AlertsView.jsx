import React from 'react';
import { useCRM } from '../context/CRMContext';

export const AlertsView = () => {
  const { notifications, toggleNotificationRead, markAllNotificationsRead } = useCRM();

  const groups = ['Today', 'Yesterday', 'Earlier'];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <main className="pt-20 md:pt-28 px-4 sm:px-6 max-w-4xl mx-auto flex flex-col gap-md sm:gap-lg pb-28 sm:pb-32 animate-in fade-in duration-200">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface dark:text-inverse-on-surface font-bold">
            Notifications
          </h1>
          <p className="text-xs text-on-surface-variant">
            {unreadCount > 0 ? `You have ${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button 
            onClick={markAllNotificationsRead}
            className="text-primary dark:text-primary-fixed font-label-lg text-label-lg hover:underline cursor-pointer flex items-center gap-1 font-semibold"
          >
            <span className="material-symbols-outlined text-sm">done_all</span>
            Mark all as read
          </button>
        )}
      </div>

      {groups.map(groupName => {
        const groupItems = notifications.filter(n => n.group === groupName);
        if (groupItems.length === 0) return null;

        return (
          <section key={groupName} className="flex flex-col gap-md">
            <h2 className="font-label-lg text-label-lg text-on-surface-variant uppercase tracking-wider font-semibold">
              {groupName}
            </h2>

            {groupItems.map(item => (
              <div 
                key={item.id}
                onClick={() => toggleNotificationRead(item.id)}
                className={`glass-card rounded-xl p-md flex items-start gap-md relative cursor-pointer hover:bg-surface-container-lowest transition-all duration-150 shadow-soft ${
                  !item.unread ? 'opacity-80' : 'ring-1 ring-primary/20'
                }`}
              >
                {/* Unread indicator dot */}
                {item.unread && (
                  <div className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></div>
                )}

                {/* Icon Container */}
                <div className={`p-2.5 rounded-full flex-shrink-0 bg-primary-container/10 dark:bg-primary-container/20`}>
                  <span className={`material-symbols-outlined text-primary-container`}>
                    {item.icon}
                  </span>
                </div>

                {/* Card Content */}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex justify-between items-baseline pr-4">
                    <span className="font-headline-sm text-headline-sm text-on-surface dark:text-inverse-on-surface text-base font-semibold">
                      {item.title}
                    </span>
                    <span className="font-label-md text-label-md text-on-surface-variant text-xs">
                      {item.time}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant pr-6">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </main>
  );
};
