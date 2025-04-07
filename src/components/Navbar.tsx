// components/Navbar.tsx
export default function Navbar() {
  return (
    <nav className="bg-white border-b border-[#e2e8f0] fixed top-0 left-64 right-0 h-16 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        {/* Bagian Kiri */}
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-[#1e293b]">Dashboard</h2>
        </div>

        {/* Bagian Kanan */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full"></div>
            <div>
              <p className="text-sm font-medium text-[#1e293b]">Anesh</p>
              <p className="text-xs text-[#64748b]">Creator</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
