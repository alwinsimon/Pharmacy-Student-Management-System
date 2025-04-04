import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api/client';
import { Button } from '../ui/Button';

interface QRCodeScannerProps {
  onScan?: (result: any) => void;
  fps?: number;
  qrbox?: number;
  disableFlip?: boolean;
  containerStyle?: React.CSSProperties;
}

export function QRCodeScanner({
  onScan,
  fps = 10,
  qrbox = 250,
  disableFlip = false,
  containerStyle,
}: QRCodeScannerProps) {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(error => {
          console.error('Error stopping scanner:', error);
        });
      }
    };
  }, [isScanning]);

  const startScanner = async () => {
    setScanResult(null);
    setScanError(null);
    setIsScanning(true);
    
    try {
      if (!containerRef.current) return;
      
      const containerId = 'qr-scanner-container';
      
      // Create scanner instance
      scannerRef.current = new Html5Qrcode(containerId);
      
      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps,
          qrbox,
          disableFlip,
        },
        async (decodedText, decodedResult) => {
          // Handle QR code data
          console.log('QR Code detected:', decodedText);
          await processQRCode(decodedText);
        },
        (errorMessage) => {
          // QR code scan error (usually just detection errors, not critical)
          console.log('QR scan error:', errorMessage);
        }
      );
    } catch (error) {
      console.error('Error starting scanner:', error);
      setScanError('Failed to access the camera. Please ensure you have given permission.');
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      await scannerRef.current.stop();
      setIsScanning(false);
    }
  };

  const processQRCode = async (qrData: string) => {
    try {
      // Stop scanning once we get a result
      await stopScanner();
      
      // Verify QR code with backend
      const response = await apiClient.post('/qrcodes/verify', {
        data: qrData
      });
      
      setScanResult(response.data);
      
      if (onScan) {
        onScan(response.data);
      }
      
      toast.success('QR Code scanned successfully');
    } catch (error: any) {
      console.error('Error processing QR code:', error);
      setScanError(error.response?.data?.message || 'Invalid QR code');
      toast.error('Invalid or expired QR code');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md" style={containerStyle}>
      <h3 className="text-lg font-semibold mb-4">QR Code Scanner</h3>
      
      <div 
        ref={containerRef}
        className="relative mb-4"
      >
        <div 
          id="qr-scanner-container" 
          style={{ width: '100%', minHeight: '300px' }}
          className="overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700"
        ></div>
        
        {!isScanning && !scanResult && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
            <p className="text-white text-center p-4">
              Camera is not active
            </p>
          </div>
        )}
      </div>
      
      {scanError && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
          {scanError}
        </div>
      )}
      
      {scanResult && (
        <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md">
          <h4 className="font-medium mb-2">Result:</h4>
          <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
            {JSON.stringify(scanResult, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="flex gap-3">
        {!isScanning ? (
          <Button 
            onClick={startScanner}
            className="flex-1"
          >
            Start Scanning
          </Button>
        ) : (
          <Button 
            onClick={stopScanner}
            variant="outline"
            className="flex-1"
          >
            Stop Scanning
          </Button>
        )}
      </div>
    </div>
  );
} 