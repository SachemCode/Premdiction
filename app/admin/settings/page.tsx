"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"
import { Upload, Image, Info, Check } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)

    // Simulate upload process
    setTimeout(() => {
      setIsUploading(false)
      setUploadSuccess(true)

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      })

      // Reset success state after a delay
      setTimeout(() => setUploadSuccess(false), 3000)
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your prediction game</p>
      </div>

      <Tabs defaultValue="images" className="space-y-4">
        <TabsList>
          <TabsTrigger value="images" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            Images
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            General
          </TabsTrigger>
        </TabsList>

        <TabsContent value="images">
          <Card>
            <CardHeader>
              <CardTitle>Image Management</CardTitle>
              <CardDescription>Learn how to add team logos and other images to your prediction game</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adding Team Logos</h3>

                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <h4 className="font-medium">Step 1: Prepare your images</h4>
                  <p className="text-sm text-muted-foreground">Prepare your team logo images. For best results:</p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Use PNG format with transparent background</li>
                    <li>Keep file size under 100KB</li>
                    <li>Use square dimensions (e.g., 200x200 pixels)</li>
                    <li>Name files consistently (e.g., team-name.png)</li>
                  </ul>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <h4 className="font-medium">Step 2: Upload to your hosting</h4>
                  <p className="text-sm text-muted-foreground">
                    Upload your images to a hosting service. You have several options:
                  </p>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Upload directly to your Vercel project in the /public folder</li>
                    <li>Use an image hosting service like Cloudinary or Imgur</li>
                    <li>Use GitHub to host images in your repository</li>
                  </ul>

                  <div className="mt-4">
                    <Label htmlFor="image-upload" className="mb-2 block">
                      Upload image to your project
                    </Label>
                    <div className="flex items-center gap-4">
                      <Input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                      <Button disabled={isUploading}>
                        {isUploading ? (
                          <>Uploading...</>
                        ) : uploadSuccess ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Uploaded
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Note: This is a demo. In a real app, you would upload to your hosting service.
                    </p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg space-y-4">
                  <h4 className="font-medium">Step 3: Update the team data</h4>
                  <p className="text-sm text-muted-foreground">
                    After uploading, update the team data in your project:
                  </p>
                  <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                    <li>
                      Open the file <code>lib/db.ts</code>
                    </li>
                    <li>
                      Find the <code>teams</code> array
                    </li>
                    <li>
                      Update the <code>logo</code> property for each team with the URL to your image
                    </li>
                  </ol>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-md text-sm font-mono mt-2 overflow-x-auto">
                    <pre>{`// Example in lib/db.ts
const teams: Team[] = [
  { 
    id: "team_1", 
    name: "Arsenal", 
    shortName: "ARS", 
    logo: "/teams/arsenal.png" // Path in public folder
  },
  // ... other teams
]`}</pre>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Adding Other Images</h3>
                <p className="text-sm text-muted-foreground">
                  For other images like backgrounds, banners, or profile pictures, follow the same process:
                </p>
                <ol className="list-decimal pl-5 text-sm text-muted-foreground space-y-1">
                  <li>Prepare your images in appropriate formats and sizes</li>
                  <li>Upload to your hosting service</li>
                  <li>Use the image URL in your components</li>
                </ol>
                <p className="text-sm text-muted-foreground">
                  For profile pictures, users can upload their own images through the profile edit page.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure general settings for your prediction game</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">General settings will be available in a future update.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
