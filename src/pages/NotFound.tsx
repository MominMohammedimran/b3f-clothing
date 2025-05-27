
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md mx-auto">
        <h1 className="text-6xl font-bold mb-4 text-red-600 animate-fade-in">404</h1>
        <p className="text-xl text-gray-700 mb-6 animate-fade-in delay-100">
          Oops! The page you're looking for doesn't exist.
        </p>
        <p className="text-gray-500 mb-8 animate-fade-in delay-200">
          The page might have been moved or deleted, or you might have mistyped the URL.
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors animate-fade-in delay-300"
        >
          <ArrowLeft size={18} className="mr-2" />
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
