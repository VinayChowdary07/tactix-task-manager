
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmailVerificationAlertProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

const EmailVerificationAlert: React.FC<EmailVerificationAlertProps> = ({
  isOpen,
  onClose,
  email
}) => {
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="max-w-md bg-slate-900/95 backdrop-blur-xl border border-slate-700/50">
        <AlertDialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/20">
            <Mail className="w-8 h-8 text-cyan-400" />
          </div>
          <AlertDialogTitle className="text-xl font-bold text-white">
            Please Verify Your Email
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-300 mt-2">
            We've sent a verification link to:
            <br />
            <span className="font-medium text-cyan-400">{email}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-4">
          <Alert className="bg-slate-800/50 border-cyan-500/20">
            <CheckCircle className="h-4 w-4 text-cyan-400" />
            <AlertTitle className="text-cyan-400">Next Steps:</AlertTitle>
            <AlertDescription className="text-slate-300 mt-2">
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Check your email inbox</li>
                <li>Look in your spam/junk folder if needed</li>
                <li>Click the verification link</li>
                <li>Return here and refresh the page</li>
              </ol>
            </AlertDescription>
          </Alert>
        </div>

        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-slate-800"
          >
            I've Verified - Refresh
          </Button>
          <AlertDialogAction 
            onClick={onClose}
            className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            I'll Verify Later
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EmailVerificationAlert;
