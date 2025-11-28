/**
 * CollectionShareDialog Component (P6-026)
 *
 * Dialog for managing collection sharing settings.
 */

import {
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  GlobeIcon,
  LinkIcon,
  LoaderIcon,
  LockIcon,
  Share2Icon,
  XIcon,
} from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Collection } from "@/lib/api-client";

interface CollectionShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection | null;
  onShare: (
    collectionId: string,
  ) => Promise<{ shareUrl: string; shareToken: string }>;
  onUnshare: (collectionId: string) => Promise<void>;
  isLoading?: boolean;
}

export function CollectionShareDialog({
  open,
  onOpenChange,
  collection,
  onShare,
  onUnshare,
  isLoading = false,
}: CollectionShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUnshareConfirm, setShowUnshareConfirm] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isUnsharing, setIsUnsharing] = useState(false);

  if (!collection) return null;

  const isShared = collection.isShared;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const currentShareUrl = collection.shareToken
    ? `${baseUrl}/shared/${collection.shareToken}`
    : shareUrl;

  const handleShare = async () => {
    if (isShared) return;

    setIsSharing(true);
    try {
      const result = await onShare(collection.id);
      setShareUrl(result.shareUrl);
    } catch {
      // Error handling done in parent
    } finally {
      setIsSharing(false);
    }
  };

  const handleUnshare = async () => {
    setIsUnsharing(true);
    try {
      await onUnshare(collection.id);
      setShareUrl(null);
      setShowUnshareConfirm(false);
    } catch {
      // Error handling done in parent
    } finally {
      setIsUnsharing(false);
    }
  };

  const handleCopy = async () => {
    if (!currentShareUrl) return;

    try {
      await navigator.clipboard.writeText(currentShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = currentShareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2Icon className="h-5 w-5" />
              Share Collection
            </DialogTitle>
            <DialogDescription>
              Share &quot;{collection.name}&quot; with others
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Current status */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                {isShared ? (
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <GlobeIcon className="h-5 w-5 text-green-500" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <LockIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-medium">
                    {isShared ? "Shared" : "Private"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isShared
                      ? "Anyone with the link can view"
                      : "Only you can see this collection"}
                  </p>
                </div>
              </div>
              <Badge variant={isShared ? "default" : "secondary"}>
                {isShared ? "Public" : "Private"}
              </Badge>
            </div>

            {/* Share link (if shared) */}
            {(isShared || shareUrl) && currentShareUrl && (
              <div className="space-y-2">
                <Label>Share Link</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={currentShareUrl}
                      readOnly
                      className="pl-9 pr-20 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7"
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4 text-green-500" />
                          <span className="sr-only">Copied</span>
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-4 w-4" />
                          <span className="sr-only">Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(currentShareUrl, "_blank")}
                    title="Open in new tab"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Anyone with this link can view the collection and its
                  bookmarks
                </p>
              </div>
            )}

            {/* Info about sharing */}
            {!(isShared || shareUrl) && (
              <div className="p-4 border border-dashed rounded-lg space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <GlobeIcon className="h-4 w-4" />
                  What happens when you share?
                </div>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>A unique link is generated for this collection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>Anyone with the link can view bookmarks</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckIcon className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <span>You can stop sharing at any time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XIcon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Viewers cannot edit or add bookmarks</span>
                  </li>
                </ul>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {isShared ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowUnshareConfirm(true)}
                  disabled={isLoading || isUnsharing}
                >
                  <LockIcon className="mr-2 h-4 w-4" />
                  Stop Sharing
                </Button>
                <Button onClick={() => onOpenChange(false)}>Done</Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button onClick={handleShare} disabled={isLoading || isSharing}>
                  {isSharing && (
                    <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  <Share2Icon className="mr-2 h-4 w-4" />
                  Create Share Link
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unshare confirmation */}
      <AlertDialog
        open={showUnshareConfirm}
        onOpenChange={setShowUnshareConfirm}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop sharing this collection?</AlertDialogTitle>
            <AlertDialogDescription>
              The current share link will stop working immediately. Anyone who
              has the link will no longer be able to view this collection.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUnsharing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleUnshare}
              disabled={isUnsharing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isUnsharing && (
                <LoaderIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Stop Sharing
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
