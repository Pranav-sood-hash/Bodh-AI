import React, { useState, useEffect, useRef } from "react";
import { X, Lock, MapPin, Plus, Loader2 } from "lucide-react";
import ChangeEmailModal from "./ChangeEmailModal";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileData: any;
  onSave: (updatedData: any) => Promise<void>;
  onSuccessMessage: (msg: string) => void;
}

export default function EditProfileModal({
  isOpen,
  onClose,
  profileData,
  onSave,
  onSuccessMessage
}: EditProfileModalProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [learningGoal, setLearningGoal] = useState("Deep Learning");
  const [skillLevel, setSkillLevel] = useState("Intermediate");
  const [topics, setTopics] = useState<string[]>([]);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newTopic, setNewTopic] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || "");
      setLastName(profileData.lastName || "");
      setEmail(profileData.email || "");
      setLocation(profileData.location || "");
      setBio(profileData.bio || "");
      setLearningGoal(profileData.learningGoal || "AI/ML");
      setSkillLevel(profileData.skillLevel || "Intermediate");
      setTopics(profileData.topicsOfInterest || []);
      setAvatarUrl(profileData.avatarUrl || "");
    }
  }, [profileData, isOpen]);

  if (!isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit");
        return;
      }
      setAvatarFile(file);
      // Create local preview URL
      const previewUrl = URL.createObjectURL(file);
      setAvatarUrl(previewUrl);
    }
  };

  const handleRemovePhoto = () => {
    setAvatarFile(null);
    setAvatarUrl("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    if (topics.includes(newTopic.trim())) {
      setNewTopic("");
      return;
    }
    setTopics([...topics, newTopic.trim()]);
    setNewTopic("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Mock Cloudinary upload if a new file was chosen
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        // Mock a brief latency representing secure upload to cloudinary
        await new Promise((resolve) => setTimeout(resolve, 800));
        // Return preview as final mock URL
        finalAvatarUrl = avatarUrl || "https://res.cloudinary.com/demo/image/upload/v1625070000/sample.jpg";
      }

      await onSave({
        firstName,
        lastName,
        location,
        bio,
        learningGoal,
        skillLevel,
        topicsOfInterest: topics,
        avatarUrl: finalAvatarUrl
      });
      
      onSuccessMessage("Profile updated ✓");
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableSuggestedTopics = [
    "Python", "React", "Node.js", "PyTorch", "Docker", "Kubernetes", "AWS", "TypeScript", "Go", "Rust", "TensorFlow", "FastAPI"
  ];

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
        <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8">
          
          {/* Modal Header */}
          <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100">
            <h3 className="text-xl font-semibold text-slate-900">Edit Profile</h3>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[70vh] px-6 py-6 space-y-6">
            
            {/* Avatar Centered Section */}
            <div className="flex flex-col items-center space-y-3">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-extrabold text-slate-400">
                      {firstName.charAt(0)}{lastName.charAt(0)}
                    </span>
                  )}
                </div>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition"
                >
                  Change Photo
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold transition"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            {/* First and Last Name Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Email (Readonly) */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Email Address
                </label>
                <button
                  type="button"
                  onClick={() => setIsChangeEmailOpen(true)}
                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold transition"
                >
                  Change Email →
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-500 focus:outline-none cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Email cannot be changed once verified.
              </p>
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full border border-slate-300 focus:border-blue-500 rounded-xl pl-11 pr-4 py-3 text-slate-800 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Bio with character counter */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Bio
                </label>
                <span className={`text-xs font-medium ${bio.length > 180 ? 'text-red-500 font-bold' : 'text-slate-400'}`}>
                  {bio.length}/200
                </span>
              </div>
              <textarea
                maxLength={200}
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full border border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 text-slate-800 focus:outline-none resize-none transition-all"
              />
            </div>

            {/* Goals and Skill Levels */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Learning Goal
                </label>
                <select
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full border border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white text-slate-800 focus:outline-none transition-all"
                >
                  <option value="Deep Learning">Deep Learning</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Data Science">Data Science</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Full Stack">Full Stack</option>
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="DevOps">DevOps</option>
                  <option value="Cloud">Cloud</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Skill Level
                </label>
                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="w-full border border-slate-300 focus:border-blue-500 rounded-xl px-4 py-3 bg-white text-slate-800 focus:outline-none transition-all"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>
            </div>

            {/* Topics of Interest */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block">
                Topics of Interest
              </label>
              
              <div className="flex flex-wrap gap-2">
                {topics.map((topic, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-xs font-medium"
                  >
                    {topic}
                    <button 
                      type="button" 
                      onClick={() => handleRemoveTopic(idx)}
                      className="hover:text-blue-900 font-bold ml-0.5 text-[10px]"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Topic Input with Suggestions */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  className="flex-1 border border-slate-300 focus:border-blue-500 rounded-xl px-4 py-2 text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddTopic}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {/* Suggested Tags Quick Click */}
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suggested Topics</p>
                <div className="flex flex-wrap gap-1.5">
                  {availableSuggestedTopics.filter(t => !topics.includes(t)).slice(0, 8).map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setTopics([...topics, topic])}
                      className="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-full px-2.5 py-1 text-[10px] font-medium transition"
                    >
                      + {topic}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </form>

          {/* Modal Footer */}
          <div className="flex justify-end gap-3 px-6 py-5 border-t border-slate-100 bg-slate-50/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="border border-slate-300 bg-white hover:bg-slate-50 rounded-xl px-5 py-2.5 text-slate-700 text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl px-5 py-2.5 text-sm font-semibold flex items-center gap-1.5 transition shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Embedded Change Email OTP Modal */}
      {isChangeEmailOpen && (
        <ChangeEmailModal
          isOpen={isChangeEmailOpen}
          onClose={() => setIsChangeEmailOpen(false)}
          currentEmail={email}
          onSuccess={(newMail) => {
            setEmail(newMail);
          }}
        />
      )}
    </>
  );
}
