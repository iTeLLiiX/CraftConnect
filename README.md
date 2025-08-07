# CraftConnect - Handwerker-Vermittlungsplattform

Eine moderne Plattform zur Vermittlung zwischen Kunden und qualifizierten Handwerkern in Deutschland.

## 🚀 Features

### Für Kunden
- **Auftragserstellung**: Einfache Erstellung und Verwaltung von Handwerkeraufträgen
- **Handwerkersuche**: Durchsuchen und filtern von qualifizierten Handwerkern
- **Bewertungssystem**: Transparente Bewertungen und Reviews
- **Messaging**: Direkte Kommunikation mit Handwerkern
- **Auftragsverfolgung**: Status-Updates und Fortschrittsverfolgung

### Für Handwerker
- **Profilmanagement**: Detaillierte Profilseiten mit Portfolio
- **Auftragssuche**: Durchsuchen verfügbarer Aufträge nach Kategorien und Standort
- **Bewerbungssystem**: Einfache Bewerbung für interessante Aufträge
- **Terminkalender**: Verwaltung von Terminen und Aufträgen
- **Messaging**: Kommunikation mit Kunden

### Für Administratoren
- **Dashboard**: Übersicht über Plattform-Aktivitäten
- **Benutzerverwaltung**: Verwaltung von Benutzerkonten und Rollen
- **Moderation**: Überwachung von Aufträgen und Bewerbungen
- **Analytics**: Detaillierte Statistiken und Berichte

## 🛠️ Technologie-Stack

### Frontend
- **Next.js 14** - React Framework mit App Router
- **TypeScript** - Typsichere Entwicklung
- **Tailwind CSS** - Utility-first CSS Framework
- **Heroicons** - Icon Library
- **React Hook Form** - Formularverwaltung
- **Zod** - Schema-Validierung

### Backend & Datenbank
- **Supabase** - Backend-as-a-Service
  - PostgreSQL Datenbank
  - Authentifizierung
  - Realtime Subscriptions
  - Row Level Security (RLS)
  - Storage für Dateien

### Payment & Integration
- **Stripe** - Payment Processing (vorbereitet)
- **React Hot Toast** - Benachrichtigungen
- **Date-fns** - Datumsverarbeitung

### Deployment & DevOps
- **Vercel** - Frontend Hosting
- **Docker** - Containerisierung
- **Kubernetes** - Orchestrierung (Manifests vorbereitet)
- **AWS CDK** - Infrastructure as Code (vorbereitet)

## 📋 Voraussetzungen

- Node.js 18+ 
- npm oder yarn
- Supabase Account
- (Optional) Stripe Account für Payments

## 🚀 Installation & Setup

### 1. Repository klonen
```bash
git clone https://github.com/your-username/craftconnect.git
cd craftconnect
```

### 2. Dependencies installieren
```bash
npm install
# oder
yarn install
```

### 3. Umgebungsvariablen konfigurieren
```bash
cp env.example .env.local
```

Bearbeiten Sie `.env.local` und fügen Sie Ihre Konfigurationswerte hinzu:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CraftConnect
```

### 4. Supabase Setup

#### 4.1 Supabase Projekt erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Erstellen Sie ein neues Projekt
3. Notieren Sie sich die Project URL und anon key

#### 4.2 Datenbank-Schema einrichten
```bash
# Führen Sie das SQL-Script aus
psql -h your-project-ref.supabase.co -U postgres -d postgres -f database/schema.sql
```

Oder kopieren Sie den Inhalt von `database/schema.sql` in den Supabase SQL Editor.

### 5. Entwicklungsserver starten
```bash
npm run dev
# oder
yarn dev
```

Die Anwendung ist jetzt unter [http://localhost:3000](http://localhost:3000) verfügbar.

## 🗄️ Datenbank-Schema

### Haupttabellen

#### users
- Benutzerprofile (Kunden und Handwerker)
- Rollen-basierte Zugriffskontrolle
- Profilinformationen und Verifizierung

#### jobs
- Auftragsdetails und Beschreibungen
- Standort, Budget und Kategorien
- Status-Tracking (offen, in Bearbeitung, abgeschlossen)

#### job_applications
- Bewerbungen von Handwerkern
- Preisvorschläge und Zeitrahmen
- Status-Tracking (ausstehend, angenommen, abgelehnt)

#### messages
- Direkte Kommunikation zwischen Benutzern
- Realtime Messaging
- Lesebestätigungen

#### reviews
- Bewertungssystem für abgeschlossene Aufträge
- Sterne-Bewertungen und Kommentare

### Zusätzliche Tabellen
- `subscriptions` - Abonnement-Management
- `leads` - Lead-Generierung
- `advertisements` - Werbeanzeigen
- `support_tickets` - Kundensupport

## 🔐 Authentifizierung & Sicherheit

### Row Level Security (RLS)
- Benutzer können nur ihre eigenen Daten sehen
- Handwerker sehen nur relevante Aufträge
- Kunden sehen nur ihre eigenen Aufträge und Bewerbungen

### Middleware
- Route-Schutz für geschützte Bereiche
- Rollen-basierte Zugriffskontrolle
- Automatische Weiterleitung für nicht-authentifizierte Benutzer

## 📱 Responsive Design

Die Anwendung ist vollständig responsive und optimiert für:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🧪 Testing

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Test Coverage
npm run test:coverage
```

