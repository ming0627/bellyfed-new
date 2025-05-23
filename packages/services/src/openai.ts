/**
 * OpenAI Service
 * Handles interactions with OpenAI API for natural language processing
 */

/**
 * Region response interface
 * Represents the response from the identifyRegion method
 */
export interface RegionResponse {
  location?: string;
  confidence: number;
  context?: {
    state?: string;
    country?: string;
    locationType: 'mall' | 'city' | 'district' | 'street' | 'landmark' | 'area';
    isCity?: boolean;
    district?: string;
    area?: string;
    landmarks?: string[];
    alternateNames?: string[];
  };
}

/**
 * Location info interface
 * Represents location information
 */
export interface LocationInfo {
  address?: string;
  city?: string;
  district?: string;
  area?: string;
}

/**
 * Extracted keywords interface
 * Represents the extracted keywords from a query
 */
export interface ExtractedKeywords {
  cuisine: string;
  location: string;
  message: string;
  relevantTerms?: {
    cuisineTypes?: string[];
    location?: LocationInfo;
    establishments?: string[];
    services?: string[];
  };
}

/**
 * OpenAI Service class
 * Provides methods for interacting with OpenAI API
 */
export class OpenAIService {
  private static API_URL = 'https://api.openai.com';
  private static apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';

