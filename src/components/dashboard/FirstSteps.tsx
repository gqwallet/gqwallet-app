/**
 * Getting-started checklist shown while the dashboard has no data.
 *
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { Card, ListRow } from '@/components/ui';

/** One step of {@link FirstSteps}. */
export interface FirstStep {
  /** Step title. */
  title: string;
  /** Short explanation. */
  detail: string;
  /** Icon ligature. */
  icon: string;
  /** Called when chosen. */
  onSelect: () => void;
}

/** Props of {@link FirstSteps}. */
export interface FirstStepsProps {
  /** Steps in order. */
  steps: FirstStep[];
}

/**
 * Renders the `Primeros pasos` card.
 *
 * @example
 * ```tsx
 * <FirstSteps steps={steps} />
 * ```
 */
export function FirstSteps({ steps }: FirstStepsProps) {
  return (
    <Card title="Primeros pasos">
      {steps.map((step) => (
        <ListRow key={step.title} icon={step.icon} title={step.title} detail={step.detail} onClick={step.onSelect} />
      ))}
    </Card>
  );
}
