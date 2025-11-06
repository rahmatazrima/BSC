import Image from "next/image";

export default function Illustration() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-cyan-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-purple-600/20 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 max-w-md text-center">
        {/* Main illustration */}
        <div className="relative w-96 h-96 mx-auto mb-8 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-xl"></div>
          <Image
            src="/hhh.png"
            alt="Bukhari Service Center Illustration"
            width={400}
            height={400}
            className="object-contain relative z-10 drop-shadow-2xl"
          />
        </div>

        {/* Welcome Text */}
        <div className="text-white">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
            Selamat Datang Kembali!
          </h2>
          <p className="text-gray-300 text-lg">
            Mitra terpercaya Anda untuk perbaikan dan perawatan perangkat mobile.
          </p>
        </div>
      </div>
    </div>
  );
}
