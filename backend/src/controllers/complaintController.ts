import { Request, Response } from 'express';
import { Complaint } from '../models/Complaint';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Function to enhance text using Gemini
async function enhanceText(text: string, type: 'title' | 'description'): Promise<string> {
  try {
    console.log(`=== Enhancing ${type} ===`);
    console.log('Original text:', text);
    
    const prompt = type === 'title' 
      ? `Enhance this complaint title to be more descriptive and professional while keeping it concise (max 100 chars): "${text}"`
      : `Enhance this complaint description to be more detailed and professional while maintaining the key information: "${text}"`;

    console.log('Sending prompt to Gemini:', prompt);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const enhancedText = response.text();
    console.log('Enhanced text received:', enhancedText);
    
    return enhancedText.trim();
  } catch (error) {
    console.error(`Error enhancing ${type}:`, error);
    return text; // Return original text if enhancement fails
  }
}

export const createComplaint = async (req: Request, res: Response) => {
  try {
    console.log('=== Complaint Creation Start ===');
    console.log('User from request:', req.user);
    console.log('Full request body:', JSON.stringify(req.body, null, 2));

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { 
      title, 
      description, 
      category, 
      priority, 
      status, 
      location, 
      images, 
      enhancedTitle: existingEnhancedTitle, 
      enhancedDescription: existingEnhancedDescription 
    } = req.body;

    console.log('Existing enhanced title:', existingEnhancedTitle);
    console.log('Existing enhanced description:', existingEnhancedDescription);

    // Only enhance if not already enhanced
    let finalEnhancedTitle = existingEnhancedTitle;
    let finalEnhancedDescription = existingEnhancedDescription;

    if (!finalEnhancedTitle || !finalEnhancedDescription) {
      console.log('No existing enhanced versions found, generating new ones...');
      const [newEnhancedTitle, newEnhancedDescription] = await Promise.all([
        enhanceText(title, 'title'),
        enhanceText(description, 'description')
      ]);

      finalEnhancedTitle = newEnhancedTitle;
      finalEnhancedDescription = newEnhancedDescription;
    }

    console.log('Final enhanced title:', finalEnhancedTitle);
    console.log('Final enhanced description:', finalEnhancedDescription);

    const complaintData = {
      title,
      description,
      enhancedTitle: finalEnhancedTitle,
      enhancedDescription: finalEnhancedDescription,
      category,
      priority,
      status,
      location,
      images,
      userId: req.user._id
    };

    console.log('Complaint data to be saved:', JSON.stringify(complaintData, null, 2));

    const complaint = new Complaint(complaintData);
    console.log('Complaint object before save:', JSON.stringify(complaint.toObject(), null, 2));

    const savedComplaint = await complaint.save();
    console.log('Saved complaint:', JSON.stringify(savedComplaint.toObject(), null, 2));
    console.log('=== Complaint Creation End ===');

    // Return the saved complaint with enhanced fields
    res.status(201).json(savedComplaint);
  } catch (error: any) {
    console.error('Error creating complaint:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Error creating complaint', 
      error: error?.message || 'Unknown error occurred' 
    });
  }
}; 