import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormField {
  id: string;
  label: string;
  type: "text" | "number" | "email" | "password" | "textarea";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

interface EnergyFormProps {
  fields: FormField[];
  onSubmit: () => void;
  submitText?: string;
  className?: string;
}

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

const fieldVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
      ease: "easeOut"
    }
  })
};

export function EnergyForm({
  fields,
  onSubmit,
  submitText = "Soumettre",
  className
}: EnergyFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={formVariants}
      initial="hidden"
      animate="visible"
      className={cn("space-y-6", className)}
    >
      {fields.map((field, index) => (
        <motion.div
          key={field.id}
          variants={fieldVariants}
          custom={index}
          className="space-y-2"
        >
          <Label htmlFor={field.id} className="text-gray-300">
            {field.label}
          </Label>
          {field.type === "textarea" ? (
            <textarea
              id={field.id}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={cn(
                "w-full min-h-[100px] p-2 rounded-md",
                "bg-gray-800 border border-gray-700",
                "text-gray-100 placeholder:text-gray-500",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                field.error && "border-red-500"
              )}
            />
          ) : (
            <Input
              id={field.id}
              type={field.type}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              className={cn(
                "bg-gray-800 border-gray-700",
                "text-gray-100 placeholder:text-gray-500",
                "focus:ring-blue-500",
                field.error && "border-red-500"
              )}
            />
          )}
          {field.error && (
            <p className="text-sm text-red-500">{field.error}</p>
          )}
        </motion.div>
      ))}

      <motion.div
        variants={fieldVariants}
        custom={fields.length}
        className="flex justify-end"
      >
        <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600"
        >
          {submitText}
        </Button>
      </motion.div>
    </motion.form>
  );
} 