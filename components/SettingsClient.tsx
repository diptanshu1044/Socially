"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Mail, 
  Lock, 
  Trash2,
  Camera,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import ModeToggle from "./ModeToggle";

export function SettingsClient() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  
  // Profile settings state
  const [profileData, setProfileData] = useState({
    name: user?.fullName || "",
    username: user?.username || "",
    bio: "",
    location: "",
    website: "",
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    likes: true,
    comments: true,
    follows: true,
    mentions: true,
    messages: true,
    emailNotifications: true,
    pushNotifications: true,
  });

  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showEmail: false,
    allowMessages: true,
    allowComments: true,
  });

  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationToggle = (key: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handlePrivacyToggle = (key: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "account", label: "Account", icon: Lock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Settings</h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Manage your account preferences and privacy settings
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Profile Settings */}
      {activeTab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your profile information and personal details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback className="text-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Camera className="w-4 h-4" />
                  Change Photo
                </Button>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  JPG, PNG or GIF. Max size 2MB.
                </p>
              </div>
            </div>

            <Separator />

            {/* Profile Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={profileData.username}
                  onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Enter your username"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profileData.location}
                  onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Where are you based?"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={profileData.website}
                  onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleProfileUpdate} disabled={isLoading} className="gap-2">
                <Save className="w-4 h-4" />
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      {activeTab === "notifications" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Likes</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    When someone likes your posts
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.likes}
                  onCheckedChange={() => handleNotificationToggle("likes")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Comments</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    When someone comments on your posts
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.comments}
                  onCheckedChange={() => handleNotificationToggle("comments")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">New Followers</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    When someone follows you
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.follows}
                  onCheckedChange={() => handleNotificationToggle("follows")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Mentions</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    When someone mentions you
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.mentions}
                  onCheckedChange={() => handleNotificationToggle("mentions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Messages</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    When someone sends you a message
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.messages}
                  onCheckedChange={() => handleNotificationToggle("messages")}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={() => handleNotificationToggle("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive notifications on your device
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.pushNotifications}
                  onCheckedChange={() => handleNotificationToggle("pushNotifications")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Privacy Settings */}
      {activeTab === "privacy" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </CardTitle>
            <CardDescription>
              Control who can see your profile and interact with you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Profile Visibility</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Who can see your profile
                  </p>
                </div>
                <select
                  value={privacySettings.profileVisibility}
                  onChange={(e) => setPrivacySettings(prev => ({ ...prev, profileVisibility: e.target.value }))}
                  className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800"
                >
                  <option value="public">Public</option>
                  <option value="followers">Followers Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Show Email</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Display your email on your profile
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={() => handlePrivacyToggle("showEmail")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Allow Messages</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Let others send you messages
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowMessages}
                  onCheckedChange={() => handlePrivacyToggle("allowMessages")}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium">Allow Comments</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Let others comment on your posts
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowComments}
                  onCheckedChange={() => handlePrivacyToggle("allowComments")}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appearance Settings */}
      {activeTab === "appearance" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how Socially looks and feels
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Theme</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Choose your preferred theme
                </p>
              </div>
              <ModeToggle />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Compact Mode</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reduce spacing for more content
                </p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Auto-play Videos</Label>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Automatically play videos in posts
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Settings */}
      {activeTab === "account" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email & Password
              </CardTitle>
              <CardDescription>
                Update your email address and password
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.emailAddresses[0]?.emailAddress || ""}
                  disabled
                  className="bg-slate-50 dark:bg-slate-800"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Contact support to change your email address
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Lock className="w-4 h-4" />
                  Change Password
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Globe className="w-4 h-4" />
                  Two-Factor Auth
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Trash2 className="w-5 h-5" />
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-950/20">
                <div>
                  <Label className="text-sm font-medium text-red-900 dark:text-red-100">
                    Delete Account
                  </Label>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 