/**
 * Profile Settings Page (P7-013)
 *
 * User profile editing.
 */

import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export function ProfilePage() {
  // TODO: Fetch real user data using useAuth hook
  const user = {
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    bio: "Bookmark enthusiast",
    avatar: null as string | null,
    isPublic: false,
  };

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your public profile information.
        </p>
      </div>

      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            This is your avatar. Click to upload a new image.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar || undefined} alt={user.name} />
            <AvatarFallback>
              <User className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline">Upload New Image</Button>
            <p className="text-xs text-muted-foreground">
              JPG, PNG or GIF. Max 2MB.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your profile details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Display Name</Label>
              <Input id="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="flex">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                  @
                </span>
                <Input
                  id="username"
                  defaultValue={user.username}
                  className="rounded-l-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
            <p className="text-xs text-muted-foreground">
              Your email cannot be changed.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              defaultValue={user.bio}
              placeholder="Tell us about yourself..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Brief description for your profile. Max 160 characters.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Visibility</CardTitle>
          <CardDescription>
            Control who can see your profile and bookmarks.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Public Profile</Label>
              <p className="text-sm text-muted-foreground">
                Make your profile visible to everyone at /u/{user.username}
              </p>
            </div>
            <Switch defaultChecked={user.isPublic} />
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Cancel</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  );
}
