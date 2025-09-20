'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Phone, Video, MoreVertical, Menu } from 'lucide-react';
import { Contact } from '@/types';
import { Card } from '../ui/card';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'contact';
  timestamp: string;
}

interface ChatBoxProps {
  selectedContact: Contact;
  messages: Message[];
  onOpenSidebar: () => void;
}

export default function ChatBox({ selectedContact, messages: initialMessages, onOpenSidebar }: ChatBoxProps) {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        content: newMessage,
        sender: 'user',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-card/60 backdrop-blur-sm">
      <div className="p-4 border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={onOpenSidebar}>
              <Menu className="h-4 w-4" />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedContact.avatar || '/placeholder.svg'} alt={selectedContact.name} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {selectedContact.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{selectedContact.name}</h2>
              <p className="text-sm text-muted-foreground">{selectedContact.online ? 'Online' : 'Last seen recently'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'contact' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end space-x-2 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg ${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {message.sender === 'user' && (
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={message.id} alt="Sender" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                )}

                <Card className={`p-3 gap-0 ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.sender === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{message.timestamp}</div>
                </Card>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t bg-card">
        <div className="flex space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <Button onClick={handleSendMessage} size="icon" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
