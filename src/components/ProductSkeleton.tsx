const ProductSkeleton = () => {
  return (
    <div className="skeleton-card">
      <div className="skeleton-box skeleton-image"></div>

      <div className="skeleton-box skeleton-title"></div>

      <div className="skeleton-box skeleton-desc"></div>
      <div className="skeleton-box skeleton-desc short"></div>

      <div className="skeleton-box skeleton-price"></div>

      <div className="skeleton-box skeleton-button"></div>
    </div>
  );
};

export default ProductSkeleton;