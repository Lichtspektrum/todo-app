import type { ToastState } from '../hooks/useToast';
import { useLang } from '../contexts/LangContext';

interface Props {
  toast: ToastState | null;
  onDismiss: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export function Toast({ toast, onDismiss, onMouseEnter, onMouseLeave }: Props) {
  const { t } = useLang();

  if (!toast) return null;

  return (
    <div
      key={toast.id}
      className="toast"
      role="status"
      aria-live="polite"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="toast-message">{toast.message}</span>
      <div className="toast-actions">
        {toast.onUndo && (
          <button
            className="toast-undo"
            onClick={() => { toast.onUndo?.(); onDismiss(); }}
            aria-label={t.undoAction}
          >
            {t.undoAction}
          </button>
        )}
        <button
          className="toast-close"
          onClick={onDismiss}
          aria-label={t.dismissToast}
        >
          ×
        </button>
      </div>
    </div>
  );
}
