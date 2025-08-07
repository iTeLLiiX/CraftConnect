# Supabase Setup Guide für CraftConnect

## 1. Supabase Projekt erstellen

### 1.1 Account erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Klicken Sie auf "Start your project"
3. Melden Sie sich mit GitHub an oder erstellen Sie ein neues Konto

### 1.2 Neues Projekt erstellen
1. Klicken Sie auf "New Project"
2. Wählen Sie Ihre Organisation
3. Geben Sie einen Projektnamen ein: `craftconnect`
4. Wählen Sie ein sicheres Datenbank-Passwort
5. Wählen Sie eine Region (empfohlen: West Europe für Deutschland)
6. Klicken Sie auf "Create new project"

### 1.3 Projekt-URLs und Keys notieren
Nach der Erstellung finden Sie diese Informationen unter **Settings > API**:
- **Project URL**: `https://your-project-ref.supabase.co`
- **Anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- **Service role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (unter "Project API keys")

## 2. Datenbank-Schema einrichten

### 2.1 SQL Editor öffnen
1. Gehen Sie zu **SQL Editor** in der linken Seitenleiste
2. Klicken Sie auf "New query"

### 2.2 Schema-Script ausführen
Kopieren Sie den gesamten Inhalt aus `database/schema.sql` und fügen Sie ihn in den SQL Editor ein.

**Wichtige Hinweise:**
- Das Script erstellt alle notwendigen Tabellen
- Row Level Security (RLS) wird automatisch aktiviert
- Standard-Abonnement-Pläne werden eingefügt
- Alle notwendigen Indizes werden erstellt

### 2.3 Script ausführen
Klicken Sie auf "Run" um das Schema zu erstellen.

## 3. Umgebungsvariablen konfigurieren

### 3.1 .env.local erstellen
```bash
cp env.example .env.local
```

### 3.2 Werte eintragen
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CraftConnect
NEXT_PUBLIC_APP_DESCRIPTION=Handwerker-Vermittlungsplattform

# Development Configuration
NODE_ENV=development
NEXT_PUBLIC_DEBUG=true
```

## 4. Authentifizierung konfigurieren

### 4.1 Auth Settings
1. Gehen Sie zu **Authentication > Settings**
2. Konfigurieren Sie die folgenden Einstellungen:

**Site URL:**
```
http://localhost:3000
```

**Redirect URLs:**
```
http://localhost:3000/auth/callback
http://localhost:3000/dashboard
http://localhost:3000/login
```

### 4.2 Email Templates (optional)
Unter **Authentication > Email Templates** können Sie die E-Mail-Templates anpassen:
- Confirm signup
- Magic Link
- Change Email Address
- Reset Password

## 5. Storage konfigurieren (optional)

### 5.1 Storage Bucket erstellen
1. Gehen Sie zu **Storage**
2. Klicken Sie auf "New bucket"
3. Name: `uploads`
4. Public bucket: ✅ (für öffentliche Dateien)
5. File size limit: 50MB
6. Allowed MIME types: `image/*, application/pdf`

### 5.2 Storage Policies
Das Schema-Script erstellt bereits die notwendigen RLS-Policies für Storage.

## 6. Realtime konfigurieren

### 6.1 Realtime aktivieren
1. Gehen Sie zu **Database > Replication**
2. Aktivieren Sie Realtime für folgende Tabellen:
   - `messages`
   - `job_applications`
   - `jobs`

## 7. Testing der Konfiguration

### 7.1 Entwicklungsserver starten
```bash
npm run dev
```

### 7.2 Test-Benutzer erstellen
1. Gehen Sie zu **Authentication > Users**
2. Klicken Sie auf "Add user"
3. Erstellen Sie einen Test-Benutzer:
   - Email: `test@example.com`
   - Password: `test123456`

### 7.3 Anwendung testen
1. Öffnen Sie [http://localhost:3000](http://localhost:3000)
2. Registrieren Sie sich mit einem neuen Konto
3. Testen Sie die Anmeldung
4. Erstellen Sie einen Test-Auftrag

## 8. Produktions-Deployment

### 8.1 Vercel Deployment
1. Pushen Sie Ihren Code zu GitHub
2. Verbinden Sie das Repository mit Vercel
3. Fügen Sie die Umgebungsvariablen in Vercel hinzu

### 8.2 Produktions-Umgebungsvariablen
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=CraftConnect
NODE_ENV=production
```

### 8.3 Supabase Auth für Produktion
Aktualisieren Sie die Redirect URLs in Supabase:
```
https://your-domain.vercel.app/auth/callback
https://your-domain.vercel.app/dashboard
https://your-domain.vercel.app/login
```

## 9. Monitoring und Wartung

### 9.1 Database Monitoring
- **Database > Logs**: Überwachen Sie Datenbankabfragen
- **Database > Backups**: Automatische Backups sind aktiviert
- **Database > Usage**: Überwachen Sie Ressourcenverbrauch

### 9.2 Auth Monitoring
- **Authentication > Users**: Benutzerverwaltung
- **Authentication > Logs**: Anmeldeversuche und Fehler

### 9.3 Storage Monitoring
- **Storage > Files**: Dateiverwaltung
- **Storage > Logs**: Upload/Download-Aktivitäten

## 10. Troubleshooting

### 10.1 Häufige Probleme

**Fehler: "Invalid API key"**
- Überprüfen Sie die Supabase URL und Keys
- Stellen Sie sicher, dass die Keys korrekt kopiert wurden

**Fehler: "RLS policy violation"**
- Überprüfen Sie die RLS-Policies in der Datenbank
- Stellen Sie sicher, dass der Benutzer authentifiziert ist

**Fehler: "Table does not exist"**
- Führen Sie das Schema-Script erneut aus
- Überprüfen Sie die Tabellennamen

### 10.2 Support
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Supabase Discord**: [discord.gg/supabase](https://discord.gg/supabase)
- **GitHub Issues**: Erstellen Sie ein Issue in unserem Repository

## 11. Nächste Schritte

Nach der erfolgreichen Einrichtung können Sie:

1. **Stripe Integration** für Zahlungen hinzufügen
2. **Email Notifications** konfigurieren
3. **Analytics** einrichten (Google Analytics, Sentry)
4. **Mobile App** mit React Native entwickeln
5. **API Gateway** für externe Partner-APIs erstellen

---

**Wichtige Sicherheitshinweise:**
- Teilen Sie niemals Ihre Service Role Keys
- Verwenden Sie immer HTTPS in der Produktion
- Regelmäßige Backups sind wichtig
- Überwachen Sie die Anwendung auf verdächtige Aktivitäten
