
# Plan: Rol Badge met Iconen Links van Email

## Probleem
De rol badge in de banner rechtsboven:
1. Staat rechts van de email (moet links)
2. Heeft geen iconen (admin panel heeft wel iconen)

## Oplossing

### Bestand: `src/pages/Index.tsx`

**1. Extra iconen importeren (regel 5)**

Toevoegen aan de bestaande import:
- `Crown` (voor super_admin)
- `Shield` (voor admin) 
- `Play` (voor operator)
- `Eye` (voor viewer)

**2. getRoleBadge functie uitbreiden (regels 145-160)**

Icoon toevoegen per rol:

| Rol | Icoon | Kleur |
|-----|-------|-------|
| super_admin | Crown | Paars |
| admin | Shield | Rood |
| operator | Play | Blauw |
| viewer | Eye | Groen |

**3. Badge positie wijzigen (regels 241-248)**

Huidige volgorde:
```
email → badge
```

Nieuwe volgorde:
```
badge → email
```

## Code Wijzigingen

**Import (regel 5):**
```typescript
import { ..., Crown, Shield, Play, Eye } from 'lucide-react';
```

**getRoleBadge functie:**
```typescript
const getRoleBadge = () => {
  if (roles.includes('super_admin')) {
    return { 
      label: 'Super Admin', 
      icon: Crown,
      className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
    };
  }
  if (roles.includes('admin')) {
    return { 
      label: 'Admin', 
      icon: Shield,
      className: 'bg-red-500/20 text-red-400 border-red-500/30' 
    };
  }
  if (roles.includes('operator')) {
    return { 
      label: 'Operator', 
      icon: Play,
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
    };
  }
  if (roles.includes('viewer')) {
    return { 
      label: 'Viewer', 
      icon: Eye,
      className: 'bg-green-500/20 text-green-400 border-green-500/30' 
    };
  }
  return null;
};
```

**Badge rendering (nieuwe volgorde):**
```tsx
<div className="flex items-center gap-2">
  {roleBadge && (
    <Badge variant="outline" className={roleBadge.className}>
      <roleBadge.icon className="w-3 h-3" />
      <span className="ml-1">{roleBadge.label}</span>
    </Badge>
  )}
  <span className="text-sm" style={{ color: '#232323' }}>{user?.email}</span>
</div>
```

## Resultaat

De banner rechtsboven toont nu:
```
[Crown] Super Admin    gebruiker@email.com    [logout] [settings]
```

Met exact dezelfde styling als in het admin panel (icoon + label + kleuren).
