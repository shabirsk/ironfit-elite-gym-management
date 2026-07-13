import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Users, UserCog, Tags, Dumbbell, CalendarCheck, Settings, Plus, Send } from 'lucide-react';

const ACTIONS = [
  { id: 'nav-dashboard', title: 'Go to Dashboard', icon: LayoutDashboard, path: '/admin/dashboard', type: 'nav' },
  { id: 'nav-members', title: 'Go to Members', icon: Users, path: '/admin/members', type: 'nav' },
  { id: 'nav-trainers', title: 'Go to Trainers', icon: UserCog, path: '/admin/trainers', type: 'nav' },
  { id: 'nav-plans', title: 'Go to Plans', icon: Tags, path: '/admin/plans', type: 'nav' },
  { id: 'nav-payments', title: 'Go to Payments', icon: Tags, path: '/admin/payments', type: 'nav' },
  { id: 'nav-settings', title: 'Open Settings', icon: Settings, path: '/admin/settings', type: 'nav' },
  
  { id: 'act-add-member', title: 'Add New Member', icon: Plus, action: 'CREATE_MEMBER', type: 'action' },
  { id: 'act-add-trainer', title: 'Add New Trainer', icon: Plus, action: 'CREATE_TRAINER', type: 'action' },
  { id: 'act-create-plan', title: 'Create Plan', icon: Plus, action: 'CREATE_PLAN', type: 'action' },
  { id: 'act-mark-attendance', title: 'Mark Attendance', icon: CalendarCheck, path: '/admin/qr-attendance', type: 'nav' },
  { id: 'act-send-notification', title: 'Send Notification', icon: Send, path: '/admin/notifications', type: 'nav' },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const filteredActions = ACTIONS.filter(action => 
    action.title.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(prev => (prev < filteredActions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredActions[activeIndex]) {
          executeAction(filteredActions[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeIndex, filteredActions]);

  const executeAction = (action) => {
    onClose();
    if (action.type === 'nav' && action.path) {
      navigate(action.path);
    } else if (action.type === 'action') {
      // Dispatch custom event to trigger modals in specific pages
      window.dispatchEvent(new CustomEvent('COMMAND_ACTION', { detail: action.action }));
      
      // If we are not on the page where the modal lives, navigate there first
      if (action.action === 'CREATE_MEMBER' && window.location.pathname !== '/admin/members') {
        navigate('/admin/members');
      } else if (action.action === 'CREATE_TRAINER' && window.location.pathname !== '/admin/trainers') {
        navigate('/admin/trainers');
      } else if (action.action === 'CREATE_PLAN' && window.location.pathname !== '/admin/plans') {
        navigate('/admin/plans');
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <style>{`
            .command-palette-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.6);
              backdrop-filter: blur(4px);
              z-index: 10000;
              display: flex;
              align-items: flex-start;
              justify-content: center;
              padding-top: 10vh;
            }
            .command-palette-modal {
              width: 100%;
              max-width: 600px;
              background: var(--bg-surface);
              border: 1px solid var(--border-light);
              border-radius: 12px;
              box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
              overflow: hidden;
              display: flex;
              flex-direction: column;
            }
            .command-palette-input {
              width: 100%;
              padding: 20px 16px;
              background: transparent;
              border: none;
              color: var(--text-primary);
              font-size: 16px;
              outline: none;
            }
            .command-palette-input::placeholder {
              color: var(--text-tertiary);
            }
            .command-palette-list {
              max-height: 350px;
              overflow-y: auto;
              padding: 8px 0;
            }
            .command-palette-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px 24px;
              color: var(--text-secondary);
              cursor: pointer;
              transition: all 0.1s ease;
            }
            .command-palette-item.active,
            .command-palette-item:hover {
              background: var(--primary-focus);
              color: var(--primary);
            }
            .command-palette-item.active span:first-of-type,
            .command-palette-item:hover span:first-of-type {
              color: var(--primary);
              font-weight: 500;
            }
          `}</style>
          <motion.div 
            className="command-palette-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div 
              className="command-palette-modal"
              initial={{ scale: 0.95, opacity: 0, y: -20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', alignItems: 'center', borderBottom: '1px solid var(--border-light)', padding: '0 24px' }}>
                <Search size={20} color="var(--text-tertiary)" />
                <input 
                  ref={inputRef}
                  className="command-palette-input"
                  style={{ borderBottom: 'none' }}
                  placeholder="Type a command or search..."
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
                />
              </div>
              <div className="command-palette-list">
                {filteredActions.length > 0 ? (
                  filteredActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <div 
                        key={action.id}
                        className={`command-palette-item ${index === activeIndex ? 'active' : ''}`}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => executeAction(action)}
                      >
                        <Icon size={18} />
                        <span style={{ flex: 1 }}>{action.title}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', border: '1px solid var(--border-light)', padding: '2px 6px', borderRadius: '4px' }}>
                          {action.type === 'nav' ? 'Jump to' : 'Action'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '14px' }}>
                    No commands found.
                  </div>
                )}
              </div>
              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border-light)', fontSize: '12px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                <span><kbd style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-medium)' }}>↑↓</kbd> to navigate</span>
                <span><kbd style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-medium)' }}>Enter</kbd> to select</span>
                <span><kbd style={{ background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-medium)' }}>Esc</kbd> to close</span>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
