import { useState, useEffect } from "react";
import { ObjectUploader } from "./ObjectUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FileText, Image, Download, Trash2, Upload, Eye, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

interface FileAttachmentProps {
  contactId: number;
  attachments: FileAttachment[];
  onAttachmentsUpdate: (attachments: FileAttachment[]) => void;
}

export function FileAttachment({ contactId, attachments, onAttachmentsUpdate }: FileAttachmentProps) {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<FileAttachment | null>(null);
  const [localAttachments, setLocalAttachments] = useState<FileAttachment[]>(attachments);
  const { toast } = useToast();

  // Keep local attachments in sync with props when they change from server
  useEffect(() => {
    // Only sync if server has more attachments (e.g., initial load or sync from another device)
    if (attachments.length > 0 && JSON.stringify(attachments) !== JSON.stringify(localAttachments)) {
      setLocalAttachments(attachments);
    }
  }, [attachments]);

  const getAuthenticatedUrl = (url: string) => {
    const token = localStorage.getItem('velvetlog_token');
    return token ? `${url}?token=${token}` : url;
  };

  const handleGetUploadParameters = async () => {
    try {
      const response = await apiRequest("POST", "/api/objects/upload", {});
      const data = await response.json();
      return {
        method: "PUT" as const,
        url: data.uploadURL,
      };
    } catch (error) {
      console.error("Failed to get upload parameters:", error);
      throw error;
    }
  };

  const handleUploadComplete = async (result: { successful: Array<{ uploadURL: string; name: string; size: number }> }) => {
    setUploading(true);
    
    try {
      const newAttachments: FileAttachment[] = [];
      
      for (const file of result.successful) {
        // Set ACL policy for the uploaded file
        const aclResponse = await apiRequest("PUT", "/api/contact-attachments", {
          attachmentURL: file.uploadURL,
        });
        const aclData = await aclResponse.json();

        const attachment: FileAttachment = {
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: getFileType(file.name),
          url: aclData.objectPath,
          uploadedAt: new Date().toISOString(),
        };

        newAttachments.push(attachment);
      }

      // Update local state immediately for instant UI update
      const updatedAttachments = [...localAttachments, ...newAttachments];
      setLocalAttachments(updatedAttachments);
      
      // Also update parent component and persist to database
      onAttachmentsUpdate(updatedAttachments);

      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${newAttachments.length} file(s)`,
      });
      
      // Invalidate contacts cache to ensure UI updates
      queryClient.invalidateQueries({ queryKey: ['/api/contacts'] });
    } catch (error) {
      console.error("Failed to process uploaded files:", error);
      toast({
        title: "Upload processing failed",
        description: "Files were uploaded but could not be processed",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    const updatedAttachments = localAttachments.filter(att => att.id !== attachmentId);
    setLocalAttachments(updatedAttachments);
    onAttachmentsUpdate(updatedAttachments);
    
    toast({
      title: "File removed",
      description: "Attachment has been removed from contact",
    });
  };

  const getFileType = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (!extension) return "document";
    
    const imageTypes = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    const documentTypes = ["pdf", "doc", "docx", "txt", "rtf"];
    const videoTypes = ["mp4", "avi", "mov", "wmv", "flv"];
    const audioTypes = ["mp3", "wav", "aac", "flac"];
    
    if (imageTypes.includes(extension)) return "image";
    if (documentTypes.includes(extension)) return "document";
    if (videoTypes.includes(extension)) return "video";
    if (audioTypes.includes(extension)) return "audio";
    
    return "document";
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Image className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "image":
        return "bg-blue-100 text-blue-800";
      case "document":
        return "bg-green-100 text-green-800";
      case "video":
        return "bg-purple-100 text-purple-800";
      case "audio":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">File Attachments</h4>
        <ObjectUploader
          maxNumberOfFiles={5}
          maxFileSize={10485760} // 10MB
          onGetUploadParameters={handleGetUploadParameters}
          onComplete={handleUploadComplete}
          buttonClassName="text-xs"
          acceptedFileTypes="image/*,.pdf,.doc,.docx,.txt"
        >
          <Upload className="w-3 h-3 mr-1" />
          Add Files
        </ObjectUploader>
      </div>

      {localAttachments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No attachments yet</p>
          <p className="text-xs text-gray-400">Upload images, documents, or other files</p>
        </div>
      ) : (
        <div className="space-y-2">
          {localAttachments.map((attachment) => (
            <Card key={attachment.id} className="p-3">
              <CardContent className="p-0">
                <div className="flex items-center justify-between">
                  <div 
                    className={`flex items-center space-x-3 flex-1 min-w-0 ${attachment.type === 'image' ? 'cursor-pointer hover:bg-gray-50 rounded p-1 -m-1' : ''}`}
                    onClick={() => attachment.type === 'image' && setPreviewImage(attachment)}
                  >
                    <div className="flex-shrink-0">
                      {attachment.type === 'image' ? (
                        <div className="w-10 h-10 rounded overflow-hidden bg-gray-100">
                          <img 
                            src={getAuthenticatedUrl(attachment.url)} 
                            alt={attachment.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        getFileIcon(attachment.type)
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {attachment.name}
                        </p>
                        <Badge variant="secondary" className={`text-xs ${getTypeColor(attachment.type)}`}>
                          {attachment.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.size)} • {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {attachment.type === 'image' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewImage(attachment)}
                        title="View image"
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(getAuthenticatedUrl(attachment.url), '_blank')}
                      title="Download file"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAttachment(attachment.id)}
                      title="Remove attachment"
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {uploading && (
        <div className="text-center py-2">
          <p className="text-sm text-gray-500">Processing uploaded files...</p>
        </div>
      )}

      {/* Image Preview Modal */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {previewImage && (
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewImage(null)}
                  className="bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center justify-center bg-black min-h-[300px] max-h-[70vh]">
                <img
                  src={getAuthenticatedUrl(previewImage.url)}
                  alt={previewImage.name}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
              <div className="p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{previewImage.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(previewImage.size)} • {new Date(previewImage.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getAuthenticatedUrl(previewImage.url), '_blank')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}