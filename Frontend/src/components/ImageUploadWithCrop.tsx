import { useState, useRef } from "react";
import { X, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import GradientButton from "@/components/GradientButton";

interface ImageUploadWithCropProps {
  onImageSave: (imageData: string) => void;
  onClose: () => void;
  title?: string;
}

const ImageUploadWithCrop = ({
  onImageSave,
  onClose,
  title = "Upload Profile Picture",
}: ImageUploadWithCropProps) => {
  const [image, setImage] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCropAndSave = () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas to circular dimensions
      const size = 200;
      canvas.width = size;
      canvas.height = size;

      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, size, size);

      // Create circular path
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();

      // Apply transformations
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);
      ctx.translate(-size / 2, -size / 2);

      // Draw image
      ctx.drawImage(img, 0, 0, size, size);

      // Get the circular image data
      const croppedImage = canvas.toDataURL("image/png");
      onImageSave(croppedImage);
      setImage(null);
      setScale(1);
      setRotation(0);
    };
    img.src = image;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-lg transition-colors"
          >
            <X size={24} className="text-foreground" />
          </button>
        </div>

        {!image ? (
          <div className="space-y-4">
            <div
              onClick={() => inputRef.current?.click()}
              className="w-32 h-32 mx-auto bg-muted rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
            >
              <span className="text-muted-foreground text-center text-sm px-4">
                Click to upload image
              </span>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <GradientButton
              onClick={() => inputRef.current?.click()}
              className="w-full"
            >
              Choose Image
            </GradientButton>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Circular Preview */}
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-primary">
              <img
                src={image}
                alt="Preview"
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${scale}) rotate(${rotation}deg)`,
                }}
              />
            </div>

            {/* Zoom Controls */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Zoom</label>
              <div className="flex items-center gap-2">
                <ZoomOut size={18} className="text-muted-foreground" />
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={scale}
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="flex-1"
                />
                <ZoomIn size={18} className="text-muted-foreground" />
              </div>
            </div>

            {/* Rotation Controls */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Rotate</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="15"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="flex-1"
                />
                <button
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <RotateCw size={18} className="text-foreground" />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <GradientButton
                onClick={handleCropAndSave}
                className="w-full"
              >
                Save Image
              </GradientButton>
              <button
                onClick={() => {
                  setImage(null);
                  setScale(1);
                  setRotation(0);
                }}
                className="w-full py-2 px-4 border-2 border-foreground/20 rounded-full text-foreground font-medium hover:bg-muted transition-colors"
              >
                Choose Different
              </button>
            </div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
};

export default ImageUploadWithCrop;
