import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Settings, Send, Sparkles, LayoutDashboard, CheckSquare,
  X, Coins, Clock, Users, Plus, Grid, PanelLeftOpen, PanelLeftClose,
  LayoutList, Shield, FileText, HelpCircle, History as HistoryIcon,
  TicketsPlane, Target
} from 'lucide-react';
import { Logo } from './Logo';
import { MessageBubble } from './MessageBubble';
import { INTERACTION_INVENTORY } from '../../data/inventory';
import type { Message, Suggestion, TaskOpportunityPayload } from '../../types/twin3';

type TabType = 'chat' | 'dashboard' | 'matrix' | 'tasks' | 'history';

export const ChatLayout: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [isMobile, setIsMobile] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const hasStarted = useRef(false);

  const quickActions = [
    { icon: Shield, label: 'Verify Humanity', action: 'verify_human' },
    { icon: FileText, label: 'White Paper', action: 'white_paper' },
    { icon: HelpCircle, label: 'How It Works', action: 'how_it_works' },
  ];

  const navItems = [
    { icon: Grid, label: 'Twin Matrix', tab: 'matrix' as TabType, action: 'twin_matrix' },
    { icon: CheckSquare, label: 'Tasks', tab: 'tasks' as TabType, action: 'browse_tasks' },
    { icon: LayoutDashboard, label: 'Dashboard', tab: 'dashboard' as TabType, action: null },
    { icon: HistoryIcon, label: 'History', tab: 'history' as TabType, action: null },
  ];

  const taskCardsData: TaskOpportunityPayload[] = [
    {
      brand: { name: "L'Oréal Paris", logoUrl: '' },
      title: 'Lipstick Filter Challenge',
      description: 'Create 15-60s Reels using specific filter showcasing #666 shade. Mention moisturizing and color payoff.',
      reward: { tokens: '500 $twin3', gift: 'Full PR Package (Worth $3000)' },
      status: 'open', spotsLeft: 3, deadline: '2026-03-15', acceptedCount: 0, totalSpots: 3
    },
    {
      brand: { name: 'Starbucks', logoUrl: '' },
      title: 'Coffee Shop Vlog',
      description: 'Capture store atmosphere and drink close-ups, share coffee tasting experience',
      reward: { tokens: '300 $twin3', gift: 'Coffee Voucher $500' },
      status: 'open', spotsLeft: 3, deadline: '2026-03-20', acceptedCount: 2, totalSpots: 5
    },
    {
      brand: { name: 'Dior', logoUrl: '' },
      title: 'Beauty Unboxing Review',
      description: 'Try new products and create unboxing video, share usage experience',
      reward: { tokens: '800 $twin3', gift: 'Makeup Gift Box (Worth $5000)' },
      status: 'open', spotsLeft: 1, deadline: '2026-03-10', acceptedCount: 1, totalSpots: 2
    }
  ];

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      setIsDesktop(window.innerWidth >= 1024);
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (scrollRef.current && messages.length > 1) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, suggestions]);

  const findNode = (text: string) => {
    const lowerText = text.toLowerCase();
    return INTERACTION_INVENTORY.find(node =>
      node.triggers.some(trigger => lowerText.includes(trigger.toLowerCase()))
    ) || null;
  };

  const triggerResponse = useCallback(async (input: string | null, nodeId: string | null = null, showUserMessage = true) => {
    if (input && showUserMessage) {
      const userMsg: Message = {
        id: Date.now().toString(),
        role: 'user',
        type: 'text',
        content: input,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, userMsg]);
    }

    setIsTyping(true);
    setSuggestions([]);

    let node;
    if (nodeId) {
      node = INTERACTION_INVENTORY.find(n => n.id === nodeId);
    } else if (input) {
      node = findNode(input);
    }

    if (!node) {
      node = INTERACTION_INVENTORY.find(n => n.id === 'fallback')!;
    }

    const delay = node.response.delay || 500;
    await new Promise(r => setTimeout(r, delay));

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      type: node.response.card ? 'card' : 'text',
      content: node.response.text,
      cardData: node.response.card,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, aiMsg]);
    setSuggestions(node.suggestedActions || []);
    setIsTyping(false);

    if (!isDesktop) {
      setSidebarOpen(false);
    }
  }, [isDesktop]);

  const handleSubmit = () => {
    if (!inputValue.trim() || isTyping) return;
    triggerResponse(inputValue.trim());
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setSuggestions([]);
    setActiveTab('chat');
    triggerResponse(null, 'welcome', false);
    if (!isDesktop) setSidebarOpen(false);
  };

  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true;
      triggerResponse(null, 'welcome', false);
    }
  }, [triggerResponse]);

  const renderFeatureGrid = (msg: Message) => {
    if (msg.type !== 'card' || msg.cardData?.type !== 'feature_grid') return null;
    const features = msg.cardData.features || [];
    return (
      <div key={msg.id} className="animate-fade-in mb-8">
        {/* Hero */}
        <div className="text-center py-12 px-6 mb-8">
          <h1 className="text-foreground font-medium mb-4 leading-tight tracking-tight"
            style={{ fontSize: 'clamp(32px, 5vw, 40px)', letterSpacing: '-0.02em' }}>
            {msg.content.split('\n')[0]}
          </h1>
          <p className="text-twin-text-secondary text-base leading-relaxed max-w-[700px] mx-auto mb-6">
            {msg.content.split('\n').slice(1).join(' ').trim()}
          </p>
          <button
            className="btn-twin btn-twin-primary"
            onClick={() => triggerResponse(null, 'verify_human', false)}
            style={{ padding: '14px 32px', fontSize: '16px', fontWeight: 500, boxShadow: 'var(--glow-primary)' }}
          >
            Click Here to Proof I'm a Human
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))' }}>
          {features.map((feature, i) => {
            const IconComponent = feature.icon === 'verification' ? TicketsPlane
              : feature.icon === 'matrix' ? Grid
              : feature.icon === 'agent' ? Sparkles
              : feature.icon === 'target' ? Target
              : null;

            return (
              <div key={i} className="glass-card glass-card-hover cursor-default" style={{ padding: '24px' }}>
                {IconComponent && (
                  <div className="mb-3 text-primary opacity-90">
                    <IconComponent size={24} />
                  </div>
                )}
                <h3 className="text-lg font-medium text-foreground mb-2" style={{ letterSpacing: '-0.01em' }}>
                  {feature.title}
                </h3>
                <p className="text-sm text-twin-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderTaskCards = (msg: Message) => {
    if (msg.type !== 'card' || msg.cardData?.type !== 'task_opportunity') return null;
    return (
      <div key={msg.id} className="animate-fade-in mb-6">
        <MessageBubble message={{ ...msg, type: 'text' }} />
        <div className="grid gap-4 mt-4" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
          marginLeft: isMobile ? '0' : '44px'
        }}>
          {taskCardsData.map((task, i) => (
            <div key={i} className="glass-card glass-card-hover cursor-pointer flex flex-col gap-4" style={{ padding: '24px' }}>
              <div>
                <h4 className="text-base font-semibold text-foreground mb-1.5">{task.title}</h4>
                <p className="text-xs text-twin-text-secondary flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
                  {task.brand.name}
                </p>
              </div>
              <p className="text-xs text-twin-text-secondary leading-relaxed">{task.description}</p>
              <div className="flex gap-3 text-xs text-twin-text-dim">
                {task.deadline && (
                  <span className="flex items-center gap-1"><Clock size={14} /> Due {task.deadline}</span>
                )}
                {task.totalSpots && (
                  <span className="flex items-center gap-1"><Users size={14} /> {task.acceptedCount || 0}/{task.totalSpots}</span>
                )}
              </div>
              <div className="flex items-center justify-between pt-3 gap-2 flex-wrap" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <span className="text-xs text-primary font-medium flex items-center gap-1">
                  <Coins size={16} /> {task.reward.tokens}
                </span>
                <button className="btn-twin btn-twin-primary text-xs" style={{ padding: '6px 14px' }}>
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSidebarButton = (icon: React.ElementType, label: string, isActive: boolean, onClick: () => void, collapsed: boolean) => {
    const Icon = icon;
    if (isDesktop && collapsed) {
      return (
        <button
          onClick={onClick}
          className="btn-twin-ghost"
          title={label}
          style={{
            width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0', background: isActive ? 'rgba(255, 255, 255, 0.08)' : undefined,
            color: isActive ? 'hsl(var(--color-text-primary))' : 'hsl(var(--color-text-secondary))',
            border: 'none', borderRadius: 'var(--radius)', cursor: 'pointer'
          }}
        >
          <Icon size={20} />
        </button>
      );
    }
    return (
      <button
        onClick={onClick}
        className="btn-twin-ghost"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
          background: isActive ? 'rgba(255, 255, 255, 0.08)' : undefined,
          color: isActive ? 'hsl(var(--color-text-primary))' : 'hsl(var(--color-text-secondary))',
          border: isActive ? 'none' : '1px solid transparent', borderRadius: 'var(--radius)',
          cursor: 'pointer', justifyContent: 'flex-start'
        }}
      >
        <Icon size={20} />
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  const sidebarCollapsed = isDesktop && !sidebarOpen;

  return (
    <div className="flex" style={{ height: '100dvh', width: '100vw', position: 'relative', zIndex: 2 }}>
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && !isDesktop && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0"
          style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)', zIndex: 998 }}
        />
      )}

      {/* Left Sidebar */}
      <aside
        className="glass flex flex-col flex-shrink-0"
        style={{
          width: isDesktop ? (sidebarOpen ? '280px' : '72px') : (sidebarOpen ? '280px' : '0'),
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          position: isDesktop ? 'relative' : 'fixed',
          left: 0, top: 0, height: '100dvh', zIndex: 999,
          transform: !isDesktop && !sidebarOpen ? 'translateX(-100%)' : 'translateX(0)',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Header */}
        <div className="flex items-center h-16 px-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', justifyContent: sidebarCollapsed ? 'center' : 'space-between' }}>
          {isDesktop && (
            <div className="flex items-center gap-3 justify-center">
              <Logo width={28} height={28} />
              {sidebarOpen && <h1 className="text-foreground text-lg font-medium animate-fade-in">twin3.ai</h1>}
            </div>
          )}
          {!isDesktop && (
            <div className="w-full flex justify-end">
              <button onClick={() => setSidebarOpen(false)} className="btn-twin-ghost p-2" style={{ minWidth: '32px', borderRadius: 'var(--radius)' }}>
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 flex flex-col gap-1 scrollbar-hide overflow-auto" style={{
          padding: sidebarCollapsed ? '16px 8px' : '16px 12px',
          alignItems: sidebarCollapsed ? 'center' : 'stretch',
        }}>
          {renderSidebarButton(Plus, 'New Chat', activeTab === 'chat', handleNewChat, sidebarCollapsed)}
          <div className="mb-2" />
          {navItems.map((item) => (
            <React.Fragment key={item.tab}>
              {renderSidebarButton(item.icon, item.label, activeTab === item.tab, () => {
                setActiveTab(item.tab);
                if (item.action) triggerResponse(null, item.action, false);
                if (!isDesktop) setSidebarOpen(false);
              }, sidebarCollapsed)}
            </React.Fragment>
          ))}

          {/* Mobile Quick Actions */}
          {!isDesktop && sidebarOpen && (
            <>
              <div className="my-3" style={{ height: '1px', background: 'rgba(255, 255, 255, 0.06)' }} />
              <div className="px-3 text-xs font-medium text-twin-text-dim mb-2">Quick Actions</div>
              {quickActions.map((qa, i) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={i}
                    onClick={() => { triggerResponse(null, qa.action, false); setSidebarOpen(false); }}
                    className="btn-twin-ghost w-full flex items-center gap-3 p-3 text-twin-text-secondary cursor-pointer"
                    style={{ border: 'none', borderRadius: 'var(--radius)', justifyContent: 'flex-start' }}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{qa.label}</span>
                  </button>
                );
              })}
            </>
          )}
        </nav>

        {/* Settings */}
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: sidebarCollapsed ? 'center' : 'flex-start' }}>
          <button className="btn-twin-ghost flex items-center gap-3 text-twin-text-dim" style={{
            width: sidebarCollapsed ? '48px' : '100%', height: sidebarCollapsed ? '48px' : 'auto',
            padding: sidebarCollapsed ? '0' : '10px 12px', border: 'none', borderRadius: 'var(--radius)',
            cursor: 'pointer', justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          }} title={sidebarCollapsed ? "Settings" : undefined}>
            <Settings size={16} />
            {sidebarOpen && "Settings"}
          </button>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="glass h-16 flex items-center justify-between px-4 flex-shrink-0 relative z-50"
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-twin-text-secondary hover:text-foreground transition-all"
              style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
          </div>

          {/* Centered Logo for Mobile */}
          <div className="desktop-hidden absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Logo width={24} height={24} />
            <h1 className="text-foreground text-lg font-medium">twin3.ai</h1>
          </div>

          {/* Right toggle */}
          <div className="flex justify-end">
            {isDesktop && (
              <button
                onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
                className="p-2 rounded-lg text-twin-text-secondary hover:text-foreground transition-all"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <LayoutList size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 scrollbar-hide">
          <div className="max-w-[900px] mx-auto">
            {messages.map((msg) => {
              if (msg.type === 'card' && msg.cardData?.type === 'feature_grid') {
                return renderFeatureGrid(msg);
              }
              if (msg.type === 'card' && msg.cardData?.type === 'task_opportunity') {
                return renderTaskCards(msg);
              }
              return (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onAction={(actionId) => triggerResponse(null, actionId, false)}
                />
              );
            })}

            {isTyping && (
              <div className="flex gap-3 mt-6 animate-fade-in">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'hsl(var(--accent))', boxShadow: 'var(--glow-primary)' }}>
                  <Sparkles size={16} className="text-foreground" />
                </div>
                <div className="flex items-center gap-1 pt-2">
                  {[0, 150, 300].map((delay, i) => (
                    <span key={i} className="animate-bounce-dot inline-block" style={{
                      width: '6px', height: '6px', borderRadius: '50%',
                      background: 'hsl(var(--color-text-dim))',
                      animationDelay: `${delay}ms`,
                    }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </div>

        {/* Suggestions */}
        {suggestions.length > 0 && !isTyping && (
          <div className="mobile-hidden px-4 pb-3 flex-shrink-0">
            <div className="max-w-[900px] mx-auto flex gap-2 flex-wrap">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => triggerResponse(s.payload, null, false)}
                  className="chip animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-3 pb-3 pt-2 flex-shrink-0">
          <div className="max-w-[900px] mx-auto">
            <div className="flex items-end gap-2 rounded-[28px] px-4 py-2"
              style={{ background: 'rgba(32, 33, 36, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <button className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-twin-text-dim"
                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} title="Attach">
                <Plus size={20} />
              </button>
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (inputRef.current) {
                    inputRef.current.style.height = '24px';
                    inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask twin3..."
                rows={1}
                disabled={isTyping}
                className="flex-1 bg-transparent text-foreground font-sans resize-none outline-none"
                style={{
                  border: 'none', fontSize: '16px', lineHeight: '24px', height: '24px',
                  maxHeight: '120px', padding: '0', margin: '4px 0',
                }}
              />
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(var(--color-text-dim))' }} title="Demo Mode" />
                <button
                  onClick={handleSubmit}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
                  style={{
                    background: inputValue.trim() && !isTyping ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    border: 'none',
                    color: inputValue.trim() && !isTyping ? 'hsl(var(--color-text-primary))' : 'hsl(var(--color-text-dim))',
                    cursor: inputValue.trim() && !isTyping ? 'pointer' : 'default',
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside
        className="glass flex-col flex-shrink-0"
        style={{
          width: rightSidebarOpen ? '280px' : '0',
          borderLeft: rightSidebarOpen ? '1px solid rgba(255, 255, 255, 0.08)' : 'none',
          display: isDesktop ? 'flex' : 'none',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
        }}
      >
        <div className="h-16 flex items-center px-4 flex-shrink-0" style={{
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          opacity: rightSidebarOpen ? 1 : 0, transition: 'opacity 0.2s ease', whiteSpace: 'nowrap',
        }}>
          <h3 className="text-base font-medium text-foreground">Quick Actions</h3>
        </div>
        <div className="p-4 flex-1 overflow-auto" style={{ opacity: rightSidebarOpen ? 1 : 0, transition: 'opacity 0.2s ease 0.1s' }}>
          <div className="flex flex-col gap-2">
            {quickActions.map((qa, i) => {
              const Icon = qa.icon;
              return (
                <button
                  key={i}
                  onClick={() => triggerResponse(null, qa.action, false)}
                  className="glass-card glass-card-hover flex items-center gap-3 cursor-pointer text-left"
                  style={{ padding: '12px 16px', borderRadius: 'var(--radius)' }}
                >
                  <Icon size={20} className="text-primary" />
                  <span className="flex-1 text-sm font-medium text-foreground">{qa.label}</span>
                  <span className="text-twin-text-dim text-sm">→</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </div>
  );
};
