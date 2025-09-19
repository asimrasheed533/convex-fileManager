'use client';

import { useState } from 'react';

import { Contact } from '@/types';
import { ChatSidebar } from '@/components/chat/ChatSidebar';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'contact';
  timestamp: string;
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
    },
    {
      id: '2',
      content: 'Yeah, just reviewing the presentation',
      sender: 'user',
      timestamp: '13:51',
    },
    {
      id: '3',
      content: 'Great work on the slides! Love it! Just one more thing...',
      sender: 'contact',
      timestamp: '13:53',
    },
    {
      id: '4',
      content: 'Could we adjust the color scheme on slide 5?',
      sender: 'contact',
      timestamp: '13:53',
    },
  ],
};

export default function ChatLayout() {
  const [selectedChat, setSelectedChat] = useState<null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact>(contacts[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={'flex h-screen bg-gray-100 dark:bg-gray-900'}>
      <ChatSidebar contacts={contacts} selectedContact={selectedContact} onContactSelect={setSelectedContact} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          // <ChatContainer messages={getMessages || []} onSendMessage={handleSendMessage} chatTitle={selectedChat.name} chatSubtitle={'Online'} />
          <>sds</>
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
    </div>
  );
}
