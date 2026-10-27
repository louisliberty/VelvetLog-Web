import { useState } from "react";
import { Plus, X, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface TagManagerProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  suggestions?: string[];
  maxTags?: number;
}

const defaultSuggestions = [
  "casual", "serious", "long-distance", "local", "new", "established",
  "dating", "exclusive", "complicated", "friends", "professional",
  "high-priority", "low-maintenance", "frequent-contact", "occasional",
  "family-friend", "work-related", "hobby", "travel", "outdoor",
  "foodie", "creative", "sporty", "intellectual", "party"
];

const getTagColor = (tag: string): string => {
  const colors = [
    "bg-pink-100 text-pink-800 border-pink-200",
    "bg-purple-100 text-purple-800 border-purple-200",
    "bg-blue-100 text-blue-800 border-blue-200",
    "bg-green-100 text-green-800 border-green-200",
    "bg-yellow-100 text-yellow-800 border-yellow-200",
    "bg-indigo-100 text-indigo-800 border-indigo-200",
    "bg-red-100 text-red-800 border-red-200",
    "bg-gray-100 text-gray-800 border-gray-200"
  ];
  
  // Generate consistent color based on tag name
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function TagManager({ 
  tags, 
  onTagsChange, 
  suggestions = defaultSuggestions, 
  maxTags = 10 
}: TagManagerProps) {
  const [newTag, setNewTag] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag || tags.includes(trimmedTag) || tags.length >= maxTags) return;

    onTagsChange([...tags, trimmedTag]);
    setNewTag("");
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      !tags.includes(suggestion) && 
      suggestion.toLowerCase().includes(newTag.toLowerCase())
  );

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Tag className="w-5 h-5 text-purple-600" />
          Tags & Categories
        </CardTitle>
        <CardDescription>
          Organize your connections with custom tags for easy filtering and search
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Tags */}
        {tags.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Current Tags ({tags.length}/{maxTags})
            </Label>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className={`${getTagColor(tag)} text-xs px-3 py-1 font-normal`}
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="ml-2 p-0 h-auto hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Add New Tag */}
        <div className="space-y-2">
          <Label htmlFor="new-tag">Add New Tag</Label>
          <div className="flex space-x-2">
            <Input
              id="new-tag"
              placeholder="Enter a tag..."
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(newTag.length > 0)}
              disabled={tags.length >= maxTags}
              className="flex-1"
            />
            <Button
              onClick={() => addTag(newTag)}
              disabled={!newTag.trim() || tags.length >= maxTags}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {tags.length >= maxTags && (
            <p className="text-xs text-amber-600">
              Maximum number of tags reached
            </p>
          )}
        </div>

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Suggested Tags
            </Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {filteredSuggestions.slice(0, 15).map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => addTag(suggestion)}
                  className="text-xs border-gray-300 hover:border-purple-400 hover:text-purple-700"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Popular Categories
          </Label>
          <div className="flex flex-wrap gap-2">
            {["casual", "serious", "long-distance", "new", "high-priority"].map((popular) => (
              <Button
                key={popular}
                variant="outline"
                size="sm"
                onClick={() => addTag(popular)}
                disabled={tags.includes(popular) || tags.length >= maxTags}
                className="text-xs border-purple-200 text-purple-700 hover:border-purple-400"
              >
                {popular}
              </Button>
            ))}
          </div>
        </div>

        {/* Tag Usage Tips */}
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded border">
          <p className="font-medium mb-1">Tag Tips:</p>
          <ul className="space-y-1">
            <li>• Use specific tags like "casual", "serious", "long-distance"</li>
            <li>• Add personality traits: "foodie", "creative", "sporty"</li>
            <li>• Include relationship context: "new", "established", "complicated"</li>
            <li>• Tags help with quick filtering and organization</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}