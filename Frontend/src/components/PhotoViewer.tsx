import { X, ChevronLeft } from "lucide-react";

interface PhotoViewerProps {
  imageUrl: string;
  open: boolean;
  onClose: () => void;
}

const PhotoViewer = ({ imageUrl, open, onClose }: PhotoViewerProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col items-center justify-center">
      {/* Header with back/close button */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-4 bg-black/50">
        <button onClick={onClose} className="p-2">
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>
        <span className="text-white text-sm">Profile Photo</span>
        <div className="w-10" />
      </div>

      {/* Photo */}
      <div className="flex-1 flex items-center justify-center">
        <img src={imageUrl} alt="Profile" className="max-w-full max-h-full object-contain" />
      </div>

      {/* Footer - optional save/share actions */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-black/50" />
    </div>
  );
};

export default PhotoViewer;
