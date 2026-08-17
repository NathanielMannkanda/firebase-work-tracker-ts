function SkeletonCard() {
  return (
    <div className="bg-[#1c1c1e] p-6 rounded-2xl border border-gray-800 animate-pulse">
      <div className="h-5 w-40 bg-[#2c2c2e] rounded mb-4"></div>

      <div className="h-4 w-full bg-[#2c2c2e] rounded mb-2"></div>

      <div className="h-4 w-3/4 bg-[#2c2c2e] rounded"></div>
    </div>
  );
}

export default SkeletonCard;
