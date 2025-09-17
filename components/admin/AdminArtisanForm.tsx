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
import { artisanService, type Artisan } from "@/lib/firebase-services"
import { aiService } from "@/lib/ai-service"
import { X, Sparkles, Plus, Trash2 } from "lucide-react"

interface AdminArtisanFormProps {
  artisan?: Artisan | null
  onClose: () => void
  onSave: () => void
}

export function AdminArtisanForm({ artisan, onClose, onSave }: AdminArtisanFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    craft: "",
    experience: 0,
    bio: "",
    profileImage: "",
    rating: 5,
    reviewCount: 0,
    specialties: [] as string[],
    verified: false,
  })
  const [newSpecialty, setNewSpecialty] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)

  useEffect(() => {
    if (artisan) {
      setFormData({
        name: artisan.name,
        email: artisan.email,
        phone: artisan.phone,
        location: artisan.location,
        craft: artisan.craft,
        experience: artisan.experience,
        bio: artisan.bio,
        profileImage: artisan.profileImage,
        rating: artisan.rating,
        reviewCount: artisan.reviewCount,
        specialties: artisan.specialties,
        verified: artisan.verified,
      })
    }
  }, [artisan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (artisan?.id) {
        // Update existing artisan
        await artisanService.update(artisan.id, formData)
      } else {
        // Create new artisan
        await artisanService.create(formData)
      }
      onSave()
    } catch (error) {
      console.error("Error saving artisan:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIBio = async () => {
    if (!formData.name || !formData.craft || !formData.location) {
      alert("Please fill in name, craft, and location first")
      return
    }

    setAiGenerating(true)
    try {
      const result = await aiService.generateArtisanBio(
        formData.name,
        formData.craft,
        formData.experience,
        formData.location,
      )

      if (result.success) {
        setFormData((prev) => ({ ...prev, bio: result.text }))
      } else {
        alert("Failed to generate bio: " + result.error)
      }
    } catch (error) {
      console.error("Error generating bio:", error)
    } finally {
      setAiGenerating(false)
    }
  }

  const addSpecialty = () => {
    if (newSpecialty.trim() && !formData.specialties.includes(newSpecialty.trim())) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }))
      setNewSpecialty("")
    }
  }

  const removeSpecialty = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-deep-teal">{artisan ? "Edit Artisan" : "Add New Artisan"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="craft">Craft *</Label>
                <Input
                  id="craft"
                  value={formData.craft}
                  onChange={(e) => setFormData((prev) => ({ ...prev, craft: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="experience">Experience (years)</Label>
                <Input
                  id="experience"
                  type="number"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, experience: Number.parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                value={formData.profileImage}
                onChange={(e) => setFormData((prev) => ({ ...prev, profileImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="bio">Bio</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAIBio}
                  disabled={aiGenerating}
                  className="border-soft-blue text-soft-blue hover:bg-soft-blue hover:text-white bg-transparent"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {aiGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                rows={4}
                placeholder="Tell us about this artisan's story and expertise..."
              />
            </div>

            <div>
              <Label>Specialties</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="Add a specialty"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSpecialty())}
                />
                <Button type="button" onClick={addSpecialty} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline" className="border-sunset-orange/30 text-sunset-orange">
                    {specialty}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-auto p-0"
                      onClick={() => removeSpecialty(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  step="0.1"
                  value={formData.rating}
                  onChange={(e) => setFormData((prev) => ({ ...prev, rating: Number.parseFloat(e.target.value) || 5 }))}
                />
              </div>
              <div>
                <Label htmlFor="reviewCount">Review Count</Label>
                <Input
                  id="reviewCount"
                  type="number"
                  value={formData.reviewCount}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, reviewCount: Number.parseInt(e.target.value) || 0 }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="verified"
                checked={formData.verified}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, verified: checked }))}
              />
              <Label htmlFor="verified">Verified Artisan</Label>
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
                {loading ? "Saving..." : "Save Artisan"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
