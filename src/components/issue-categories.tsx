import { Card, CardContent } from "./ui/card";
import { 
  Circle, 
  Lightbulb, 
  Trash2, 
  Palette, 
  Footprints, 
  StopCircle, 
  Droplets, 
  Volume2,
  MoreHorizontal
} from "lucide-react";

interface IssueCategoriesProps {
  selectedCategory: string | null;
  onCategorySelect: (category: string) => void;
}

export function IssueCategories({ selectedCategory, onCategorySelect }: IssueCategoriesProps) {
  const categories = [
    { id: "pothole", label: "Pothole", icon: Circle, color: "bg-orange-100 text-orange-600" },
    { id: "street-light", label: "Street Light", icon: Lightbulb, color: "bg-yellow-100 text-yellow-600" },
    { id: "trash", label: "Trash", icon: Trash2, color: "bg-green-100 text-green-600" },
    { id: "graffiti", label: "Graffiti", icon: Palette, color: "bg-pink-100 text-pink-600" },
    { id: "sidewalk", label: "Sidewalk", icon: Footprints, color: "bg-gray-100 text-gray-600" },
    { id: "traffic-signal", label: "Traffic Signal", icon: StopCircle, color: "bg-red-100 text-red-600" },
    { id: "water-leak", label: "Water Leak", icon: Droplets, color: "bg-blue-100 text-blue-600" },
    { id: "noise", label: "Noise", icon: Volume2, color: "bg-purple-100 text-purple-600" },
    { id: "other", label: "Other", icon: MoreHorizontal, color: "bg-gray-100 text-gray-600" }
  ];

  return (
    <div className="mb-6">
      <h3 className="font-medium mb-4">What type of issue is this?</h3>
      <div className="grid grid-cols-3 gap-3">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategory === category.id;
          
          return (
            <Card 
              key={category.id}
              className={`cursor-pointer transition-all border-2 ${
                isSelected 
                  ? "border-blue-500 shadow-md" 
                  : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => onCategorySelect(category.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mx-auto mb-2`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium">{category.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}