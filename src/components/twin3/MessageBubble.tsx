import React from 'react';
import type { Message } from '../../types/twin3';
import { Sparkles } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  onAction?: (actionId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onAction }) => {
  const isUser = message.role === 'user';

  // Simple markdown-like bold rendering
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-fade-in">
        <div
          className="max-w-[80%] rounded-2xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <p className="text-foreground whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  return (
    <div className="flex gap-3 mb-4 animate-fade-in">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: 'hsl(var(--accent))',
          boxShadow: 'var(--glow-primary)',
        }}
      >
        <Sparkles size={16} className="text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-primary mb-1.5">twin3</div>
        <div className="text-sm leading-relaxed">
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={`${line ? 'mb-1' : 'mb-2'} text-twin-text-secondary`}>
              {renderText(line)}
            </p>
          ))}
        </div>
        {/* Card actions */}
        {message.cardData && 'actions' in message.cardData && message.cardData.actions && (
          <div className="flex gap-2 mt-3">
            {message.cardData.actions.map((action, i) => (
              <button
                key={i}
                onClick={() => onAction?.(action.actionId)}
                className={`btn-twin text-xs ${action.variant === 'primary' ? 'btn-twin-primary' : 'btn-twin-ghost'}`}
                style={{ padding: '6px 14px' }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
