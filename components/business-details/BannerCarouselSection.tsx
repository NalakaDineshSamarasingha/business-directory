import dynamic from 'next/dynamic';

const BannerCarousel = dynamic(() => import('@/components/business/BannerCarousel'), {
  loading: () => <div className="h-96 bg-gray-200 animate-pulse rounded-lg" />,
  ssr: false
});

interface BannerCarouselSectionProps {
  images: string[];
}

export default function BannerCarouselSection({ images }: BannerCarouselSectionProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="w-full my-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        Featured Images
      </h2>
      <BannerCarousel images={images} />
    </div>
  );
}
