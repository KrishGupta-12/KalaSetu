"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, X } from "lucide-react"
import { productService, type Product } from "@/lib/firebase-service"

interface ProductEditFormProps {
  product: Product
  onProductUpdated: (product: Product) => void
  onCancel: () => void
}

export function ProductEditForm({ product, onProductUpdated, onCancel }: ProductEditFormProps) {
  const [formData, setFormData] = useState({
    name: product.name,
    description: product.description,
    heritage_story: product.heritage_story || "",
    category: product.category,
    price: product.price.toString(),
    stock: product.stock.toString(),
    status: product.status,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const updates: Partial<Product> = {
        name: formData.name,
        description: formData.description,
        heritage_story: formData.heritage_story,
        category: formData.category as Product["category"],
        price: Number.parseFloat(formData.price),
        stock: Number.parseInt(formData.stock),
        status: formData.status as Product["status"],
      }

      const updatedProduct = await productService.updateProduct(product.id, updates)
      onProductUpdated(updatedProduct)
    } catch (err) {
      setError("Failed to update product")
      console.error("Error updating product:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert className="border-warm-red/20 bg-warm-red/5">
          <AlertDescription className="text-warm-red">{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-deep-teal">
            Product Name
          </Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="border-warm-brown/30 focus:border-heritage-gold"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category" className="text-deep-teal">
            Category
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
          >
            <SelectTrigger className="border-warm-brown/30 focus:border-heritage-gold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Textiles">Textiles & Fabrics</SelectItem>
              <SelectItem value="Pottery">Pottery & Ceramics</SelectItem>
              <SelectItem value="Jewelry">Jewelry & Ornaments</SelectItem>
              <SelectItem value="Woodwork">Woodwork & Carving</SelectItem>
              <SelectItem value="Metalwork">Metalwork</SelectItem>
              <SelectItem value="Art">Paintings & Art</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price" className="text-deep-teal">
            Price (₹)
          </Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
            className="border-warm-brown/30 focus:border-heritage-gold"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="stock" className="text-deep-teal">
            Stock
          </Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
            className="border-warm-brown/30 focus:border-heritage-gold"
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="status" className="text-deep-teal">
            Status
          </Label>
          <Select
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger className="border-warm-brown/30 focus:border-heritage-gold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="sold_out">Sold Out</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-deep-teal">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
          className="border-warm-brown/30 focus:border-heritage-gold"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="heritage_story" className="text-deep-teal">
          Heritage Story
        </Label>
        <Textarea
          id="heritage_story"
          value={formData.heritage_story}
          onChange={(e) => setFormData((prev) => ({ ...prev, heritage_story: e.target.value }))}
          className="border-warm-brown/30 focus:border-heritage-gold"
          rows={3}
          placeholder="Share the cultural significance and traditional techniques..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Update Product
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-warm-brown text-warm-brown hover:bg-warm-brown hover:text-soft-cream bg-transparent"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </form>
  )
}
