import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { User2, LogOut, LogIn, UserPlus } from "lucide-react";

function getInitials(name) {
  if (!name) return '';
  return name[0].toUpperCase();
}

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="w-full bg-white shadow-md border-b border-green-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/images/logo.svg" alt="Logo" className="h-9 w-9 object-contain text-[#16a34a] transition-transform group-hover:scale-110" />
          <span className="text-2xl md:text-3xl font-extrabold text-[#16a34a] tracking-tight leading-tight align-middle group-hover:text-[#15803d] transition-colors">
            Sugarcane Monitoring
          </span>
        </Link>
        <div className="hidden md:flex gap-2 items-center flex-1 justify-end">
          <Button variant="ghost" asChild className="text-[#16a34a] hover:text-[#15803d]"><Link to="/dashboard">Dashboard</Link></Button>
          <Button variant="ghost" asChild className="text-[#16a34a] hover:text-[#15803d]"><Link to="/fields">Fields</Link></Button>
          <Button variant="ghost" asChild className="text-[#16a34a] hover:text-[#15803d]"><Link to="/map">Map</Link></Button>
          <Button variant="ghost" asChild className="text-[#16a34a] hover:text-[#15803d]"><Link to="/feedback">Feedback</Link></Button>
          {/* Profile Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="ml-4 cursor-pointer border-2 border-green-400">
                {user ? (
                  <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                    {getInitials(user.name || user.email || "U")}
                  </AvatarFallback>
                ) : (
                  <AvatarFallback className="bg-green-100 text-green-700">
                    <User2 className="w-6 h-6" />
                  </AvatarFallback>
                )}
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              {user ? (
                <>
                  <DropdownMenuItem disabled className="font-semibold text-green-700">
                    {user.name || user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/login"><LogIn className="w-4 h-4 mr-2" /> Login</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/register"><UserPlus className="w-4 h-4 mr-2" /> Register</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Open menu"
          >
            <svg className="h-6 w-6 text-[#16a34a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>
      </div>
      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-green-100 shadow-lg px-4 py-2">
          <div className="flex flex-col gap-2">
            <Button variant="ghost" asChild onClick={() => setMenuOpen(false)} className="text-[#16a34a] hover:text-[#15803d]"><Link to="/dashboard">Dashboard</Link></Button>
            <Button variant="ghost" asChild onClick={() => setMenuOpen(false)} className="text-[#16a34a] hover:text-[#15803d]"><Link to="/fields">Fields</Link></Button>
            <Button variant="ghost" asChild onClick={() => setMenuOpen(false)} className="text-[#16a34a] hover:text-[#15803d]"><Link to="/map">Map</Link></Button>
            <Button variant="ghost" asChild onClick={() => setMenuOpen(false)} className="text-[#16a34a] hover:text-[#15803d]"><Link to="/feedback">Feedback</Link></Button>
            {/* Profile Avatar Dropdown for mobile */}
            {user ? (
              <>
                <Button variant="ghost" asChild onClick={() => setMenuOpen(false)} className="text-[#16a34a] hover:text-[#15803d]"><Link to="/profile">Profile</Link></Button>
                <Button variant="outline" onClick={() => { handleLogout(); setMenuOpen(false); }} className="text-[#16a34a] border-[#16a34a] hover:bg-green-50">Logout</Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild onClick={() => setMenuOpen(false)} className="text-[#16a34a] border-[#16a34a] hover:bg-[#16a34a] hover:text-white hover:border-[#16a34a] transition-colors"><Link to="/login">Login</Link></Button>
                <Button variant="default" asChild onClick={() => setMenuOpen(false)} className="bg-[#16a34a] hover:bg-[#15803d] text-white"><Link to="/register">Register</Link></Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
