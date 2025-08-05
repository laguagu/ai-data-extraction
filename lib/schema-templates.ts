import { FieldType } from "@/hooks/use-extraction";

export interface SchemaTemplate {
  id: string;
  name: string;
  description: string;
  fields: FieldType[];
  category: string;
}

export const schemaTemplates: SchemaTemplate[] = [
  {
    id: "business-card",
    name: "Business Card",
    description: "Extract contact information from business cards",
    category: "Contact",
    fields: [
      {
        type: "text",
        name: "fullName",
        description: "Full name of the person",
        required: true,
      },
      {
        type: "text",
        name: "jobTitle",
        description: "Job title or position",
        required: false,
      },
      {
        type: "text",
        name: "company",
        description: "Company or organization name",
        required: false,
      },
      {
        type: "text",
        name: "email",
        description: "Email address",
        required: false,
      },
      {
        type: "text",
        name: "phone",
        description: "Phone number",
        required: false,
      },
      {
        type: "text",
        name: "website",
        description: "Website URL",
        required: false,
      },
      {
        type: "text",
        name: "address",
        description: "Physical address",
        required: false,
      },
    ],
  },
  {
    id: "invoice",
    name: "Invoice",
    description: "Extract key information from invoices",
    category: "Financial",
    fields: [
      {
        type: "text",
        name: "invoiceNumber",
        description: "Invoice number or ID",
        required: true,
      },
      {
        type: "date",
        name: "invoiceDate",
        description: "Date of invoice",
        required: true,
      },
      {
        type: "date",
        name: "dueDate",
        description: "Due date for payment",
        required: false,
      },
      {
        type: "text",
        name: "vendorName",
        description: "Vendor or company name",
        required: true,
      },
      {
        type: "text",
        name: "clientName",
        description: "Client or customer name",
        required: true,
      },
      {
        type: "number",
        name: "subtotal",
        description: "Subtotal amount",
        required: false,
      },
      {
        type: "number",
        name: "tax",
        description: "Tax amount",
        required: false,
      },
      {
        type: "number",
        name: "total",
        description: "Total amount due",
        required: true,
      },
      {
        type: "text",
        name: "currency",
        description: "Currency code (e.g., USD, EUR)",
        required: false,
      },
    ],
  },
  {
    id: "resume",
    name: "Resume/CV",
    description: "Extract personal and professional information from resumes",
    category: "HR",
    fields: [
      {
        type: "text",
        name: "fullName",
        description: "Full name",
        required: true,
      },
      {
        type: "text",
        name: "email",
        description: "Email address",
        required: false,
      },
      {
        type: "text",
        name: "phone",
        description: "Phone number",
        required: false,
      },
      {
        type: "text",
        name: "location",
        description: "Location or address",
        required: false,
      },
      {
        type: "text",
        name: "currentPosition",
        description: "Current job title",
        required: false,
      },
      {
        type: "array",
        name: "skills",
        description: "List of skills",
        itemType: "text",
        required: false,
      },
      {
        type: "array",
        name: "experience",
        description: "Work experience entries",
        itemType: "text",
        required: false,
      },
      {
        type: "text",
        name: "education",
        description: "Educational background",
        required: false,
      },
    ],
  },
  {
    id: "product-catalog",
    name: "Product Information",
    description: "Extract product details from catalogs or descriptions",
    category: "E-commerce",
    fields: [
      {
        type: "text",
        name: "productName",
        description: "Product name or title",
        required: true,
      },
      {
        type: "text",
        name: "sku",
        description: "Product SKU or model number",
        required: false,
      },
      {
        type: "text",
        name: "description",
        description: "Product description",
        required: false,
      },
      {
        type: "number",
        name: "price",
        description: "Product price",
        required: false,
      },
      {
        type: "text",
        name: "currency",
        description: "Currency code",
        required: false,
      },
      {
        type: "text",
        name: "category",
        description: "Product category",
        required: false,
      },
      {
        type: "text",
        name: "brand",
        description: "Brand name",
        required: false,
      },
      {
        type: "array",
        name: "features",
        description: "Product features",
        itemType: "text",
        required: false,
      },
      {
        type: "text",
        name: "availability",
        description: "Stock status",
        required: false,
      },
    ],
  },
  {
    id: "research-paper",
    name: "Research Paper",
    description: "Extract metadata from academic papers",
    category: "Academic",
    fields: [
      {
        type: "text",
        name: "title",
        description: "Paper title",
        required: true,
      },
      {
        type: "array",
        name: "authors",
        description: "List of authors",
        itemType: "text",
        required: true,
      },
      {
        type: "text",
        name: "abstract",
        description: "Paper abstract",
        required: false,
      },
      {
        type: "array",
        name: "keywords",
        description: "Keywords or tags",
        itemType: "text",
        required: false,
      },
      {
        type: "text",
        name: "journal",
        description: "Journal or publication name",
        required: false,
      },
      {
        type: "date",
        name: "publicationDate",
        description: "Publication date",
        required: false,
      },
      {
        type: "text",
        name: "doi",
        description: "DOI identifier",
        required: false,
      },
    ],
  },
  {
    id: "event-info",
    name: "Event Information",
    description: "Extract details from event announcements or flyers",
    category: "Events",
    fields: [
      {
        type: "text",
        name: "eventName",
        description: "Event title or name",
        required: true,
      },
      {
        type: "date",
        name: "eventDate",
        description: "Event date",
        required: true,
      },
      {
        type: "text",
        name: "startTime",
        description: "Start time",
        required: false,
      },
      {
        type: "text",
        name: "endTime",
        description: "End time",
        required: false,
      },
      {
        type: "text",
        name: "location",
        description: "Event location or venue",
        required: false,
      },
      {
        type: "text",
        name: "description",
        description: "Event description",
        required: false,
      },
      {
        type: "text",
        name: "organizer",
        description: "Event organizer",
        required: false,
      },
      {
        type: "text",
        name: "contactInfo",
        description: "Contact information",
        required: false,
      },
      {
        type: "number",
        name: "price",
        description: "Ticket price",
        required: false,
      },
    ],
  },
];

export function getTemplatesByCategory() {
  const categories = Array.from(
    new Set(schemaTemplates.map((t) => t.category)),
  );
  return categories.reduce(
    (acc, category) => {
      acc[category] = schemaTemplates.filter((t) => t.category === category);
      return acc;
    },
    {} as Record<string, SchemaTemplate[]>,
  );
}
