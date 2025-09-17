"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productService, type Product, type Artisan } from "@/lib/firebase-services"
import { aiService } from "@/lib/ai-service"
import { X, Sparkles, Plus, Trash2 } from "lucide-react"

interface AdminProductFormProps {
  product?: Product | null
  artisans: Artisan[]
  onClose: () => void
  onSave: () => void
}

export function AdminProductForm({ product, artisans, onClose, onSave }: AdminProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    images: [] as string[],
    artisanId: "",
    artisanName: "",
    craft: "",
    category: "",
    inStock: true,
    featured: false,
  })
  const [newImage, setNewImage] = useState("")
  const [materials, setMaterials] = useState<string[]>([])
  const [newMaterial, setNewMaterial] = useState("")
  const [loading, setLoading] = useState(false)
  const [aiGenerating, setAiGenerating] = useState(false)

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        images: product.images,
        artisanId: product.artisanId,
        artisanName: product.artisanName,
        craft: product.craft,
        category: product.category,
        inStock: product.inStock,
        featured: product.featured,
      })
    }
  }, [product])

  const handleArtisanChange = (artisanId: string) => {
    const selectedArtisan = artisans.find((a) => a.id === artisanId)
    if (selectedArtisan) {
      setFormData((prev) => ({
        ...prev,
        artisanId,
        artisanName: selectedArtisan.name,
        craft: selectedArtisan.craft,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (product?.id) {
        // Update existing product
        await productService.update(product.id, formData)
      } else {
        // Create new product
        await productService.create(formData)
      }
      onSave()
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateAIDescription = async () => {
    if (!formData.name || !formData.craft || materials.length === 0) {
      alert("Please fill in product name, craft, and materials first")
      return
    }

    setAiGenerating(true)
    try {
      const result = await aiService.generateProductDescription(formData.name, formData.craft, materials)

      if (result.success) {
        setFormData((prev) => ({ ...prev, description: result.text }))
      } else {
        alert("Failed to generate description: " + result.error)
      }
    } catch (error) {
      console.error("Error generating description:", error)
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

  const addMaterial = () => {
    if (newMaterial.trim() && !materials.includes(newMaterial.trim())) {
      setMaterials((prev) => [...prev, newMaterial.trim()])
      setNewMaterial("")
    }
  }

  const removeMaterial = (index: number) => {
    setMaterials((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-deep-teal">{product ? "Edit Product" : "Add New Product"}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
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

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: Number.parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., Textiles, Pottery, Jewelry"
                />
              </div>
            </div>

            <div>
              <Label>Materials (for AI description)</Label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  placeholder="Add material"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addMaterial())}
                />
                <Button type="button" onClick={addMaterial} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {materials.map((material, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-heritage-gold/10 text-heritage-gold rounded text-sm"
                  >
                    {material}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => removeMaterial(index)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="description">Description *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAIDescription}
                  disabled={aiGenerating}
                  className="border-soft-blue text-soft-blue hover:bg-soft-blue hover:text-white bg-transparent"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  {aiGenerating ? "Generating..." : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
                placeholder="Describe the product, its craftsmanship, and unique features..."
              />
            </div>

            <div>
              <Label>Product Images</Label>
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

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, inStock: checked }))}
                />
                <Label htmlFor="inStock">In Stock</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, featured: checked }))}
                />
                <Label htmlFor="featured">Featured Product</Label>
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
                {loading ? "Saving..." : "Save Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
