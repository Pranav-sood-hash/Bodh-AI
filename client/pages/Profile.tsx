import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Bell, Settings as SettingsIcon, Plus, 
  Map, Wrench, Calendar, BarChart3, Sliders, LogOut, Loader2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import MobileTopBar from '@/components/MobileTopBar';

import api from "@/lib/axios";

// Sub-tab Components
import ProfileHero from "@/components/profile/ProfileHero";
import ProfileTabs from "@/components/profile/ProfileTabs";
import StatsRow from "@/components/profile/StatsRow";
import AboutCard from "@/components/profile/AboutCard";
import ActivityHeatmap from "@/components/profile/ActivityHeatmap";
import ActiveRoadmapCard from "@/components/profile/ActiveRoadmapCard";
import AchievementsCard from "@/components/profile/AchievementsCard";
import RecentProjects from "@/components/profile/RecentProjects";
import MasteryByTopic from "@/components/profile/MasteryByTopic";
import EditProfileModal from "@/components/profile/EditProfileModal";

// Tab Subviews
import SecurityTab from "@/components/profile/SecurityTab";
import NotificationsTab from "@/components/profile/NotificationsTab";
import ConnectedAppsTab from "@/components/profile/ConnectedAppsTab";
import CompactProfileHeader from "@/components/profile/CompactProfileHeader";

