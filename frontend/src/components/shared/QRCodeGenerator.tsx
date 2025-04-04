import { useState } from 'react';
import QRCode from 'react-qr-code';
import { apiClient } from '@/lib/api/client';
import { toast } from 'sonner';
import { Button } from '../ui/Button';

interface QRCodeGeneratorProps {
  type?: 'attendance' | 'access' | 'verification';
  entityId?: string;
  size?: number;
  onGenerate?: (qrCodeId: string) => void;
}

export function QRCodeGenerator({
  type = 'verification',
  entityId,
  size = 200,
  onGenerate,
}: QRCodeGeneratorProps) {
  const [qrValue, setQrValue] = useState<string>('');
  const [qrCodeId, setQrCodeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);

  const generateQRCode = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.post('/qrcodes', {
        type,
        entityId,
        expiryHours: 24, // Default expiry time
      });

      if (response.data) {
        setQrValue(response.data.data);
        setQrCodeId(response.data.id);
        if (response.data.expiresAt) {
          setExpiryTime(new Date(response.data.expiresAt));
        }
        
        if (onGenerate) {
          onGenerate(response.data.id);
        }
        
        toast.success('QR Code generated successfully');
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrValue) return;
    
    const svg = document.getElementById('qr-code')?.querySelector('svg');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-${qrCodeId || new Date().getTime()}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">QR Code Generator</h3>
      
      <div 
        id="qr-code" 
        className="bg-white p-4 rounded-lg mb-4"
        style={{ maxWidth: `${size}px`, maxHeight: `${size}px` }}
      >
        {qrValue ? (
          <QRCode
            value={qrValue}
            size={size}
            style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
          />
        ) : (
          <div 
            className="flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600" 
            style={{ width: `${size}px`, height: `${size}px` }}
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
              QR Code will appear here
            </p>
          </div>
        )}
      </div>
      
      {expiryTime && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Expires: {expiryTime.toLocaleString()}
        </p>
      )}
      
      <div className="flex gap-3 w-full">
        <Button
          onClick={generateQRCode}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Generating...' : 'Generate QR Code'}
        </Button>
        
        {qrValue && (
          <Button
            variant="outline"
            onClick={downloadQRCode}
            className="flex-1"
          >
            Download
          </Button>
        )}
      </div>
    </div>
  );
} 