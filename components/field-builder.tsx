"use client";

import { AIFieldGenerator } from "@/components/ai-field-generator";
import { TemplateSelector } from "@/components/template-selector";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FieldType } from "@/hooks/use-extraction";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, FileText, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const fieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  type: z.enum(["text", "number", "boolean", "date", "array"]),
  description: z.string().optional(),
  required: z.boolean(),
  itemType: z.enum(["text", "number"]).optional(),
});

type FieldFormData = z.infer<typeof fieldSchema>;

interface FieldBuilderProps {
  fields: FieldType[];
  onFieldsChange: (fields: FieldType[]) => void;
}

export function FieldBuilder({ fields, onFieldsChange }: FieldBuilderProps) {
  const [isAddingField, setIsAddingField] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FieldFormData>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      required: false,
      type: "text",
    },
  });

  const selectedType = watch("type");

  const onAddField = (data: FieldFormData) => {
    const newField: FieldType = {
      ...data,
      description: data.description || undefined,
    };

    if (editingIndex !== null) {
      // Update existing field
      const updatedFields = [...fields];
      updatedFields[editingIndex] = newField;
      onFieldsChange(updatedFields);
      setEditingIndex(null);
    } else {
      // Add new field
      onFieldsChange([...fields, newField]);
    }

    reset();
    setIsAddingField(false);
  };

  const removeField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    onFieldsChange(newFields);
  };

  const editField = (index: number) => {
    const field = fields[index];
    setValue("name", field.name);
    setValue("type", field.type);
    setValue("description", field.description || "");
    setValue("required", field.required || false);
    if (field.itemType) {
      setValue("itemType", field.itemType);
    }
    setEditingIndex(index);
    setIsAddingField(true);
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setIsAddingField(false);
    reset();
  };

  const handleTemplateSelect = (templateFields: FieldType[]) => {
    onFieldsChange(templateFields);
    setIsTemplateDialogOpen(false);
  };

  const handleAIGenerated = (aiFields: FieldType[]) => {
    onFieldsChange([...fields, ...aiFields]);
  };

  return (
    <div className="space-y-6">
      {/* Quick Templates - Always Visible */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Quick Templates</h3>
          <Badge variant="secondary" className="text-xs">
            Pre-built field sets
          </Badge>
        </div>
        <Dialog
          open={isTemplateDialogOpen}
          onOpenChange={setIsTemplateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left h-auto p-4 border-dashed hover:border-primary/50 hover:bg-primary/5"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-medium">
                    Choose from Template Library
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Business Card, Invoice, Resume, Product Info, and more...
                  </div>
                </div>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Choose a Template</DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[80vh]">
              <TemplateSelector
                onTemplateSelect={handleTemplateSelect}
                onDialogClose={() => setIsTemplateDialogOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Custom Fields Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">Custom Fields</h3>
            {fields.length > 0 && (
              <Badge variant="outline" className="text-xs w-fit">
                {fields.length} field{fields.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <AIFieldGenerator onFieldsGenerated={handleAIGenerated} />
            {fields.length > 0 && (
              <Button
                onClick={() => onFieldsChange([])}
                size="sm"
                variant="outline"
                className="flex items-center gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>

        {/* Add New Field Button - Always visible and prominent */}
        <Button
          onClick={() => setIsAddingField(true)}
          variant="outline"
          className="w-full h-12 border-dashed border-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Field
        </Button>

        {/* Add/Edit Field Form - Right after the Add New Field button */}
        {isAddingField && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {editingIndex !== null ? "Edit Field" : "Add New Field"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onAddField)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Field Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., firstName, age, email"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="type">Field Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={(value) =>
                        setValue("type", value as FieldFormData["type"])
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="boolean">Boolean</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="array">Array</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedType === "array" && (
                  <div>
                    <Label htmlFor="itemType">Array Item Type</Label>
                    <Select
                      onValueChange={(value) =>
                        setValue("itemType", value as "text" | "number")
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select item type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this field should contain..."
                    rows={2}
                    {...register("description")}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="required"
                    onCheckedChange={(checked) =>
                      setValue("required", checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="required"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Required field
                  </Label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingIndex !== null ? "Update Field" : "Save"}
                  </Button>
                  <Button type="button" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Current Fields Display */}
        {fields.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-px bg-border flex-1" />
              <span className="text-xs text-muted-foreground uppercase tracking-wide">
                Current Fields
              </span>
              <div className="h-px bg-border flex-1" />
            </div>

            <ScrollArea
              className={`w-full ${fields.length > 6 ? "h-96" : "h-auto"}`}
            >
              <div className="space-y-2 pr-4">
                {fields.map((field, index) => (
                  <Card
                    key={index}
                    className="relative border-l-4 border-l-primary/30 bg-gradient-to-r from-primary/5 to-transparent hover:shadow-sm transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-medium text-sm">
                              {field.name}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs capitalize px-2 py-0.5"
                            >
                              {field.type}
                              {field.type === "array" &&
                                field.itemType &&
                                ` of ${field.itemType}s`}
                            </Badge>
                            {field.required && (
                              <Badge
                                variant="destructive"
                                className="text-xs px-2 py-0.5"
                              >
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
                        <div className="flex items-center gap-1 ml-3">
                          <Button
                            onClick={() => editField(index)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => removeField(index)}
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {fields.length > 0 && <Separator />}
      </div>

      {fields.length === 0 && !isAddingField && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center space-y-4">
            <p className="text-muted-foreground">
              No custom fields defined yet. You can:
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <AIFieldGenerator onFieldsGenerated={handleAIGenerated} />
              <span className="text-muted-foreground self-center">or</span>
              <Button
                onClick={() => setIsAddingField(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Manually
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
