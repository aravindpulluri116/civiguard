import { Complaint } from '../types';

// Simulate AI classification service
export class AIService {
  static classifyComplaint(description: string, imageUrl?: string): {
    category: Complaint['category'];
    urgency: Complaint['urgency'];
    confidence: number;
  } {
    // Simple keyword-based classification for demo
    const text = description.toLowerCase();
    
    let category: Complaint['category'] = 'other';
    let urgency: Complaint['urgency'] = 'low';
    
    // Category classification
    if (text.includes('pothole') || text.includes('road') || text.includes('pavement')) {
      category = 'pothole';
    } else if (text.includes('garbage') || text.includes('trash') || text.includes('waste')) {
      category = 'garbage';
    } else if (text.includes('water') || text.includes('leak') || text.includes('pipe')) {
      category = 'water_leak';
    } else if (text.includes('light') || text.includes('lamp') || text.includes('street light')) {
      category = 'street_light';
    }
    
    // Urgency classification based on keywords
    if (text.includes('dangerous') || text.includes('urgent') || text.includes('emergency') || 
        text.includes('critical') || text.includes('severe') || text.includes('immediate')) {
      urgency = 'critical';
    } else if (text.includes('moderate') || text.includes('concern') || text.includes('problem')) {
      urgency = 'medium';
    }
    
    // Simulate confidence score
    const confidence = Math.random() * 0.3 + 0.7; // 70-100%
    
    return { category, urgency, confidence };
  }
  
  static extractLocation(text: string): { address: string; confidence: number } | null {
    // Simple address extraction (in real app, would use NLP)
    const addressPattern = /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln)\b/gi;
    const match = text.match(addressPattern);
    
    if (match) {
      return {
        address: match[0],
        confidence: 0.8
      };
    }
    
    return null;
  }
  
  static generateResponse(complaint: Complaint): string {
    const responses = {
      pothole: "Thank you for reporting this road issue. Our Public Works team will assess the pothole within 48 hours.",
      garbage: "We've received your waste management complaint. Our Sanitation team will address this issue promptly.",
      water_leak: "Water leak reported. Our Water Department has been notified and will respond urgently.",
      street_light: "Street lighting issue logged. Our Electrical Maintenance team will investigate.",
      other: "Your complaint has been received and will be reviewed by the appropriate department."
    };
    
    return responses[complaint.category] || responses.other;
  }
}