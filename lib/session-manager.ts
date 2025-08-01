import { ChatSession, ChatMessage } from './types';

const SESSIONS_KEY = 'chat-sessions';
const CURRENT_SESSION_KEY = 'current-session';

export class SessionManager {
  static getSessions(): ChatSession[] {
    const stored = localStorage.getItem(SESSIONS_KEY);
    if (!stored) return [];
    
    try {
      const sessions = JSON.parse(stored);
      return sessions.map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt),
        messages: s.messages.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        }))
      }));
    } catch {
      return [];
    }
  }

  static saveSession(session: ChatSession): void {
    const sessions = this.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.push(session);
    }
    
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }

  static deleteSession(sessionId: string): void {
    const sessions = this.getSessions().filter(s => s.id !== sessionId);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    
    // If this was the current session, clear it
    if (this.getCurrentSessionId() === sessionId) {
      localStorage.removeItem(CURRENT_SESSION_KEY);
    }
  }

  static renameSession(sessionId: string, newTitle: string): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.title = newTitle;
      session.updatedAt = new Date();
      this.saveSession(session);
    }
  }

  static toggleStar(sessionId: string): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.starred = !session.starred;
      session.updatedAt = new Date();
      this.saveSession(session);
    }
  }

  static getCurrentSessionId(): string | null {
    return localStorage.getItem(CURRENT_SESSION_KEY);
  }

  static setCurrentSessionId(sessionId: string): void {
    localStorage.setItem(CURRENT_SESSION_KEY, sessionId);
  }

  static createNewSession(): ChatSession {
    const session: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [],
      starred: false
    };
    
    this.saveSession(session);
    this.setCurrentSessionId(session.id);
    return session;
  }

  static updateSessionMessages(sessionId: string, messages: ChatMessage[]): void {
    const sessions = this.getSessions();
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      session.messages = messages;
      session.updatedAt = new Date();
      
      // Auto-update title based on first message if it's still "New Chat"
      if (session.title === 'New Chat' && messages.length > 0) {
        const firstUserMessage = messages.find(m => m.role === 'user');
        if (firstUserMessage) {
          session.title = firstUserMessage.content.slice(0, 50) + 
            (firstUserMessage.content.length > 50 ? '...' : '');
        }
      }
      
      this.saveSession(session);
    }
  }
}