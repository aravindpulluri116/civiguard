const GEMINI_API_KEY = 'AIzaSyCo4m_8IUWaD3LsiAsHJabMYK4X-oLpt44';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiResponse {
  category: string;
  priority: string;
  explanation: string;
}

interface ValidationResponse {
  isValid: boolean;
  reason: string;
}

export async function validateComplaint(title: string, description: string): Promise<ValidationResponse> {
  try {
    const prompt = `Analyze if this civic complaint is valid and relevant.
Title: ${title}
Description: ${description}

A valid civic complaint should:
1. Be about a real issue that affects the community
2. Be specific and clear about the problem
3. Be related to public infrastructure, services, or community concerns
4. Not contain spam, inappropriate content, or personal grievances

Respond with a JSON object containing:
{
  "isValid": true/false,
  "reason": "brief explanation of why the complaint is valid or invalid"
}

Do not include any markdown formatting or code block markers. Return only the raw JSON object.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response text to handle markdown formatting
    let jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const validation = JSON.parse(jsonText);
      return {
        isValid: validation.isValid,
        reason: validation.reason
      };
    } catch (parseError) {
      console.error('Error parsing validation response:', parseError);
      return {
        isValid: true, // Default to true if we can't parse the response
        reason: 'Unable to validate complaint'
      };
    }
  } catch (error) {
    console.error('Error validating complaint:', error);
    return {
      isValid: true, // Default to true if validation fails
      reason: 'Unable to validate complaint'
    };
  }
}

export async function analyzeComplaint(title: string, description: string): Promise<GeminiResponse> {
  try {
    const prompt = `Analyze this civic complaint and determine its category and priority level.
Title: ${title}
Description: ${description}

Please analyze this complaint and provide:
1. The most appropriate category (pothole, garbage, water leak, street light, or other)
2. The priority level (low, medium, high, or critical)
3. A brief explanation for your categorization

Respond with a JSON object containing these fields:
{
  "category": "category_name",
  "priority": "priority_level",
  "explanation": "your_explanation"
}

Do not include any markdown formatting or code block markers. Return only the raw JSON object.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Gemini API Error:', errorData);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response text to handle markdown formatting
    let jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const analysis = JSON.parse(jsonText);

      // Validate the response format
      if (!analysis.category || !analysis.priority || !analysis.explanation) {
        throw new Error('Invalid analysis format');
      }

      // Ensure category and priority match our expected values
      const validCategories = ['pothole', 'garbage', 'water leak', 'street light', 'other'];
      const validPriorities = ['low', 'medium', 'high', 'critical'];

      if (!validCategories.includes(analysis.category)) {
        analysis.category = 'other';
      }
      if (!validPriorities.includes(analysis.priority)) {
        analysis.priority = 'medium';
      }

      return {
        category: analysis.category,
        priority: analysis.priority,
        explanation: analysis.explanation
      };
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Raw response:', responseText);
      throw new Error('Failed to parse AI response');
    }
  } catch (error) {
    console.error('Error analyzing complaint:', error);
    // Return default values in case of error
    return {
      category: 'other',
      priority: 'medium',
      explanation: 'Unable to analyze the complaint. Please select category and priority manually.'
    };
  }
}

export async function getCoordinatesFromAddress(address: string): Promise<{ type: string; coordinates: [number, number] }> {
  try {
    const prompt = `Given this address: "${address}", provide the latitude and longitude coordinates in this exact format:
    {
      "lat": number,
      "lng": number
    }
    Only return the JSON object, nothing else.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid response format from Gemini API');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response text to handle markdown formatting
    let jsonText = responseText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    try {
      const coordinates = JSON.parse(jsonText);
      
      // Validate coordinates
      if (typeof coordinates.lat !== 'number' || typeof coordinates.lng !== 'number') {
        throw new Error('Invalid coordinates format');
      }

      return {
        type: 'Point',
        coordinates: [coordinates.lng, coordinates.lat] as [number, number]
      };
    } catch (parseError) {
      console.error('Error parsing coordinates:', parseError);
      throw new Error('Failed to parse coordinates');
    }
  } catch (error) {
    console.error('Error getting coordinates:', error);
    throw error;
  }
} 