'use client';

import { useEffect, useState } from 'react';

import { Contact } from '@/types';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import ChatBox from '@/components/chat/chat-box';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'contact';
  timestamp: string;
  avatar: string;
}

const contacts: Contact[] = [
  {
    id: '1',
    name: 'Creative Director',
    avatar: '/professional-woman-diverse.png',
    lastMessage: 'Great work on the slides! Love it! Just one more thing...',
    timestamp: '13:53',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Design Team',
    avatar: '/team-group.jpg',
    lastMessage: 'The new mockups are ready for review',
    timestamp: '12:30',
    online: true,
  },
];

const messagesByContact: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      content: 'Hey! Are you here?',
      sender: 'contact',
      timestamp: '13:50',
      avatar: '/api/placeholder/32/32',
    },
    {
      id: '2',
      content: 'Yeah, just reviewing the presentation',
      sender: 'user',
      timestamp: '13:51',
      avatar: '/api/placeholder/32/32',
    },
    {
      id: '3',
      content: 'Great work on the slides! Love it! Just one more thing...',
      sender: 'contact',
      timestamp: '13:53',
      avatar: '/api/placeholder/32/32',
    },
    {
      id: '4',
      content: 'Could we adjust the color scheme on slide 5?',
      sender: 'contact',
      timestamp: '13:53',
      avatar: '/api/placeholder/32/32',
    },
  ],
};

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentMessages = messagesByContact[selectedContact.id] || [];

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedChat(null);
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-chat-gradient-start to-chat-gradient-end">
      <ChatSidebar
        contacts={contacts}
        selectedContact={selectedContact}
        onContactSelect={(contact) => {
          setSelectedContact(contact);
          setSelectedChat(contact.id);
          setIsSidebarOpen(false);
        }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <ChatBox selectedContact={selectedContact} messages={currentMessages} onOpenSidebar={() => setIsSidebarOpen(true)} />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">💬</div>
              <h2 className="text-xl font-medium mb-2">Welcome to Chat</h2>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-10 md:hidden" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
}
