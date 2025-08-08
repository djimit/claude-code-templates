/**
 * Sidebar - Minimalist navigation sidebar for the analytics dashboard
 * Provides navigation between Dashboard and Agents sections
 */
class Sidebar {
  constructor(container, onNavigate) {
    this.container = container;
    this.onNavigate = onNavigate;
    this.currentPage = 'dashboard';
    this.isCollapsed = true; // Start collapsed for minimal design
    this.hoverTimeout = null;
    
    this.init();
  }

  /**
   * Initialize the sidebar
   */
  init() {
    this.render();
    this.bindEvents();
  }

  /**
   * Render the sidebar structure
   */
  render() {
    this.container.innerHTML = `
      <nav class="sidebar ${this.isCollapsed ? 'collapsed' : ''}">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zM7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
              </svg>
            </div>
            <span class="logo-text">Claude Analytics</span>
          </div>
        </div>
        
        <div class="sidebar-content">
          <ul class="nav-menu">
            <li class="nav-item ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard" title="Dashboard">
              <a href="#" class="nav-link">
                <div class="nav-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z"/>
                  </svg>
                </div>
                <span class="nav-text">Dashboard</span>
              </a>
            </li>
            <li class="nav-item ${this.currentPage === 'agents' ? 'active' : ''}" data-page="agents" title="Agent Chats">
              <a href="#" class="nav-link" id="chats-nav-link">
                <div class="nav-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
                  </svg>
                </div>
                <span class="nav-text">Chats</span>
              </a>
            </li>
          </ul>
        </div>
        
        <!-- Mobile Chat Submenu -->
        <div class="mobile-chat-submenu" id="mobile-chat-submenu">
          <div class="mobile-chat-header">
            <h3>Chats</h3>
            <button class="mobile-chat-close" id="mobile-chat-close">&times;</button>
          </div>
          <div class="conversations-list" id="mobile-conversations-list">
            <!-- Chat conversations will be rendered here -->
          </div>
        </div>
        
        <div class="sidebar-footer">
          <div class="connection-status" title="Connection Status">
            <div class="status-indicator">
              <span class="status-dot ${this.getConnectionStatus()}"></span>
              <span class="status-text">Live</span>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    const sidebar = this.container.querySelector('.sidebar');
    
    // Navigation items
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const page = item.getAttribute('data-page');
        
        // Handle mobile chat submenu
        if (page === 'agents' && this.isMobile()) {
          this.toggleMobileChatSubmenu();
        } else {
          this.navigateToPage(page);
        }
      });
    });
    
    // Mobile chat submenu events
    const mobileChatClose = this.container.querySelector('#mobile-chat-close');
    if (mobileChatClose) {
      mobileChatClose.addEventListener('click', () => {
        this.closeMobileChatSubmenu();
      });
    }

    // Hover to expand when collapsed
    sidebar.addEventListener('mouseenter', () => {
      if (this.isCollapsed) {
        this.expandOnHover();
      }
    });

    sidebar.addEventListener('mouseleave', () => {
      if (this.isCollapsed) {
        this.collapseOnLeave();
      }
    });
  }

  /**
   * Set active page (visual update only)
   * @param {string} page - Page identifier
   */
  setActivePage(page) {
    // Update active state visually
    const navItems = this.container.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.classList.toggle('active', item.getAttribute('data-page') === page);
    });
    
    this.currentPage = page;
  }

  /**
   * Handle navigation click and notify parent
   * @param {string} page - Page identifier
   */
  navigateToPage(page) {
    if (page === this.currentPage) return;
    
    console.log(`🖱️ Sidebar navigation clicked: ${page}`);
    
    // Notify parent component for actual navigation
    if (this.onNavigate) {
      this.onNavigate(page);
    }
  }

  /**
   * Expand sidebar on hover
   */
  expandOnHover() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    
    const sidebar = this.container.querySelector('.sidebar');
    sidebar.classList.add('hover-expanded');
  }

  /**
   * Collapse sidebar when mouse leaves
   */
  collapseOnLeave() {
    this.hoverTimeout = setTimeout(() => {
      const sidebar = this.container.querySelector('.sidebar');
      sidebar.classList.remove('hover-expanded');
    }, 200); // Small delay to prevent flickering
  }

  /**
   * Get connection status class
   * @returns {string} Status class
   */
  getConnectionStatus() {
    // This would normally check actual connection status
    return 'connected';
  }

  /**
   * Update connection status
   * @param {string} status - Connection status
   */
  updateConnectionStatus(status) {
    const statusDot = this.container.querySelector('.status-dot');
    const statusText = this.container.querySelector('.status-text');
    
    if (statusDot) {
      statusDot.className = `status-dot ${status}`;
    }
    
    if (statusText) {
      statusText.textContent = status === 'connected' ? 'Live' : 'Offline';
    }
  }
  
  /**
   * Check if device is mobile
   * @returns {boolean}
   */
  isMobile() {
    return window.innerWidth <= 768;
  }
  
  /**
   * Toggle mobile chat submenu
   */
  toggleMobileChatSubmenu() {
    const submenu = this.container.querySelector('#mobile-chat-submenu');
    if (submenu) {
      submenu.classList.toggle('active');
      
      // Load conversations if opening
      if (submenu.classList.contains('active')) {
        this.loadMobileChatConversations();
      }
    }
  }
  
  /**
   * Close mobile chat submenu
   */
  closeMobileChatSubmenu() {
    const submenu = this.container.querySelector('#mobile-chat-submenu');
    if (submenu) {
      submenu.classList.remove('active');
    }
  }
  
  /**
   * Load chat conversations for mobile submenu
   */
  async loadMobileChatConversations() {
    const conversationsList = this.container.querySelector('#mobile-conversations-list');
    if (!conversationsList) return;
    
    try {
      // Get conversations from the main app (if available)
      if (window.agentsPageInstance && window.agentsPageInstance.stateService) {
        const conversations = window.agentsPageInstance.stateService.getStateProperty('conversations') || [];
        const states = window.agentsPageInstance.stateService.getStateProperty('conversationStates') || {};
        
        if (conversations.length > 0) {
          this.renderMobileConversations(conversations, states);
        } else {
          conversationsList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary);">No conversations found</div>';
        }
      }
    } catch (error) {
      console.error('Error loading mobile conversations:', error);
      conversationsList.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-error);">Error loading conversations</div>';
    }
  }
  
  /**
   * Render conversations in mobile submenu
   */
  renderMobileConversations(conversations, states) {
    const conversationsList = this.container.querySelector('#mobile-conversations-list');
    if (!conversationsList) return;
    
    const conversationsHTML = conversations.slice(0, 20).map(conv => {
      const projectName = conv.project || 'Unknown Project';
      const avatarText = projectName.charAt(0).toUpperCase();
      const state = states[conv.id] || 'unknown';
      const stateClass = this.getStateClass(state);
      
      return `
        <div class="sidebar-conversation-item mobile-chat-item" data-id="${conv.id}">
          <div class="sidebar-conversation-header">
            <div class="sidebar-conversation-title">
              <div class="chat-avatar">${avatarText}</div>
              <div class="sidebar-conversation-info">
                <h4 class="sidebar-conversation-name">${projectName}</h4>
                <div class="sidebar-conversation-meta">
                  <span class="sidebar-meta-item">
                    <span class="status-dot ${stateClass}"></span>
                    ${this.getStateLabel(state)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    conversationsList.innerHTML = conversationsHTML;
    
    // Bind click events for mobile conversations
    const mobileItems = conversationsList.querySelectorAll('.mobile-chat-item');
    mobileItems.forEach(item => {
      item.addEventListener('click', () => {
        const conversationId = item.dataset.id;
        this.selectMobileConversation(conversationId);
      });
    });
  }
  
  /**
   * Select conversation from mobile submenu
   */
  selectMobileConversation(conversationId) {
    // Close submenu
    this.closeMobileChatSubmenu();
    
    // Navigate to agents page and select conversation
    this.navigateToPage('agents');
    
    // Wait for page to load then select conversation
    setTimeout(() => {
      if (window.agentsPageInstance && window.agentsPageInstance.selectConversation) {
        window.agentsPageInstance.selectConversation(conversationId);
      }
    }, 100);
  }
  
  /**
   * Get state class for conversation state
   */
  getStateClass(state) {
    const stateMap = {
      'active': 'status-active',
      'typing': 'status-typing', 
      'pending': 'status-pending',
      'recent': 'status-recent',
      'inactive': 'status-inactive',
      'old': 'status-old',
      'completed': 'status-completed',
      'waiting': 'status-waiting'
    };
    return stateMap[state] || 'status-unknown';
  }
  
  /**
   * Get state label for conversation state
   */
  getStateLabel(state) {
    const labelMap = {
      'active': 'Active',
      'typing': 'Typing',
      'pending': 'Pending', 
      'recent': 'Recent',
      'inactive': 'Inactive',
      'old': 'Old',
      'completed': 'Done',
      'waiting': 'Waiting'
    };
    return labelMap[state] || 'Unknown';
  }

  /**
   * Destroy sidebar
   */
  destroy() {
    // Clean up event listeners and DOM
    this.container.innerHTML = '';
  }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Sidebar;
}