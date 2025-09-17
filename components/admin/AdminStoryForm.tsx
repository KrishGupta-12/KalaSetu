"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { storyService, type Story, type Artisan } from "@/lib/firebase-services"
import { aiService } from "@/lib/ai-service"
import { X, Sparkles, Plus, Trash2 } from "lucide-react"

interface AdminStoryFormProps {
  story?: Story | null
  artisans: Artisan[]
  onClose: () => void
  onSave: () => void
}

export function AdminStoryForm({ story, artisans, onClose, onSave }: AdminStoryFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    artisanId: "",
    artisanName: "",
    craft: "",
    location: "",
    images: [] as string[],
    tags: [] as string[],
    aiEnhanced: false,
    aiSummary: "",
    featured: false,
    views: 0,
    likes: 0,
  })
  const [newImage, setNewImage] = useState("")
  const [newTag, setNewTag] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)

  useEffect(() => {
    if (story) {
      setFormData({
        title: story.title,
        content: story.content,
        artisanId: story.artisanId,
        artisanName: story.artisanName,
        craft: story.craft,
        location: story.location,
        images: story.images,
        tags: story.tags,
        aiEnhanced: story.aiEnhanced,
        aiSummary: story.aiSummary || "",
        featured: story.featured,
        views: story.views,
        likes: story.likes,
      })
    }
  }, [story])

  const handleArtisanChange = (artisanId: string) => {
    const selectedArtisan = artisans.find((a) => a.id === artisanId)
    if (selectedArtisan) {
      setFormData((prev) => ({
        ...prev,
        artisanId,
        artisanName: selectedArtisan.name,
        craft: selectedArtisan.craft,
        location: selectedArtisan.location,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (story?.id) {
        // Update existing story
        await storyService.update(story.id, formData)
      } else {
        // Create new story
        await storyService.create(formData)
      }
      onSave()
    } catch (error) {
      console.error("Error saving story:", error)
    } finally {
      setLoading(false)
    }
  }

  const enhanceWithAI = async () => {
    if (!formData.content || !formData.craft || !formData.location) {
      alert("Please fill in content, craft, and location first")
      return
    }

    setAiGenerating(true)
    try {
      const enhanced = await aiService.enhanceStory(formData.content, formData.craft, formData.location)

      if (enhanced.success) {
        const summary = await aiService.generateStorySummary(enhanced.text)

        setFormData((prev) => ({
          ...prev,
          content: enhanced.text,
          aiEnhanced: true,
          aiSummary: summary.success ? summary.text : "",
        }))
      } else {
        alert("Failed to enhance story: " + enhanced.error)
      }
    } catch (error) {
      console.error("Error enhancing story:", error)
    } finally {
      setAiGenerating(false)
    }
  }

  const addImage = () => {
    if (newImage.trim() && !formData.images.includes(newImage.trim())) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, newImage.trim()],
      }))
      setNewImage("")
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-deep-teal">{story ? "Edit Story" : "Add New Story"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="artisan">Select Artisan *</Label>
              <Select value={formData.artisanId} onValueChange={handleArtisanChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose an artisan" />
                </SelectTrigger>
                <SelectContent>
                  {artisans.map((artisan) => (
                    <SelectItem key={artisan.id} value={artisan.id!}>
                      {artisan.name} - {artisan.craft}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="content">Story Content *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={enhanceWithAI}
                  disabled={aiGenerating || !formData.content}
                  className="border-soft-blue text-soft-blue hover:bg-soft-blue hover:text-white bg-transparent"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {aiGenerating ? "Enhancing..." : "Enhance with AI"}
                </Button>
              </div>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
                placeholder="Tell the artisan's story..."
              />
            </div>

            {formData.aiSummary && (
              <div>
                <Label htmlFor="aiSummary">AI Summary</Label>
                <Textarea
                  id="aiSummary"
                  value={formData.aiSummary}
                  onChange={(e) => setFormData((prev) => ({ ...prev, aiSummary: e.target.value }))}
                  rows={3}
                  placeholder="AI-generated summary..."
                />
              </div>
            )}

            <div>
              <Label>Images</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Add image URL"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addImage())}
                />
                <Button type="button" onClick={addImage} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.images.map((image, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded">
                    <span className="flex-1 text-sm truncate">{image}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Tags</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-sage-green/30 text-sage-green">
                    #{tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0"
                      onClick={() => removeTag(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="views">Views</Label>
                <Input
                  id="views"
                  type="number"
                  value={formData.views}
                  onChange={(e) => setFormData((prev) => ({ ...prev, views: Number.parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div>
                <Label htmlFor="likes">Likes</Label>
                <Input
                  id="likes"
                  type="number"
                  value={formData.likes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, likes: Number.parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Story</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="aiEnhanced"
                  checked={formData.aiEnhanced}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, aiEnhanced: checked }))}
                />
                <Label htmlFor="aiEnhanced">AI Enhanced</Label>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
              >
                {loading ? "Saving..." : "Save Story"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