## 🚀 Deployment

### Vercel (Empfohlen)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t craftconnect .
docker run -p 3000:3000 craftconnect
```

### Kubernetes
```bash
kubectl apply -f k8s/
```

## 📊 Monitoring & Analytics

### Sentry Integration
- Error Tracking und Performance Monitoring
- Automatische Fehlerberichte

### Google Analytics
- Benutzerverhalten und Conversion-Tracking
- Custom Events für wichtige Aktionen

## 🔧 Entwicklung

### Code-Struktur
```
src/
├── app/                 # Next.js App Router
│   ├── (auth)/         # Authentifizierung
│   ├── admin/          # Admin-Bereich
│   ├── api/            # API Routes
│   └── ...
├── components/         # React Komponenten
│   ├── providers/      # Context Providers
│   └── ...
├── lib/               # Utilities und Konfiguration
│   ├── supabase/      # Supabase Client
│   └── ...
├── types/             # TypeScript Typen
└── utils/             # Helper Functions
```

### Coding Standards
- TypeScript für Typsicherheit
- ESLint für Code-Qualität
- Prettier für konsistente Formatierung
- Husky für Git Hooks

## 🤝 Beitragen

1. Fork das Repository
2. Erstellen Sie einen Feature Branch (`git checkout -b feature/amazing-feature`)
3. Committen Sie Ihre Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushen Sie zum Branch (`git push origin feature/amazing-feature`)
5. Öffnen Sie einen Pull Request

## 📄 Lizenz

Dieses Projekt ist unter der MIT Lizenz lizenziert - siehe [LICENSE](LICENSE) Datei für Details.

## 🆘 Support

Bei Fragen oder Problemen:

1. Überprüfen Sie die [Dokumentation](docs/)
2. Suchen Sie in den [Issues](https://github.com/your-username/craftconnect/issues)
3. Erstellen Sie ein neues Issue mit detaillierter Beschreibung

## 🗺️ Roadmap

### Phase 1 - MVP ✅
- [x] Benutzerregistrierung und -authentifizierung
- [x] Auftragserstellung und -verwaltung
- [x] Handwerkersuche und -bewerbung
- [x] Messaging-System
- [x] Grundlegende Admin-Funktionen

### Phase 2 - Erweiterte Features
- [ ] Payment Integration (Stripe)
- [ ] Erweiterte Bewertungen und Reviews
- [ ] Terminkalender und Scheduling
- [ ] Mobile App (React Native)
- [ ] Push-Benachrichtigungen

### Phase 3 - Enterprise Features
- [ ] Multi-Tenant Support
- [ ] Erweiterte Analytics
- [ ] API für Partner-Integrationen
- [ ] White-Label Lösungen
- [ ] Internationalisierung

## 🙏 Danksagungen

- [Supabase](https://supabase.com) für das Backend-as-a-Service
- [Vercel](https://vercel.com) für das Hosting
- [Tailwind CSS](https://tailwindcss.com) für das CSS Framework
- [Heroicons](https://heroicons.com) für die Icons

---

**CraftConnect** - Verbinden Sie sich mit qualifizierten Handwerkern in Ihrer Nähe.
