import React, { useState, useRef } from "react";
import { ChevronLeft, Camera, Pencil } from "lucide-react";
import { api } from "../../services/api";

interface EditProfileViewProps {
  currentName: string;
  currentProfilePic: string | null;
  onBack: () => void;
  onSave: (newName: string) => Promise<void>;
}

export function EditProfileView({ currentName, currentProfilePic, onBack, onSave }: EditProfileViewProps) {
  const [name, setName] = useState(currentName);
  const [profilePic, setProfilePic] = useState<string | null>(currentProfilePic);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
      // We can specify a subfolder if desired, though the preset also has it
      formData.append("folder", "ironlog/profile_pics");

      const res = await fetch(`https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Cloudinary upload failed");

      const data = await res.json();
      const newUrl = data.secure_url;

      // Save immediately so it feels snappy
      await api.patch("/users/me", { profile_picture_url: newUrl });
      setProfilePic(newUrl);
    } catch (err) {
      console.error("Failed to upload or save profile picture", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset input
      }
    }
  };

  const handleRemovePicture = async () => {
    setUploading(true);
    try {
      await api.patch("/users/me", { profile_picture_url: null });
      setProfilePic(null);
    } catch (err) {
      console.error("Failed to remove profile picture", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || name === currentName) {
      onBack();
      return;
    }
    setLoading(true);
    try {
      await onSave(name.trim());
      // onSave does window reload, so no need to clean up here
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-bg z-[100] flex flex-col font-body">
      <header className="flex items-center justify-between px-5 pt-5 pb-3.5 border-b border-border shrink-0 bg-bg/80 backdrop-blur-md sticky top-0 z-10">
        <button
          onClick={onBack}
          className="text-heat text-[15px] font-display uppercase tracking-widest cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1"
        >
          <ChevronLeft size={16} className="-ml-1" />
          Back
        </button>
        <h1 className="font-display text-base font-bold tracking-widest text-white uppercase absolute left-1/2 -translate-x-1/2">
          Edit Profile
        </h1>
        <div className="w-[60px]" /> {/* Spacer for flex layout */}
      </header>

      <div className="flex-1 overflow-y-auto px-5 pt-8 pb-[120px] flex flex-col items-center">
        {/* Avatar Section */}
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/jpg, image/webp, image/heic"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <div className="w-full flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
            <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-2 border-border bg-[#141414] flex items-center justify-center relative">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-[32px] font-display text-dim uppercase">
                  {name ? name.charAt(0) : "?"}
                </span>
              )}
              
              {/* Loading / Hover Overlay */}
              <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {uploading ? (
                   <span className="text-white text-xs tracking-widest uppercase animate-pulse">Wait</span>
                ) : (
                   <Camera size={24} className="text-white" />
                )}
              </div>
            </div>
            
            {/* Edit Icon Badge */}
            <div className="absolute -bottom-1 -right-1 w-[34px] h-[34px] bg-heat rounded-full border-[3px] border-bg flex items-center justify-center text-bg shadow-lg">
              <Pencil size={14} className="ml-[1px]" />
            </div>
          </div>

          {profilePic && (
            <button
              onClick={handleRemovePicture}
              disabled={uploading}
              className="mt-6 px-8 py-3 rounded-xl bg-[#FF4444]/10 border border-[#FF4444]/20 text-[#FF4444] text-[12px] font-display tracking-[1.5px] uppercase hover:bg-[#FF4444]/20 transition-colors disabled:opacity-50 w-full max-w-[240px]"
            >
              Remove Picture
            </button>
          )}
        </div>

        {/* Form Fields */}
        <div className="w-full bg-[#141414] border border-border rounded-xl overflow-hidden">
          <div className="flex flex-col px-4 py-2 border-b border-border/50">
            <span className="text-[10px] text-ghost font-display tracking-[1.5px] uppercase mt-1 mb-0.5">
              Name
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent text-white font-body text-[16px] outline-none placeholder:text-dim pb-2"
              placeholder="Your Name"
            />
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-bg via-bg/90 to-transparent pb-10 z-20">
        <button
          onClick={handleSave}
          disabled={loading || !name.trim()}
          className="w-full h-14 bg-heat text-bg text-[15px] font-display font-bold tracking-[2px] uppercase rounded-xl flex items-center justify-center hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-heat shadow-lg shadow-heat/20"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}
