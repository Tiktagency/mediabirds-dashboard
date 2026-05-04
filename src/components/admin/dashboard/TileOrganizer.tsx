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
import { GripVertical, LayoutGrid, Pencil, X, CalendarDays, Search, FileText, Image, MessageCircle, Clock, BarChart3, LucideIcon } from 'lucide-react';
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

// Tile configuration matching dashboard exactly
const tileConfig: Record<string, { icon: LucideIcon; variant: 'primary' | 'secondary' | 'accent' | 'muted' }> = {
  'saved-hours': { icon: Clock, variant: 'primary' },
  'monday-planning': { icon: CalendarDays, variant: 'primary' },
  'zoekwoord-onderzoek': { icon: Search, variant: 'secondary' },
  'blogs': { icon: FileText, variant: 'accent' },
  'wordpress-alt-text': { icon: Image, variant: 'primary' },
  'chatbot': { icon: MessageCircle, variant: 'secondary' },
};

const variantClasses = {
  primary: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  accent: 'bg-accent text-accent-foreground',
  muted: 'bg-muted text-muted-foreground',
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

  // Empty placeholder tile
  if (isEmpty) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-20 rounded-lg bg-muted/50 border-2 border-dashed border-border/30 flex items-center justify-center"
      >
        <BarChart3 className="w-5 h-5 text-muted-foreground/30" />
      </div>
    );
  }

  const isSavedHours = id === 'saved-hours';
  const config = tileConfig[id] || { icon: BarChart3, variant: 'muted' as const };
  const Icon = config.icon;

  // Saved Hours tile - white with purple accent (scaled down, simplified)
  if (isSavedHours) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-20 rounded-lg bg-white border border-[#8f13e2]/30 flex items-center justify-center relative group cursor-grab active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        {/* Status indicator */}
        {status && (
          <div className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full z-10 ${statusColors[status]} shadow-sm`} />
        )}
        
        {/* Drag handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none">
          <GripVertical className="w-4 h-4 text-[#8f13e2]" />
        </div>

        <div className="flex flex-col items-center justify-center gap-1">
          <Clock className="w-4 h-4 text-[#8f13e2]" />
          
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
                className="h-5 text-[10px] bg-[#8f13e2]/10 px-1 text-[#8f13e2] text-center w-20"
                autoFocus
                onPointerDown={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLabel(customLabel || name);
                  setIsEditing(false);
                }}
                className="p-0.5 hover:bg-[#8f13e2]/10 rounded"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <X className="w-2.5 h-2.5 text-[#8f13e2]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-0.5">
              <span className="text-[10px] text-[#8f13e2] font-medium leading-tight">{customLabel || name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-[#8f13e2]/10 rounded transition-opacity"
              >
                <Pencil className="w-2.5 h-2.5 text-[#8f13e2]" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Regular automation tile - scaled down version
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`h-20 rounded-lg ${variantClasses[config.variant]} flex items-center justify-center relative group cursor-grab active:cursor-grabbing`}
      {...attributes}
      {...listeners}
    >
      {/* Status indicator */}
      {status && (
        <div className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full z-10 ${statusColors[status]} shadow-sm`} />
      )}
      
      {/* Drag handle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none">
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex flex-col items-center justify-center gap-1">
        <Icon className="w-4 h-4" />
        
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
              className="h-5 text-[10px] bg-background/20 px-1 text-center w-20"
              autoFocus
              onPointerDown={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLabel(customLabel || name);
                setIsEditing(false);
              }}
              className="p-0.5 hover:bg-background/20 rounded"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-0.5">
            <span className="text-[10px] font-semibold leading-tight">{customLabel || name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-background/20 rounded transition-opacity"
            >
              <Pencil className="w-2.5 h-2.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DragOverlayTile = ({ id, name, status }: { id: string; name: string; status?: 'active' | 'inactive' | 'testmode' }) => {
  const isSavedHours = id === 'saved-hours';
  const config = tileConfig[id] || { icon: BarChart3, variant: 'muted' as const };
  const Icon = config.icon;

  if (isSavedHours) {
    return (
      <div className="h-20 rounded-lg bg-white border border-[#8f13e2]/30 flex items-center justify-center shadow-lg relative">
        {status && (
          <div className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full z-10 ${statusColors[status]} shadow-sm`} />
        )}
        <div className="flex flex-col items-center justify-center gap-1">
          <Clock className="w-4 h-4 text-[#8f13e2]" />
          <span className="text-[10px] text-[#8f13e2] font-medium leading-tight">{name}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-20 rounded-lg ${variantClasses[config.variant]} flex items-center justify-center shadow-lg relative`}>
      {status && (
        <div className={`absolute top-1.5 left-1.5 w-2 h-2 rounded-full z-10 ${statusColors[status]} shadow-sm`} />
      )}
      <div className="flex flex-col items-center justify-center gap-1">
        <Icon className="w-4 h-4" />
        <span className="text-[10px] font-semibold leading-tight">{name}</span>
      </div>
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
          Sleep tiles naar de gewenste positie. Dit is een exacte preview van je dashboard.
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
            {activeId && !activeId.startsWith('__empty_') ? (
              <div className="w-[120px]">
                <DragOverlayTile 
                  id={activeId}
                  name={customLabels[activeId] || getAutomationName(activeId)} 
                  status={activeTile?.status}
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        
        <p className="text-xs text-muted-foreground text-center mt-6">
          Klik op een tile label om het aan te passen
        </p>
      </CardContent>
    </Card>
  );
};