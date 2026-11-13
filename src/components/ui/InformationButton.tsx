/**
 * Contextual information from FR-059 and the approved product copy.
 * @author G0nz4loQu3dena
 * @packageDocumentation
 */
import { useState } from 'react';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { INFORMATION, INFORMATION_TITLES } from '@/utils/information';

/** Props for the contextual information trigger. */
export interface InformationButtonProps {
  /** Topic matching the approved copy. */
  topic: string;
  /** Additional positioning utilities. */
  className?: string;
}
/** Opens the approved explanation without navigating or resetting the underlying view. */
export function InformationButton({ topic, className }: InformationButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const body = INFORMATION[topic];
  if (!body) return null;
  return <>
    <IconButton icon="info" size={16} label={`Información sobre ${topic}`} className={`size-11 [&>.material-symbols-rounded]:opacity-60 hover:[&>.material-symbols-rounded]:opacity-100 focus-visible:[&>.material-symbols-rounded]:opacity-100 ${className ?? ''}`} onClick={() => setIsOpen(true)} />
    <Modal isOpen={isOpen} title={INFORMATION_TITLES[topic] ?? topic} isInformation onClose={() => setIsOpen(false)} footer={<Button label="Cerrar" className="min-h-11 w-full" onClick={() => setIsOpen(false)} />}>
      <p className="whitespace-pre-line text-body text-content-primary">{body}</p>
    </Modal>
  </>;
}