export default function Profile() {
  const { tab } = useParams<{ tab: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [mastery, setMastery] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [successToast, setSuccessToast] = useState("");

  const activeTab = tab || "overview";

  const fetchProfileData = async () => {
    try {
      // Parallel loading from real API routes using Promise.allSettled for maximum resilience
      const results = await Promise.allSettled([
        api.get("/user/profile"),
        api.get("/user/stats"),
        api.get("/progress"),
        api.get("/roadmap"),
        api.get("/projects"),
        api.get("/progress/stats").catch(() => ({ data: { data: { mastery: [], achievements: [] } } }))
      ]);

      const [profileRes, statsRes, progressRes, roadmapRes, projectsRes, progressStatsRes] = results;

      if (profileRes.status === "fulfilled") {
        const rawProfile = profileRes.value.data.data;
        let joinedDate = "Oct 2023";
        if (rawProfile?.createdAt) {
          try {
            const d = new Date(rawProfile.createdAt);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            joinedDate = `${months[d.getMonth()]} ${d.getFullYear()}`;
          } catch (e) {
            console.warn(e);
          }
        }
        const mappedProfile = rawProfile ? {
          ...rawProfile,
          avatarUrl: rawProfile.avatar || "",
          learningGoal: rawProfile.goal || "",
          skillLevel: rawProfile.level ? rawProfile.level.charAt(0).toUpperCase() + rawProfile.level.slice(1) : "",
          topicsOfInterest: rawProfile.topics || [],
          joinedDate
        } : null;
        setProfile(mappedProfile);
      } else {
        console.error("Failed to load user profile:", profileRes.reason);
      }

      if (statsRes.status === "fulfilled") {
        setStats(statsRes.value.data.data);
      } else {
        console.error("Failed to load stats:", statsRes.reason);
      }

      if (progressRes.status === "fulfilled") {
        setActivity(progressRes.value.data.data);
      } else {
        console.error("Failed to load activity/progress logs:", progressRes.reason);
      }

      if (roadmapRes.status === "fulfilled" && roadmapRes.value.data.data) {
        const rm = roadmapRes.value.data.data;
        const milestones = (rm.milestones || []).map((m: any) => ({
          ...m,
          status: m.status ? m.status.toLowerCase() : "upcoming",
          ...(m.status?.toLowerCase() === "in_progress" && { status: "active" }),
          ...(m.status?.toLowerCase() === "locked" && { status: "upcoming" })
        }));
        setRoadmap({
          ...rm,
          progress: rm.progress !== undefined ? rm.progress : (rm.overallProgress ?? 0),
          milestones
        });
      } else if (roadmapRes.status === "rejected") {
        console.error("Failed to load active roadmap:", roadmapRes.reason);
      }

      if (projectsRes.status === "fulfilled") {
        const rawProjects = projectsRes.value.data.data?.projects || projectsRes.value.data.data || [];
        const mappedProjects = rawProjects.map((p: any) => ({
          ...p,
          image: p.coverImage || p.image,
          title: p.name || p.title,
          tech: p.techStack || p.tech || [],
          status: p.status === 'COMPLETED' ? 'Completed' :
                  p.status === 'IN_PROGRESS' ? 'In Progress' :
                  p.status === 'PLANNING' ? 'Planning' :
                  p.status === 'IN_REVIEW' ? 'In Review' : (p.status || 'Planning')
        }));
        setProjects(mappedProjects);
      } else {
        console.error("Failed to load projects:", projectsRes.reason);
      }

      if (progressStatsRes.status === "fulfilled") {
        const statsData = progressStatsRes.value.data?.data || {};
        setMastery(statsData.mastery || []);
        setAchievements(statsData.achievements || []);
      } else {
        console.error("Failed to load progress stats:", progressStatsRes.reason);
      }

    } catch (err) {
      console.error("Error loading profile details", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSaveProfile = async (updatedData: any) => {
    try {
      const apiPayload = {
        firstName: updatedData.firstName,
        lastName: updatedData.lastName,
        location: updatedData.location,
        bio: updatedData.bio,
        goal: updatedData.learningGoal,
        level: updatedData.skillLevel?.toLowerCase(),
        topics: updatedData.topicsOfInterest,
        avatar: updatedData.avatarUrl
      };
      const { data } = await api.put("/user/profile", apiPayload);
      const updatedUser = data.data;

      let joinedDate = 'Oct 2023';
      if (updatedUser.createdAt) {
        try {
          const d = new Date(updatedUser.createdAt);
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          joinedDate = `${months[d.getMonth()]} ${d.getFullYear()}`;
        } catch (e) {}
      }

      const mappedProfile = {
        ...updatedUser,
        avatarUrl: updatedUser.avatar || '',
        learningGoal: updatedUser.goal || '',
        skillLevel: updatedUser.level ? updatedUser.level.charAt(0).toUpperCase() + updatedUser.level.slice(1) : '',
        topicsOfInterest: updatedUser.topics || [],
        joinedDate
      };
      setProfile(mappedProfile);
    } catch (err) {
      throw new Error("Failed to save profile changes");
    }
  };

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen bg-slate-50 items-center justify-center">
        <div className="flex flex-col items-center gap-3 select-none">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="text-sm font-semibold text-slate-500">Loading profile...</span>
        </div>
      </div>
    );
  }

  const currentUserName = profile ? `${profile.firstName} ${profile.lastName}` : "User";

  return (
    <div className="flex bg-slate-50 min-h-screen font-sans">
      
      {/* Dynamic Sidebar Nav */}
      <Sidebar userName={currentUserName} />

      {/* Main Page Layout Pane */}
      <div className="flex-1 lg:pl-[var(--sidebar-width)] flex flex-col min-h-screen transition-all duration-300">
        
        {/* Top Navigation Header matching reference specs */}
        <MobileTopBar title="Profile" />
        <header className="hidden lg:flex h-16 border-b border-slate-200 bg-white items-center justify-between px-8 sticky top-0 z-30 select-none">
          
          {/* Left Area: Navigation & Back Button */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/dashboard")}
              className="w-8 h-8 border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            {/* Navigation tabs */}
            <div className="hidden md:flex gap-6 text-sm font-semibold text-slate-500">
              <span className="cursor-pointer hover:text-slate-800 transition">Explore</span>
              <span className="cursor-pointer text-blue-600 font-bold border-b-2 border-blue-600 pb-[18px]">Workspace</span>
              <span className="cursor-pointer hover:text-slate-800 transition">Community</span>
            </div>
          </div>

          {/* Right Area: Search, Icons, CTA & User profile */}
          <div className="flex items-center gap-4">
            
            {/* Search inputs */}
            <div className="relative hidden lg:block w-56">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input 
                type="text" 
                placeholder="Search resources..."
                className="w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Icons Actions */}
            <button className="text-slate-400 hover:text-slate-600 transition" title="Notifications">
              <Bell className="w-4 h-4" />
            </button>
            <button 
              onClick={() => navigate("/settings")} 
              className="text-slate-400 hover:text-slate-600 transition" 
              title="Settings"
            >
              <SettingsIcon className="w-4 h-4" />
            </button>

            {/* New Project CTA */}
            <button 
              onClick={() => navigate("/projects")}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>

            {/* Small Avatar icon pointing back to overview profile */}
            <div 
              onClick={() => navigate("/profile")}
              className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden cursor-pointer bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 hover:ring-2 hover:ring-blue-500 transition"
              title="Your Profile"
            >
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{profile.firstName?.charAt(0)}</span>
              )}
            </div>

          </div>

        </header>

        {/* Floating Success Toast */}
        {successToast && (
          <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 text-white text-xs font-semibold rounded-xl px-5 py-3.5 shadow-2xl flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <span>{successToast}</span>
          </div>
        )}

        {/* Core Profile Container Pane */}
        <main className="flex-1 p-8 max-w-5xl w-full mx-auto overflow-y-auto">
          
          {/* Main Hero Header Info */}
          {activeTab === "overview" ? (
            <ProfileHero 
              profile={profile} 
              onEditTrigger={() => setIsEditOpen(true)} 
            />
          ) : (
            <CompactProfileHeader 
              tab={activeTab} 
              profile={profile}
              onEditTrigger={() => setIsEditOpen(true)} 
            />
          )}

          {/* Sub-routing Navigation Tabs */}
          <ProfileTabs />

          {/* Render Active Sub-tab View */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Stats Row Grid (Topics, Streaks, Projects, Hours) */}
              <StatsRow stats={stats} />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: About & Calendar Activity Grid */}
                <div className="lg:col-span-2 space-y-6">
                  <AboutCard profile={profile} />
                  <ActivityHeatmap activityData={activity} />
                  
                  {/* Mastery Animate Progress */}
                  <MasteryByTopic masteryData={mastery} />
                </div>

                {/* Right Column: Achievements & Active roadmap progress */}
                <div className="space-y-6">
                  <ActiveRoadmapCard roadmap={roadmap} />
                  <AchievementsCard achievements={achievements} />
                </div>

              </div>

              {/* Bottom Row: Recent Projects list cards */}
              <RecentProjects projects={projects} />

            </div>
          )}

          {activeTab === "security" && <SecurityTab />}

          {activeTab === "notifications" && <NotificationsTab />}

          {activeTab === "connected-apps" && <ConnectedAppsTab />}

        </main>

      </div>

      {/* Edit Profile Modal Trigger */}
      {isEditOpen && (
        <EditProfileModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profileData={profile}
          onSave={handleSaveProfile}
          onSuccessMessage={triggerToast}
        />
      )}

    </div>
  );
}

