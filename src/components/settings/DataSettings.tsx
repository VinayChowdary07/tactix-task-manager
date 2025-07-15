
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Database, Download, Upload, Shield } from 'lucide-react';
import { useDataExport } from '@/hooks/useDataExport';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

export const DataSettings = () => {
  const { exportData, deleteAllData, isExporting, isDeleting } = useDataExport();
  const { signOut } = useAuth();
  const [confirmText, setConfirmText] = useState('');

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a JSON file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        // TODO: Implement data import logic
        console.log('Import data:', data);
        toast.success('Data import feature will be available soon');
      } catch (error) {
        toast.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAllData = async () => {
    if (confirmText !== 'DELETE ALL DATA') {
      toast.error('Please type "DELETE ALL DATA" to confirm');
      return;
    }

    try {
      await deleteAllData();
      await signOut();
    } catch (error) {
      console.error('Error deleting data:', error);
    }
  };

  return (
    <Card className="glass-dark border-slate-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Database className="w-5 h-5 mr-2 text-orange-400" />
          Data Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Data */}
        <div className="p-4 rounded-lg glass border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium mb-1">Export Your Data</h4>
              <p className="text-slate-400 text-sm">Download all your tasks, projects, and settings</p>
            </div>
            <Button 
              variant="outline" 
              className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50"
              onClick={() => exportData()}
              disabled={isExporting}
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Import Data */}
        <div className="p-4 rounded-lg glass border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium mb-1">Import Data</h4>
              <p className="text-slate-400 text-sm">Import tasks and projects from other apps</p>
            </div>
            <Label htmlFor="data-import">
              <Button 
                variant="outline" 
                className="bg-slate-800/50 border-slate-600 hover:bg-slate-700/50 cursor-pointer"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </span>
              </Button>
            </Label>
            <input
              id="data-import"
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImport}
            />
          </div>
        </div>

        {/* Storage Usage */}
        <div className="p-4 rounded-lg glass border border-slate-700/50">
          <h4 className="text-white font-medium mb-3">Storage Usage</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Used Storage</span>
              <span className="text-white">125 MB of 1 GB</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div className="w-1/8 h-2 bg-gradient-to-r from-green-500 to-cyan-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-4 rounded-lg border-2 border-red-500/50 bg-red-500/5">
          <h4 className="text-red-400 font-medium mb-3 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Danger Zone
          </h4>
          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full" disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete All Data'}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-dark border-slate-700">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-300">
                    This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="my-4">
                  <Label htmlFor="confirm-delete" className="text-slate-200">
                    Type "DELETE ALL DATA" to confirm:
                  </Label>
                  <Input
                    id="confirm-delete"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="mt-2 bg-slate-800/50 border-slate-600"
                    placeholder="DELETE ALL DATA"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 border-slate-600 text-white hover:bg-slate-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAllData}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={confirmText !== 'DELETE ALL DATA'}
                  >
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-slate-400 text-sm">
              This action cannot be undone. All your tasks, projects, and settings will be permanently deleted.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
