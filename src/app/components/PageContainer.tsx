import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export default function PageContainer({
  children,
  title,
  className = "",
}: PageContainerProps) {
  return (
    <main className="p-3 w-[99%] mx-auto">
      <div
        className={`bg-white rounded-xl shadow-sm p-6 min-h-[calc(100vh-100px)]  flex flex-col ${className}`}
      >
        {title && (
          <div className="mb-6 border-b pb-3">
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>
        )}

        <div className="flex-1">{children}</div>
      </div>
    </main>
  );
}
