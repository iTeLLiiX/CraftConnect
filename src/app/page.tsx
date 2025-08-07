import Link from 'next/link';
import { 
  WrenchScrewdriverIcon, 
  UserGroupIcon, 
  ShieldCheckIcon, 
  StarIcon,
  MapPinIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  TruckIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Finden Sie den richtigen{' '}
              <span className="gradient-text">Handwerker</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Schnelle und zuverlässige Handwerker-Vermittlung mit transparenten Preisen, 
              Bewertungen und Qualitätsgarantie. Alles in einer Plattform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/register" 
                className="btn-primary btn-lg"
              >
                Jetzt Handwerker finden
              </Link>
              <Link 
                href="/register?type=craftsman" 
                className="btn-outline btn-lg"
              >
                Als Handwerker registrieren
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Warum CraftConnect?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Wir verbinden Kunden mit qualifizierten Handwerkern und bieten 
              eine transparente, sichere Plattform für alle Handwerks-Dienstleistungen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WrenchScrewdriverIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Qualifizierte Handwerker
              </h3>
              <p className="text-gray-600">
                Alle Handwerker werden verifiziert und bewertet. 
                Nur die Besten für Ihr Projekt.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-success-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sichere Abwicklung
              </h3>
              <p className="text-gray-600">
                Geschützte Zahlungen und Qualitätsgarantie. 
                Ihr Projekt ist bei uns in sicheren Händen.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <StarIcon className="w-8 h-8 text-warning-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Transparente Bewertungen
              </h3>
              <p className="text-gray-600">
                Echte Bewertungen von echten Kunden. 
                Finden Sie den Handwerker, der zu Ihnen passt.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-secondary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Lokale Handwerker
              </h3>
              <p className="text-gray-600">
                Handwerker in Ihrer Nähe. 
                Schnelle Reaktionszeiten und persönlicher Service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              So funktioniert es
            </h2>
            <p className="text-xl text-gray-600">
              In nur 3 einfachen Schritten zu Ihrem Handwerker
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Projekt beschreiben
              </h3>
              <p className="text-gray-600">
                Beschreiben Sie Ihr Projekt und erhalten Sie passende Angebote 
                von qualifizierten Handwerkern.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Angebote vergleichen
              </h3>
              <p className="text-gray-600">
                Vergleichen Sie Preise, Bewertungen und Erfahrungen. 
                Wählen Sie den Handwerker, der am besten zu Ihnen passt.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Projekt starten
              </h3>
              <p className="text-gray-600">
                Beauftragen Sie Ihren Handwerker und verfolgen Sie den Fortschritt. 
                Bezahlen Sie erst nach erfolgreicher Fertigstellung.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Unsere Dienstleistungen
            </h2>
            <p className="text-xl text-gray-600">
              Von der kleinen Reparatur bis zum großen Bauprojekt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { name: 'Sanitär', icon: '🚿', description: 'Wasserinstallation, Heizung, Badrenovierung' },
              { name: 'Elektrik', icon: '⚡', description: 'Elektroinstallation, Smart Home, Reparaturen' },
              { name: 'Bau & Renovierung', icon: '🏗️', description: 'Bauarbeiten, Renovierung, Ausbau' },
              { name: 'Garten & Landschaft', icon: '🌳', description: 'Gartengestaltung, Pflege, Terrasse' },
              { name: 'Maler & Lackierer', icon: '🎨', description: 'Anstrich, Tapezieren, Fassaden' },
              { name: 'Dach & Dachfenster', icon: '🏠', description: 'Dachreparatur, Dachfenster, Dämmung' },
            ].map((service) => (
              <div key={service.name} className="card p-6 text-center hover:shadow-medium transition-shadow">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Bereit für Ihr nächstes Projekt?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Registrieren Sie sich jetzt und finden Sie den perfekten Handwerker 
            für Ihr Projekt. Kostenlos und unverbindlich.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
            >
              Jetzt kostenlos registrieren
            </Link>
            <Link 
              href="/about" 
              className="btn border border-white text-white hover:bg-primary-700 btn-lg"
            >
              Mehr erfahren
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">CraftConnect</h3>
              <p className="text-gray-400">
                Die führende Plattform für Handwerker-Vermittlung in Deutschland.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Für Kunden</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/jobs" className="hover:text-white">Aufträge erstellen</Link></li>
                <li><Link href="/handwerker" className="hover:text-white">Handwerker finden</Link></li>
                <li><Link href="/bewertungen" className="hover:text-white">Bewertungen</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Für Handwerker</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/register?type=craftsman" className="hover:text-white">Registrieren</Link></li>
                <li><Link href="/auftraege" className="hover:text-white">Aufträge finden</Link></li>
                <li><Link href="/marktplatz" className="hover:text-white">Marktplatz</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Hilfe</Link></li>
                <li><Link href="/contact" className="hover:text-white">Kontakt</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Datenschutz</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CraftConnect. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

