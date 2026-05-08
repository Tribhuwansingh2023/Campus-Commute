import { Camera, Image, Smile, Instagram, Wand2, Trash2 } from "lucide-react";

interface PhotoOptionsSheetProps {
  open: boolean;
  onClose: () => void;
  onCamera: () => void;
  onGallery: () => void;
  onAvatar: () => void;
  onDelete: () => void;
  hasPhoto: boolean;
}

const PhotoOptionsSheet = ({ open, onClose, onCamera, onGallery, onAvatar, onDelete, hasPhoto }: PhotoOptionsSheetProps) => {
  if (!open) return null;

  const options = [
    { id: "camera", label: "Camera", icon: Camera, action: onCamera },
    { id: "gallery", label: "Gallery", icon: Image, action: onGallery },
    { id: "avatar", label: "Avatar", icon: Smile, action: onAvatar },
    { id: "instagram", label: "Instagram", icon: Instagram, action: () => {} },
    { id: "ai", label: "AI Images", icon: Wand2, action: () => {} },
  ];

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-foreground/20 z-40" />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl z-50 animate-in slide-in-from-bottom duration-300 max-w-[430px] mx-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">Profile photo</h2>

          <div className="space-y-2 mb-6">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  option.action();
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted rounded-2xl transition-colors text-foreground"
              >
                <option.icon className="w-5 h-5 text-primary" />
                <span className="font-medium">{option.label}</span>
              </button>
            ))}

            {/* Delete option - shown only if photo exists */}
            {hasPhoto && (
              <button
                onClick={() => {
                  onDelete();
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-4 hover:bg-muted rounded-2xl transition-colors text-destructive"
              >
                <Trash2 className="w-5 h-5" />
                <span className="font-medium">Delete photo</span>
              </button>
            )}
          </div>

          <button onClick={onClose} className="w-full py-3 px-4 border-2 border-foreground/20 rounded-full text-foreground font-medium hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
};

export default PhotoOptionsSheet;
