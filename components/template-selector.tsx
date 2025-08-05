"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldType } from "@/hooks/use-extraction";
import { getTemplatesByCategory, SchemaTemplate } from "@/lib/schema-templates";
import { Check, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface TemplateSelectorProps {
  onTemplateSelect: (fields: FieldType[]) => void;
  onDialogClose?: () => void;
}

export function TemplateSelector({
  onTemplateSelect,
  onDialogClose,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<SchemaTemplate | null>(null);
  const templatesByCategory = getTemplatesByCategory();

  const handleTemplateClick = (template: SchemaTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate.fields);
      toast.success(`Applied ${selectedTemplate.name} template!`);
      onDialogClose?.();
    }
  };

  return (
    <div className="space-y-6">
      {/* Template List */}
      <div className="space-y-4">
        <h4 className="font-medium text-lg">Available Templates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(templatesByCategory).map(([category, templates]) => (
            <div key={category} className="space-y-3">
              <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {category}
              </h5>
              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedTemplate?.id === template.id
                        ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                        : "border-muted hover:border-primary/50 hover:bg-muted/50"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="font-medium text-sm">
                          {template.name}
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {template.description}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template.fields.length} fields
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Template Preview - Below templates */}
      {selectedTemplate && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview: {selectedTemplate.name}
              </span>
              <Button onClick={handleUseTemplate} size="sm">
                Use This Template
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {selectedTemplate.description}
              </p>
              <div className="space-y-2">
                <h6 className="text-sm font-medium">Fields:</h6>
                <div className="space-y-2">
                  {selectedTemplate.fields.map((field, index) => (
                    <div
                      key={index}
                      className="p-3 bg-background rounded border text-sm space-y-1"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{field.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      {field.description && (
                        <p className="text-xs text-muted-foreground">
                          {field.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
