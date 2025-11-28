import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Database, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DataCentre() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }

    // Check if user is developer role
    if (!isLoading && user?.role !== "developer") {
      toast({
        title: "Access Denied",
        description: "You don't have access to this page. Developer role required.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return;
    }
  }, [isAuthenticated, isLoading, user, toast]);

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", "/api/account", {});
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your account has been permanently deleted.",
      });
      setTimeout(() => {
        window.location.href = "/api/logout";
      }, 1000);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    },
  });

  const handleDeleteAccount = () => {
    if (confirmText !== "DELETE") {
      toast({
        title: "Confirmation Failed",
        description: 'Please type "DELETE" to confirm account deletion',
        variant: "destructive",
      });
      return;
    }
    deleteAccountMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 space-y-8">
        <Skeleton className="h-20 w-64" />
        <Skeleton className="h-96 w-full rounded-xl" />
      </div>
    );
  }

  if (!user || user.role !== "developer") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/10 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/20 p-3">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl font-bold" data-testid="heading-data-centre">
                Data Centre
              </h1>
              <p className="text-muted-foreground">Manage your account and data</p>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your current account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Username</p>
                <p className="text-lg font-semibold" data-testid="text-username">
                  {user?.username}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-semibold" data-testid="text-email">
                  {user?.email || "Not set"}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="text-lg font-semibold text-primary" data-testid="text-role">
                  Developer
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Member Since</p>
                <p className="text-lg font-semibold" data-testid="text-created-date">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-destructive" />
              <div>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions - proceed with caution</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delete Account Section */}
            <div className="space-y-4 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="space-y-2">
                <h4 className="font-semibold text-destructive flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Delete Account Permanently
                </h4>
                <p className="text-sm text-muted-foreground">
                  Once you delete your account, there is no going back. Please be certain before proceeding. This action will:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Permanently remove your account and all profile data</li>
                  <li>Delete all your messages and stories</li>
                  <li>Remove your shop items and requests</li>
                  <li>Erase all gaming history and notifications</li>
                </ul>
              </div>
              <Button
                variant="destructive"
                size="lg"
                onClick={() => setShowDeleteDialog(true)}
                className="gap-2"
                data-testid="button-delete-account"
              >
                <Trash2 className="h-5 w-5" />
                Delete My Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent data-testid="dialog-delete-account-confirm" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account Permanently?
            </DialogTitle>
            <DialogDescription className="space-y-3">
              <p>This action cannot be undone. This will permanently delete your account and all associated data.</p>
              <p className="font-semibold">Type <span className="font-mono bg-muted px-2 py-1 rounded">DELETE</span> to confirm:</p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Type DELETE to confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              data-testid="input-delete-confirmation"
            />
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setConfirmText("");
                }}
                data-testid="button-cancel-delete"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending || confirmText !== "DELETE"}
                data-testid="button-confirm-delete"
              >
                {deleteAccountMutation.isPending ? "Deleting..." : "Delete Account"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
