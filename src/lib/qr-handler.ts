import { toPng } from 'html-to-image';
import { format } from 'date-fns';
import type { Event } from '@/lib/types';

interface QROptions {
  size: number;
  quality?: number;
  scale?: number;
}

interface GenerateQRResult {
  success: boolean;
  error?: string;
  url?: string;
  filename?: string;
}

export class QRHandler {
  private static validateQRElement(element: HTMLElement | null): boolean {
    if (!element) {
      throw new Error('QR code element not found');
    }

    const qrImage = element.querySelector('svg');
    if (!qrImage) {
      throw new Error('QR code not properly rendered');
    }

    return true;
  }

  private static getFilename(event: Event): string {
    const date = format(new Date(event.created_at), 'yyyy-MM-dd');
    const sanitizedName = event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `qr-code-${sanitizedName}-${date}`;
  }

  private static async generateImage(
    element: HTMLElement,
    options: QROptions
  ): Promise<string> {
    try {
      const dataUrl = await toPng(element, {
        quality: options.quality || 0.95,
        width: options.size,
        height: options.size * 1.4, // Account for text below QR code
        pixelRatio: options.scale || 3,
        skipAutoScale: true,
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        },
      });

      return dataUrl;
    } catch (error) {
      console.error('Error generating QR image:', error);
      throw new Error('Failed to generate QR code image');
    }
  }

  static async downloadQR(
    element: HTMLElement | null,
    event: Event,
    options: QROptions
  ): Promise<GenerateQRResult> {
    try {
      // Validate QR element
      this.validateQRElement(element);
      if (!element) return { success: false, error: 'QR code element not found' };

      // Generate image
      const dataUrl = await this.generateImage(element, options);
      const filename = this.getFilename(event);

      // Create download link
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();

      return {
        success: true,
        url: dataUrl,
        filename: `${filename}.png`,
      };
    } catch (error) {
      console.error('QR download error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to download QR code',
      };
    }
  }

  static async printQR(
    element: HTMLElement | null,
    event: Event,
    options: QROptions
  ): Promise<GenerateQRResult> {
    try {
      // Validate QR element
      this.validateQRElement(element);
      if (!element) return { success: false, error: 'QR code element not found' };

      // Generate image
      const dataUrl = await this.generateImage(element, options);

      // Create print window
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Failed to open print window. Please allow pop-ups for this site.');
      }

      // Generate print content
      const eventDate = format(new Date(event.created_at), 'MMMM d, yyyy');
      const eventTime = event.start_time
        ? format(new Date(`2000-01-01T${event.start_time}`), 'h:mm a')
        : '';
      const eventLocation = event.location || '';

      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${event.name}</title>
            <style>
              @media print {
                @page {
                  size: auto;
                  margin: 20mm;
                }
                body {
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              body {
                margin: 0;
                padding: 40px;
                font-family: system-ui, -apple-system, sans-serif;
                color: #000;
                background: #fff;
              }
              .container {
                max-width: 800px;
                margin: 0 auto;
                text-align: center;
              }
              .qr-image {
                max-width: 100%;
                height: auto;
                margin-bottom: 30px;
              }
              .event-details {
                margin-top: 20px;
                padding: 20px;
                border-top: 2px solid #eee;
              }
              .event-name {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              .event-info {
                font-size: 16px;
                color: #666;
                margin-bottom: 5px;
              }
              .instructions {
                margin-top: 20px;
                font-size: 18px;
                color: #444;
              }
              .footer {
                margin-top: 40px;
                font-size: 12px;
                color: #999;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="${dataUrl}" alt="QR Code" class="qr-image" />
              <div class="event-details">
                <div class="event-name">${event.name}</div>
                <div class="event-info">${eventDate}</div>
                ${eventTime ? `<div class="event-info">${eventTime}</div>` : ''}
                ${eventLocation ? `<div class="event-info">${eventLocation}</div>` : ''}
                <div class="instructions">Scan to request songs!</div>
              </div>
              <div class="footer">
                Generated on ${format(new Date(), 'MMMM d, yyyy')}
              </div>
            </div>
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                  window.onafterprint = () => window.close();
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      return { success: true };
    } catch (error) {
      console.error('QR print error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to print QR code',
      };
    }
  }
}