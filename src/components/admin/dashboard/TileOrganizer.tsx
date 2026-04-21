import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSwappingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GripVertical, LayoutGrid, Pencil, X } from 'lucide-react';
import type { AutomationSetting } from '@/hooks/useAutomationSettings';

interface TileOrganizerProps {
  tileOrder: string[];
  automations: AutomationSetting[];
  customLabels: Record<string, string>;
  onReorder: (newOrder: string[]) => Promise<void>;
  onUpdateLabel: (automationName: string, label: string) => Promise<void>;
}

interface GridTileProps {
  id: string;
  index: number;
  name: string;
  customLabel: string;
  status?: 'active' | 'inactive' | 'testmode';
  isEmpty: boolean;
  onUpdateLabel: (label: string) => void;
}

const statusColors = {
  active: 'bg-green-500',
  inactive: 'bg-red-500',
  testmode: 'bg-yellow-500',
};

const GridTile = ({ id, index, name, customLabel, status, isEmpty, onUpdateLabel }: GridTileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(customLabel || name);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isEmpty });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  const handleSave = () => {
    if (!isEmpty) {
      onUpdateLabel(label);
    }
    setIsEditing(false);
  };

  if (isEmpty) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="aspect-[4/3] rounded-lg border-2 border-dashed border-border/30 bg-background/20 flex items-center justify-center"
      >
        <span className="text-xs text-muted-foreground/50">{index + 1}</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="aspect-[4/3] rounded-lg border border-primary/50 bg-gradient-to-br from-primary/30 to-primary/10 relative group cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      {/* Position number */}
      <div className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full bg-background/60 flex items-center justify-center">
        <span className="text-[10px] font-medium text-foreground/70">{index + 1}</span>
      </div>

      {/* Status indicator */}
      {status && (
        <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${statusColors[status]}`} />
      )}

      {/* Drag handle indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity">
        <GripVertical className="w-6 h-6 text-foreground" />
      </div>

      {/* Tile name */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 to-transparent rounded-b-lg">
        {isEditing ? (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setLabel(customLabel || name);
                  setIsEditing(false);
                }
              }}
              className="h-6 text-xs bg-background/50 px-1"
              autoFocus
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLabel(customLabel || name);
                setIsEditing(false);
              }}
              className="p-0.5 hover:bg-background/50 rounded"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <X className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground truncate pr-1">
              {customLabel || name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-background/50 rounded transition-opacity"
            >
              <Pencil className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DragOverlayTile = ({ name, status }: { name: string; status?: 'active' | 'inactive' | 'testmode' }) => (
  <div className="aspect-[4/3] w-full rounded-lg border border-primary/50 bg-gradient-to-br from-card to-card/60 relative shadow-lg">
    {status && (
      <div className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${statusColors[status]}`} />
    )}
    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-background/80 to-transparent rounded-b-lg">
      <span className="text-xs font-medium text-foreground truncate">{name}</span>
    </div>
  </div>
);

export const TileOrganizer = ({ 
  tileOrder, 
  automations, 
  customLabels,
  onReorder, 
  onUpdateLabel 
}: TileOrganizerProps) => {
  const GRID_SIZE = 9;
  
  // Pad the tile order to always have 9 slots
  const paddedOrder = [...tileOrder];
  while (paddedOrder.length < GRID_SIZE) {
    paddedOrder.push(`__empty_${paddedOrder.length}`);
  }
  
  const [items, setItems] = useState(paddedOrder.slice(0, GRID_SIZE));
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = items.indexOf(active.id as string);
      const newIndex = items.indexOf(over.id as string);
      
      const newItems = [...items];
      // Swap the items
      [newItems[oldIndex], newItems[newIndex]] = [newItems[newIndex], newItems[oldIndex]];
      
      setItems(newItems);
      
      // Save the full array with positions preserved (including empty slots)
      await onReorder(newItems);
    }
  };

  const getAutomation = (id: string) => {
    return automations.find(a => a.automation_name === id);
  };

  const getAutomationName = (id: string) => {
    const automation = getAutomation(id);
    return automation?.display_name || id;
  };

  const activeTile = activeId ? getAutomation(activeId) : null;

  return (
    <Card className="bg-card/50 border-border/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <LayoutGrid className="w-4 h-4" />
          Tile Volgorde
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Sleep tiles naar de gewenste positie in het grid. Het grid toont hoe je dashboard eruit zal zien.
        </p>
      </CardHeader>
      <CardContent>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={items} strategy={rectSwappingStrategy}>
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {items.map((id, index) => {
                const isEmpty = id.startsWith('__empty_');
                const automation = getAutomation(id);
                
                return (
                  <GridTile
                    key={id}
                    id={id}
                    index={index}
                    name={getAutomationName(id)}
                    customLabel={customLabels[id] || ''}
                    status={automation?.status}
                    isEmpty={isEmpty}
                    onUpdateLabel={(label) => onUpdateLabel(id, label)}
                  />
                );
              })}
            </div>
          </SortableContext>
          
          <DragOverlay>
            {activeId && activeTile ? (
              <div className="w-[120px]">
                <DragOverlayTile 
                  name={customLabels[activeId] || activeTile.display_name} 
                  status={activeTile.status}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        
        <p className="text-xs text-muted-foreground text-center mt-4">
          Lege posities worden als placeholder tiles getoond op het dashboard
        </p>
      </CardContent>
    </Card>
  );
};
