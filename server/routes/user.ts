import { Request, Response, Router } from "express";

// In-memory Database for demo state that maps exactly to the user specifications
let userProfile = {
  firstName: "Pranav",
  lastName: "Sood",
  email: "pranav.sood@bodhai.edu",
  location: "San Francisco, CA",
  bio: "Full Stack Developer & AI Enthusiast passionate about building the future of learning systems.",
  learningGoal: "AI/ML",
  skillLevel: "Intermediate",
  topicsOfInterest: ["Python", "Web Dev", "Machine Learning", "PyTorch", "UI/UX"],
  avatarUrl: "https://res.cloudinary.com/demo/image/upload/v1625070000/sample.jpg",
  joinedDate: "Oct 2023"
};

let userStats = {
  topicsLearned: 12,
  topicsLearnedWeeklyDiff: 2,
  dayStreak: 5,
  bestStreak: 14,
  projectsBuilt: 3,
  hoursStudied: 48
};

// Generate 12 months of heatmap data
const generateHeatmapData = () => {
  const data = [];
  const now = new Date();
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(now.getFullYear() - 1);
  
  const current = new Date(oneYearAgo);
  while (current <= now) {
    // Random counts for realistic learning activity
    const rand = Math.random();
    let count = 0;
    if (rand > 0.8) count = Math.floor(Math.random() * 8); // 0 to 7
    else if (rand > 0.5) count = Math.floor(Math.random() * 4); // 0 to 3
    
    data.push({
      date: current.toISOString().split("T")[0],
      count: count
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
};

let activityLog = generateHeatmapData();

let progressStats = {
  mastery: [
    { name: "Neural Networks", percentage: 85, level: "Advanced", color: "text-blue-600", barColor: "bg-blue-600" },
    { name: "Python Architecture", percentage: 78, level: "Proficient", color: "text-blue-500", barColor: "bg-blue-500" },
    { name: "Data Science Pipeline", percentage: 62, level: "Intermediate", color: "text-blue-400", barColor: "bg-blue-400" },
    { name: "Deployment & CI/CD", percentage: 40, level: "Beginner", color: "text-slate-400", barColor: "bg-slate-300" }
  ],
  achievements: [
    { id: "1", title: "Fast Learner", description: "Top 5% in AI Foundations", type: "trophy", iconBg: "bg-yellow-50" },
    { id: "2", title: "Code Architect", description: "Built 3 full-stack projects", type: "build", iconBg: "bg-blue-50" },
    { id: "3", title: "Day 5 Streak", description: "Consistent knowledge flow", type: "star", iconBg: "bg-purple-50" }
  ]
};

let activeRoadmap = {
  title: "Mastering Transformers",
  subtitle: "Mastering Transformers",
  progress: 30,
  milestones: [
    { id: "1", title: "Attention Mechanisms", status: "completed", dateText: "Completed 2 days ago" },
    { id: "2", title: "Position Encodings", status: "active", dateText: "Currently active" },
    { id: "3", title: "Layer Normalization", status: "upcoming", dateText: "Next in line" }
  ]
};

let recentProjects = [
  {
    id: "proj_1",
    title: "Neural Vision API",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
    tech: ["PYTHON", "PYTORCH"],
    progress: 100,
    status: "Completed"
  },
  {
    id: "proj_2",
    title: "DataNexus Crawler",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80",
    tech: ["RUST", "REACT"],
    progress: 45,
    status: "In Progress"
  },
  {
    id: "proj_3",
    title: "BodhAI CLI Tool",
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=400&q=80",
    tech: ["GO", "SHELL"],
    progress: 15,
    status: "Starting"
  }
];

let pendingOtp: { [email: string]: { code: string; newEmail: string; expiresAt: number } } = {};

let userPreferences = {
  learningReminders: true,
  roadmapUpdates: true,
  projectActivity: true,
  achievementUnlocked: true,
  aiUsageAlerts: false,
  weeklySummary: true,
  emailDigest: "Daily"
};

let activeSessions = [
  { id: "sess_1", device: "Chrome on Windows", location: "San Francisco, USA", ip: "192.168.1.45", isCurrent: true, lastActive: "Active now" },
  { id: "sess_2", device: "Chrome on Android", location: "San Francisco, USA", ip: "192.168.1.12", isCurrent: false, lastActive: "Last active 2 hours ago" }
];

export const userRouter = Router();

// GET /api/user/profile
userRouter.get("/user/profile", (req: Request, res: Response) => {
  res.json(userProfile);
});

// PUT /api/user/profile
userRouter.put("/user/profile", (req: Request, res: Response) => {
  const { firstName, lastName, location, bio, learningGoal, skillLevel, topicsOfInterest, avatarUrl } = req.body;
  
  if (firstName) userProfile.firstName = firstName;
  if (lastName) userProfile.lastName = lastName;
  if (location !== undefined) userProfile.location = location;
  if (bio !== undefined) userProfile.bio = bio;
  if (learningGoal) userProfile.learningGoal = learningGoal;
  if (skillLevel) userProfile.skillLevel = skillLevel;
  if (topicsOfInterest) userProfile.topicsOfInterest = topicsOfInterest;
  if (avatarUrl !== undefined) userProfile.avatarUrl = avatarUrl;
  
  res.json({ success: true, profile: userProfile });
});

// GET /api/user/stats
userRouter.get("/user/stats", (req: Request, res: Response) => {
  res.json(userStats);
});

// GET /api/progress
userRouter.get("/progress", (req: Request, res: Response) => {
  res.json(activityLog);
});

// GET /api/progress/stats
userRouter.get("/progress/stats", (req: Request, res: Response) => {
  res.json(progressStats);
});

// GET /api/roadmap
userRouter.get("/roadmap", (req: Request, res: Response) => {
  res.json(activeRoadmap);
});

// GET /api/projects
userRouter.get("/projects", (req: Request, res: Response) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
  res.json(recentProjects.slice(0, limit));
});

// POST /api/auth/change-email/request
userRouter.post("/auth/change-email/request", (req: Request, res: Response) => {
  const { newEmail } = req.body;
  if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
    return res.status(400).json({ error: "Please enter a valid email address" });
  }
  if (newEmail.toLowerCase() === userProfile.email.toLowerCase()) {
    return res.status(400).json({ error: "Cannot be same as current email" });
  }

  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  pendingOtp[newEmail.toLowerCase()] = { code, newEmail, expiresAt };
  console.log(`[OTP] Generated OTP for new email ${newEmail}: ${code}`);
  
  res.json({ success: true, message: "Verification code sent successfully", code_demo_only: code });
});

// POST /api/auth/change-email/verify
userRouter.post("/auth/change-email/verify", (req: Request, res: Response) => {
  const { code, newEmail } = req.body;
  if (!newEmail || !code) {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  const record = pendingOtp[newEmail.toLowerCase()];
  if (!record) {
    return res.status(400).json({ error: "No pending email change request found" });
  }

  if (Date.now() > record.expiresAt) {
    return res.status(400).json({ error: "Code has expired. Please request a new one." });
  }

  if (record.code !== code) {
    return res.status(400).json({ error: "Incorrect verification code" });
  }

  // Success: Update email
  userProfile.email = record.newEmail;
  delete pendingOtp[newEmail.toLowerCase()];
  
  res.json({ success: true, email: userProfile.email });
});

// PUT /api/user/password
userRouter.put("/user/password", (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Both current and new password are required" });
  }
  // Simple validation mock
  if (newPassword.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters long" });
  }
  res.json({ success: true, message: "Password updated successfully" });
});

// GET /api/user/preferences
userRouter.get("/user/preferences", (req: Request, res: Response) => {
  res.json(userPreferences);
});

// PUT /api/user/preferences
userRouter.put("/user/preferences", (req: Request, res: Response) => {
  const prefs = req.body;
  userPreferences = { ...userPreferences, ...prefs };
  res.json({ success: true, preferences: userPreferences });
});

// GET /api/user/sessions
userRouter.get("/user/sessions", (req: Request, res: Response) => {
  res.json(activeSessions);
});

// DELETE /api/user/sessions/:id
userRouter.delete("/user/sessions/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  activeSessions = activeSessions.filter(s => s.id !== id);
  res.json({ success: true });
});

// DELETE /api/user/account
userRouter.delete("/user/account", (req: Request, res: Response) => {
  // Clear mock session state
  res.json({ success: true, message: "Account deleted successfully" });
});
