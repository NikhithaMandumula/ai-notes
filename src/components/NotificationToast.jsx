import { useSocket } from '../context/SocketContext';

function NotificationToast() {
  const { notification, dismissNotification } = useSocket();

  if (!notification) return null;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-in">
      <div className="bg-[var(--modal-bg)] backdrop-blur-2xl border border-cyan-400/30 rounded-[16px] shadow-[0_0_40px_rgba(6,182,212,0.2),0_8px_24px_rgba(0,0,0,0.2)] p-4 max-w-sm flex items-start gap-3">
        <div className="h-9 w-9 rounded-[12px] bg-gradient-to-br from-blue-400/20 to-cyan-400/20 border border-cyan-400/25 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z M12 18v-6m0 0l-3 3m3-3l3 3" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--text-primary)]">New Shared Note</p>
          <p className="text-xs text-[var(--text-muted)] mt-0.5 line-clamp-2">{notification.message}</p>
        </div>
        <button
          onClick={dismissNotification}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default NotificationToast;
