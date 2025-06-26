import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { NAVALHA_SVG_ICON } from '../constants';
import { useAuth } from '../hooks/useAuth';
import { BarbershopProfile, Service as ServiceType } from '../types';
import { mockGetPublicBarbershops, mockGetServicesForBarbershop } from '../services/mockApiService';
import LoadingSpinner from '../components/LoadingSpinner';

const FeatureCard: React.FC<{ title: string; description: string; iconName: string }> = ({ title, description, iconName }) => (
  <div className="bg-light-blue p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow transform hover:-translate-y-1">
    <div className="flex items-center justify-center w-12 h-12 bg-primary-blue text-white rounded-full mb-4 mx-auto">
      <span className="material-icons-outlined text-2xl">{iconName}</span>
    </div>
    <h3 className="text-xl font-semibold text-primary-blue mb-2 text-center">{title}</h3>
    <p className="text-gray-700 text-sm text-center">{description}</p>
  </div>
);

const BarbershopShowcaseCard: React.FC<{ barbershop: BarbershopProfile, services: ServiceType[] }> = ({ barbershop, services }) => (
  <div className="bg-white p-6 rounded-xl shadow-2xl border border-primary-blue/30 transform hover:scale-105 transition-transform duration-300 ease-out flex flex-col justify-between">
    <div>
      {barbershop.logoUrl ? 
          <img src={barbershop.logoUrl} alt={`${barbershop.name} logo`} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-light-blue shadow-md" /> 
          : <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gray-200 flex items-center justify-center text-primary-blue text-4xl font-bold border-4 border-light-blue shadow-md">{barbershop.name.charAt(0)}</div>
      }
      <h3 className="text-2xl font-bold text-primary-blue text-center mb-2">{barbershop.name}</h3>
      <p className="text-gray-600 text-center text-xs mb-1 truncate" title={barbershop.address}>{barbershop.address}</p>
      <p className="text-gray-600 text-center text-xs mb-4">Telefone: {barbershop.phone}</p>
      
      {services.length > 0 && (
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-primary-blue mb-1 text-center">Principais Serviços:</h4>
          {services.slice(0, 2).map(service => (
            <div key={service.id} className="text-xs text-gray-700 p-1.5 bg-light-blue/70 rounded mb-1 text-center truncate">
                {service.name} - R$ {service.price.toFixed(2).replace('.',',')}
            </div>
          ))}
          {services.length > 2 && <p className="text-xs text-primary-blue text-center mt-1">e mais!</p>}
        </div>
      )}
    </div>

    <Link to={`/barbershop/${barbershop.id}`} className="mt-auto">
      <Button variant="primary" fullWidth>Ver Barbearia e Agendar</Button>
    </Link>
  </div>
);


const HomePage: React.FC = () => {
  const { user } = useAuth();
  const [publicBarbershops, setPublicBarbershops] = useState<BarbershopProfile[]>([]);
  const [barbershopServices, setBarbershopServices] = useState<Record<string, ServiceType[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const shops = await mockGetPublicBarbershops(3); // Get 3 random shops for showcase
        setPublicBarbershops(shops);
        if (shops.length > 0) {
            const servicesPromises = shops.map(shop => mockGetServicesForBarbershop(shop.id));
            const servicesResults = await Promise.all(servicesPromises);
            
            const servicesMap: Record<string, ServiceType[]> = {};
            shops.forEach((shop, index) => {
            servicesMap[shop.id] = servicesResults[index].filter(s => s.isActive);
            });
            setBarbershopServices(servicesMap);
        }
      } catch (error) {
        console.error("Error fetching public barbershops:", error);
        // Add notification here if desired
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="text-text-dark space-y-16 md:space-y-24">
      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-primary-blue to-blue-500 text-white rounded-xl shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-repeat bg-center" style={{backgroundImage: "url('data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2252%22%20height%3D%2226%22%20viewBox%3D%220%200%2052%2026%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M10%200h1v26h-1zM36%200h1v26h-1z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"}}></div>
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <span className="text-6xl w-20 h-20" dangerouslySetInnerHTML={{ __html: NAVALHA_SVG_ICON.replace('class="w-full h-full"', 'class="w-full h-full filter drop-shadow-lg"') }} />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight">Navalha Digital</h1>
          <p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            A plataforma definitiva para agendamento em barbearias. Simples para o cliente, poderosa para o seu negócio.
          </p>
          {!user && (
            <div className="space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup/client">
                <Button size="lg" className="bg-white text-primary-blue hover:bg-light-blue shadow-xl hover:shadow-2xl transform hover:scale-105">Quero Agendar</Button>
              </Link>
              <Link to="/signup/barbershop">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-blue shadow-xl hover:shadow-2xl transform hover:scale-105">Sou uma Barbearia</Button>
              </Link>
            </div>
          )}
          {user && (
             <Link to={user.type === 'client' ? "/client/appointments" : "/admin/overview"}>
                <Button size="lg" className="bg-white text-primary-blue hover:bg-light-blue shadow-xl hover:shadow-2xl transform hover:scale-105">
                    {user.type === 'client' ? "Meus Agendamentos" : "Acessar Painel"}
                </Button>
              </Link>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-primary-blue text-center mb-12">Por que escolher o Navalha Digital?</h2>
        <div className="container mx-auto px-6 grid md:grid-cols-3 gap-8">
          <FeatureCard
            iconName="event_available"
            title="Agendamento Fácil"
            description="Clientes agendam em segundos, escolhendo serviço, data e horário com total conveniência, 24/7."
          />
          <FeatureCard
            iconName="dashboard_customize"
            title="Gestão Completa"
            description="Barbearias gerenciam agenda, equipe, serviços, clientes e finanças em um painel intuitivo."
          />
          <FeatureCard
            iconName="payments"
            title="Planos Flexíveis"
            description="Desde o gratuito para começar até planos premium com recursos avançados para crescer seu negócio."
          />
        </div>
      </section>

      {/* Barbershops Showcase */}
      {!user?.id && ( 
        <section className="py-12 bg-gray-50 rounded-lg">
          <h2 className="text-3xl font-bold text-primary-blue text-center mb-12">Encontre Barbearias Incríveis</h2>
          {loading ? <LoadingSpinner label="Carregando barbearias..." /> : (
            publicBarbershops.length > 0 ? (
              <div className="container mx-auto px-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {publicBarbershops.map(shop => (
                  <BarbershopShowcaseCard key={shop.id} barbershop={shop} services={barbershopServices[shop.id] || []} />
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-600 bg-white p-6 rounded-lg shadow-md">Nenhuma barbearia para exibir no momento. <Link to="/signup/barbershop" className="text-primary-blue hover:underline font-semibold">Cadastre a sua!</Link></p>
            )
          )}
        </section>
      )}

      {/* Call to Action for Barbershops */}
      {!user?.id && (
         <section className="py-16 bg-primary-blue text-white rounded-xl shadow-xl text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl font-bold mb-4">Pronto para modernizar sua barbearia?</h2>
            <p className="text-lg mb-8 max-w-xl mx-auto">
              Junte-se ao Navalha Digital e transforme a gestão do seu negócio. Comece grátis e veja a diferença!
            </p>
            <Link to="/signup/barbershop">
              <Button size="lg" className="bg-white text-primary-blue hover:bg-light-blue shadow-lg hover:shadow-xl transform hover:scale-105">Cadastrar Minha Barbearia</Button>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;