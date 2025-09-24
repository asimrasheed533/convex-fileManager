'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';
import useAuth from '@/hooks/use-auth';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

export default function NewGroupModal() {
  const [open, setOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const createGroup = useMutation(api.chat.createGroup);
  const user = useAuth();

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    const chatId = await createGroup({
      name: groupName,
      createBy: user._id,
      initialParticipants: [],
    });
    if (!chatId) {
      toast.error('Failed to create group');
      return;
    }

    setLoading(true);
    try {
      const invite = `${window.location.origin}/invite/${Math.random().toString(36).slice(2, 10)}`;
      setInviteUrl(invite);

      await navigator.clipboard.writeText(invite);

      toast.success('Group created! Invite link copied automatically.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (inviteUrl) {
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          New Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
          <DialogDescription>Create a new group chat with your contacts</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <Input placeholder="Group Name" value={groupName} onChange={(e) => setGroupName(e.target.value)} />

          <Button onClick={handleCreate} disabled={loading}>
            {loading ? 'Creating...' : 'Create Group'}
          </Button>

          {inviteUrl && (
            <div className="mt-2">
              <div className="text-sm text-muted-foreground mb-1">Invite Link (already copied)</div>
              <div className="flex gap-2 items-center">
                <Input value={inviteUrl} readOnly />
                <Button size="sm" onClick={handleCopy}>
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
