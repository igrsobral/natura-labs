'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useFocusManagement } from '@/shared/hooks';
import { KEYBOARD_KEYS, ARIA_ROLES, generateAriaLabel, keyboardNavigationPatterns } from '@/shared/utils';
import { Button } from '@/components/ui/button';
import { BarChart3, Table, Bot, Menu, X } from 'lucide-react';
import { Container } from '@/components/ui';

interface DashboardHeaderProps {
  activeTab: 'charts' | 'tables' | 'ai';
  onTabChange: (tab: 'charts' | 'tables' | 'ai') => void;
  className?: string;
}

export function DashboardHeader({
  activeTab,
  onTabChange,
  className = ""
}: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const mobileMenuContainerRef = useRef<HTMLDivElement>(null);

  const tabs = [
    { id: 'charts' as const, label: 'Charts', icon: BarChart3, shortLabel: 'Charts', description: 'View interactive sales charts and visualizations' },
    { id: 'tables' as const, label: 'Tables', icon: Table, shortLabel: 'Tables', description: 'Browse sales data in filterable tables' },
    { id: 'ai' as const, label: 'AI Assistant', icon: Bot, shortLabel: 'AI', description: 'Get insights from AI assistant' }
  ];

  useFocusManagement({
    trapFocus: isMobileMenuOpen,
    restoreFocus: true
  });

  const handleTabChange = (tabId: 'charts' | 'tables' | 'ai') => {

    onTabChange(tabId);
    setIsMobileMenuOpen(false);

    const selectedTab = tabs.find(tab => tab.id === tabId);
    if (selectedTab) {
      const announcement = `${selectedTab.label} tab selected. ${selectedTab.description}`;
      const announcer = document.createElement('div');
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      announcer.textContent = announcement;
      document.body.appendChild(announcer);
      setTimeout(() => document.body.removeChild(announcer), 1000);
    }
  };

  const handleTabKeyDown = (event: KeyboardEvent, tabIndex: number) => {
    keyboardNavigationPatterns.tabs(
      event,
      tabIndex,
      tabs.length,
      (newIndex) => {
        handleTabChange(tabs[newIndex].id);
      }
    );
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === KEYBOARD_KEYS.ESCAPE && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isMobileMenuOpen]);

  return (
    <div className={`bg-card shadow-sm border-b border-border sticky top-0 z-40 ${className}`}>
      <Container size="2xl" padding="md">
        <div className="flex items-center justify-between h-14 sm:h-16 w-full">

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex space-x-4 lg:space-x-6 flex-1 justify-center items-center" aria-label="Dashboard navigation">
            <div role={ARIA_ROLES.TABLIST} className="flex space-x-4 lg:space-x-6 items-center" aria-label="Main navigation tabs">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  ref={(el) => { tabRefs.current[index] = el; }}
                  role={ARIA_ROLES.TAB}
                  tabIndex={activeTab === tab.id ? 0 : -1}
                  onClick={() => handleTabChange(tab.id)}
                  onKeyDown={(e) => handleTabKeyDown(e.nativeEvent, index)}
                  className={`
                    inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm
                    whitespace-nowrap min-h-[40px]
                    ${activeTab === tab.id
                      ? 'border-primary text-primary bg-primary/5'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground hover:bg-muted/50'
                    }
                  `}
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  aria-label={generateAriaLabel.navigation(tab.label, tabs.length, index + 1)}
                  title={tab.description}
                >
                  <tab.icon className="mr-2 h-4 w-4" aria-hidden="true" />
                  <span className="lg:hidden">{tab.shortLabel}</span>
                  <span className="hidden lg:inline">{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile Navigation Button */}
          <div className="flex sm:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              className="p-2 relative z-50"
            >
              <span className="sr-only">
                {isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              </span>
              {/* Hamburger/Close icon */}
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Desktop Controls/Actions */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              <span>Last updated: </span>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div
            id="mobile-menu"
            ref={mobileMenuContainerRef}
            className="sm:hidden border-t border-border bg-card"
            role={ARIA_ROLES.MENU}
            aria-label="Mobile navigation menu"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "secondary" : "ghost"}
                  size="sm"
                  role={ARIA_ROLES.MENUITEM}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    w-full justify-start text-left h-auto p-3
                    ${activeTab === tab.id
                      ? 'border-l-4 border-primary rounded-l-none'
                      : ''
                    }
                  `}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                  aria-label={`${tab.label}. ${tab.description}`}
                >
                  <tab.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  <div>
                    <div className="font-medium">{tab.label}</div>
                    <div className="text-sm text-muted-foreground mt-1">{tab.description}</div>
                  </div>
                  {activeTab === tab.id && (
                    <span className="sr-only">Currently selected</span>
                  )}
                </Button>
              ))}
            </div>
            <div className="border-t border-border px-4 py-3">
              <div className="text-sm text-muted-foreground" role="status" aria-live="polite">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}