  /**
   * Initialize the OpenAI service with an API key
   * @param apiKey The OpenAI API key
   */
  static initialize(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Parse extracted keywords from OpenAI response
   * @param content The content to parse
   * @returns The extracted keywords
   * @private
   */
  private static parseExtractedKeywords(content: string): ExtractedKeywords {
    try {
      console.log('Parsing OpenAI response content:', content);
      const parsedResponse = JSON.parse(content);

      if (!parsedResponse.relevantTerms) {
        return {
          cuisine: '',
          location: '',
          message: 'No relevant information found in the query',
          relevantTerms: undefined,
        };
      }

      const result = {
        cuisine: parsedResponse.relevantTerms.cuisineTypes?.[0] || '',
        location:
          parsedResponse.relevantTerms.location?.address ||
          parsedResponse.relevantTerms.location?.city ||
          '',
        message: '',
        relevantTerms: parsedResponse.relevantTerms,
      };

      if (!result.cuisine && !result.location) {
        result.message = 'No cuisine or location found in the query';
      }

      return result;
    } catch (error: unknown) {
      console.error('Failed to parse OpenAI response:', error);
      return {
        cuisine: '',
        location: '',
        message: 'Failed to understand the query',
        relevantTerms: undefined,
      };
    }
  }

  /**
   * Extract keywords from a text query
   * @param text The text to extract keywords from
   * @returns The extracted keywords
   */
  static async extractKeywords(text: string): Promise<ExtractedKeywords> {
    if (!text.trim()) {
      return {
        cuisine: '',
        location: '',
        message: 'Please enter a search query',
        relevantTerms: undefined,
      };
    }

    try {
      console.log('Sending request to OpenAI with text:', text);

      const response = await fetch(`${this.API_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: this.generateFoodQueryPrompt(text),
            },
            { role: 'user', content: text },
          ],
          temperature: 0,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('OpenAI API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        return {
          cuisine: '',
          location: '',
          message: `Search error: ${response.statusText}`,
          relevantTerms: undefined,
        };
      }

      const data = await response.json();
      console.log('OpenAI response:', data);

      if (!data.choices?.[0]?.message?.content) {
        console.error('Invalid OpenAI response format:', data);
        return {
          cuisine: '',
          location: '',
          message: 'Failed to process search results',
          relevantTerms: undefined,
        };
      }

      const result = this.parseExtractedKeywords(
        data.choices[0].message.content,
      );
      console.log('Parsed result:', result);

      return result;
    } catch (error: unknown) {
      console.error('Error in extractKeywords:', error);
      return {
        cuisine: '',
        location: '',
        message:
          error instanceof Error
            ? error.message
            : 'An error occurred while searching',
        relevantTerms: undefined,
      };
    }
  }

  /**
   * Identify cuisine and dish type from a text query
   * @param text The text to identify cuisine and dish from
   * @returns The identified cuisine and dish type
   */
  public static async identifyCuisineAndDish(text: string): Promise<{
    cuisineType?: string;
    dishType?: string;
    confidence: number;
  }> {
    const prompt = `Given the food item or dish name "${text}", identify:
1. The cuisine type (e.g., Japanese, Chinese, Malaysian, etc.)
2. The type of dish (e.g., main course, appetizer, dessert, etc.)

Respond in JSON format:
{
  "cuisineType": "identified cuisine or null if uncertain",
  "dishType": "identified dish type or null if uncertain",
  "confidence": "confidence score between 0 and 1"
}

Consider cultural context, ingredients, and preparation methods in your analysis.`;

    try {
      const response = await fetch(
        `${OpenAIService.API_URL}/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OpenAIService.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are a culinary expert with deep knowledge of global cuisines.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
          }),
        },
      );

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content);
    } catch (error: unknown) {
      console.error('Error identifying cuisine:', error);
      return { confidence: 0 };
    }
  }

  /**
   * Identify region from a text query
   * @param text The text to identify region from
   * @returns The identified region
   */
  public static async identifyRegion(text: string): Promise<RegionResponse> {
    const prompt = `Given the text "${text}", identify any location mentioned and classify its type accurately.

Respond in JSON format:
{
  "location": "the main city this belongs to",
  "confidence": "confidence score between 0 and 1",
  "context": {
    "state": "state name",
    "country": "Malaysia",
    "locationType": "one of: mall, city, district, street, landmark, area",
    "isCity": false if it's not a city,
    "district": "district or area name",
    "area": "specific area or neighborhood",
    "landmarks": ["relevant landmarks or points of interest"],
    "alternateNames": ["common alternate names"]
  }
}

Examples:
- "midvalley" should map to:
{
  "location": "Kuala Lumpur",
  "confidence": 0.95,
  "context": {
    "state": "Federal Territory of Kuala Lumpur",
    "country": "Malaysia",
    "locationType": "mall",
    "isCity": false,
    "district": "Bangsar",
    "area": "Mid Valley City",
    "landmarks": ["Mid Valley Megamall", "The Gardens Mall"],
    "alternateNames": ["mv", "mid valley megamall"]
  }
}

- "ttdi" should map to:
{
  "location": "Kuala Lumpur",
  "confidence": 0.95,
  "context": {
    "state": "Federal Territory of Kuala Lumpur",
    "country": "Malaysia",
    "locationType": "district",
    "isCity": false,
    "district": "Taman Tun Dr Ismail",
    "area": "TTDI",
    "landmarks": [],
    "alternateNames": ["taman tun", "taman tun dr ismail"]
  }
}

- "jalan telawi" should map to:
{
  "location": "Kuala Lumpur",
  "confidence": 0.95,
  "context": {
    "state": "Federal Territory of Kuala Lumpur",
    "country": "Malaysia",
    "locationType": "street",
    "isCity": false,
    "district": "Bangsar",
    "area": "Telawi",
    "landmarks": ["Bangsar Village", "Bangsar Village II"],
    "alternateNames": ["telawi street"]
  }
}

Ensure you accurately classify the location type and provide relevant context.`;

    try {
      const response = await fetch(
        `${OpenAIService.API_URL}/v1/chat/completions`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${OpenAIService.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [
              {
                role: 'system',
                content:
                  'You are a Malaysian geography expert with extensive knowledge of landmarks, shopping malls, districts, and streets in major Malaysian cities.',
              },
              { role: 'user', content: prompt },
            ],
            temperature: 0.3,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        console.error('OpenAI API error:', data);
        return { confidence: 0 };
      }

      const result = JSON.parse(data.choices[0].message.content);
      return {
        location: result.location,
        confidence: result.confidence,
        context: result.context,
      };
    } catch (error: unknown) {
      console.error('Error identifying region:', error);
      return { confidence: 0 };
    }
  }

  /**
   * Generate a food query prompt
   * @param text The text to generate a prompt for
   * @returns The generated prompt
   * @private
   */
  private static generateFoodQueryPrompt(text: string): string {
    return `Analyze and extract structured information from food and restaurant related queries. Consider various aspects like cuisine, location, timing, ambiance, and special features.

Categories to identify:
- cuisineTypes: Types of cuisine or food styles
- location: City, country, and address information (IMPORTANT: For malls, include the full mall name)
- dishType: Specific dish names
- dietaryOptions: Dietary preferences (vegetarian, gluten-free, halal, kosher)
- establishmentType: Type of establishment (RESTAURANT, FOOD_COURT_STALL, FOOD_TRUCK, POP_UP_STALL, GHOST_KITCHEN)
- ambiance: Atmosphere and setting features (rooftop, beachfront, romantic, etc.)
- schedule: Operating hours information (day, time, recurring status)
- priceRange: Price level indicators (cheap, expensive, fine dining, etc.)
- facilities: Available facilities (parking, wifi, seating)
- services: Special services and their availability

Format the response as JSON:
{
  "keywords": ["all", "relevant", "keywords"],
  "relevantTerms": {
    "cuisineTypes": ["identified", "cuisine", "types"],
    "location": {
      "city": "city name",
      "country": "country name",
      "address": "full location name (e.g., 'Mid Valley Megamall' not just 'midvalley')"
    },
    "dishType": "specific dish if mentioned",
    "dietaryOptions": {
      "isVegetarian": true/false,
      "isGlutenFree": true/false,
      "isHalal": true/false,
      "isKosher": true/false
    },
    "establishmentType": "RESTAURANT",
    "ambiance": ["ambiance", "features"],
    "schedule": {
      "dayOfWeek": "Monday",
      "startTime": "09:00",
      "endTime": "22:00",
      "isRecurring": true
    },
    "priceRange": "price category",
    "facilities": {
      "parking": {
        "available": true,
        "details": "Free parking available"
      },
      "wifi": {
        "available": true,
        "details": "Free high-speed wifi"
      },
      "seating": {
        "capacity": 50,
        "details": "Indoor and outdoor seating"
      }
    },
    "services": [
      {
        "type": "service type",
        "available": true,
        "details": "service details"
      }
    ]
  }
}

Examples:
1. Query: "best chicken rice in midvalley"
Response:
{
  "keywords": ["best", "chicken rice", "midvalley"],
  "relevantTerms": {
    "cuisineTypes": ["Chinese", "Malaysian"],
    "location": {
      "city": "Kuala Lumpur",
      "country": "Malaysia",
      "address": "Mid Valley Megamall"
    },
    "dishType": "chicken rice",
    "establishmentType": "RESTAURANT"
  }
}

2. Query: "halal food near klcc"
Response:
{
  "keywords": ["halal", "food", "klcc"],
  "relevantTerms": {
    "cuisineTypes": [],
    "location": {
      "city": "Kuala Lumpur",
      "country": "Malaysia",
      "address": "Suria KLCC"
    },
    "dietaryOptions": {
      "isHalal": true
    },
    "establishmentType": "RESTAURANT"
  }
}

Analyze this query: "${text}"`;
  }
}

// Export a singleton instance
export const openaiService = OpenAIService;
