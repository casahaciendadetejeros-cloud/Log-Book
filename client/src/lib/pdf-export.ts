import type { Visitor } from "@shared/schema";

export function exportToPDF(visitors: Visitor[], filename: string = "visitor-log") {
  // Create PDF content as HTML string
  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Visitor Log Report</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #16a34a;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #16a34a;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            color: #666;
            margin: 5px 0 0 0;
          }
          .stats {
            display: flex;
            justify-content: space-around;
            margin-bottom: 30px;
          }
          .stat-box {
            text-align: center;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            min-width: 120px;
          }
          .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
          }
          .stat-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px 8px;
            text-align: left;
            font-size: 11px;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #374151;
            text-transform: uppercase;
            font-size: 10px;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .control-number {
            font-weight: bold;
            color: #16a34a;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tourist Log Book System</h1>
          <p>Visitor Registration Report</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="stats">
          <div class="stat-box">
            <div class="stat-number">${visitors.length}</div>
            <div class="stat-label">Total Visitors</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${visitors.filter(v => 
              new Date(v.createdAt).toDateString() === new Date().toDateString()
            ).length}</div>
            <div class="stat-label">Today</div>
          </div>
          <div class="stat-box">
            <div class="stat-number">${new Set(visitors.map(v => 
              new Date(v.createdAt).toDateString()
            )).size}</div>
            <div class="stat-label">Total Days</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Control Number</th>
              <th>Full Name</th>
              <th>Phone Number</th>
              <th>Email Address</th>
              <th>Registration Date</th>
              <th>Registration Time</th>
            </tr>
          </thead>
          <tbody>
            ${visitors.map(visitor => {
              const date = new Date(visitor.createdAt);
              return `
                <tr>
                  <td class="control-number">${visitor.controlNumber}</td>
                  <td>${visitor.name}</td>
                  <td>${visitor.phone}</td>
                  <td>${visitor.email}</td>
                  <td>${date.toLocaleDateString()}</td>
                  <td>${date.toLocaleTimeString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This report contains ${visitors.length} visitor records.</p>
          <p>© Tourist Log Book System - Confidential Document</p>
        </div>
      </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Create temporary link and trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
  
  // Note: For true PDF export, we would use a library like jsPDF or Puppeteer
  // This HTML export provides a printable format that browsers can save as PDF
}
