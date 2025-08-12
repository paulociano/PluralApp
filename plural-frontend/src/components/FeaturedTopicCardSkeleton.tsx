// Este componente simula o layout do card de destaque
export default function FeaturedTopicCardSkeleton() {
  return (
    <div className="mb-12 p-8 rounded-xl bg-gray-200 animate-pulse">
      <div className="h-4 w-1/4 bg-gray-300 rounded"></div>
      <div className="h-10 w-3/4 bg-gray-300 rounded mt-4"></div>
      <div className="h-6 w-full bg-gray-300 rounded mt-4"></div>
      <div className="h-6 w-5/6 bg-gray-300 rounded mt-2"></div>
      <div className="flex items-center space-x-6 mt-6">
        <div className="h-5 w-24 bg-gray-300 rounded"></div>
        <div className="h-5 w-24 bg-gray-300 rounded"></div>
      </div>
      <div className="h-12 w-48 bg-gray-300 rounded-lg mt-8"></div>
    </div>
  );
}