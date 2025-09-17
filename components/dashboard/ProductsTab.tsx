"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, MoreVertical, Edit, Trash2, Eye, Star, TrendingUp, Loader2, Plus, RefreshCw } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { productService, type Product } from "@/lib/firebase-service"
import { ProductEditForm } from "./ProductEditForm"

export function ProductsTab() {
  const { userProfile } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!userProfile?.id) return

    const loadProducts = async () => {
      try {
        setLoading(true)
        const data = await productService.getProducts(userProfile.id)
        setProducts(data)
      } catch (err) {
        setError("Failed to load products")
        console.error("Error loading products:", err)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()

    // Set up real-time listener
    const unsubscribe = productService.onProductsChange(userProfile.id, (updatedProducts) => {
      setProducts(updatedProducts)
    })

    return unsubscribe
  }, [userProfile?.id])

  const filteredProducts = products.filter((product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    setDeletingId(productId)
    try {
      await productService.deleteProduct(productId)
    } catch (err) {
      setError("Failed to delete product")
      console.error("Error deleting product:", err)
    } finally {
      setDeletingId(null)
    }
  }

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setIsEditDialogOpen(true)
  }

  const handleProductUpdated = (updatedProduct: Product) => {
    setIsEditDialogOpen(false)
    setSelectedProduct(null)
    // Products will be updated via real-time listener
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-heritage-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-warm-red/20 bg-warm-red/5">
          <AlertDescription className="text-warm-red">{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-brown w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border-warm-brown/30 focus:border-heritage-gold"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="border-heritage-gold text-heritage-gold hover:bg-heritage-gold hover:text-deep-teal bg-transparent"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90">
            <Plus className="w-4 h-4 mr-2" />
            Add New Product
          </Button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-warm-brown/20 hover:shadow-lg transition-shadow">
            <div className="relative">
              <img
                src={product.images[0] || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              <div className="absolute top-3 right-3">
                <Badge
                  className={`${
                    product.status === "active"
                      ? "bg-sage-green text-white"
                      : product.status === "sold_out"
                        ? "bg-warm-red text-white"
                        : "bg-warm-brown text-white"
                  }`}
                >
                  {product.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="absolute top-3 left-3">
                <Badge className="bg-heritage-gold text-deep-teal">{product.authenticity_score}% Authentic</Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-deep-teal text-sm line-clamp-2">{product.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-warm-red"
                      onClick={() => handleDeleteProduct(product.id)}
                      disabled={deletingId === product.id}
                    >
                      {deletingId === product.id ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline" className="text-xs border-warm-brown/30">
                  {product.category}
                </Badge>
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-heritage-gold fill-current" />
                  <span className="text-xs text-warm-brown ml-1">{product.rating}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-deep-teal">₹{product.price.toLocaleString()}</span>
                <span className={`text-sm ${product.stock > 0 ? "text-warm-brown" : "text-warm-red"}`}>
                  Stock: {product.stock}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-warm-brown">
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {product.total_orders} orders
                </div>
                <span>ID: {product.id}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && !loading && (
        <Card className="border-warm-brown/20">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-warm-brown/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-warm-brown" />
            </div>
            <h3 className="font-semibold text-deep-teal mb-2">No products found</h3>
            <p className="text-warm-brown mb-4">
              {searchTerm ? "Try adjusting your search terms" : "Add your first product to get started"}
            </p>
            <Button className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-deep-teal">Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductEditForm
              product={selectedProduct}
              onProductUpdated={handleProductUpdated}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
