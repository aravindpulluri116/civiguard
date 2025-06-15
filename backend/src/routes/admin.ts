import express from 'express';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { isAuthenticated, isAdmin } from '../middleware/auth';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// Get officers data from CSV
router.get('/officers', isAuthenticated, isAdmin, (req, res) => {
  try {
    const csvPath = path.join(__dirname, '../../data/emailsData.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    res.json(records);
  } catch (error) {
    console.error('Error reading officers data:', error);
    res.status(500).json({ message: 'Failed to load officers data' });
  }
});

router.post('/send-gemini-email', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, description, recipientEmail } = req.body;

    if (!title || !description || !recipientEmail) {
      return res.status(400).json({ message: 'Missing required fields: title, description, or recipientEmail.' });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Please draft a professional email for a complaint report.
    The complaint title is: "${title}".
    The complaint description is: "${description}".
    The email should be formal and request the recipient to take necessary action.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const emailContent = response.text();

    // Here you would integrate with an email sending service (e.g., Nodemailer)
    // For now, we'll just send back the generated email content as a response
    console.log('Generated Email Content:', emailContent);

    // In a real application, you would send the email here using a library like Nodemailer
    // Example (requires Nodemailer setup):
    // const transporter = nodemailer.createTransport(...);
    // await transporter.sendMail({
    //   from: 'your-email@example.com',
    //   to: recipientEmail,
    //   subject: `Complaint Report: ${title}`,
    //   text: emailContent,
    // });

    res.status(200).json({ message: 'Email content generated and ready to be sent', generatedContent: emailContent });
  } catch (error) {
    console.error('Error in send-gemini-email:', error);
    res.status(500).json({ message: 'Failed to generate or send email', error: error.message });
  }
});

export default router; 