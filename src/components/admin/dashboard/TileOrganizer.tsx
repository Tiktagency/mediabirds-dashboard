import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GripVertical, LayoutGrid, Pencil } from 'lucide-react';
import type { AutomationSetting } from '@/hooks/useAutomationSettings';

interface TileOrganizerProps {
  tileOrder: string[];
  automations: AutomationSetting[];
  customLabels: Record<string, string>;
  onReorder: (newOrder: string[]) => Promise<void>;
  onUpdateLabel: (automationName: string, label: string) => Promise<void>;
}

interface SortableItemProps {
  id: string;
  name: string;
  customLabel: string;
  onUpdateLabel: (label: string) => void;
}

const SortableItem = ({ id, name, customLabel, onUpdateLabel }: SortableItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(customLabel || name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = () => {
    onUpdateLabel(label);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 hover:bg-card/50 rounded"
      >
        <GripVertical className="w-4 h-4 text-muted-foreground" />
      </button>
      
      {isEditing ? (
        <Input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className="flex-1 h-8 bg-background/50"
          autoFocus
        />
      ) : (
        <span className="flex-1 text-sm font-medium text-foreground">
          {customLabel || name}
        </span>
      )}
      
      <button
        onClick={() => setIsEditing(true)}
        className="p-1 hover:bg-card/50 rounded text-muted-foreground hover:text-foreground"
      >
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  );
};

export const TileOrganizer = ({ 
  tileOrder, 
  automations, 
  customLabels,
  onReorder, 
  onUpdateLabel 
}: TileOrganizerProps) => {
  const [items, setItems] = useState(tileOrder);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      const newItems = arrayMove(items, oldIndex, newIndex);
      setItems(newItems);
      await onReorder(newItems);
    }
  };

  const getAutomationName = (id: string) => {
    const automation = automations.find(a => a.automation_name === id);
    return automation?.display_name || id;
  };

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutGrid className="w-4 h-4" />
          Tile Volgorde
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sleep tiles om de volgorde aan te passen. Klik op het potlood om labels te wijzigen.
        </p>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((id) => (
                <SortableItem
                  key={id}
                  id={id}
                  name={getAutomationName(id)}
                  customLabel={customLabels[id] || ''}
                  onUpdateLabel={(label) => onUpdateLabel(id, label)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
};
