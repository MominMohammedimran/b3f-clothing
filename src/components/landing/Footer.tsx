
import React from "react";
import { Twitter, Linkedin, Github, Facebook } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-slate-900">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
              Product
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Features
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Changelog
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
              Company
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Community
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Partners
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Status
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-400 tracking-wider uppercase">
              Legal
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Terms
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-base text-slate-300 hover:text-white">
                  Licenses
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-8">
          <div className="flex justify-between items-center">
            <p className="text-base text-slate-400">
              &copy; {currentYear} Horizon, Inc. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-slate-300">
                <span className="sr-only">Twitter</span>
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-300">
                <span className="sr-only">LinkedIn</span>
                <Linkedin className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-300">
                <span className="sr-only">GitHub</span>
                <Github className="h-6 w-6" />
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-300">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
