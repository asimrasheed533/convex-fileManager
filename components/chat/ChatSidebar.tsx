'use client';

import { Search, CircleX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Contact } from '@/types';
import { ScrollArea } from '../ui/scroll-area';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import NewGroupModal from '../new-group-modal';

interface ChatSidebarProps {
  contacts: Contact[];
  selectedContact: Contact;
  onContactSelect: (contact: Contact) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({ contacts, selectedContact, onContactSelect, isOpen, onClose }: ChatSidebarProps) {
  const [query, setQuery] = useState('');

  return (
    <div
      className={cn(
        'w-80 bg-card/80 backdrop-blur-sm border-r border-border/50 flex flex-col transition-transform duration-300 ease-in-out',
        'md:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        'absolute md:relative z-20 h-full',
      )}
    >
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-foreground">Messages</h1>
          <Button variant="ghost" size="sm" className="md:hidden" onClick={onClose}>
            <CircleX />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Search conversations..." className="pl-10 bg-background/50 border-border/50" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <NewGroupModal />
      </div>
      <ScrollArea className={cn('flex-1 overflow-y-auto', 'max-h-[calc(100vh-8rem)]', 'md:max-h-none')}>
        <div className="p-2">
          {contacts
            .filter((contact) => contact.name.toLowerCase().includes(query.toLowerCase()))
            .map((contact) => (
              <Card
                key={contact.id}
                className={cn(
                  'p-3 mb-2 cursor-pointer transition-all duration-200 hover:bg-accent/50 border border-border/30',
                  'flex w-full sm:w-auto sm:max-w-md',
                  selectedContact.id === contact.id && 'bg-accent border-primary/30',
                )}
                onClick={() => onContactSelect(contact)}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-12 w-12 sm:h-14 sm:w-14">
                      <AvatarImage src={contact.avatar || '/placeholder.svg'} alt={contact.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {contact.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    {contact.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-card" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-foreground truncate">{contact.name}</div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">{contact.timestamp}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{contact.lastMessage?.split(' ').slice(0, 5).join(' ') + (contact.lastMessage?.split(' ').length > 6 ? '...' : '')}</div>
                  </div>

                  {contact.unread && (
                    <Badge variant="default" className="bg-primary text-primary-foreground ml-2 flex-shrink-0">
                      {contact.unread}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
