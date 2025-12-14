import Image from "next/image";

interface PhotoGallerySectionProps {
  images: string[];
  onImageClick: (image: string) => void;
}

export default function PhotoGallerySection({ images, onImageClick }: PhotoGallerySectionProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="w-full mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        Photo Gallery
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => onImageClick(img)}
          >
            <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}
