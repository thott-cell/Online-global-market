interface SkeletonProps {
  isCarousel?: boolean;
}

const ProductSkeleton = ({ isCarousel = false }: SkeletonProps) => {
  return (
    <div className={isCarousel ? "skeleton-carousel" : "skeleton-card"}>
      <div className={isCarousel ? "skeleton-box skeleton-hero" : "skeleton-box skeleton-image"}></div>

      {!isCarousel && (
        <>
          <div className="skeleton-box skeleton-title"></div>
          <div className="skeleton-box skeleton-desc"></div>
          <div className="skeleton-box skeleton-desc short"></div>
          <div className="skeleton-box skeleton-price"></div>
          <div className="skeleton-box skeleton-button"></div>
        </>
      )}

      <style>{`
        .skeleton-card, .skeleton-carousel {
          display: flex;
          flex-direction: column;
          border-radius: 14px;
          background: #f5f5f5;
          overflow: hidden;
          gap: 8px;
          animation: pulse 1.2s infinite ease-in-out;
        }

        .skeleton-box {
          background: #e0e0e0;
          border-radius: 8px;
        }

        .skeleton-image { height: 150px; }
        .skeleton-title { height: 20px; width: 70%; margin: 0 8px; }
        .skeleton-desc { height: 12px; width: 90%; margin: 0 8px; }
        .skeleton-desc.short { width: 60%; }
        .skeleton-price { height: 18px; width: 30%; margin: 0 8px; }
        .skeleton-button { height: 32px; width: 80%; margin: 0 8px; border-radius: 8px; }

        .skeleton-hero { height: 210px; width: 100%; }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 768px) {
          .skeleton-hero { height: 180px; }
          .skeleton-card { gap: 6px; }
        }
      `}</style>
    </div>
  );
};

export default ProductSkeleton;