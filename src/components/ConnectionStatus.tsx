import { Wifi, WifiOff, Database, RefreshCw } from 'lucide-react';
import { useConnectionStatus } from '@/hooks/useConnectionStatus';
import { Button } from './ui/button';

export function ConnectionStatus() {
  const { isOnline, isSupabaseConnected, retryConnection, checkSupabaseConnection } = useConnectionStatus();

  // If everything is connected, don't show anything
  if (isOnline && isSupabaseConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 z-50">
      {!isOnline ? (
        <>
          <WifiOff className="h-5 w-5" />
          <div className="flex-1">
            <span className="text-sm font-medium block">You're offline</span>
            <span className="text-xs opacity-80">Check your internet connection</span>
          </div>
        </>
      ) : !isSupabaseConnected ? (
        <>
          <Database className="h-5 w-5" />
          <div className="flex-1">
            <span className="text-sm font-medium block">Database connection issue</span>
            <span className="text-xs opacity-80">Some features may be limited</span>
          </div>
        </>
      ) : null}
      
      <Button 
        size="sm" 
        variant="secondary" 
        onClick={!isOnline ? retryConnection : checkSupabaseConnection}
        className="text-xs flex items-center gap-1"
      >
        <RefreshCw className="h-3 w-3" />
        Retry
      </Button>
    </div>
  );
}