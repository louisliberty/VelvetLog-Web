import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ObjectUploaderProps {
  maxNumberOfFiles?: number;
  maxFileSize?: number;
  onGetUploadParameters: () => Promise<{
    method: "PUT";
    url: string;
  }>;
  onComplete?: (result: { successful: Array<{ uploadURL: string; name: string; size: number }> }) => void;
  buttonClassName?: string;
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children: ReactNode;
  acceptedFileTypes?: string;
}

/**
 * A file upload component that renders as a button and provides a modal interface for
 * file management.
 * 
 * Features:
 * - Renders as a customizable button that opens a file upload modal
 * - Provides a modal interface for:
 *   - File selection
 *   - File preview
 *   - Upload progress tracking
 *   - Upload status display
 * 
 * @param props - Component props
 * @param props.maxNumberOfFiles - Maximum number of files allowed to be uploaded (default: 1)
 * @param props.maxFileSize - Maximum file size in bytes (default: 10MB)
 * @param props.onGetUploadParameters - Function to get upload parameters (method and URL)
 * @param props.onComplete - Callback function called when upload is complete
 * @param props.buttonClassName - Optional CSS class name for the button
 * @param props.children - Content to be rendered inside the button
 * @param props.acceptedFileTypes - Accepted file types (e.g., "image/*,.pdf")
 */
export function ObjectUploader({
  maxNumberOfFiles = 1,
  maxFileSize = 10485760, // 10MB default
  onGetUploadParameters,
  onComplete,
  buttonClassName,
  buttonVariant = "default",
  children,
  acceptedFileTypes = "*"
}: ObjectUploaderProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, "pending" | "uploading" | "completed" | "error">>({});
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file count
    if (files.length > maxNumberOfFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxNumberOfFiles} file(s) allowed`,
        variant: "destructive",
      });
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(file => file.size > maxFileSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${(maxFileSize / (1024 * 1024)).toFixed(1)}MB`,
        variant: "destructive",
      });
      return;
    }

    setSelectedFiles(files);
    
    // Initialize upload status
    const newStatus: Record<string, "pending"> = {};
    files.forEach(file => {
      newStatus[file.name] = "pending";
    });
    setUploadStatus(newStatus);
    setUploadProgress({});
  };

  const uploadFile = async (file: File): Promise<{ uploadURL: string; name: string; size: number }> => {
    try {
      setUploadStatus(prev => ({ ...prev, [file.name]: "uploading" }));
      
      // Get upload parameters
      const { url } = await onGetUploadParameters();
      
      // Create upload request
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setUploadStatus(prev => ({ ...prev, [file.name]: "completed" }));
            resolve({
              uploadURL: url,
              name: file.name,
              size: file.size
            });
          } else {
            setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
          reject(new Error('Upload failed'));
        });

        xhr.open('PUT', url);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });
    } catch (error) {
      setUploadStatus(prev => ({ ...prev, [file.name]: "error" }));
      throw error;
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      const uploadPromises = selectedFiles.map(file => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      
      onComplete?.({ successful: results });
      
      toast({
        title: "Upload completed",
        description: `Successfully uploaded ${results.length} file(s)`,
      });

      // Close modal after successful upload
      setShowModal(false);
      setSelectedFiles([]);
      setUploadProgress({});
      setUploadStatus({});
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Some files failed to upload",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (fileName: string) => {
    setSelectedFiles(prev => prev.filter(file => file.name !== fileName));
    setUploadStatus(prev => {
      const newStatus = { ...prev };
      delete newStatus[fileName];
      return newStatus;
    });
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileName];
      return newProgress;
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />;
      case "error":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <File className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} className={buttonClassName}>
          {children}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Upload Photo</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div>
            <div className="relative w-full border border-gray-200 rounded-md p-3 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
              <input
                type="file"
                accept={acceptedFileTypes}
                multiple={maxNumberOfFiles > 1}
                onChange={handleFileSelect}
                disabled={isUploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center space-x-2">
                <div className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors">
                  Choose File
                </div>
                <span className="text-gray-600 text-xs">
                  {selectedFiles.length > 0 ? `${selectedFiles.length} selected` : 'JPG, PNG up to 5MB'}
                </span>
              </div>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-1">
              {selectedFiles.map((file) => (
                <div key={file.name} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(uploadStatus[file.name] || "pending")}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.name}</p>
                      <p className="text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  
                  {!isUploading && uploadStatus[file.name] !== "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.name)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
              
              {/* Progress bars */}
              {Object.entries(uploadProgress).map(([fileName, progress]) => (
                <div key={fileName} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="truncate">{fileName}</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-1.5" />
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowModal(false)}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || isUploading}
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
            >
              <Upload className="w-3 h-3 mr-1" />
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}