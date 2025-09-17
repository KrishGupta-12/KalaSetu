"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/ui/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AuthProvider } from "@/contexts/AuthContext"
import { storyService, type Story } from "@/lib/firebase-services"
import { Heart, Share2, Search, BookOpen, Sparkles, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    loadStories()
  }, [])

  const loadStories = async () => {
    try {
      setLoading(true)
      const storiesData = await storyService.getAll()

      if (storiesData.length === 0) {
        // Fallback to mock data if no stories in database
        setStories(mockStories)
      } else {
        setStories(storiesData)
      }
    } catch (error) {
      console.error("Error loading stories:", error)
      setStories(mockStories)
    } finally {
      setLoading(false)
    }
  }

  // Mock data as fallback
  const mockStories: Story[] = [
    {
      id: "1",
      title: "The Ancient Art of Madhubani: Colors That Tell Stories",
      content:
        'In the heart of Bihar, where the Ganges flows through ancient lands, Priya Sharma sits cross-legged on her courtyard floor, her fingers dancing across handmade paper with a bamboo brush. The vibrant colors of her Madhubani painting seem to pulse with life - deep reds from crushed hibiscus, brilliant yellows from turmeric, and rich blues from indigo. This is not just art; it is a 2,500-year-old tradition that has been passed down through generations of women in her family.\n\nPriya learned this sacred art form from her grandmother, who would tell her stories of gods and goddesses while teaching her the intricate patterns and motifs. Each stroke carries meaning - the fish symbolizes fertility, the peacock represents love, and the lotus signifies purity. "When I paint," Priya explains, "I am not just creating art. I am preserving our culture, our stories, our very soul."\n\nToday, Priya has become a master artist, her work displayed in galleries across India and internationally. She has trained over 200 women in her village, providing them with a source of income while ensuring this beautiful tradition continues to flourish. Her paintings are not just decorative pieces; they are windows into the rich cultural heritage of Bihar, each one telling a story that connects the past with the present.',
      artisanId: "1",
      artisanName: "Priya Sharma",
      craft: "Madhubani Painting",
      location: "Varanasi, Uttar Pradesh",
      images: ["/madhubani-painting-traditional-indian-art.jpg"],
      tags: ["Madhubani", "Traditional Art", "Bihar", "Heritage"],
      aiEnhanced: true,
      aiSummary:
        "Discover how Priya Sharma preserves the 2500-year-old tradition of Madhubani painting, passing down techniques from her grandmother while empowering women in her village.",
      featured: true,
      views: 1247,
      likes: 234,
      createdAt: { toDate: () => new Date("2024-01-15") } as any,
      updatedAt: { toDate: () => new Date("2024-01-15") } as any,
    },
    {
      id: "2",
      title: "From Clay to Soul: A Potter's Journey Through Generations",
      content:
        'The ancient pottery wheel spins rhythmically in Rajesh Kumar\'s workshop in Khurja, Uttar Pradesh, as it has for over three generations. His hands, weathered by years of working with clay, shape the earth with an expertise that seems almost magical. This is the story of a family tradition that has survived the test of time, adapting to modern needs while preserving its authentic roots.\n\nRajesh\'s grandfather established this pottery workshop in 1952, specializing in the famous Khurja pottery known for its distinctive blue and white patterns. "My grandfather used to say that clay has memory," Rajesh shares, his eyes twinkling with warmth. "It remembers every touch, every intention. When you work with respect and love, the clay responds with beauty."\n\nToday, Rajesh creates both traditional terracotta pieces and contemporary ceramic art, bridging the gap between heritage and modernity. His pottery reflects the rich cultural tapestry of Indian craftsmanship, with each piece telling a story of dedication, skill, and artistic vision. His work has gained recognition not just locally but internationally, proving that traditional crafts can thrive in the modern world when nurtured with passion and innovation.',
      artisanId: "2",
      artisanName: "Rajesh Kumar",
      craft: "Pottery",
      location: "Khurja, Uttar Pradesh",
      images: ["/indian-pottery-artisan-creating-clay-vessels.jpg"],
      tags: ["Pottery", "Rajasthan", "Family Tradition", "Terracotta"],
      aiEnhanced: true,
      aiSummary:
        "Rajesh Kumar shares how his family's pottery tradition has evolved while maintaining its authentic roots in the heart of Uttar Pradesh.",
      featured: false,
      views: 892,
      likes: 189,
      createdAt: { toDate: () => new Date("2024-01-10") } as any,
      updatedAt: { toDate: () => new Date("2024-01-10") } as any,
    },
    {
      id: "3",
      title: "Threads of Time: The Kashmiri Pashmina Legacy",
      content:
        'High in the mountains of Kashmir, where the air is thin and the landscape breathtaking, lies the secret to one of the world\'s most luxurious textiles - Pashmina. Meera Devi, a master weaver from Srinagar, has dedicated her life to preserving this ancient craft that transforms the soft undercoat of Changthangi goats into threads finer than silk.\n\nThe process is painstakingly slow and requires extraordinary skill. Each Pashmina shawl takes months to complete, with every thread carefully hand-spun and woven on traditional wooden looms. "Pashmina is not just a fabric," Meera explains, her fingers working the delicate threads with practiced precision. "It is poetry written in wool, a testament to the patience and artistry of our ancestors."\n\nMeera learned this craft from her mother, who learned from her grandmother, creating an unbroken chain of knowledge spanning centuries. Despite the challenges posed by modern synthetic alternatives, she continues to create authentic Pashmina pieces, each one a masterpiece of craftsmanship that carries the soul of Kashmir within its fibers.',
      artisanId: "3",
      artisanName: "Meera Devi",
      craft: "Textile Weaving",
      location: "Jaipur, Rajasthan",
      images: ["/kashmiri-pashmina-shawl-traditional-weaving.jpg"],
      tags: ["Pashmina", "Kashmir", "Weaving", "Luxury Crafts"],
      aiEnhanced: false,
      featured: false,
      views: 654,
      likes: 312,
      createdAt: { toDate: () => new Date("2024-01-08") } as any,
      updatedAt: { toDate: () => new Date("2024-01-08") } as any,
    },
  ]

  const filteredStories = stories.filter((story) => {
    const matchesSearch =
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.artisanName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || story.craft === selectedCategory

    return matchesSearch && matchesCategory
  })

  const categories = [...new Set(stories.map((s) => s.craft))]

  if (loading) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-soft-cream">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse border-warm-brown/20">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      <div className="w-48 h-32 bg-gray-200 rounded-lg"></div>
                      <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                        <div className="flex gap-4">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                      </div>
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
              Artisan Stories & Heritage
            </h1>
            <p className="text-xl text-warm-brown max-w-2xl mx-auto text-pretty">
              Discover the rich traditions, personal journeys, and cultural heritage behind every craft. Each story
              preserves centuries of wisdom.
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-brown w-4 h-4" />
              <Input
                placeholder="Search stories, authors, or crafts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-warm-brown/20"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 border-warm-brown/20">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Featured Story */}
          {filteredStories.length > 0 && filteredStories[0].featured && (
            <Card className="mb-8 overflow-hidden border-warm-brown/20">
              <div className="relative h-64 md:h-80">
                <Image
                  src={filteredStories[0].images[0] || "/placeholder.svg?height=320&width=800&query=featured story"}
                  alt={filteredStories[0].title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className="bg-heritage-gold text-deep-teal">Featured Story</Badge>
                    {filteredStories[0].aiEnhanced && (
                      <Badge className="bg-soft-blue text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Enhanced
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold mb-2 text-balance">
                    {filteredStories[0].title}
                  </h2>
                  <p className="text-lg opacity-90 mb-4 text-pretty">
                    {filteredStories[0].aiSummary || filteredStories[0].content.substring(0, 150) + "..."}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-heritage-gold/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">{filteredStories[0].artisanName.charAt(0)}</span>
                      </div>
                      <span className="font-medium">{filteredStories[0].artisanName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{filteredStories[0].views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Stories List */}
          <div className="space-y-6">
            {filteredStories.slice(filteredStories[0]?.featured ? 1 : 0).map((story) => (
              <Card key={story.id} className="group hover:shadow-lg transition-all duration-300 border-warm-brown/20">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={story.images[0] || "/placeholder.svg?height=128&width=192&query=story image"}
                        alt={story.title}
                        width={192}
                        height={128}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs border-sage-green/30 text-sage-green">
                          {story.craft}
                        </Badge>
                        {story.aiEnhanced && (
                          <Badge className="bg-soft-blue text-white text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AI Enhanced
                          </Badge>
                        )}
                        <span className="text-xs text-warm-brown">{story.createdAt.toDate().toLocaleDateString()}</span>
                      </div>

                      <h3 className="text-xl font-serif font-semibold text-deep-teal mb-2 group-hover:text-heritage-gold transition-colors text-balance">
                        {story.title}
                      </h3>

                      <p className="text-warm-brown mb-4 text-pretty">
                        {story.aiSummary || story.content.substring(0, 150) + "..."}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-heritage-gold/20 rounded-full flex items-center justify-center">
                              <span className="text-xs font-semibold text-heritage-gold">
                                {story.artisanName.charAt(0)}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-deep-teal">{story.artisanName}</span>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-warm-brown">
                            <div className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {story.views}
                            </div>
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {story.likes}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            asChild
                            size="sm"
                            className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90"
                          >
                            <Link href={`/stories/${story.id}`}>Read Story</Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStories.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="w-12 h-12 text-warm-brown/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-deep-teal mb-2">No stories found</h3>
              <p className="text-warm-brown">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </AuthProvider>
  )
}
