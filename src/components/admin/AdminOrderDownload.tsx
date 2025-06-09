
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface Order {
  id: string;
  order_number: string;
  items: any[];
  shipping_address: any;
  total: number;
}

interface AdminOrderDownloadProps {
  order: Order;
}

const AdminOrderDownload: React.FC<AdminOrderDownloadProps> = ({ order }) => {
  const generateOrderPDF = () => {
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Generate HTML content for A4 paper
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order ${order.order_number}</title>
        <style>
          @page {
            size: A4;
            margin: 20mm;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .order-details {
            margin-bottom: 30px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          .items-table th,
          .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          .items-table th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          .design-preview {
            width: 100px;
            height: 100px;
            border: 1px solid #ddd;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 10px 0;
          }
          .total {
            text-align: right;
            font-size: 18px;
            font-weight: bold;
            margin-top: 20px;
          }
          .shipping-address {
            background-color: #f9f9f9;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>B3F Prints & Men's Wear</h1>
          <h2>Order Details</h2>
        </div>
        
        <div class="order-details">
          <h3>Order Number: ${order.order_number}</h3>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        ${order.shipping_address ? `
        <div class="shipping-address">
          <h3>Shipping Address:</h3>
          <p>${order.shipping_address.fullName || order.shipping_address.firstName + ' ' + order.shipping_address.lastName}</p>
          <p>${order.shipping_address.addressLine1 || order.shipping_address.street}</p>
          <p>${order.shipping_address.city}, ${order.shipping_address.state} ${order.shipping_address.postalCode || order.shipping_address.zipCode}</p>
          <p>${order.shipping_address.country || 'India'}</p>
          ${order.shipping_address.phone ? `<p>Phone: ${order.shipping_address.phone}</p>` : ''}
        </div>
        ` : ''}

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Design Preview</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${item.name}</td>
                <td>${item.size || '-'}</td>
                <td>${item.quantity}</td>
                <td>₹${item.price}</td>
                <td>
                  <div class="design-preview">
                    ${item.metadata?.customDesign ? 
                      '<div style="font-size: 12px; text-align: center;">Custom Design<br/>Elements Present</div>' : 
                      '<div style="font-size: 12px; text-align: center;">Standard Product</div>'
                    }
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total">
          <p>Total Amount: ₹${order.total}</p>
        </div>

        <div style="margin-top: 50px; text-align: center; font-size: 12px; color: #666;">
          <p>Thank you for your business!</p>
          <p>For any queries, contact us at support@b3fprints.com</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateOrderPDF}
    >
      <Download className="h-4 w-4 mr-1" />
      Download
    </Button>
  );
};

export default AdminOrderDownload;