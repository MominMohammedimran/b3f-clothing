
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Facebook, FileText, Truck, Package } from 'lucide-react';

const Footer = () => {
  return (
    <div className="bg-gray-100">
      <div className="container-custom py-8">
        {/* Contact Info */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start space-x-3 animate-fade-in">
            <MapPin className="text-red-500 mt-1 flex-shrink-0" />
            <p className="text-sm">
              1/128 Opposite Ap Transco Colony Gooty Gooty RS, Ananthapur (District), Andhra Pradesh (State) 515402
            </p>
          </div>
          
          <div className="flex items-center space-x-3 animate-fade-in">
            <Mail className="text-red-500 flex-shrink-0" />
            <p className="text-sm">b3fprintingsolutions@gmail.com</p>
          </div>
          
          <div className="flex items-center space-x-3 animate-fade-in">
            <Phone className="text-red-500 flex-shrink-0" />
            <p className="text-sm">7672080881 | 9581319687</p>
          </div>
        </div>
        
        {/* Legal Pages Links */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Link to="/privacy-policy" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <FileText size={16} className="mr-2" />
            <span>Privacy Policy</span>
          </Link>
          <Link to="/terms-conditions" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <FileText size={16} className="mr-2" />
            <span>Terms & Conditions</span>
          </Link>
          <Link to="/cancellation-refund" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <FileText size={16} className="mr-2" />
            <span>Cancellation & Refund</span>
          </Link>
          <Link to="/shipping-delivery" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <Truck size={16} className="mr-2" />
            <span>Shipping & Delivery</span>
          </Link>
        </div>
        
      {/* Features 
        <div className="grid grid-cols-2 gap-2 text-sm mb-6">
          <div className="flex items-center gap-1">
            <span>📱</span>
            <p>Order Notifications</p>
          </div>
          <div className="flex items-center gap-1">
            <span>🎫</span>
            <p>Coupons & Promo Codes</p>
          </div>
          <div className="flex items-center gap-1">
            <span>👛</span>
            <p>Wallet System</p>
          </div>
          <div className="flex items-center gap-1">
            <span>🌟</span>
            <p>Reward Points System</p>
          </div>
          <div className="flex items-center gap-1">
            <span>🔍</span>
            <p>SEO-Optimized Website</p>
          </div>
          <div className="flex items-center gap-1">
            <span>🚫</span>
            <p>Content Copy Protection</p>
          </div>
          <div className="flex items-center gap-1">
            <span>🛡️</span>
            <p>Free Security Tools</p>
          </div>
          <div className="flex items-center gap-1">
            <span>📈</span>
            <p>Google Search Console</p>
          </div>
        </div> */}
        
        {/* WhatsApp Community Join */}
        <div className="mb-6 border border-green-500 rounded-md p-4 bg-green-50">
          <h3 className="font-bold text-green-700 mb-2 flex items-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
              <path d="M17.4 14.3912C16.9 14.1412 15.5 13.4412 15 13.2412C14.5 13.0912 14.1 13.0412 13.7 13.5412C13.3 14.0412 12.7 14.6912 12.4 15.0912C12.1 15.4912 11.8 15.5412 11.3 15.2912C9.8 14.5912 8.5 13.5912 7.3 12.3912C6.8 11.7912 7.5 11.7912 8.1 10.5912C8.3 10.1912 8.2 9.89121 8.1 9.64121C8 9.39121 7.3 7.99121 6.9 7.09121C6.5 6.19121 6.1 6.29121 5.8 6.29121C5.3 6.19121 4.9 6.19121 4.5 6.19121C4.1 6.19121 3.5 6.39121 3 6.89121C2.5 7.39121 1.7 8.09121 1.7 9.49121C1.7 10.8912 2.8 12.2912 3 12.6912C3.2 13.0912 5.1 16.1912 8.2 17.3912C9.8 17.9912 10.7 18.0912 11.5 17.9912C12.3 17.8912 13.5 17.2912 13.9 16.2912C14.3 15.2912 14.3 14.4912 14.2 14.3912C14.1 14.2912 13.8 14.1912 13.4 14.0912" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Join Our WhatsApp Community!
          </h3>
          <p className="text-sm text-gray-700 mb-2">
            Get exclusive updates, catalogs, and special offers directly on WhatsApp.
          </p>
          <a 
            href="https://wa.me/917672080881?text=I%20want%20to%20join%20ur%20community%20please%20add%20me%20and%20send%20me%20catalogue."
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-green-600 text-white text-sm px-4 py-2 rounded-md inline-flex items-center hover:bg-green-700 transition-colors"
          >
            <span className="mr-2">Join Now</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 5L16 12L9 19" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
        
        {/* Track Order Link 
        <div className="flex justify-center mb-4">
          <Link 
            to="/orders" 
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Package size={18} />
            <span>Track Your Order</span>
          </Link>
        </div>*/}
        
        {/* Copyright */}
        <div className="text-center text-sm text-gray-500 mb-3">
          <p>2025 © to B3F prints and men's wear</p>
        </div>
        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-10">
          <p className="font-medium">Follow us on</p>
          <Link to="https://www.instagram.com/b3f_prints?igsh=aG9nNzVleDdqZXA" className="text-pink-500 hover:text-pink-600 transition-colors">
            <Instagram />
          </Link>
        {/*  <Link to="#" className="text-green-500 hover:text-green-600 transition-colors">
            <Facebook />
          </Link> */}
        </div>
        
      </div>
    </div>
  );
};

export default Footer;
