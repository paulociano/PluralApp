// Este componente simula o layout do card da grade
export default function TopicGridCardSkeleton() {
  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm animate-pulse">
      <div className="h-3 w-1/3 bg-gray-200 rounded"></div>
      <div className="h-6 w-3/4 bg-gray-200 rounded mt-3"></div>
      <div className="h-4 w-full bg-gray-200 rounded mt-3"></div>
      <div className="h-4 w-4/5 bg-gray-200 rounded mt-2"></div>
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}