"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuthProvider } from "@/contexts/AuthContext"
import {
  artisanService,
  storyService,
  productService,
  type Artisan,
  type Story,
  type Product,
} from "@/lib/firebase-services"
import { aiService } from "@/lib/ai-service"
import { Plus, Edit, Trash2, Users, BookOpen, Package, Sparkles, Eye, Heart } from "lucide-react"
import { AdminArtisanForm } from "@/components/admin/AdminArtisanForm"
import { AdminStoryForm } from "@/components/admin/AdminStoryForm"
import { AdminProductForm } from "@/components/admin/AdminProductForm"

export default function AdminDashboard() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [stories, setStories] = useState<Story[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [showArtisanForm, setShowArtisanForm] = useState(false)
  const [showStoryForm, setShowStoryForm] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      const [artisansData, storiesData, productsData] = await Promise.all([
        artisanService.getAll(),
        storyService.getAll(),
        productService.getAll(),
      ])

      setArtisans(artisansData)
      setStories(storiesData)
      setProducts(productsData)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteArtisan = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this artisan?")) {
      const success = await artisanService.delete(id)
      if (success) {
        setArtisans(artisans.filter((a) => a.id !== id))
      }
    }
  }

  const handleDeleteStory = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this story?")) {
      const success = await storyService.delete(id)
      if (success) {
        setStories(stories.filter((s) => s.id !== id))
      }
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      const success = await productService.delete(id)
      if (success) {
        setProducts(products.filter((p) => p.id !== id))
      }
    }
  }

  const handleEnhanceStory = async (story: Story) => {
    if (!story.id) return

    try {
      const enhanced = await aiService.enhanceStory(story.content, story.craft, story.location)
      if (enhanced.success) {
        const summary = await aiService.generateStorySummary(enhanced.text)

        const success = await storyService.update(story.id, {
          content: enhanced.text,
          aiEnhanced: true,
          aiSummary: summary.success ? summary.text : undefined,
        })

        if (success) {
          fetchAllData() // Refresh data
        }
      }
    } catch (error) {
      console.error("Error enhancing story:", error)
    }
  }

  if (loading) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-soft-cream">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
                <div className="h-32 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-soft-cream">
        <Navigation />

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-serif font-bold text-deep-teal">Admin Dashboard</h1>
            <Badge className="bg-heritage-gold text-deep-teal">Admin Panel</Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="artisans">Artisans</TabsTrigger>
              <TabsTrigger value="stories">Stories</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Overview Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-warm-brown/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-warm-brown text-sm">Total Artisans</p>
                        <p className="text-2xl font-bold text-deep-teal">{artisans.length}</p>
                      </div>
                      <Users className="w-8 h-8 text-heritage-gold" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-warm-brown/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-warm-brown text-sm">Total Stories</p>
                        <p className="text-2xl font-bold text-deep-teal">{stories.length}</p>
                      </div>
                      <BookOpen className="w-8 h-8 text-heritage-gold" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-warm-brown/20">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-warm-brown text-sm">Total Products</p>
                        <p className="text-2xl font-bold text-deep-teal">{products.length}</p>
                      </div>
                      <Package className="w-8 h-8 text-heritage-gold" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <Card className="border-warm-brown/20">
                <CardHeader>
                  <CardTitle className="text-deep-teal">Recent Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stories.slice(0, 5).map((story) => (
                      <div
                        key={story.id}
                        className="flex items-center justify-between p-4 border border-warm-brown/10 rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold text-deep-teal">{story.title}</h4>
                          <p className="text-sm text-warm-brown">by {story.artisanName}</p>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-warm-brown">
                          <div className="flex items-center">
                            <Eye className="w-4 h-4 mr-1" />
                            {story.views}
                          </div>
                          <div className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {story.likes}
                          </div>
                          {story.aiEnhanced && (
                            <Badge className="bg-soft-blue text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI Enhanced
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="artisans" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-deep-teal">Manage Artisans</h2>
                <Button
                  onClick={() => {
                    setEditingItem(null)
                    setShowArtisanForm(true)
                  }}
                  className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Artisan
                </Button>
              </div>

              <div className="grid gap-4">
                {artisans.map((artisan) => (
                  <Card key={artisan.id} className="border-warm-brown/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-heritage-gold/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-heritage-gold" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-deep-teal">{artisan.name}</h3>
                            <p className="text-sm text-warm-brown">
                              {artisan.craft} • {artisan.location}
                            </p>
                            <div className="flex items-center mt-1">
                              <Badge
                                className={
                                  artisan.verified ? "bg-sage-green text-white" : "bg-warm-brown/20 text-warm-brown"
                                }
                              >
                                {artisan.verified ? "Verified" : "Pending"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(artisan)
                              setShowArtisanForm(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => artisan.id && handleDeleteArtisan(artisan.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stories" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-deep-teal">Manage Stories</h2>
                <Button
                  onClick={() => {
                    setEditingItem(null)
                    setShowStoryForm(true)
                  }}
                  className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Story
                </Button>
              </div>

              <div className="grid gap-4">
                {stories.map((story) => (
                  <Card key={story.id} className="border-warm-brown/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-heritage-gold/10 rounded-full flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-heritage-gold" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-deep-teal">{story.title}</h3>
                            <p className="text-sm text-warm-brown">
                              by {story.artisanName} • {story.location}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                className={
                                  story.featured ? "bg-sunset-orange text-white" : "bg-warm-brown/20 text-warm-brown"
                                }
                              >
                                {story.featured ? "Featured" : "Regular"}
                              </Badge>
                              {story.aiEnhanced && (
                                <Badge className="bg-soft-blue text-white">
                                  <Sparkles className="w-3 h-3 mr-1" />
                                  AI Enhanced
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!story.aiEnhanced && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEnhanceStory(story)}
                              className="border-soft-blue text-soft-blue hover:bg-soft-blue hover:text-white"
                            >
                              <Sparkles className="w-4 h-4 mr-1" />
                              Enhance with AI
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(story)
                              setShowStoryForm(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => story.id && handleDeleteStory(story.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-deep-teal">Manage Products</h2>
                <Button
                  onClick={() => {
                    setEditingItem(null)
                    setShowProductForm(true)
                  }}
                  className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Product
                </Button>
              </div>

              <div className="grid gap-4">
                {products.map((product) => (
                  <Card key={product.id} className="border-warm-brown/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-heritage-gold/10 rounded-full flex items-center justify-center">
                            <Package className="w-6 h-6 text-heritage-gold" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-deep-teal">{product.name}</h3>
                            <p className="text-sm text-warm-brown">
                              by {product.artisanName} • ₹{product.price.toLocaleString()}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge
                                className={product.inStock ? "bg-sage-green text-white" : "bg-warm-red text-white"}
                              >
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </Badge>
                              {product.featured && <Badge className="bg-sunset-orange text-white">Featured</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(product)
                              setShowProductForm(true)
                            }}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => product.id && handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Forms */}
        {showArtisanForm && (
          <AdminArtisanForm
            artisan={editingItem}
            onClose={() => {
              setShowArtisanForm(false)
              setEditingItem(null)
            }}
            onSave={() => {
              setShowArtisanForm(false)
              setEditingItem(null)
              fetchAllData()
            }}
          />
        )}

        {showStoryForm && (
          <AdminStoryForm
            story={editingItem}
            artisans={artisans}
            onClose={() => {
              setShowStoryForm(false)
              setEditingItem(null)
            }}
            onSave={() => {
              setShowStoryForm(false)
              setEditingItem(null)
              fetchAllData()
            }}
          />
        )}

        {showProductForm && (
          <AdminProductForm
            product={editingItem}
            artisans={artisans}
            onClose={() => {
              setShowProductForm(false)
              setEditingItem(null)
            }}
            onSave={() => {
              setShowProductForm(false)
              setEditingItem(null)
              fetchAllData()
            }}
          />
        )}
      </div>
    </AuthProvider>
  )
}
