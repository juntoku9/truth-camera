import Link from "next/link";
import { CameraIcon, ShieldCheckIcon, DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <CameraIcon className="h-12 w-12 sm:h-16 sm:w-16 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Truth Camera
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
            Capture authentic images with built-in verification. 
            Use your camera to take photos that can't be faked or tampered with.
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12 sm:mb-16">
          <Link href="/upload" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group-hover:border-blue-300 dark:group-hover:border-blue-600">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 sm:p-4 rounded-full">
                  <CameraIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center">
                Take Photo
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4 sm:mb-6 text-sm sm:text-base">
                Use your device's camera to capture an authentic image with built-in verification.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium group-hover:bg-blue-700 transition-colors text-sm sm:text-base">
                  Start Camera →
                </span>
              </div>
            </div>
          </Link>

          <Link href="/verify" className="group">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group-hover:border-green-300 dark:group-hover:border-green-600">
              <div className="flex items-center justify-center mb-4 sm:mb-6">
                <div className="bg-green-100 dark:bg-green-900 p-3 sm:p-4 rounded-full">
                  <DocumentMagnifyingGlassIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 text-center">
                Verify Image
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-center mb-4 sm:mb-6 text-sm sm:text-base">
                Check if an image is authentic by comparing it against our verification database.
              </p>
              <div className="text-center">
                <span className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg font-medium group-hover:bg-green-700 transition-colors text-sm sm:text-base">
                  Verify Image →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* How it Works */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 sm:p-8 shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8 text-center">
            How It Works
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-blue-600 dark:text-blue-400 font-bold text-base sm:text-lg">1</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Capture with Camera</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Take photos directly through the app to prevent pre-manipulation
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-green-600 dark:text-green-400 font-bold text-base sm:text-lg">2</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Generate Hash</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Create a unique SHA-256 fingerprint that serves as the image's signature
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <span className="text-purple-600 dark:text-purple-400 font-bold text-base sm:text-lg">3</span>
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm sm:text-base">Store Proof</h4>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm">
                Save the verification record for future authenticity checks
              </p>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 sm:p-6 mt-8 max-w-4xl mx-auto">
          <div className="flex items-start space-x-3">
            <ShieldCheckIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Enhanced Security Through Camera Capture
              </h4>
              <p className="text-blue-800 dark:text-blue-200 text-sm sm:text-base">
                By requiring direct camera capture instead of file uploads, Truth Camera prevents the submission 
                of pre-manipulated images, ensuring the highest level of authenticity verification.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
