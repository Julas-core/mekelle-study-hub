import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ExternalLink } from 'lucide-react';

interface MuslimNamePopupProps {
  isOpen: boolean;
  onClose: () => void;
  onJoin: () => void;
  userName: string;
}

const MuslimNamePopup = ({ isOpen, onClose, onJoin, userName }: MuslimNamePopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close popup"
        >
          <X className="h-5 w-5" />
        </button>
        
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle className="text-xl">Welcome, {userName}!</CardTitle>
            <Badge variant="default">Muslim</Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Assalamu Alaikum! We noticed your name and thought you might be interested in joining our 
            Muslim student community on Telegram. Connect with fellow students, share resources, 
            and participate in study groups.
          </p>
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2">
          <Button 
            className="w-full flex items-center gap-2"
            onClick={onJoin}
          >
            Join Telegram Group
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
          >
            Not Interested
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default MuslimNamePopup;