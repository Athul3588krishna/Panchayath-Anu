import React from 'react';
import { Landmark, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 mt-auto py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info Column */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-lg">
            <Landmark className="h-5 w-5" />
            <span>Smart Panchayat System</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Empowering rural communities through digital governance, enabling transparent distribution of agricultural subsidies, housing schemes, animal husbandry benefits, and direct forms download.
          </p>
        </div>

        {/* Contact Column */}
        <div className="space-y-3">
          <h3 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">Contact Office</h3>
          <ul className="space-y-2 text-sm text-slate-400">
            <li className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>Main Panchayat Office, Ward 4, District HQ</span>
            </li>
            <li className="flex items-center space-x-2">
              <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>helpdesk@panchayat.gov</span>
            </li>
          </ul>
        </div>

        {/* Quick Guidelines */}
        <div className="space-y-3">
          <h3 className="text-slate-200 font-semibold text-sm uppercase tracking-wider">Citizens Guidelines</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Please update your profile details under the 'Profile' section including age, annual income, occupation, and category. The portal uses these parameters to verify your eligibility for various welfare schemes.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Smart Panchayat Information System. All Rights Reserved.</p>
        <p className="mt-2 md:mt-0">Designed for rural e-Governance and transparency.</p>
      </div>
    </footer>
  );
};

export default Footer;
