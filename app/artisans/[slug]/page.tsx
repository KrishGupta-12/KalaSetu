"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AuthProvider } from "@/contexts/AuthContext"
import { artisanService, productService, type Artisan, type Product } from "@/lib/firebase-services"
import { Star, MapPin, Calendar, Award, Phone, Mail, ArrowLeft, ShoppingBag } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ArtisanProfilePage() {
  const params = useParams()
  const slug = params.slug as string
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchArtisanData = async () => {
      try {
        setLoading(true)

        // Get artisan by ID (slug is the artisan ID)
        const artisanData = await artisanService.getById(slug)

        if (!artisanData) {
          setError("Artisan not found")
          return
        }

        setArtisan(artisanData)

        // Get artisan's products
        const artisanProducts = await productService.getByArtisan(slug)
        setProducts(artisanProducts)
      } catch (err) {
        console.error("Error fetching artisan data:", err)
        setError("Failed to load artisan profile")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchArtisanData()
    }
  }, [slug])

  if (loading) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-soft-cream">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                  <div className="h-96 bg-gray-200 rounded-lg mb-6"></div>
                  <div className="h-32 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="lg:col-span-2">
                  <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AuthProvider>
    )
  }

  if (error || !artisan) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-soft-cream">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-deep-teal mb-4">Artisan Not Found</h1>
              <p className="text-warm-brown mb-6">
                {error || "The artisan profile you are looking for does not exist."}
              </p>
              <Button asChild>
                <Link href="/artisans">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Artisans
                </Link>
              </Button>
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
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/artisans">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Artisans
            </Link>
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1">
              <Card className="border-warm-brown/20">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="relative w-32 h-32 mx-auto mb-4">
                      <Image
                        src={artisan.profileImage || "/placeholder.svg?height=128&width=128&query=artisan profile"}
                        alt={artisan.name}
                        fill
                        className="rounded-full object-cover"
                      />
                      {artisan.verified && (
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-heritage-gold rounded-full flex items-center justify-center">
                          <Award className="w-4 h-4 text-deep-teal" />
                        </div>
                      )}
                    </div>
                    <h1 className="text-2xl font-serif font-bold text-deep-teal mb-2">{artisan.name}</h1>
                    <Badge className="bg-heritage-gold/10 text-heritage-gold border-heritage-gold/20 mb-4">
                      {artisan.craft} Artisan
                    </Badge>

                    <div className="flex items-center justify-center mb-4">
                      <div className="flex text-heritage-gold mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(artisan.rating) ? "fill-current" : ""}`} />
                        ))}
                      </div>
                      <span className="text-sm text-warm-brown">
                        {artisan.rating.toFixed(1)} ({artisan.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="space-y-4">
                    <div className="flex items-center text-warm-brown">
                      <MapPin className="w-4 h-4 mr-3 text-heritage-gold" />
                      <span>{artisan.location}</span>
                    </div>
                    <div className="flex items-center text-warm-brown">
                      <Calendar className="w-4 h-4 mr-3 text-heritage-gold" />
                      <span>{artisan.experience}+ years experience</span>
                    </div>
                    <div className="flex items-center text-warm-brown">
                      <Phone className="w-4 h-4 mr-3 text-heritage-gold" />
                      <span>{artisan.phone}</span>
                    </div>
                    <div className="flex items-center text-warm-brown">
                      <Mail className="w-4 h-4 mr-3 text-heritage-gold" />
                      <span>{artisan.email}</span>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="font-semibold text-deep-teal mb-3">Specialties</h3>
                    <div className="flex flex-wrap gap-2">
                      {artisan.specialties.map((specialty, index) => (
                        <Badge key={index} variant="outline" className="border-sunset-orange/30 text-sunset-orange">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full mt-6 bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90">
                    Contact Artisan
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Bio and Products */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bio Section */}
              <Card className="border-warm-brown/20">
                <CardContent className="p-6">
                  <h2 className="text-xl font-serif font-bold text-deep-teal mb-4">About {artisan.name}</h2>
                  <div className="prose prose-warm-brown max-w-none">
                    <p className="text-warm-brown leading-relaxed whitespace-pre-line">{artisan.bio}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Products Section */}
              <Card className="border-warm-brown/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-serif font-bold text-deep-teal">Products by {artisan.name}</h2>
                    <Badge variant="outline" className="border-heritage-gold text-heritage-gold">
                      {products.length} items
                    </Badge>
                  </div>

                  {products.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {products.map((product) => (
                        <Card key={product.id} className="border-warm-brown/10 hover:shadow-lg transition-shadow">
                          <div className="relative h-48 overflow-hidden rounded-t-lg">
                            <Image
                              src={product.images[0] || "/placeholder.svg?height=192&width=300&query=handcraft product"}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            {product.featured && (
                              <Badge className="absolute top-2 right-2 bg-heritage-gold text-deep-teal">Featured</Badge>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-semibold text-deep-teal mb-2">{product.name}</h3>
                            <p className="text-warm-brown text-sm mb-3 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-heritage-gold">
                                ₹{product.price.toLocaleString()}
                              </span>
                              <Button size="sm" className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90">
                                <ShoppingBag className="w-4 h-4 mr-1" />
                                Buy Now
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="w-12 h-12 text-warm-brown/50 mx-auto mb-4" />
                      <p className="text-warm-brown">No products available yet.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}
