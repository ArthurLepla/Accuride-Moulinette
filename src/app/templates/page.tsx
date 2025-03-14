import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Factory, LineChart } from "lucide-react";
import Link from "next/link";

export default function TemplatesPage() {
  const templates = [
    {
      title: "Vue Globale",
      description: "Visualisez les informations globales sur la consommation d'énergie de votre usine",
      href: "/templates/global-view",
      icon: Globe,
      color: "text-blue-500",
    },
    {
      title: "Saisie Production",
      description: "Saisissez manuellement les données de production ou importez-les depuis un fichier",
      href: "/templates/production-entry",
      icon: Factory,
      color: "text-green-500",
    },
    {
      title: "Analyse Production",
      description: "Analysez les courbes de consommation et les performances des machines",
      href: "/templates/production-analysis",
      icon: LineChart,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Templates</h1>
        <p className="text-muted-foreground">
          Choisissez un template pour commencer à travailler avec vos données d'énergie
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Link key={template.href} href={template.href}>
            <Card className="h-full hover:bg-accent/50 transition-colors cursor-pointer">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <template.icon className={`w-5 h-5 ${template.color}`} />
                  <CardTitle>{template.title}</CardTitle>
                </div>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Cliquez pour accéder à ce template
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
} 