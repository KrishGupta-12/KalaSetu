// AI Service using Gemini API
const GEMINI_API_KEY = "AIzaSyAjDuzhbSUfvKt7EjGknx5SqedcS9E_rQk"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent"

export interface AIResponse {
  text: string
  success: boolean
  error?: string
}

export const aiService = {
  // Generate AI-enhanced story content
  async enhanceStory(originalStory: string, craft: string, location: string): Promise<AIResponse> {
    try {
      const prompt = `
        Enhance this artisan story with cultural context and engaging narrative while preserving authenticity:
        
        Original Story: ${originalStory}
        Craft: ${craft}
        Location: ${location}
        
        Please:
        1. Add rich cultural context about the craft tradition
        2. Include historical significance
        3. Make it more engaging while keeping it authentic
        4. Highlight the artisan's skill and dedication
        5. Keep the tone respectful and celebratory
        
        Return only the enhanced story content, no additional formatting.
      `

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!enhancedText) {
        throw new Error("No content generated")
      }

      return {
        text: enhancedText,
        success: true,
      }
    } catch (error) {
      console.error("Error enhancing story:", error)
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Generate product description
  async generateProductDescription(productName: string, craft: string, materials: string[]): Promise<AIResponse> {
    try {
      const prompt = `
        Create an engaging product description for this handcrafted item:
        
        Product: ${productName}
        Craft Type: ${craft}
        Materials: ${materials.join(", ")}
        
        Please create a description that:
        1. Highlights the craftsmanship and skill involved
        2. Mentions the cultural significance
        3. Describes the materials and techniques used
        4. Appeals to buyers who value authentic handmade items
        5. Is concise but compelling (2-3 paragraphs)
        
        Return only the product description, no additional formatting.
      `

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const description = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!description) {
        throw new Error("No content generated")
      }

      return {
        text: description,
        success: true,
      }
    } catch (error) {
      console.error("Error generating product description:", error)
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Generate artisan bio
  async generateArtisanBio(name: string, craft: string, experience: number, location: string): Promise<AIResponse> {
    try {
      const prompt = `
        Create a compelling artisan biography for:
        
        Name: ${name}
        Craft: ${craft}
        Experience: ${experience} years
        Location: ${location}
        
        Please create a bio that:
        1. Tells their story with respect and authenticity
        2. Highlights their expertise and dedication
        3. Mentions the cultural tradition they're preserving
        4. Is engaging and personal
        5. Is 2-3 paragraphs long
        
        Return only the biography, no additional formatting.
      `

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const bio = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!bio) {
        throw new Error("No content generated")
      }

      return {
        text: bio,
        success: true,
      }
    } catch (error) {
      console.error("Error generating artisan bio:", error)
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },

  // Generate story summary
  async generateStorySummary(fullStory: string): Promise<AIResponse> {
    try {
      const prompt = `
        Create a compelling 2-3 sentence summary of this artisan story:
        
        Full Story: ${fullStory}
        
        The summary should:
        1. Capture the essence of the story
        2. Be engaging and make people want to read more
        3. Highlight the most interesting aspects
        4. Be concise but impactful
        
        Return only the summary, no additional formatting.
      `

      const response = await fetch(GEMINI_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      const summary = data.candidates?.[0]?.content?.parts?.[0]?.text

      if (!summary) {
        throw new Error("No content generated")
      }

      return {
        text: summary,
        success: true,
      }
    } catch (error) {
      console.error("Error generating story summary:", error)
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  },
}
