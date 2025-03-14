import { ReactElement } from "react";
import { ListValue, ListWidgetValue, ListAttributeValue, ListReferenceValue, ListReferenceSetValue, ListExpressionValue } from "mendix";

export interface MendixWidgetProps {
    // Common props
    name: string;
    class?: string;
    style?: React.CSSProperties;
    
    // Data props
    dataSource?: ListValue;
    content?: ListWidgetValue;
    
    // Attribute props
    attribute?: ListAttributeValue;
    reference?: ListReferenceValue;
    referenceSet?: ListReferenceSetValue;
    
    // Expression props
    expression?: ListExpressionValue;
    
    // Event handlers
    onClick?: () => void;
    onDoubleClick?: () => void;
    onContextMenu?: () => void;
    
    // Accessibility
    ariaLabel?: string;
    ariaDescribedBy?: string;
    
    // Custom props
    [key: string]: any;
}

// Types spécifiques pour les composants Energy
export interface EnergyChartProps extends MendixWidgetProps {
    data: Array<{
        time: string;
        elec: number;
        gaz: number;
        eau: number;
        air: number;
    }>;
    selectedFields: string[];
    onFieldToggle: (field: string) => void;
}

export interface EnergyStatCardProps extends MendixWidgetProps {
    title: string;
    value: string;
    change: string;
    trend: 'up' | 'down' | 'warning';
    icon: ReactElement;
    color: string;
    bgColor: string;
    description: string;
}

export interface EnergyLayoutProps extends MendixWidgetProps {
    children: React.ReactNode;
    className?: string;
}

export interface TemplateHeaderProps extends MendixWidgetProps {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
} 