"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthProvider } from "@/contexts/AuthContext"
import { artisanService, type Artisan } from "@/lib/firebase-services"
import { MapPin, Star, Search, Filter, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ArtisansPage() {
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCraft, setSelectedCraft] = useState("all")
  const [selectedLocation, setSelectedLocation] = useState("all")

  useEffect(() => {
    loadArtisans()
  }, [])

  const loadArtisans = async () => {
    try {
      setLoading(true)
      const artisanData = await artisanService.getAll()

      if (artisanData.length === 0) {
        // Fallback to mock data if no data in Firebase
        setArtisans(mockArtisans)
      } else {
        setArtisans(artisanData)
      }
    } catch (error) {
      console.error("Error loading artisans:", error)
      // Fallback to mock data if Firebase fails
      setArtisans(mockArtisans)
    } finally {
      setLoading(false)
    }
  }

  // Mock data as fallback
  const mockArtisans: Artisan[] = [
    {
      id: "1",
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 9876543210",
      location: "Varanasi, Uttar Pradesh",
      craft: "Handloom Weaving",
      experience: 25,
      bio: "Master weaver from Varanasi specializing in Banarasi silk sarees with 25+ years of experience. Priya learned the intricate art of handloom weaving from her grandmother and has been preserving this traditional craft while innovating with contemporary designs. Her work has been featured in national exhibitions and she mentors young weavers in her community.",
      profileImage: "/indian-artisan-weaving-traditional-textiles.jpg",
      rating: 4.9,
      reviewCount: 127,
      specialties: ["Banarasi Silk", "Traditional Motifs", "Wedding Sarees"],
      verified: true,
      createdAt: { toDate: () => new Date() } as any,
      updatedAt: { toDate: () => new Date() } as any,
    },
    {
      id: "2",
      name: "Rajesh Kumar",
      email: "rajesh@example.com",
      phone: "+91 9876543211",
      location: "Khurja, Uttar Pradesh",
      craft: "Pottery",
      experience: 18,
      bio: "Third-generation potter from Khurja, renowned for creating exquisite terracotta and ceramic pieces. Rajesh combines traditional techniques passed down through generations with modern aesthetics to create functional art pieces. His pottery reflects the rich cultural heritage of Indian craftsmanship and has gained recognition both nationally and internationally.",
      profileImage: "/indian-pottery-artisan-creating-clay-vessels.jpg",
      rating: 4.7,
      reviewCount: 89,
      specialties: ["Terracotta", "Blue Pottery", "Decorative Vases"],
      verified: true,
      createdAt: { toDate: () => new Date() } as any,
      updatedAt: { toDate: () => new Date() } as any,
    },
    {
      id: "3",
      name: "Meera Devi",
      email: "meera@example.com",
      phone: "+91 9876543212",
      location: "Jaipur, Rajasthan",
      craft: "Jewelry Making",
      experience: 15,
      bio: "Skilled jewelry artisan from Jaipur creating intricate silver and traditional Rajasthani ornaments. Meera specializes in kundan and meenakari work, techniques that have been perfected over centuries in Rajasthan. Her designs blend traditional motifs with contemporary styling, making them perfect for modern brides who want to honor their heritage.",
      profileImage: "/indian-jewelry-artisan-crafting-silver-ornaments.jpg",
      rating: 4.8,
      reviewCount: 156,
      specialties: ["Kundan Work", "Meenakari", "Bridal Jewelry"],
      verified: true,
      createdAt: { toDate: () => new Date() } as any,
      updatedAt: { toDate: () => new Date() } as any,
    },
  ]

  const filteredArtisans = artisans.filter((artisan) => {
    const matchesSearch =
      artisan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.craft.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCraft = selectedCraft === "all" || artisan.craft === selectedCraft
    const matchesLocation = selectedLocation === "all" || artisan.location.includes(selectedLocation)

    return matchesSearch && matchesCraft && matchesLocation
  })

  const craftTypes = [...new Set(artisans.map((a) => a.craft))]
  const locations = [...new Set(artisans.map((a) => a.location.split(",")[0]))]

  if (loading) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-soft-cream">
          <Navigation />
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse border-warm-brown/20">
                  <CardContent className="p-6">
                    <div className="h-32 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      <div className="h-6 w-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-heritage-gold/10 to-sunset-orange/10 py-16">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-deep-teal mb-4 text-balance">
              Meet Our Talented Artisans
            </h1>
            <p className="text-xl text-warm-brown max-w-2xl mx-auto text-pretty">
              Discover the masters behind the crafts. Each artisan brings generations of knowledge and passion to their
              work.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-brown w-4 h-4" />
              <Input
                placeholder="Search artisans by name or craft..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-warm-brown/20"
              />
            </div>

            <Select value={selectedCraft} onValueChange={setSelectedCraft}>
              <SelectTrigger className="w-full md:w-48 border-warm-brown/20">
                <SelectValue placeholder="All Crafts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crafts</SelectItem>
                {craftTypes.map((craft) => (
                  <SelectItem key={craft} value={craft}>
                    {craft}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48 border-warm-brown/20">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Artisans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtisans.map((artisan) => (
              <Card key={artisan.id} className="group hover:shadow-lg transition-all duration-300 border-warm-brown/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16">
                      <Image
                        src={artisan.profileImage || "/placeholder.svg?height=64&width=64&query=artisan profile"}
                        alt={artisan.name}
                        fill
                        className="rounded-full object-cover"
                      />
                      {artisan.verified && (
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-heritage-gold rounded-full flex items-center justify-center">
                          <Award className="w-3 h-3 text-deep-teal" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg text-deep-teal">{artisan.name}</h3>
                        {artisan.verified && <Badge className="bg-sage-green text-white text-xs">Verified</Badge>}
                      </div>
                      <p className="text-sm text-warm-brown font-medium">{artisan.craft}</p>
                      <div className="flex items-center gap-1 text-xs text-warm-brown">
                        <MapPin className="w-3 h-3" />
                        {artisan.location}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-warm-brown mb-4 line-clamp-2">{artisan.bio}</p>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-heritage-gold text-heritage-gold" />
                      <span className="text-sm font-medium text-deep-teal">{artisan.rating}</span>
                      <span className="text-xs text-warm-brown">({artisan.reviewCount})</span>
                    </div>
                    <div className="text-sm text-warm-brown">{artisan.experience}+ years</div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {artisan.specialties.slice(0, 2).map((specialty) => (
                      <Badge
                        key={specialty}
                        variant="outline"
                        className="text-xs border-sunset-orange/30 text-sunset-orange"
                      >
                        {specialty}
                      </Badge>
                    ))}
                    {artisan.specialties.length > 2 && (
                      <Badge variant="outline" className="text-xs border-sunset-orange/30 text-sunset-orange">
                        +{artisan.specialties.length - 2} more
                      </Badge>
                    )}
                  </div>

                  <Button asChild className="w-full bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90">
                    <Link href={`/artisans/${artisan.id}`}>View Profile</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredArtisans.length === 0 && (
            <div className="text-center py-12">
              <Filter className="w-12 h-12 text-warm-brown/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-deep-teal mb-2">No artisans found</h3>
              <p className="text-warm-brown">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </AuthProvider>
  )
}
