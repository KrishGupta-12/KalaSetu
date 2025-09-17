"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Navigation } from "@/components/ui/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AuthProvider } from "@/contexts/AuthContext"
import { storyService, artisanService, type Story, type Artisan } from "@/lib/firebase-services"
import { ArrowLeft, Eye, Heart, MapPin, Calendar, User, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function StoryDetailPage() {
  const params = useParams()
  const slug = params.slug as string
  const [story, setStory] = useState<Story | null>(null)
  const [artisan, setArtisan] = useState<Artisan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStoryData = async () => {
      try {
        setLoading(true)

        // Get story by ID (slug is the story ID)
        const storyData = await storyService.getById(slug)

        if (!storyData) {
          setError("Story not found")
          return
        }

        setStory(storyData)

        // Increment view count
        await storyService.incrementViews(slug)

        // Get artisan data
        const artisanData = await artisanService.getById(storyData.artisanId)
        if (artisanData) {
          setArtisan(artisanData)
        }
      } catch (err) {
        console.error("Error fetching story data:", err)
        setError("Failed to load story")
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchStoryData()
    }
  }, [slug])

  if (loading) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-soft-cream">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="h-64 bg-gray-200 rounded-lg mb-6"></div>
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
      </AuthProvider>
    )
  }

  if (error || !story) {
    return (
      <AuthProvider>
        <div className="min-h-screen bg-soft-cream">
          <Navigation />
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-deep-teal mb-4">Story Not Found</h1>
              <p className="text-warm-brown mb-6">{error || "The story you are looking for does not exist."}</p>
              <Button asChild>
                <Link href="/stories">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Stories
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

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/stories">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Stories
            </Link>
          </Button>

          {/* Hero Image */}
          {story.images && story.images.length > 0 && (
            <div className="relative h-64 md:h-96 rounded-lg overflow-hidden mb-8">
              <Image src={story.images[0] || "/placeholder.svg"} alt={story.title} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  {story.featured && <Badge className="bg-heritage-gold text-deep-teal">Featured Story</Badge>}
                  {story.aiEnhanced && (
                    <Badge className="bg-soft-blue text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Enhanced
                    </Badge>
                  )}
                  <Badge className="bg-sunset-orange text-white">{story.craft}</Badge>
                </div>
              </div>
            </div>
          )}

          {/* Story Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-deep-teal mb-4 text-balance">
              {story.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-warm-brown mb-6">
              <div className="flex items-center">
                <User className="w-4 h-4 mr-2 text-heritage-gold" />
                <Link href={`/artisans/${story.artisanId}`} className="hover:text-heritage-gold transition-colors">
                  {story.artisanName}
                </Link>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-heritage-gold" />
                <span>{story.location}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-heritage-gold" />
                <span>{story.createdAt.toDate().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Eye className="w-4 h-4 mr-2 text-heritage-gold" />
                <span>{story.views} views</span>
              </div>
              <div className="flex items-center">
                <Heart className="w-4 h-4 mr-2 text-heritage-gold" />
                <span>{story.likes} likes</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {story.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-sage-green/30 text-sage-green">
                  #{tag}
                </Badge>
              ))}
            </div>

            {/* AI Summary */}
            {story.aiSummary && (
              <Card className="border-soft-blue/20 bg-soft-blue/5 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Sparkles className="w-5 h-5 text-soft-blue mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-deep-teal mb-2">AI Summary</h3>
                      <p className="text-warm-brown text-sm leading-relaxed">{story.aiSummary}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Story Content */}
          <Card className="border-warm-brown/20 mb-8">
            <CardContent className="p-8">
              <div className="prose prose-lg prose-warm-brown max-w-none">
                <div className="text-warm-brown leading-relaxed whitespace-pre-line font-cultural">{story.content}</div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Images */}
          {story.images && story.images.length > 1 && (
            <Card className="border-warm-brown/20 mb-8">
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold text-deep-teal mb-4">Gallery</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {story.images.slice(1).map((image, index) => (
                    <div key={index} className="relative h-48 rounded-lg overflow-hidden">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${story.title} - Image ${index + 2}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Artisan Info */}
          {artisan && (
            <Card className="border-warm-brown/20">
              <CardContent className="p-6">
                <h3 className="text-xl font-serif font-bold text-deep-teal mb-4">About the Artisan</h3>
                <div className="flex items-start space-x-4">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    <Image
                      src={artisan.profileImage || "/placeholder.svg?height=64&width=64&query=artisan profile"}
                      alt={artisan.name}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-deep-teal mb-1">{artisan.name}</h4>
                    <p className="text-warm-brown text-sm mb-2">
                      {artisan.craft} Artisan from {artisan.location}
                    </p>
                    <p className="text-warm-brown text-sm mb-4 line-clamp-2">{artisan.bio}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-heritage-gold text-heritage-gold hover:bg-heritage-gold hover:text-deep-teal bg-transparent"
                      asChild
                    >
                      <Link href={`/artisans/${artisan.id}`}>View Profile</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4 mt-8">
            <Button className="bg-heritage-gold text-deep-teal hover:bg-heritage-gold/90">
              <Heart className="w-4 h-4 mr-2" />
              Like Story
            </Button>
            <Button
              variant="outline"
              className="border-heritage-gold text-heritage-gold hover:bg-heritage-gold hover:text-deep-teal bg-transparent"
            >
              Share Story
            </Button>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}
