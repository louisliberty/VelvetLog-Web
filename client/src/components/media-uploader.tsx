import { useState, useRef } from "react";
import { Upload, Image, FileText, Music, Video, X, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ClientEncryption } from "@/lib/encryption";
import type { Contact, MediaAttachment } from "@shared/schema";

interface MediaUploaderProps {
  contact: Contact;
  existingMedia?: MediaAttachment[];
  onMediaAdd?: (media: MediaAttachment) => void;
  onMediaRemove?: (mediaId: number) => void;
}

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (fileType.startsWith('video/')) return <Video className="w-4 h-4" />;
  if (fileType.startsWith('audio/')) return <Music className="w-4 h-4" />;
  return <FileText className="w-4 h-4" />;
};

const getFileTypeColor = (fileType: string) => {
  if (fileType.startsWith('image/')) return "bg-green-100 text-green-800";
  if (fileType.startsWith('video/')) return "bg-blue-100 text-blue-800";
  if (fileType.startsWith('audio/')) return "bg-purple-100 text-purple-800";
  return "bg-gray-100 text-gray-800";
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function MediaUploader({ 
  contact, 
  existingMedia = [], 
  onMediaAdd, 
  onMediaRemove 
}: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm',
      'audio/mp3', 'audio/wav', 'audio/m4a',
      'application/pdf', 'text/plain'
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Unsupported File Type",
        description: "Please select an image, video, audio, or document file",
        variant: "destructive"
      });
      return;
    }

    setPreviewFile(file);
  };

  const handleUpload = async () => {
    if (!previewFile) return;

    setIsUploading(true);
    
    try {
      // Read file as base64
      const fileReader = new FileReader();
      fileReader.onload = async (e) => {
        const fileData = e.target?.result as string;
        const base64Data = fileData.split(',')[1]; // Remove data URL prefix

        // Get user encryption key
        const token = localStorage.getItem('velvetlog_token');
        if (!token) throw new Error('No authentication token');

        const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
        const encryptionKey = decoded.encryptionKey;

        // Encrypt file data
        const encryptedData = ClientEncryption.encrypt(base64Data, encryptionKey);
        
        // Encrypt metadata
        const metadata = {
          originalName: previewFile.name,
          description: uploadDescription,
          uploadedAt: new Date().toISOString()
        };
        const encryptedMetadata = ClientEncryption.encryptObject(metadata, encryptionKey);

        // Upload to server
        const response = await fetch('/api/media', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            contactId: contact.id,
            fileName: `encrypted_${Date.now()}`,
            fileType: previewFile.type,
            fileSize: previewFile.size,
            encryptedData: JSON.stringify(encryptedData),
            encryptedMetadata
          })
        });

        if (!response.ok) throw new Error('Upload failed');

        const newMedia = await response.json();
        onMediaAdd?.(newMedia);

        toast({
          title: "Media Uploaded",
          description: "File has been securely encrypted and saved"
        });

        // Reset form
        setPreviewFile(null);
        setUploadDescription("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };

      fileReader.readAsDataURL(previewFile);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Could not upload file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (media: MediaAttachment) => {
    try {
      const token = localStorage.getItem('velvetlog_token');
      if (!token) throw new Error('No authentication token');

      const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
      const encryptionKey = decoded.encryptionKey;

      // Decrypt file data
      const encryptedData = JSON.parse(media.encryptedData);
      const decryptedData = ClientEncryption.decrypt(encryptedData, encryptionKey);

      // Decrypt metadata
      const metadata = ClientEncryption.decryptObject(media.encryptedMetadata, encryptionKey);

      // Create download link
      const byteCharacters = atob(decryptedData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: media.fileType });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = metadata.originalName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: "File has been decrypted and downloaded"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not decrypt and download file",
        variant: "destructive"
      });
    }
  };

  const handleRemove = async (media: MediaAttachment) => {
    try {
      const token = localStorage.getItem('velvetlog_token');
      const response = await fetch(`/api/media/${media.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Delete failed');

      onMediaRemove?.(media.id);

      toast({
        title: "Media Removed",
        description: "File has been permanently deleted"
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Could not remove file. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Upload className="w-5 h-5 text-blue-600" />
            Media & Attachments
          </CardTitle>
          <CardDescription>
            Upload photos, documents, or other files. All files are encrypted before storage.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <Input
              ref={fileInputRef}
              id="file-upload"
              type="file"
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*,.pdf,.txt"
              className="cursor-pointer"
            />
            <p className="text-xs text-gray-600">
              Supported: Images, Videos, Audio, PDF, Text (Max 10MB)
            </p>
          </div>

          {/* File Preview */}
          {previewFile && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${getFileTypeColor(previewFile.type)}`}>
                    {getFileIcon(previewFile.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{previewFile.name}</p>
                    <p className="text-sm text-gray-600">{formatFileSize(previewFile.size)}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description or note about this file..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  rows={2}
                />
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full mt-3 bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? "Encrypting & Uploading..." : "Upload Securely"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Media */}
      {existingMedia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Saved Media ({existingMedia.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {existingMedia.map((media) => (
                <div key={media.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full ${getFileTypeColor(media.fileType)}`}>
                      {getFileIcon(media.fileType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{media.fileName}</p>
                      <p className="text-sm text-gray-600">{formatFileSize(media.fileSize)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(media)}
                      className="text-blue-600 hover:text-blue-700 p-1"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(media)}
                      className="text-red-600 hover:text-red-700 p-1"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}