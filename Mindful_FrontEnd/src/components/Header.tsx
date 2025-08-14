
import { Link } from "react-router-dom";
import { Building2, Award } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-slate-200/80 shadow-sm backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Professional Logo Section */}
          <Link to={"/dashboard"} className="flex items-center gap-3 hover:opacity-90 transition-opacity group">
            <div className="flex items-center justify-center w-11 h-11 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-slate-800 leading-tight tracking-tight">Corporate Learning</h1>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Professional Development Platform</span>
            </div>
          </Link>

          {/* Professional Brand Section */}
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-50/80 rounded-lg border border-slate-200/60">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg">
              <Building2 className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700">Chippersage</span>
              <span className="text-xs text-slate-500">Enterprise Edition</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
