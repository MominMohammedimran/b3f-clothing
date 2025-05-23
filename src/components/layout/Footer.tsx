
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, FileLock,RefreshCcw,AtSign, FileText, Truck, Package ,UsersRound} from 'lucide-react';

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
          <div className="flex justify-center mt-6">
          <div
               className="max-w-md rounded overflow-hidden shadow-md cursor-pointer"
               onClick={() => window.open('https://maps.app.goo.gl/sKTqynHNJmw2bpCL9', '_blank')}
           >
              <iframe
                src="https://maps.google.com/maps?q=B3F - prints & men's wear Gooty&output=embed"
                width="100%"
                height="200"
                style={{ border: 0, pointerEvents: 'none' }}
                loading="lazy"
                title="Map Preview"
               ></iframe>
             </div>
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
            <FileLock size={16} className="mr-2" />
            <span>Privacy Policy</span>
          </Link>
          <Link to="/terms-conditions" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <FileText size={16} className="mr-2" />
            <span>Terms & Conditions</span>
          </Link>
          <Link to="/cancellation-refund" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <RefreshCcw size={16} className="mr-2" />
            <span>Cancellation & Refund</span>
          </Link>
          <Link to="/shipping-delivery" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <Truck size={16} className="mr-2" />
            <span>Shipping & Delivery</span>
          </Link>
           <Link to="/about-us" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <UsersRound size={16} className="mr-2" />
            <span>About us </span>
          </Link>
          <Link to="/contact-us" className="text-sm flex items-center hover:text-blue-600 transition-colors">
            <AtSign size={16} className="mr-2" />
            <span>Contact us</span>
          </Link>
        </div>
        
        
        
        
        {/* WhatsApp Community Join */}
        {/*<div className="mb-6 border border-green-500 rounded-md p-4 bg-green-50">
          <h3 className="font-bold text-green-700 mb-2 flex items-center">
         <div className="w-8 h-8 rounded-full border border-green-500 flex items-center justify-center mr-2">
                   <Phone size={16} className="text-green-800" />
                    </div>


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
        </div>*/}
        
      
        
        
        {/* Copyright */}
        <div className="text-center text-xxl text-gray-500 mb-5 mt-3">
          <p>2025 © to b3f prints and men's wear</p>
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
