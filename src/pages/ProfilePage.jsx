import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchProfile, updateProfile, uploadProfilePicture, removeProfilePicture } from '../services/api';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

function ProfilePage() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', sidebarCollapsed);
  }, [sidebarCollapsed]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchProfile();
        setProfile(data);
        setName(data.name);
        setBio(data.bio || '');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);
      setSuccess('');
      const updated = await updateProfile({ name, bio });
      setProfile(updated);
      updateUser({ name: updated.name });
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePicture = async () => {
    try {
      setUploading(true);
      setError(null);
      await removeProfilePicture();
      setProfile((prev) => ({ ...prev, profilePicture: '' }));
      updateUser({ profilePicture: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const pictureUrl = await uploadProfilePicture(file);
      setProfile((prev) => ({ ...prev, profilePicture: pictureUrl }));
      updateUser({ profilePicture: pictureUrl });
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const layoutWrapper = (content) => (
    <div className="min-h-screen relative z-10">
      <Navbar
        searchTerm=""
        onSearchChange={() => {}}
        pendingCount={0}
        onNotificationClick={() => {}}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
      <Sidebar
        noteCount={0}
        favoriteCount={0}
        pinnedCount={0}
        trashCount={0}
        activeFilter=""
        onFilterChange={() => {}}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        receivedShareCount={0}
        sentShareCount={0}
      />
      <div
        className={`min-h-screen transition-all duration-300 pt-16 ${
          sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        {content}
      </div>
    </div>
  );

  if (loading) {
    return layoutWrapper(
      <div className="flex items-center justify-center h-[60vh]">
        <div className="inline-flex items-center gap-2.5">
          <div className="h-5 w-5 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
          <p className="text-[var(--text-secondary)] text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return layoutWrapper(
    <div className="px-4 lg:px-6 py-6 max-w-2xl mx-auto">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors mb-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold font-geist text-[var(--text-primary)]">Profile</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Manage your account details
        </p>
      </motion.div>

      {/* Profile header card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 card-glow mb-6"
      >
        <div className="flex items-center gap-5">
          {/* Avatar with upload overlay */}
          <div className="relative group">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="h-20 w-20 rounded-full overflow-hidden cursor-pointer ring-2 ring-blue-400/30 ring-offset-2 ring-offset-[var(--bg-primary)]"
            >
              {profile?.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                {uploading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handlePictureUpload}
              className="hidden"
            />
            {profile?.profilePicture && (
              <button
                onClick={handleRemovePicture}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-[var(--card-bg)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-red-400 hover:border-red-400/40 transition-colors"
                title="Remove picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {/* Name + meta */}
          <div>
            <h2 className="text-xl font-bold font-geist text-[var(--text-primary)]">
              {profile?.name}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">{profile?.email}</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Member since{' '}
              {new Date(profile?.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Feedback messages */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl py-3 px-5 text-sm text-red-400 mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl py-3 px-5 text-sm text-green-400 mb-4">
          {success}
        </div>
      )}

      {/* Edit form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 card-glow"
      >
        <h3 className="text-base font-semibold font-geist text-[var(--text-primary)] mb-4">
          Edit Profile
        </h3>
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-400/40 focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] transition-all"
              required
            />
          </div>
          {/* Email field (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-muted)] opacity-60 cursor-not-allowed"
            />
          </div>
          {/* Bio field */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Bio{' '}
              <span className="text-[var(--text-muted)] font-normal">({bio.length}/500)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-2.5 bg-[var(--input-bg)] border border-[var(--border)] rounded-xl text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-blue-400/40 focus:shadow-[0_0_16px_rgba(96,165,250,0.15)] transition-all resize-none"
            />
          </div>
          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="self-end px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white text-sm font-semibold rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] disabled:opacity-50 transition-all duration-300"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ProfilePage;
